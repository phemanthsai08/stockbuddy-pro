import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CircleSlash,
  Package,
  RotateCcw,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/warehouse/kpi-card";
import { EmptyState } from "@/components/warehouse/page-header";
import { TransactionsTable } from "@/components/warehouse/transactions-table";
import { formatCurrency, formatNumber } from "@/lib/warehouse/logic";
import { useWarehouse, useWarehouseStats } from "@/lib/warehouse/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — StockNova Warehouse Management" },
      {
        name: "description",
        content:
          "Live warehouse dashboard with stock KPIs, movement charts, low-stock alerts and recent inventory transactions.",
      },
      { property: "og:title", content: "StockNova Dashboard — Smart Warehouse Management" },
      {
        property: "og:description",
        content: "Track stock levels, movements and alerts across your warehouse in real time.",
      },
    ],
  }),
  component: DashboardPage,
});

const STATUS_COLORS = ["var(--success)", "var(--warning)", "var(--destructive)"];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-5">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <p className="mb-4 text-xs text-muted-foreground">{subtitle}</p>
      <div className="h-[260px] w-full">{children}</div>
    </section>
  );
}

function DashboardPage() {
  const { data, ready, resetDemoData } = useWarehouse();
  const { stats, categories, movement, status, lowStock } = useWarehouseStats();
  const recent = data.transactions.slice(0, 8);
  const isEmpty = ready && data.products.length === 0;

  return (
    <div className="space-y-6">
      <header className="card-surface p-5">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          {greeting()}, Warehouse Manager
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {!ready
            ? "Loading your warehouse data…"
            : isEmpty
              ? "No products yet. Load demo data to explore the full warehouse experience."
              : `${stats.transactionsToday} movements logged today · ${formatNumber(stats.stockInToday)} units received · ${formatNumber(stats.stockOutToday)} units dispatched · ${stats.lowStockCount + stats.outOfStockCount} items need attention.`}
        </p>
        {isEmpty ? (
          <Button className="mt-4" onClick={resetDemoData}>
            <RotateCcw className="size-4" aria-hidden /> Load Demo Data
          </Button>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Products"
          value={formatNumber(stats.totalProducts)}
          icon={Package}
          hint="Active SKUs"
        />
        <KpiCard
          label="Total Stock Units"
          value={formatNumber(stats.totalUnits)}
          icon={Boxes}
          tone="info"
          hint="Units on hand"
        />
        <KpiCard
          label="Low Stock Items"
          value={formatNumber(stats.lowStockCount)}
          icon={AlertTriangle}
          tone="warning"
          hint="At or below minimum"
        />
        <KpiCard
          label="Out of Stock"
          value={formatNumber(stats.outOfStockCount)}
          icon={CircleSlash}
          tone="danger"
          hint="Requires reorder"
        />
        <KpiCard
          label="Stock In Today"
          value={formatNumber(stats.stockInToday)}
          icon={ArrowDownToLine}
          tone="success"
          hint="Units received"
        />
        <KpiCard
          label="Stock Out Today"
          value={formatNumber(stats.stockOutToday)}
          icon={ArrowUpFromLine}
          tone="info"
          hint="Units dispatched"
        />
        <KpiCard
          label="Inventory Value"
          value={formatCurrency(stats.inventoryValue)}
          icon={Wallet}
          tone="success"
          hint="Quantity × unit price"
        />
        <div className="card-surface flex flex-col justify-center gap-2 p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Quick actions
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/stock-in">Stock In</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/stock-out">Stock Out</Link>
            </Button>
            <Button size="sm" variant="secondary" onClick={resetDemoData}>
              <RotateCcw className="size-3.5" aria-hidden /> Demo data
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Inventory by Category" subtitle="Units on hand per product category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} margin={{ left: -18, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v: string) => (v.length > 10 ? `${v.slice(0, 9)}…` : v)}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="units" name="Units" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Stock Movement" subtitle="Stock in vs stock out over the last 7 days">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={movement} margin={{ left: -18, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="stockIn"
                name="Stock In"
                stroke="var(--success)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="stockOut"
                name="Stock Out"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Stock Status" subtitle="Healthy, low and out-of-stock products">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={status}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={2}
              >
                {status.map((entry, index) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card-surface overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="font-display text-base font-semibold">Recent Activity</h2>
              <p className="text-xs text-muted-foreground">Latest warehouse transactions</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/reports">View reports</Link>
            </Button>
          </div>
          <TransactionsTable transactions={recent} />
        </section>

        <section className="card-surface flex flex-col p-5">
          <h2 className="font-display text-base font-semibold">Low Stock Panel</h2>
          <p className="text-xs text-muted-foreground">Products at or below minimum level</p>
          <div className="mt-4 flex-1 space-y-3">
            {lowStock.length === 0 ? (
              <EmptyState
                title="All stock is healthy"
                description="No product has dropped to its minimum level."
              />
            ) : (
              lowStock.slice(0, 5).map((p) => (
                <div key={p.id} className="rounded-lg border border-warning/30 bg-warning-soft p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-warning-foreground">
                    <AlertTriangle className="size-4" aria-hidden />
                    {p.name}
                  </p>
                  <p className="mt-1 text-xs text-warning-foreground/80">
                    Current: {formatNumber(p.quantity)} · Minimum: {formatNumber(p.minimumStock)} ·
                    Location: {p.location}
                  </p>
                </div>
              ))
            )}
          </div>
          <Button asChild className="mt-4 w-full" variant="outline">
            <Link to="/inventory">View Inventory</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
