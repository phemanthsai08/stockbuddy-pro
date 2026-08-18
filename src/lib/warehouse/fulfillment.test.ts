import { describe, expect, it } from "vitest";
import {
  buildPickList,
  compareLocations,
  fulfillOrder,
  pickListTotalUnits,
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

describe("compareLocations", () => {
  it("sorts by aisle then bin number", () => {
    const locs = ["B-03", "A-12", "A-2", "C-01"];
    const sorted = [...locs].sort(compareLocations);
    expect(sorted).toEqual(["A-2", "A-12", "B-03", "C-01"]);
  });
});

describe("buildPickList", () => {
  const products = [
    product({ id: "1", sku: "A", name: "Mouse", location: "B-03", quantity: 20 }),
    product({ id: "2", sku: "B", name: "Cable", location: "A-04", quantity: 50 }),
    product({ id: "3", sku: "C", name: "Tape", location: "A-12", quantity: 10 }),
  ];

  it("orders stops by location", () => {
    const result = buildPickList(products, [
      { productId: "1", quantity: 2 },
      { productId: "2", quantity: 5 },
      { productId: "3", quantity: 1 },
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.map((i) => i.location)).toEqual(["A-04", "A-12", "B-03"]);
      expect(result.value[0]!.step).toBe(1);
      expect(result.value[2]!.step).toBe(3);
    }
  });

  it("rejects insufficient stock", () => {
    const result = buildPickList(products, [{ productId: "3", quantity: 99 }]);
    expect(result.ok).toBe(false);
  });

  it("rejects empty lines", () => {
    expect(buildPickList(products, []).ok).toBe(false);
  });

  it("rejects duplicate products", () => {
    const result = buildPickList(products, [
      { productId: "1", quantity: 1 },
      { productId: "1", quantity: 2 },
    ]);
    expect(result.ok).toBe(false);
  });
});

describe("fulfillOrder", () => {
  const products = [
    product({ id: "1", sku: "A", name: "Mouse", location: "B-03", quantity: 20 }),
    product({ id: "2", sku: "B", name: "Cable", location: "A-04", quantity: 50 }),
  ];

  it("atomically decrements all lines and writes OUT transactions", () => {
    const result = fulfillOrder(data(products), {
      lines: [
        { productId: "1", quantity: 3 },
        { productId: "2", quantity: 10 },
      ],
      customer: "Branch North",
      reference: "ORD-1",
      date: "2026-08-18",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const mouse = result.value.products.find((p) => p.id === "1")!;
      const cable = result.value.products.find((p) => p.id === "2")!;
      expect(mouse.quantity).toBe(17);
      expect(cable.quantity).toBe(40);
      expect(result.value.transactions).toHaveLength(2);
      expect(result.value.transactions.every((t) => t.type === "OUT")).toBe(true);
      expect(result.value.transactions.every((t) => t.reference === "ORD-1")).toBe(true);
    }
  });

  it("does not change inventory when validation fails", () => {
    const original = data(products);
    const result = fulfillOrder(original, {
      lines: [{ productId: "1", quantity: 999 }],
      customer: "X",
      reference: "ORD-2",
      date: "2026-08-18",
    });
    expect(result.ok).toBe(false);
  });

  it("requires customer and reference", () => {
    expect(
      fulfillOrder(data(products), {
        lines: [{ productId: "1", quantity: 1 }],
        customer: "",
        reference: "ORD",
        date: "2026-08-18",
      }).ok,
    ).toBe(false);
  });
});

describe("pickListTotalUnits", () => {
  it("sums quantities", () => {
    expect(
      pickListTotalUnits([
        {
          step: 1,
          productId: "1",
          sku: "A",
          name: "A",
          location: "A-1",
          quantity: 3,
          available: 10,
          unitPrice: 1,
        },
        {
          step: 2,
          productId: "2",
          sku: "B",
          name: "B",
          location: "B-1",
          quantity: 7,
          available: 10,
          unitPrice: 1,
        },
      ]),
    ).toBe(10);
  });
});
