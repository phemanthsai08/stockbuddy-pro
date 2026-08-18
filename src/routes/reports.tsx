import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KpiCard } from "@/components/warehouse/kpi-card";
import { EmptyState, PageHeader } from "@/components/warehouse/page-header";
import { StatusBadge } from "@/components/warehouse/status-badge";
import { TransactionsTable } from "@/components/warehouse/transactions-table";
import {
  calculateStockStatus,
  categoryBreakdown,
  downloadCSV,
  formatCurrency,
  formatNumber,
  getLowStockItems,
  toCSV,
} from "@/lib/warehouse/logic";
import { useWarehouse } from "@/lib/warehouse/store";
import { CATEGORIES } from "@/lib/warehouse/types";
import { Boxes, Package, Wallet } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — StockNova" },
      {
        name: "description",
        content:
          "Inventory summary, stock movement, category analysis, low-stock report and inventory valuation with CSV export.",
      },
      { property: "og:title", content: "Warehouse Reports — StockNova" },
      {
        property: "og:description",
        content: "Filter warehouse data by date, category and status, then export it as CSV.",
      },
    ],
  }),
  component: ReportsPage,
});

const SELECT_CLASS = "h-9 w-full rounded-md border border-input bg-card px-3 text-sm";

function ReportsPage() {
  const { data } = useWarehouse();
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const products = useMemo(
    () =>
      data.products.filter(
        (p) =>
          (category === "all" || p.category === category) &&
          (status === "all" || calculateStockStatus(p) === status),
      ),
    [data.products, category, status],
  );

  const transactions = useMemo(
    () =>
      data.transactions.filter((t) => {
        const product = data.products.find((p) => p.id === t.productId);
        const matchesCategory = category === "all" || product?.category === category;
        const matchesFrom = !from || t.date >= from;
        const matchesTo = !to || t.date <= to;
        return matchesCategory && matchesFrom && matchesTo;
      }),
    [data.transactions, data.products, category, from, to],
  );

  const categories = useMemo(() => categoryBreakdown(products), [products]);
  const lowStock = useMemo(() => getLowStockItems(products), [products]);
  const totalUnits = products.reduce((s, p) => s + p.quantity, 0);
  const totalValue = products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
  const inQty = transactions.filter((t) => t.type === "IN").reduce((s, t) => s + t.quantity, 0);
  const outQty = transactions.filter((t) => t.type === "OUT").reduce((s, t) => s + t.quantity, 0);

  const exportInventory = () =>
    downloadCSV(
      "stocknova-inventory.csv",
      toCSV(
        products.map((p) => ({
          SKU: p.sku,
          Product: p.name,
          Category: p.category,
          Quantity: p.quantity,
          MinimumStock: p.minimumStock,
          Location: p.location,
          UnitPrice: p.unitPrice.toFixed(2),
          StockValue: (p.quantity * p.unitPrice).toFixed(2),
          Supplier: p.supplier,
          Status: calculateStockStatus(p),
        })),
      ),
    );

  const exportTransactions = () =>
    downloadCSV(
      "stocknova-transactions.csv",
      toCSV(
        transactions.map((t) => ({
          Date: t.date,
          Type: t.type === "IN" ? "Stock In" : "Stock Out",
          SKU: t.sku,
          Product: t.productName,
          Quantity: t.quantity,
          Party: t.party,
          Reference: t.reference,
          Notes: t.notes ?? "",
        })),
      ),
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analyse inventory and movement data, then export it for your records."
        actions={
          <>
            <Button variant="outline" onClick={exportInventory} disabled={products.length === 0}>
              <Download className="size-4" aria-hidden /> Inventory CSV
            </Button>
            <Button variant="outline" onClick={exportTransactions} disabled={transactions.length === 0}>
              <Download className="size-4" aria-hidden /> Transactions CSV
            </Button>
          </>
        }
      />

      <section className="card-surface grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="grid gap-1.5">
          <Label htmlFor="r-from">From date</Label>
          <Input id="r-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="r-to">To date</Label>
          <Input id="r-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="r-category">Category</Label>
          <select
            id="r-category"
            className={SELECT_CLASS}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="r-status">Stock status</Label>
          <select
            id="r-status"
            className={SELECT_CLASS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Products" value={formatNumber(products.length)} icon={Package} />
        <KpiCard label="Units in Stock" value={formatNumber(totalUnits)} icon={Boxes} tone="info" />
        <KpiCard label="Inventory Value" value={formatCurrency(totalValue)} icon={Wallet} tone="success" />
        <div className="card-surface p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Stock movement
          </p>
          <p className="mt-2 text-sm">
            In: <strong className="text-success">+{formatNumber(inQty)}</strong>
          </p>
          <p className="text-sm">
            Out: <strong className="text-info">−{formatNumber(outQty)}</strong>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Net: {formatNumber(inQty - outQty)} units across {transactions.length} transactions
          </p>
        </div>
      </div>

      <section className="card-surface overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="font-display text-base font-semibold">Category Analysis</h2>
          <p className="text-xs text-muted-foreground">Products, units and value per category</p>
        </div>
        {categories.length === 0 ? (
          <EmptyState title="No data for these filters" description="Adjust the filters above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Products</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Units</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Stock Value</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Share of Value</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((row) => (
                  <tr key={row.category} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 font-medium">{row.category}</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(row.products)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(row.units)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(row.value)}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {totalValue > 0 ? `${((row.value / totalValue) * 100).toFixed(1)}%` : "0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card-surface overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="font-display text-base font-semibold">Low Stock Report</h2>
          <p className="text-xs text-muted-foreground">Products at or below their minimum level</p>
        </div>
        {lowStock.length === 0 ? (
          <EmptyState title="No low-stock products" description="Stock levels are healthy for the current filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th scope="col" className="px-4 py-3 font-semibold">SKU</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Product</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Quantity</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Minimum</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Shortfall</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(p.quantity)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(p.minimumStock)}</td>
                    <td className="px-4 py-3 tabular-nums text-warning-foreground">
                      {formatNumber(Math.max(0, p.minimumStock - p.quantity))}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={calculateStockStatus(p)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card-surface overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="font-display text-base font-semibold">Stock Movement Report</h2>
          <p className="text-xs text-muted-foreground">
            {transactions.length} transactions for the selected filters
          </p>
        </div>
        <TransactionsTable transactions={transactions.slice(0, 50)} />
      </section>
    </div>
  );
}
