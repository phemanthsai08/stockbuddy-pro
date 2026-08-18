/**
 * StockNova — order fulfillment & pick-list logic.
 * Kept pure (no React / no LocalStorage) so it is easy to unit-test and reuse.
 *
 * Real WMS systems sort picks by bin location so walkers take a short path
 * through the warehouse instead of zig-zagging by product name.
 */
import { newId, type Result } from "./logic";
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

/** Natural-ish location sort: A-12 before A-2 is wrong if pure string — we split aisle-bin. */
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

/**
 * Builds a pick list sorted by warehouse location (efficient walking order).
 * Validates products exist and quantities are positive; does not reserve stock yet.
 */
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

/**
 * Atomically fulfills a multi-line order:
 * 1) Validate every line (no partial commit).
 * 2) Decrement all quantities.
 * 3) Append one OUT transaction per line with the same order reference.
 */
export function fulfillOrder(
  data: WarehouseData,
  input: FulfillOrderInput,
): Result<WarehouseData> {
  if (!input.customer.trim()) return fail("Customer / destination is required.");
  if (!input.reference.trim()) return fail("Order reference is required.");
  if (!input.date) return fail("Date is required.");

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
      party: input.customer.trim(),
      date: input.date,
      reference: input.reference.trim(),
      notes: input.notes?.trim() || `Fulfillment pick step ${item.step} @ ${item.location}`,
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
