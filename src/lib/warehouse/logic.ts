/**
 * StockNova — pure business logic.
 * All stock rules, KPI calculations and chart aggregations live here so that
 * no page duplicates business rules.
 */
import type {
  Product,
  ProductInput,
  StockStatus,
  Transaction,
  TransactionType,
  WarehouseData,
} from "./types";

/* ------------------------------------------------------------------ utils */

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatCurrency(value: number, currency = "$"): string {
  return `${currency}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/* --------------------------------------------------------------- statuses */

export function calculateStockStatus(product: Product): StockStatus {
  if (product.quantity === 0) return "OUT_OF_STOCK";
  if (product.quantity <= product.minimumStock) return "LOW_STOCK";
  return "IN_STOCK";
}

export const STATUS_LABEL: Record<StockStatus, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

/* -------------------------------------------------------------- selectors */

export function getLowStockItems(products: Product[]): Product[] {
  return products
    .filter((p) => calculateStockStatus(p) === "LOW_STOCK")
    .sort((a, b) => a.quantity - a.minimumStock - (b.quantity - b.minimumStock));
}

export function getOutOfStockItems(products: Product[]): Product[] {
  return products.filter((p) => p.quantity === 0);
}

export function getAlertItems(products: Product[]): Product[] {
  return [...getOutOfStockItems(products), ...getLowStockItems(products)];
}

export function inventoryValue(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
}

export interface DashboardStats {
  totalProducts: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockInToday: number;
  stockOutToday: number;
  inventoryValue: number;
  transactionsToday: number;
}

export function calculateDashboard(data: WarehouseData): DashboardStats {
  const today = todayISO();
  const todays = data.transactions.filter((t) => t.date === today);
  return {
    totalProducts: data.products.length,
    totalUnits: data.products.reduce((sum, p) => sum + p.quantity, 0),
    lowStockCount: getLowStockItems(data.products).length,
    outOfStockCount: getOutOfStockItems(data.products).length,
    stockInToday: todays.filter((t) => t.type === "IN").reduce((s, t) => s + t.quantity, 0),
    stockOutToday: todays.filter((t) => t.type === "OUT").reduce((s, t) => s + t.quantity, 0),
    inventoryValue: inventoryValue(data.products),
    transactionsToday: todays.length,
  };
}

/* ----------------------------------------------------------- aggregations */

export interface CategoryRow {
  category: string;
  units: number;
  products: number;
  value: number;
}

export function categoryBreakdown(products: Product[]): CategoryRow[] {
  const map = new Map<string, CategoryRow>();
  for (const p of products) {
    const row = map.get(p.category) ?? {
      category: p.category,
      units: 0,
      products: 0,
      value: 0,
    };
    row.units += p.quantity;
    row.products += 1;
    row.value += p.quantity * p.unitPrice;
    map.set(p.category, row);
  }
  return [...map.values()].sort((a, b) => b.units - a.units);
}

export interface MovementRow {
  date: string;
  label: string;
  stockIn: number;
  stockOut: number;
}

/** Stock-in vs stock-out totals for the last `days` days (oldest first). */
export function movementSeries(transactions: Transaction[], days = 7): MovementRow[] {
  const rows: MovementRow[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const dayTx = transactions.filter((t) => t.date === iso);
    rows.push({
      date: iso,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      stockIn: dayTx.filter((t) => t.type === "IN").reduce((s, t) => s + t.quantity, 0),
      stockOut: dayTx.filter((t) => t.type === "OUT").reduce((s, t) => s + t.quantity, 0),
    });
  }
  return rows;
}

export function statusBreakdown(products: Product[]) {
  const counts = { IN_STOCK: 0, LOW_STOCK: 0, OUT_OF_STOCK: 0 };
  for (const p of products) counts[calculateStockStatus(p)] += 1;
  return [
    { key: "IN_STOCK", name: "Healthy Stock", value: counts.IN_STOCK },
    { key: "LOW_STOCK", name: "Low Stock", value: counts.LOW_STOCK },
    { key: "OUT_OF_STOCK", name: "Out of Stock", value: counts.OUT_OF_STOCK },
  ];
}

/* ------------------------------------------------------------- mutations  */

export type Result<T = void> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

export function validateProductInput(
  input: ProductInput,
  products: Product[],
  ignoreId?: string,
): string | null {
  if (!input.name.trim()) return "Product name is required.";
  if (!input.sku.trim()) return "SKU is required.";
  if (!input.category.trim()) return "Category is required.";
  if (!input.location.trim()) return "Warehouse location is required.";
  if (!Number.isFinite(input.quantity) || input.quantity < 0)
    return "Quantity must be zero or a positive number.";
  if (!Number.isFinite(input.minimumStock) || input.minimumStock < 0)
    return "Minimum stock must be zero or a positive number.";
  if (!Number.isFinite(input.unitPrice) || input.unitPrice < 0)
    return "Unit price must be a valid positive amount.";
  const duplicate = products.some(
    (p) => p.sku.toLowerCase() === input.sku.trim().toLowerCase() && p.id !== ignoreId,
  );
  if (duplicate) return `SKU "${input.sku.trim()}" already exists.`;
  return null;
}

export function addProduct(data: WarehouseData, input: ProductInput): Result<WarehouseData> {
  const error = validateProductInput(input, data.products);
  if (error) return fail(error);
  const now = new Date().toISOString();
  const product: Product = {
    ...input,
    sku: input.sku.trim().toUpperCase(),
    name: input.name.trim(),
    id: newId("p"),
    createdAt: now,
    updatedAt: now,
  };
  return { ok: true, value: { ...data, products: [product, ...data.products] } };
}

export function updateProduct(
  data: WarehouseData,
  id: string,
  input: ProductInput,
): Result<WarehouseData> {
  const existing = data.products.find((p) => p.id === id);
  if (!existing) return fail("Product not found.");
  const error = validateProductInput(input, data.products, id);
  if (error) return fail(error);
  const updated: Product = {
    ...existing,
    ...input,
    sku: input.sku.trim().toUpperCase(),
    name: input.name.trim(),
    updatedAt: new Date().toISOString(),
  };
  return {
    ok: true,
    value: { ...data, products: data.products.map((p) => (p.id === id ? updated : p)) },
  };
}

export function deleteProduct(data: WarehouseData, id: string): Result<WarehouseData> {
  if (!data.products.some((p) => p.id === id)) return fail("Product not found.");
  return { ok: true, value: { ...data, products: data.products.filter((p) => p.id !== id) } };
}

export interface MovementInput {
  productId: string;
  quantity: number;
  party: string;
  date: string;
  reference: string;
  notes?: string;
}

function applyMovement(
  data: WarehouseData,
  input: MovementInput,
  type: TransactionType,
): Result<WarehouseData> {
  const product = data.products.find((p) => p.id === input.productId);
  if (!product) return fail("Please select a valid product.");
  if (!Number.isFinite(input.quantity) || input.quantity <= 0)
    return fail("Quantity must be greater than zero.");
  const quantity = Math.round(input.quantity);
  if (!input.party.trim())
    return fail(type === "IN" ? "Supplier is required." : "Destination / customer is required.");
  if (!input.date) return fail("Date is required.");
  if (!input.reference.trim()) return fail("Reference number is required.");
  if (type === "OUT" && quantity > product.quantity) return fail("Insufficient stock available.");

  const nextQuantity = type === "IN" ? product.quantity + quantity : product.quantity - quantity;
  const transaction: Transaction = {
    id: newId("t"),
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    type,
    quantity,
    party: input.party.trim(),
    date: input.date,
    reference: input.reference.trim(),
    notes: input.notes?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };

  return {
    ok: true,
    value: {
      ...data,
      products: data.products.map((p) =>
        p.id === product.id
          ? { ...p, quantity: nextQuantity, updatedAt: new Date().toISOString() }
          : p,
      ),
      transactions: [transaction, ...data.transactions],
    },
  };
}

export function stockIn(data: WarehouseData, input: MovementInput): Result<WarehouseData> {
  return applyMovement(data, input, "IN");
}

export function stockOut(data: WarehouseData, input: MovementInput): Result<WarehouseData> {
  return applyMovement(data, input, "OUT");
}

/* -------------------------------------------------------------- filtering */

export interface InventoryFilters {
  search: string;
  category: string; // "all" | category
  status: string; // "all" | StockStatus
  sortBy: string;
}

export function filterProducts(products: Product[], filters: InventoryFilters): Product[] {
  const term = filters.search.trim().toLowerCase();
  const result = products.filter((p) => {
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      p.supplier.toLowerCase().includes(term);
    const matchesCategory = filters.category === "all" || p.category === filters.category;
    const matchesStatus = filters.status === "all" || calculateStockStatus(p) === filters.status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sorted = [...result];
  switch (filters.sortBy) {
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "qty-asc":
      sorted.sort((a, b) => a.quantity - b.quantity);
      break;
    case "qty-desc":
      sorted.sort((a, b) => b.quantity - a.quantity);
      break;
    case "value-desc":
      sorted.sort((a, b) => b.quantity * b.unitPrice - a.quantity * a.unitPrice);
      break;
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}

/* ------------------------------------------------------------------- csv  */

export function toCSV(rows: Array<Record<string, string | number>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h] ?? "")).join(",")),
  ].join("\n");
}

export function downloadCSV(filename: string, csv: string): void {
  if (typeof document === "undefined" || !csv) return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
