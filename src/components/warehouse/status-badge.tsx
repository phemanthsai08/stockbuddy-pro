import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/warehouse/logic";
import type { StockStatus, TransactionType } from "@/lib/warehouse/types";

const STATUS_STYLES: Record<StockStatus, string> = {
  IN_STOCK: "bg-success-soft text-success border-success/25",
  LOW_STOCK: "bg-warning-soft text-warning-foreground border-warning/35",
  OUT_OF_STOCK: "bg-destructive-soft text-destructive border-destructive/25",
};

const BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

export function StatusBadge({ status, className }: { status: StockStatus; className?: string }) {
  return (
    <span className={cn(BASE, STATUS_STYLES[status], className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function TypeBadge({ type }: { type: TransactionType }) {
  return (
    <span
      className={cn(
        BASE,
        type === "IN"
          ? "bg-success-soft text-success border-success/25"
          : "bg-info-soft text-info border-info/25",
      )}
    >
      {type === "IN" ? "Stock In" : "Stock Out"}
    </span>
  );
}
