import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CircleSlash, PackagePlus, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/warehouse/kpi-card";
import { EmptyState, PageHeader } from "@/components/warehouse/page-header";
import { StatusBadge } from "@/components/warehouse/status-badge";
import {
  calculateStockStatus,
  formatNumber,
  getReorderSuggestions,
} from "@/lib/warehouse/logic";
import { useWarehouse, useWarehouseStats } from "@/lib/warehouse/store";
import type { Product } from "@/lib/warehouse/types";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Stock Alerts — StockNova" },
      {
        name: "description",
        content:
          "Automatic low-stock and out-of-stock alerts with severity, current quantity, minimum level, warehouse location and smart reorder suggestions.",
      },
      { property: "og:title", content: "Stock Alerts — StockNova" },
      {
        property: "og:description",
        content: "See every product that needs replenishment, ranked by severity, with suggested order quantities.",
      },
    ],
  }),
  component: AlertsPage,
});

function AlertRow({ product, severity }: { product: Product; severity: "critical" | "warning" }) {
  const tone =
    severity === "critical"
      ? "border-destructive/30 bg-destructive-soft"
      : "border-warning/30 bg-warning-soft";
  const Icon = severity === "critical" ? CircleSlash : AlertTriangle;
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border p-4 ${tone}`}>
      <Icon
        className={`size-5 shrink-0 ${severity === "critical" ? "text-destructive" : "text-warning-foreground"}`}
        aria-hidden
      />
      <div className="min-w-[180px] flex-1">
        <p className="font-semibold">{product.name}</p>
        <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
      </div>
      <p className="text-sm">
        Current: <strong>{formatNumber(product.quantity)}</strong>
      </p>
      <p className="text-sm">
        Minimum: <strong>{formatNumber(product.minimumStock)}</strong>
      </p>
      <p className="text-sm">
        Location: <strong>{product.location}</strong>
      </p>
      <StatusBadge status={calculateStockStatus(product)} />
    </div>
  );
}

function AlertsPage() {
  const { data } = useWarehouse();
  const { lowStock, outOfStock, stats } = useWarehouseStats();
  const total = lowStock.length + outOfStock.length;

  const suggestions = useMemo(
    () => getReorderSuggestions(data.products, data.transactions),
    [data.products, data.transactions],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Products are flagged automatically whenever quantity reaches the minimum level. Smart reorder suggestions use recent demand velocity."
        actions={
          <Button asChild variant="outline">
            <Link to="/inventory">Go to Inventory</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Critical Alerts"
          value={formatNumber(outOfStock.length)}
          icon={CircleSlash}
          tone="danger"
          hint="Out of stock"
        />
        <KpiCard
          label="Warnings"
          value={formatNumber(lowStock.length)}
          icon={AlertTriangle}
          tone="warning"
          hint="At or below minimum"
        />
        <KpiCard
          label="Healthy Products"
          value={formatNumber(stats.totalProducts - total)}
          icon={ShieldCheck}
          tone="success"
          hint="No action needed"
        />
      </div>

      {suggestions.length > 0 ? (
        <section className="card-surface p-5">
          <div className="flex items-start gap-3">
            <PackagePlus className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <h2 className="font-display text-base font-semibold">Smart Reorder Suggestions</h2>
              <p className="text-xs text-muted-foreground">
                Suggested quantities based on recent outbound velocity (last 14 days) or 2× minimum when history is thin.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {suggestions.map((s) => (
              <div
                key={s.product.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="min-w-[180px] flex-1">
                  <p className="font-semibold">{s.product.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{s.product.sku}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                </div>
                <p className="text-sm">
                  On hand: <strong>{formatNumber(s.product.quantity)}</strong>
                </p>
                <p className="text-sm">
                  Min: <strong>{formatNumber(s.product.minimumStock)}</strong>
                </p>
                <p className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                  Suggest order: {formatNumber(s.suggestedQty)} units
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button asChild size="sm">
              <Link to="/stock-in">Record Stock In</Link>
            </Button>
          </div>
        </section>
      ) : null}

      <section className="card-surface p-5">
        <h2 className="font-display text-base font-semibold text-destructive">
          Out of Stock ({outOfStock.length})
        </h2>
        <p className="text-xs text-muted-foreground">Critical — reorder immediately</p>
        <div className="mt-4 space-y-3">
          {outOfStock.length === 0 ? (
            <EmptyState
              title="Nothing out of stock"
              description="Every product still has units available."
            />
          ) : (
            outOfStock.map((p) => <AlertRow key={p.id} product={p} severity="critical" />)
          )}
        </div>
      </section>

      <section className="card-surface p-5">
        <h2 className="font-display text-base font-semibold text-warning-foreground">
          Low Stock ({lowStock.length})
        </h2>
        <p className="text-xs text-muted-foreground">Warning — schedule replenishment</p>
        <div className="mt-4 space-y-3">
          {lowStock.length === 0 ? (
            <EmptyState
              title="No low-stock products"
              description="All quantities are above their minimum levels."
            />
          ) : (
            lowStock.map((p) => <AlertRow key={p.id} product={p} severity="warning" />)
          )}
        </div>
      </section>
    </div>
  );
}
