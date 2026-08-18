/**
 * StockNova — unit tests for pure warehouse business logic.
 * Run with: npm test
 */
import { describe, expect, it } from "vitest";
import {
  addProduct,
  calculateDashboard,
  calculateStockStatus,
  deleteProduct,
  filterProducts,
  getAlertItems,
  getLowStockItems,
  getOutOfStockItems,
  getReorderSuggestions,
  inventoryValue,
  stockIn,
  stockOut,
  updateProduct,
  validateProductInput,
} from "./logic";
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

function makeData(products: Product[] = [], transactions: WarehouseData["transactions"] = []): WarehouseData {
  return {
    products,
    transactions,
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

describe("calculateStockStatus", () => {
  it("returns OUT_OF_STOCK when quantity is 0", () => {
    expect(calculateStockStatus(makeProduct({ quantity: 0 }))).toBe("OUT_OF_STOCK");
  });

  it("returns LOW_STOCK when quantity <= minimumStock", () => {
    expect(calculateStockStatus(makeProduct({ quantity: 10, minimumStock: 10 }))).toBe("LOW_STOCK");
    expect(calculateStockStatus(makeProduct({ quantity: 5, minimumStock: 10 }))).toBe("LOW_STOCK");
  });

  it("returns IN_STOCK when quantity > minimumStock", () => {
    expect(calculateStockStatus(makeProduct({ quantity: 11, minimumStock: 10 }))).toBe("IN_STOCK");
  });
});

describe("getLowStockItems / getOutOfStockItems / getAlertItems", () => {
  const products = [
    makeProduct({ id: "1", quantity: 0, name: "Out" }),
    makeProduct({ id: "2", quantity: 5, minimumStock: 10, name: "Low" }),
    makeProduct({ id: "3", quantity: 100, minimumStock: 10, name: "Healthy" }),
  ];

  it("detects out of stock", () => {
    expect(getOutOfStockItems(products)).toHaveLength(1);
    expect(getOutOfStockItems(products)[0]!.name).toBe("Out");
  });

  it("detects low stock", () => {
    expect(getLowStockItems(products)).toHaveLength(1);
    expect(getLowStockItems(products)[0]!.name).toBe("Low");
  });

  it("combines alerts (out first, then low)", () => {
    const alerts = getAlertItems(products);
    expect(alerts).toHaveLength(2);
    expect(alerts[0]!.name).toBe("Out");
    expect(alerts[1]!.name).toBe("Low");
  });
});

describe("inventoryValue", () => {
  it("sums quantity * unitPrice", () => {
    const products = [
      makeProduct({ quantity: 10, unitPrice: 5 }),
      makeProduct({ id: "p-2", quantity: 4, unitPrice: 2.5 }),
    ];
    expect(inventoryValue(products)).toBe(60);
  });
});

describe("validateProductInput", () => {
  it("rejects empty name", () => {
    expect(validateProductInput({ ...baseInput, name: "  " }, [])).toMatch(/name/i);
  });

  it("rejects duplicate SKU (case-insensitive)", () => {
    const existing = [makeProduct({ sku: "ABC-1" })];
    expect(validateProductInput({ ...baseInput, sku: "abc-1" }, existing)).toMatch(/already exists/i);
  });

  it("allows same SKU when editing the same product", () => {
    const existing = [makeProduct({ id: "p-1", sku: "ABC-1" })];
    expect(validateProductInput({ ...baseInput, sku: "ABC-1" }, existing, "p-1")).toBeNull();
  });

  it("rejects negative quantity", () => {
    expect(validateProductInput({ ...baseInput, quantity: -1 }, [])).toMatch(/quantity/i);
  });
});

describe("addProduct / updateProduct / deleteProduct", () => {
  it("adds a product", () => {
    const data = makeData();
    const result = addProduct(data, baseInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products).toHaveLength(1);
      expect(result.value.products[0]!.sku).toBe("NEW-100");
      expect(result.value.products[0]!.name).toBe("New Widget");
    }
  });

  it("rejects duplicate SKU on add", () => {
    const data = makeData([makeProduct({ sku: "NEW-100" })]);
    const result = addProduct(data, baseInput);
    expect(result.ok).toBe(false);
  });

  it("updates a product", () => {
    const data = makeData([makeProduct({ id: "p-1", name: "Old" })]);
    const result = updateProduct(data, "p-1", { ...baseInput, name: "Updated" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products[0]!.name).toBe("Updated");
    }
  });

  it("deletes a product", () => {
    const data = makeData([makeProduct({ id: "p-1" })]);
    const result = deleteProduct(data, "p-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products).toHaveLength(0);
    }
  });

  it("fails delete when product missing", () => {
    const result = deleteProduct(makeData(), "missing");
    expect(result.ok).toBe(false);
  });
});

describe("stockIn / stockOut", () => {
  const product = makeProduct({ id: "p-1", quantity: 40 });
  const data = makeData([product]);

  const movement = {
    productId: "p-1",
    quantity: 10,
    party: "Supplier X",
    date: "2026-08-18",
    reference: "PO-1",
  };

  it("increases quantity on stock in and creates transaction", () => {
    const result = stockIn(data, movement);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products[0]!.quantity).toBe(50);
      expect(result.value.transactions).toHaveLength(1);
      expect(result.value.transactions[0]!.type).toBe("IN");
      expect(result.value.transactions[0]!.quantity).toBe(10);
    }
  });

  it("decreases quantity on stock out", () => {
    const result = stockOut(data, { ...movement, party: "Customer Y", reference: "SO-1" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products[0]!.quantity).toBe(30);
      expect(result.value.transactions[0]!.type).toBe("OUT");
    }
  });

  it("rejects stock out that exceeds available quantity", () => {
    const result = stockOut(data, { ...movement, quantity: 100, party: "Customer Y", reference: "SO-2" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/insufficient/i);
    }
  });

  it("rejects zero or negative quantity", () => {
    expect(stockIn(data, { ...movement, quantity: 0 }).ok).toBe(false);
    expect(stockOut(data, { ...movement, quantity: -5, party: "C", reference: "R" }).ok).toBe(false);
  });

  it("rejects missing product", () => {
    expect(stockIn(data, { ...movement, productId: "missing" }).ok).toBe(false);
  });
});

describe("calculateDashboard", () => {
  it("computes KPIs from products and today's transactions", () => {
    const today = new Date().toISOString().slice(0, 10);
    const products = [
      makeProduct({ id: "1", quantity: 0 }),
      makeProduct({ id: "2", quantity: 5, minimumStock: 10 }),
      makeProduct({ id: "3", quantity: 20, minimumStock: 5, unitPrice: 10 }),
    ];
    const transactions = [
      {
        id: "t1",
        productId: "3",
        productName: "Test",
        sku: "SKU",
        type: "IN" as const,
        quantity: 7,
        party: "S",
        date: today,
        reference: "PO",
        createdAt: new Date().toISOString(),
      },
      {
        id: "t2",
        productId: "3",
        productName: "Test",
        sku: "SKU",
        type: "OUT" as const,
        quantity: 3,
        party: "C",
        date: today,
        reference: "SO",
        createdAt: new Date().toISOString(),
      },
    ];
    const stats = calculateDashboard(makeData(products, transactions));
    expect(stats.totalProducts).toBe(3);
    expect(stats.totalUnits).toBe(25);
    expect(stats.outOfStockCount).toBe(1);
    expect(stats.lowStockCount).toBe(1);
    expect(stats.stockInToday).toBe(7);
    expect(stats.stockOutToday).toBe(3);
    expect(stats.transactionsToday).toBe(2);
    expect(stats.inventoryValue).toBe(0 * 12.5 + 5 * 12.5 + 20 * 10);
  });
});

describe("filterProducts", () => {
  const products = [
    makeProduct({ id: "1", name: "Wireless Mouse", sku: "ELC-1", category: "Electronics", quantity: 5, minimumStock: 10 }),
    makeProduct({ id: "2", name: "Packing Tape", sku: "PKG-1", category: "Packaging", quantity: 100, minimumStock: 20 }),
  ];

  it("filters by search term", () => {
    const result = filterProducts(products, { search: "mouse", category: "all", status: "all", sortBy: "name" });
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("Wireless Mouse");
  });

  it("filters by status", () => {
    const result = filterProducts(products, { search: "", category: "all", status: "LOW_STOCK", sortBy: "name" });
    expect(result).toHaveLength(1);
    expect(result[0]!.sku).toBe("ELC-1");
  });

  it("filters by category", () => {
    const result = filterProducts(products, { search: "", category: "Packaging", status: "all", sortBy: "name" });
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("Packing Tape");
  });
});

describe("getReorderSuggestions", () => {
  it("suggests quantity for low-stock products", () => {
    const product = makeProduct({ id: "p-1", quantity: 5, minimumStock: 20 });
    const suggestions = getReorderSuggestions([product], []);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]!.suggestedQty).toBeGreaterThan(0);
    expect(suggestions[0]!.product.id).toBe("p-1");
  });

  it("returns empty when all stock is healthy", () => {
    const product = makeProduct({ quantity: 100, minimumStock: 10 });
    expect(getReorderSuggestions([product], [])).toHaveLength(0);
  });

  it("uses demand velocity when outbound history exists", () => {
    const product = makeProduct({ id: "p-1", quantity: 0, minimumStock: 10 });
    const today = new Date().toISOString().slice(0, 10);
    const txs = [
      {
        id: "t1",
        productId: "p-1",
        productName: "Test",
        sku: "SKU",
        type: "OUT" as const,
        quantity: 28,
        party: "C",
        date: today,
        reference: "SO",
        createdAt: new Date().toISOString(),
      },
    ];
    const suggestions = getReorderSuggestions([product], txs, 14);
    expect(suggestions[0]!.avgDailyOut).toBeGreaterThan(0);
    expect(suggestions[0]!.suggestedQty).toBeGreaterThan(10);
  });
});
