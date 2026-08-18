/**
 * StockNova — order fulfillment & pick-list logic.
 * Kept pure (no React / no LocalStorage) so it is easy to unit-test and reuse.
 */
import { newId, type Result } from "./logic";
import { FIELD_LIMITS, isOverLength, sanitizeText } from "./sanitize";
import type { Product, Transaction, WarehouseData } from "./types";

export interface FulfillmentLine {
  productId: string;
  quantity: number;
}

export interface PickListItem {
  step: number;
  productId: string;
  sku: string;
  name: string;
  location: string;
  quantity: number;
  available: number;
  unitPrice: number;
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

/** Natural-ish location sort: aisle then bin number. */
export function compareLocations(a: string, b: string): number {
  const parse = (loc: string) => {
    const m = loc.trim().match(/^([A-Za-z]+)\s*-?\s*(\d+)/);
    if (m) return { aisle: m[1]!.toUpperCase(), bin: Number(m[2]) };
    return { aisle: loc.toUpperCase(), bin: 0 };
  };
  const pa = parse(a);
  const pb = parse(b);
  if (pa.aisle !== pb.aisle) return pa.aisle.localeCompare(pb.aisle);
  if (pa.bin !== pb.bin) return pa.bin - pb.bin;
  return a.localeCompare(b);
}

export function buildPickList(
  products: Product[],
  lines: FulfillmentLine[],
): Result<PickListItem[]> {
  if (lines.length === 0) return fail("Add at least one product line to the order.");

  const items: PickListItem[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    if (seen.has(line.productId)) {
      return fail("Duplicate product in the same order. Combine quantities into one line.");
    }
    seen.add(line.productId);

    const product = products.find((p) => p.id === line.productId);
    if (!product) return fail("One or more products are invalid.");
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
      return fail(`Quantity for ${product.name} must be greater than zero.`);
    }
    const qty = Math.round(line.quantity);
    if (qty > product.quantity) {
      return fail(
        `Insufficient stock for ${product.name} (${product.sku}): need ${qty}, have ${product.quantity}.`,
      );
    }

    items.push({
      step: 0,
      productId: product.id,
      sku: product.sku,
      name: product.name,
      location: product.location,
      quantity: qty,
      available: product.quantity,
      unitPrice: product.unitPrice,
    });
  }

  items.sort((a, b) => compareLocations(a.location, b.location));
  items.forEach((item, i) => {
    item.step = i + 1;
  });

  return { ok: true, value: items };
}

export interface FulfillOrderInput {
  lines: FulfillmentLine[];
  customer: string;
  reference: string;
  date: string;
  notes?: string;
}

export function fulfillOrder(
  data: WarehouseData,
  input: FulfillOrderInput,
): Result<WarehouseData> {
  if (!input.customer.trim()) return fail("Customer / destination is required.");
  if (isOverLength(input.customer, FIELD_LIMITS.party))
    return fail(`Customer must be at most ${FIELD_LIMITS.party} characters.`);
  if (!input.reference.trim()) return fail("Order reference is required.");
  if (isOverLength(input.reference, FIELD_LIMITS.reference))
    return fail(`Order reference must be at most ${FIELD_LIMITS.reference} characters.`);
  if (!input.date) return fail("Date is required.");
  if (input.notes && isOverLength(input.notes, FIELD_LIMITS.notes))
    return fail(`Notes must be at most ${FIELD_LIMITS.notes} characters.`);

  const pick = buildPickList(data.products, input.lines);
  if (!pick.ok) return pick;

  const now = new Date().toISOString();
  const qtyById = new Map(pick.value.map((i) => [i.productId, i.quantity]));

  const products = data.products.map((p) => {
    const take = qtyById.get(p.id);
    if (take === undefined) return p;
    return {
      ...p,
      quantity: p.quantity - take,
      updatedAt: now,
    };
  });

  const transactions: Transaction[] = [
    ...pick.value.map((item) => ({
      id: newId("t"),
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      type: "OUT" as const,
      quantity: item.quantity,
      party: sanitizeText(input.customer, FIELD_LIMITS.party),
      date: input.date,
      reference: sanitizeText(input.reference, FIELD_LIMITS.reference),
      notes: input.notes?.trim()
        ? sanitizeText(input.notes, FIELD_LIMITS.notes)
        : `Fulfillment pick step ${item.step} @ ${item.location}`,
      createdAt: now,
    })),
    ...data.transactions,
  ];

  return { ok: true, value: { ...data, products, transactions } };
}

export function pickListTotalValue(items: PickListItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
}

export function pickListTotalUnits(items: PickListItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
