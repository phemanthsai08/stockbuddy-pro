import { describe, expect, it } from "vitest";
import { buildBinMap } from "./locations";
import type { Product } from "./types";

function p(o: Partial<Product> & Pick<Product, "id" | "name" | "location" | "quantity" | "minimumStock">): Product {
  return {
    sku: "S",
    category: "Electronics",
    unitPrice: 1,
    supplier: "X",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...o,
  };
}

describe("buildBinMap", () => {
  it("aggregates status as worst of products in bin", () => {
    const bins = buildBinMap([
      p({ id: "1", name: "Ok", location: "A-01", quantity: 50, minimumStock: 10 }),
      p({ id: "2", name: "Low", location: "A-01", quantity: 5, minimumStock: 10 }),
      p({ id: "3", name: "Out", location: "B-02", quantity: 0, minimumStock: 5 }),
    ]);
    expect(bins).toHaveLength(2);
    const a = bins.find((b) => b.location === "A-01")!;
    expect(a.productCount).toBe(2);
    expect(a.status).toBe("LOW_STOCK");
    const b = bins.find((b) => b.location === "B-02")!;
    expect(b.status).toBe("OUT_OF_STOCK");
  });

  it("sorts bins by location", () => {
    const bins = buildBinMap([
      p({ id: "1", name: "B", location: "B-01", quantity: 1, minimumStock: 1 }),
      p({ id: "2", name: "A", location: "A-10", quantity: 1, minimumStock: 1 }),
    ]);
    expect(bins.map((x) => x.location)).toEqual(["A-10", "B-01"]);
  });

  it("aggregates total units across products in same bin", () => {
    const bins = buildBinMap([
      p({ id: "1", name: "A", location: "C-05", quantity: 3, minimumStock: 1 }),
      p({ id: "2", name: "B", location: "C-05", quantity: 7, minimumStock: 1 }),
    ]);
    expect(bins).toHaveLength(1);
    expect(bins[0]!.totalUnits).toBe(10);
    expect(bins[0]!.productCount).toBe(2);
  });

  it("returns empty map for empty inventory", () => {
    expect(buildBinMap([])).toEqual([]);
  });
});
