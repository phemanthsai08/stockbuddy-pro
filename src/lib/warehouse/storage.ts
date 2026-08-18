/**
 * StockNova — persistence layer (LocalStorage).
 * The only module that talks to LocalStorage directly.
 */
import { createSeedData } from "./sample-data";
import { FIELD_LIMITS, sanitizeText } from "./sanitize";
import type { Product, Settings, Transaction, WarehouseData } from "./types";

export const STORAGE_KEY = "stocknova:data:v1";

export const EMPTY_DATA: WarehouseData = {
  products: [],
  transactions: [],
  settings: {
    companyName: "StockNova",
    currency: "$",
    managerName: "Warehouse Manager",
    seeded: false,
  },
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sanitizeProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  if (typeof p["sku"] !== "string" || typeof p["name"] !== "string") return null;
  const num = (v: unknown, fallback = 0) =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return {
    id: typeof p["id"] === "string" ? p["id"] : crypto.randomUUID(),
    sku: sanitizeText(String(p["sku"]), FIELD_LIMITS.sku),
    name: sanitizeText(String(p["name"]), FIELD_LIMITS.name),
    category:
      typeof p["category"] === "string"
        ? sanitizeText(p["category"], FIELD_LIMITS.category) || "Uncategorized"
        : "Uncategorized",
    quantity: Math.max(0, Math.round(num(p["quantity"]))),
    minimumStock: Math.max(0, Math.round(num(p["minimumStock"]))),
    location:
      typeof p["location"] === "string"
        ? sanitizeText(p["location"], FIELD_LIMITS.location) || "—"
        : "—",
    unitPrice: Math.max(0, num(p["unitPrice"])),
    supplier:
      typeof p["supplier"] === "string"
        ? sanitizeText(p["supplier"], FIELD_LIMITS.supplier) || "—"
        : "—",
    createdAt: typeof p["createdAt"] === "string" ? p["createdAt"] : new Date().toISOString(),
    updatedAt: typeof p["updatedAt"] === "string" ? p["updatedAt"] : new Date().toISOString(),
  };
}

function sanitizeTransaction(raw: unknown): Transaction | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  if (t["type"] !== "IN" && t["type"] !== "OUT") return null;
  const qty =
    typeof t["quantity"] === "number" && Number.isFinite(t["quantity"]) ? t["quantity"] : 0;
  if (qty <= 0) return null;
  return {
    id: typeof t["id"] === "string" ? t["id"] : crypto.randomUUID(),
    productId: typeof t["productId"] === "string" ? t["productId"] : "",
    productName:
      typeof t["productName"] === "string" ? t["productName"] : "Unknown product",
    sku: typeof t["sku"] === "string" ? t["sku"] : "—",
    type: t["type"],
    quantity: Math.round(qty),
    party:
      typeof t["party"] === "string"
        ? sanitizeText(t["party"], FIELD_LIMITS.party) || "—"
        : "—",
    date: typeof t["date"] === "string" ? t["date"] : new Date().toISOString().slice(0, 10),
    reference:
      typeof t["reference"] === "string"
        ? sanitizeText(t["reference"], FIELD_LIMITS.reference) || "—"
        : "—",
    notes: typeof t["notes"] === "string" ? sanitizeText(t["notes"], FIELD_LIMITS.notes) : "",
    createdAt: typeof t["createdAt"] === "string" ? t["createdAt"] : new Date().toISOString(),
  };
}

function sanitizeSettings(raw: unknown): Settings {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    companyName: typeof s["companyName"] === "string" ? s["companyName"] : "StockNova",
    currency: typeof s["currency"] === "string" ? s["currency"] : "$",
    managerName: typeof s["managerName"] === "string" ? s["managerName"] : "Warehouse Manager",
    seeded: s["seeded"] === true,
  };
}

/** Defensive parse: corrupted LocalStorage must never crash the app. */
export function parseData(rawJson: string | null): WarehouseData | null {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const obj = parsed as Record<string, unknown>;
    const products = Array.isArray(obj["products"])
      ? obj["products"].map(sanitizeProduct).filter((p): p is Product => p !== null)
      : [];
    const transactions = Array.isArray(obj["transactions"])
      ? obj["transactions"].map(sanitizeTransaction).filter((t): t is Transaction => t !== null)
      : [];
    return { products, transactions, settings: sanitizeSettings(obj["settings"]) };
  } catch {
    return null;
  }
}

export function loadData(): WarehouseData {
  if (!isBrowser()) return EMPTY_DATA;
  const existing = parseData(window.localStorage.getItem(STORAGE_KEY));
  if (existing && existing.products.length > 0) return existing;
  const seeded = createSeedData();
  saveData(seeded);
  return seeded;
}

export function saveData(data: WarehouseData): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("StockNova: unable to persist data", error);
  }
}

export function resetData(): WarehouseData {
  const seeded = createSeedData();
  saveData(seeded);
  return seeded;
}
