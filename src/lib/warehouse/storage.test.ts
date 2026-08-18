import { describe, expect, it } from "vitest";
import { parseData } from "./storage";

describe("parseData", () => {
  it("returns null for empty or invalid JSON", () => {
    expect(parseData(null)).toBeNull();
    expect(parseData("")).toBeNull();
    expect(parseData("{not json")).toBeNull();
    expect(parseData("null")).toBeNull();
  });

  it("keeps valid products and drops broken ones", () => {
    const raw = JSON.stringify({
      products: [
        {
          id: "1",
          sku: "OK-1",
          name: "Good",
          category: "Hardware",
          quantity: 5,
          minimumStock: 2,
          location: "A-1",
          unitPrice: 3,
          supplier: "S",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        { sku: 123, name: null },
        null,
      ],
      transactions: [
        {
          id: "t1",
          productId: "1",
          productName: "Good",
          sku: "OK-1",
          type: "IN",
          quantity: 2,
          party: "S",
          date: "2026-08-01",
          reference: "PO",
          createdAt: "2026-08-01T00:00:00.000Z",
        },
        { type: "MAYBE", quantity: 1 },
      ],
      settings: { companyName: "Demo Co", seeded: true },
    });
    const data = parseData(raw);
    expect(data).not.toBeNull();
    expect(data!.products).toHaveLength(1);
    expect(data!.products[0]!.sku).toBe("OK-1");
    expect(data!.transactions).toHaveLength(1);
    expect(data!.settings.companyName).toBe("Demo Co");
    expect(data!.settings.seeded).toBe(true);
  });

  it("clamps negative quantities to zero", () => {
    const raw = JSON.stringify({
      products: [
        {
          sku: "X",
          name: "Neg",
          quantity: -5,
          minimumStock: -1,
          unitPrice: -2,
        },
      ],
      transactions: [],
      settings: {},
    });
    const data = parseData(raw)!;
    expect(data.products[0]!.quantity).toBe(0);
    expect(data.products[0]!.minimumStock).toBe(0);
    expect(data.products[0]!.unitPrice).toBe(0);
  });

  it("returns null for non-object JSON roots", () => {
    expect(parseData("[]")).toBeNull();
    expect(parseData("42")).toBeNull();
    expect(parseData('"string"')).toBeNull();
  });

  it("fills default settings when missing", () => {
    const raw = JSON.stringify({
      products: [
        {
          sku: "S1",
          name: "Item",
          quantity: 1,
          minimumStock: 0,
          unitPrice: 1,
        },
      ],
      transactions: [],
    });
    const data = parseData(raw)!;
    expect(data.settings.companyName).toBe("StockNova");
    expect(data.settings.seeded).toBe(false);
  });
});
