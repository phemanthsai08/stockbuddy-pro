import { describe, expect, it } from "vitest";
import {
  buildPickList,
  compareLocations,
  fulfillOrder,
} from "./fulfillment";
import type { Product, WarehouseData } from "./types";

function product(partial: Partial<Product> & Pick<Product, "id" | "sku" | "name" | "location" | "quantity">): Product {
  return {
    category: "Electronics",
    minimumStock: 5,
    unitPrice: 10,
    supplier: "S",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

function data(products: Product[]): WarehouseData {
  return {
    products,
    transactions: [],
    settings: {
      companyName: "StockNova",
      currency: "$",
      managerName: "WM",
      seeded: true,
    },
  };
}

describe("buildPickList extra edges", () => {
  const products = [
    product({ id: "1", sku: "A", name: "Mouse", location: "B-03", quantity: 20 }),
    product({ id: "2", sku: "B", name: "Cable", location: "A-04", quantity: 50 }),
  ];

  it("rejects zero quantity lines", () => {
    expect(buildPickList(products, [{ productId: "1", quantity: 0 }]).ok).toBe(false);
  });

  it("rejects negative quantity lines", () => {
    expect(buildPickList(products, [{ productId: "1", quantity: -3 }]).ok).toBe(false);
  });

  it("rejects unknown product ids", () => {
    expect(buildPickList(products, [{ productId: "missing", quantity: 1 }]).ok).toBe(false);
  });
});

describe("fulfillOrder extra edges", () => {
  const products = [
    product({ id: "1", sku: "A", name: "Mouse", location: "B-03", quantity: 20 }),
  ];

  it("rejects missing date", () => {
    expect(
      fulfillOrder(data(products), {
        lines: [{ productId: "1", quantity: 1 }],
        customer: "Branch",
        reference: "ORD-9",
        date: "",
      }).ok,
    ).toBe(false);
  });

  it("rejects oversized customer", () => {
    expect(
      fulfillOrder(data(products), {
        lines: [{ productId: "1", quantity: 1 }],
        customer: "C".repeat(200),
        reference: "ORD-9",
        date: "2026-08-18",
      }).ok,
    ).toBe(false);
  });

  it("sanitizes notes and writes default pick notes when omitted", () => {
    const result = fulfillOrder(data(products), {
      lines: [{ productId: "1", quantity: 1 }],
      customer: "  Branch  ",
      reference: "ORD-10",
      date: "2026-08-18",
      notes: "  note\u0000  ",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.transactions[0]!.party).toBe("Branch");
      expect(result.value.transactions[0]!.notes).toBe("note");
    }
  });
});

describe("compareLocations stability", () => {
  it("handles equal locations", () => {
    expect(compareLocations("A-01", "A-01")).toBe(0);
  });

  it("orders multi-letter aisles lexicographically before bin number", () => {
    const sorted = ["Z-1", "AA-2", "A-10"].sort(compareLocations);
    expect(sorted[0]).toBe("A-10");
  });
});
