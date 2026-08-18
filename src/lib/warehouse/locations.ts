/**
 * StockNova — warehouse location / bin aggregation.
 * Used by the floor map so managers see hotspots at a glance.
 */
import { calculateStockStatus, type StockStatus } from "./logic";
import { compareLocations } from "./fulfillment";
import type { Product } from "./types";

export interface BinCell {
  location: string;
  productCount: number;
  totalUnits: number;
  /** Worst status among products in this bin (OUT > LOW > IN). */
  status: StockStatus;
  productNames: string[];
}

const STATUS_RANK: Record<StockStatus, number> = {
  OUT_OF_STOCK: 2,
  LOW_STOCK: 1,
  IN_STOCK: 0,
};

function worse(a: StockStatus, b: StockStatus): StockStatus {
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b;
}

/** Group products into bins sorted by location. */
export function buildBinMap(products: Product[]): BinCell[] {
  const map = new Map<string, BinCell>();

  for (const p of products) {
    const loc = p.location.trim() || "—";
    const status = calculateStockStatus(p);
    const existing = map.get(loc);
    if (!existing) {
      map.set(loc, {
        location: loc,
        productCount: 1,
        totalUnits: p.quantity,
        status,
        productNames: [p.name],
      });
    } else {
      existing.productCount += 1;
      existing.totalUnits += p.quantity;
      existing.status = worse(existing.status, status);
      if (existing.productNames.length < 4) existing.productNames.push(p.name);
    }
  }

  return [...map.values()].sort((a, b) => compareLocations(a.location, b.location));
}
