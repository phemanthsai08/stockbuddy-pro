/**
 * Security-focused domain tests (length limits, normalization).
 */
import { describe, expect, it } from "vitest";
import { addProduct, stockIn, stockOut } from "./logic";
import type { Product, ProductInput, WarehouseData } from "./types";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p-1",
    sku: "SKU-001",
    name: "Test Product",
    category: "Electronics",
    quantity: 50,
    minimumStock: 10,
    location: "A-01",
    unitPrice: 12.5,
    supplier: "Supplier A",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeData(products: Product[] = []): WarehouseData {
  return {
    products,
    transactions: [],
    settings: {
      companyName: "StockNova",
      currency: "$",
      managerName: "Warehouse Manager",
      seeded: true,
    },
  };
}

const baseInput: ProductInput = {
  sku: "NEW-100",
  name: "New Widget",
  category: "Hardware",
  quantity: 25,
  minimumStock: 5,
  location: "B-02",
  unitPrice: 9.99,
  supplier: "Acme",
};

describe("security & input limits", () => {
  it("rejects oversized product name", () => {
    const result = addProduct(makeData(), { ...baseInput, name: "N".repeat(200) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/at most/i);
  });

  it("rejects quantity above hard max", () => {
    const result = addProduct(makeData(), { ...baseInput, quantity: 5_000_000 });
    expect(result.ok).toBe(false);
  });

  it("normalizes SKU to uppercase and trims name", () => {
    const result = addProduct(makeData(), {
      ...baseInput,
      sku: "  abc-1  ",
      name: "  Widget  ",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products[0]!.sku).toBe("ABC-1");
      expect(result.value.products[0]!.name).toBe("Widget");
    }
  });

  it("rejects stock-out with oversized party", () => {
    const data = makeData([makeProduct({ id: "p1", quantity: 50 })]);
    const result = stockOut(data, {
      productId: "p1",
      quantity: 1,
      party: "X".repeat(200),
      date: "2026-08-18",
      reference: "R-1",
    });
    expect(result.ok).toBe(false);
  });

  it("sanitizes notes on successful stock-in", () => {
    const data = makeData([makeProduct({ id: "p1", quantity: 10 })]);
    const result = stockIn(data, {
      productId: "p1",
      quantity: 2,
      party: "Supplier",
      date: "2026-08-18",
      reference: "PO-1",
      notes: "  hello\u0000  world  ",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.transactions[0]!.notes).toBe("hello world");
    }
  });
});
