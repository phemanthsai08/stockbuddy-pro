/**
 * Extra coverage: formatters, CSV, breakdowns, normalize, sort variants.
 */
import { describe, expect, it } from "vitest";
import {
  categoryBreakdown,
  filterProducts,
  formatCurrency,
  formatDate,
  formatNumber,
  movementSeries,
  newId,
  normalizeProductInput,
  statusBreakdown,
  toCSV,
  todayISO,
} from "./logic";
import type { Product, ProductInput } from "./types";

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

describe("formatters & ids", () => {
  it("formatCurrency uses two decimal places", () => {
    expect(formatCurrency(12.5)).toContain("12.50");
    expect(formatCurrency(1000, "€")).toMatch(/€/);
  });

  it("formatNumber localizes", () => {
    expect(formatNumber(1234)).toBeTruthy();
  });

  it("formatDate returns original on invalid input", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });

  it("todayISO is yyyy-mm-dd", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("newId includes prefix", () => {
    expect(newId("p")).toMatch(/^p-/);
  });
});

describe("normalizeProductInput", () => {
  it("uppercases SKU and sanitizes whitespace", () => {
    const n = normalizeProductInput({
      ...baseInput,
      sku: "  ab-99  ",
      name: "  Hello   World  ",
    });
    expect(n.sku).toBe("AB-99");
    expect(n.name).toBe("Hello World");
  });
});

describe("categoryBreakdown / statusBreakdown / movementSeries", () => {
  it("categoryBreakdown groups value by category", () => {
    const products = [
      makeProduct({ category: "Electronics", quantity: 2, unitPrice: 10 }),
      makeProduct({ id: "2", category: "Electronics", quantity: 1, unitPrice: 5 }),
      makeProduct({ id: "3", category: "Hardware", quantity: 4, unitPrice: 2 }),
    ];
    const rows = categoryBreakdown(products);
    expect(rows.find((r) => r.category === "Electronics")?.value).toBe(25);
    expect(rows.find((r) => r.category === "Hardware")?.value).toBe(8);
  });

  it("statusBreakdown counts statuses", () => {
    const products = [
      makeProduct({ quantity: 0 }),
      makeProduct({ id: "2", quantity: 5, minimumStock: 10 }),
      makeProduct({ id: "3", quantity: 50, minimumStock: 10 }),
    ];
    const rows = statusBreakdown(products);
    expect(rows.find((r) => r.key === "OUT_OF_STOCK")?.value).toBe(1);
    expect(rows.find((r) => r.key === "LOW_STOCK")?.value).toBe(1);
    expect(rows.find((r) => r.key === "IN_STOCK")?.value).toBe(1);
  });

  it("movementSeries returns requested number of days", () => {
    const series = movementSeries([], 5);
    expect(series).toHaveLength(5);
  });
});

describe("toCSV", () => {
  it("returns empty string for empty rows", () => {
    expect(toCSV([])).toBe("");
  });

  it("escapes commas and quotes", () => {
    const csv = toCSV([
      { name: 'Widget, "Pro"', qty: 2 },
      { name: "Simple", qty: 1 },
    ]);
    expect(csv).toContain('"Widget, ""Pro"""');
    expect(csv.split("\n")[0]).toBe("name,qty");
  });
});

describe("filterProducts sorting", () => {
  const products = [
    makeProduct({ id: "1", name: "Alpha", quantity: 5, unitPrice: 10 }),
    makeProduct({ id: "2", name: "Beta", quantity: 20, unitPrice: 1 }),
  ];

  it("sorts by quantity ascending", () => {
    const result = filterProducts(products, {
      search: "",
      category: "all",
      status: "all",
      sortBy: "qty-asc",
    });
    expect(result[0]!.name).toBe("Alpha");
  });

  it("sorts by value descending", () => {
    const result = filterProducts(products, {
      search: "",
      category: "all",
      status: "all",
      sortBy: "value-desc",
    });
    expect(result[0]!.name).toBe("Alpha");
  });
});
