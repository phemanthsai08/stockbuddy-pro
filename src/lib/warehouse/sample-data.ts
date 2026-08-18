/**
 * StockNova — first-launch seed data.
 * Only used when LocalStorage is empty; never overwrites user data.
 */
import type { Product, Transaction, WarehouseData } from "./types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

interface SeedProduct {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minimumStock: number;
  location: string;
  unitPrice: number;
  supplier: string;
}

const SEED_PRODUCTS: SeedProduct[] = [
  { sku: "ELC-1001", name: "Wireless Mouse", category: "Electronics", quantity: 8, minimumStock: 20, location: "A-12", unitPrice: 18.5, supplier: "Nexus Peripherals" },
  { sku: "ELC-1002", name: "Mechanical Keyboard", category: "Electronics", quantity: 46, minimumStock: 15, location: "A-13", unitPrice: 62.0, supplier: "Nexus Peripherals" },
  { sku: "ELC-1003", name: "USB-C Cable 2m", category: "Electronics", quantity: 132, minimumStock: 40, location: "A-04", unitPrice: 6.25, supplier: "Cabletech Ltd" },
  { sku: "ELC-1004", name: "LED Monitor 24\"", category: "Electronics", quantity: 21, minimumStock: 8, location: "B-01", unitPrice: 149.99, supplier: "Vertex Displays" },
  { sku: "ELC-1005", name: "Power Adapter 65W", category: "Electronics", quantity: 0, minimumStock: 12, location: "B-03", unitPrice: 29.4, supplier: "Cabletech Ltd" },
  { sku: "ELC-1006", name: "Network Cable Cat6", category: "Electronics", quantity: 210, minimumStock: 60, location: "B-07", unitPrice: 4.1, supplier: "Cabletech Ltd" },
  { sku: "OFF-2001", name: "Office Paper A4 (500)", category: "Office Supplies", quantity: 74, minimumStock: 25, location: "C-02", unitPrice: 5.75, supplier: "PaperWorks Co" },
  { sku: "OFF-2002", name: "Printer Cartridge XL", category: "Office Supplies", quantity: 11, minimumStock: 12, location: "C-05", unitPrice: 41.0, supplier: "PrintPro Supplies" },
  { sku: "OFF-2003", name: "Barcode Labels Roll", category: "Office Supplies", quantity: 58, minimumStock: 20, location: "C-09", unitPrice: 12.3, supplier: "PrintPro Supplies" },
  { sku: "PKG-3001", name: "Cardboard Box Medium", category: "Packaging", quantity: 340, minimumStock: 100, location: "D-01", unitPrice: 1.15, supplier: "BoxLine Packaging" },
  { sku: "PKG-3002", name: "Packing Tape 50m", category: "Packaging", quantity: 26, minimumStock: 30, location: "D-04", unitPrice: 2.4, supplier: "BoxLine Packaging" },
  { sku: "PKG-3003", name: "Bubble Wrap Roll", category: "Packaging", quantity: 63, minimumStock: 20, location: "D-06", unitPrice: 9.8, supplier: "BoxLine Packaging" },
  { sku: "HRD-4001", name: "Storage Container 60L", category: "Hardware", quantity: 37, minimumStock: 10, location: "E-02", unitPrice: 22.5, supplier: "IronGrid Tools" },
  { sku: "HRD-4002", name: "Pallet Jack Wheels", category: "Hardware", quantity: 0, minimumStock: 6, location: "E-08", unitPrice: 34.9, supplier: "IronGrid Tools" },
  { sku: "SAF-5001", name: "Safety Gloves (Pair)", category: "Safety Equipment", quantity: 92, minimumStock: 40, location: "F-01", unitPrice: 3.6, supplier: "GuardWell Safety" },
  { sku: "SAF-5002", name: "Safety Helmet", category: "Safety Equipment", quantity: 14, minimumStock: 15, location: "F-03", unitPrice: 17.25, supplier: "GuardWell Safety" },
];

interface SeedTx {
  sku: string;
  type: "IN" | "OUT";
  quantity: number;
  party: string;
  daysAgo: number;
  reference: string;
}

const SEED_TRANSACTIONS: SeedTx[] = [
  { sku: "ELC-1003", type: "IN", quantity: 60, party: "Cabletech Ltd", daysAgo: 6, reference: "PO-10241" },
  { sku: "PKG-3001", type: "IN", quantity: 200, party: "BoxLine Packaging", daysAgo: 6, reference: "PO-10242" },
  { sku: "ELC-1001", type: "OUT", quantity: 24, party: "Retail Branch North", daysAgo: 5, reference: "SO-88120" },
  { sku: "OFF-2001", type: "IN", quantity: 40, party: "PaperWorks Co", daysAgo: 5, reference: "PO-10250" },
  { sku: "SAF-5001", type: "OUT", quantity: 18, party: "Loading Bay Team", daysAgo: 4, reference: "SO-88131" },
  { sku: "ELC-1004", type: "IN", quantity: 12, party: "Vertex Displays", daysAgo: 4, reference: "PO-10256" },
  { sku: "ELC-1005", type: "OUT", quantity: 30, party: "Retail Branch South", daysAgo: 3, reference: "SO-88147" },
  { sku: "PKG-3002", type: "OUT", quantity: 22, party: "Dispatch Line 2", daysAgo: 3, reference: "SO-88152" },
  { sku: "HRD-4001", type: "IN", quantity: 25, party: "IronGrid Tools", daysAgo: 2, reference: "PO-10263" },
  { sku: "OFF-2002", type: "OUT", quantity: 9, party: "Head Office", daysAgo: 2, reference: "SO-88166" },
  { sku: "ELC-1006", type: "IN", quantity: 120, party: "Cabletech Ltd", daysAgo: 1, reference: "PO-10271" },
  { sku: "SAF-5002", type: "OUT", quantity: 11, party: "Site Crew A", daysAgo: 1, reference: "SO-88174" },
  { sku: "ELC-1002", type: "IN", quantity: 18, party: "Nexus Peripherals", daysAgo: 0, reference: "PO-10280" },
  { sku: "PKG-3003", type: "OUT", quantity: 14, party: "Dispatch Line 1", daysAgo: 0, reference: "SO-88190" },
  { sku: "OFF-2003", type: "OUT", quantity: 6, party: "Labeling Station", daysAgo: 0, reference: "SO-88193" },
];

export function createSeedData(): WarehouseData {
  const now = new Date().toISOString();

  const products: Product[] = SEED_PRODUCTS.map((p, i) => ({
    ...p,
    id: `seed-p-${i + 1}`,
    createdAt: now,
    updatedAt: now,
  }));

  const transactions: Transaction[] = SEED_TRANSACTIONS.map((t, i) => {
    const product = products.find((p) => p.sku === t.sku)!;
    return {
      id: `seed-t-${i + 1}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: t.type,
      quantity: t.quantity,
      party: t.party,
      date: daysAgo(t.daysAgo),
      reference: t.reference,
      notes: "",
      createdAt: new Date(Date.now() - t.daysAgo * 86400000).toISOString(),
    };
  });

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
