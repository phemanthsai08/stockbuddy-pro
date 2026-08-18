/**
 * StockNova — shared domain types.
 */

export const CATEGORIES = [
  "Electronics",
  "Office Supplies",
  "Packaging",
  "Hardware",
  "Safety Equipment",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minimumStock: number;
  location: string;
  unitPrice: number;
  supplier: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = "IN" | "OUT";

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: TransactionType;
  quantity: number;
  /** Supplier for stock-in, destination/customer for stock-out. */
  party: string;
  date: string; // yyyy-mm-dd
  reference: string;
  notes?: string;
  createdAt: string;
}

export interface Settings {
  companyName: string;
  currency: string;
  managerName: string;
  seeded: boolean;
}

export interface WarehouseData {
  products: Product[];
  transactions: Transaction[];
  settings: Settings;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;
