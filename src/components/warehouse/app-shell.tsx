import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { StockNovaLogo } from "@/components/warehouse/logo";
import { cn } from "@/lib/utils";
import { getAlertItems } from "@/lib/warehouse/logic";
import { useWarehouse } from "@/lib/warehouse/store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/stock-in", label: "Stock In", icon: ArrowDownToLine },
  { to: "/stock-out", label: "Stock Out", icon: ArrowUpFromLine },
  { to: "/fulfillment", label: "Fulfillment", icon: ClipboardList },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useWarehouse();
  const alertCount = getAlertItems(data.products).length;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background lg:flex">
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <span className="text-sidebar-primary">
            <StockNovaLogo />
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-bold tracking-tight">STOCKNOVA</p>
            <p className="truncate text-[11px] text-sidebar-foreground/65">
              Smart Warehouse System
            </p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-md p-1 hover:bg-sidebar-accent lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-[18px]" aria-hidden />
                {item.label}
                {item.label === "Alerts" && alertCount > 0 ? (
                  <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">
                    {alertCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-4 text-[11px] text-sidebar-foreground/60">
          Data stored locally in your browser
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
          <button
            type="button"
            className="rounded-md border border-border p-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold">
              {NAV.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)))
                ?.label ?? "StockNova"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {data.products.length} products tracked · {data.transactions.length} transactions
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-semibold">Warehouse Manager</span>
              <span className="block text-[11px] text-muted-foreground">Central Depot</span>
            </span>
            <span
              className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
              aria-hidden
            >
              WM
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
