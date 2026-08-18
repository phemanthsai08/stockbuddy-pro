import { EmptyState } from "@/components/warehouse/page-header";
import { TypeBadge } from "@/components/warehouse/status-badge";
import { formatDate, formatNumber } from "@/lib/warehouse/logic";
import type { Transaction } from "@/lib/warehouse/types";

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Recorded stock in and stock out movements will appear here."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
            <th scope="col" className="px-4 py-3 font-semibold">Product</th>
            <th scope="col" className="px-4 py-3 font-semibold">Type</th>
            <th scope="col" className="px-4 py-3 font-semibold">Quantity</th>
            <th scope="col" className="px-4 py-3 font-semibold">Date</th>
            <th scope="col" className="px-4 py-3 font-semibold">Reference</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-border/70 last:border-0 hover:bg-surface">
              <td className="px-4 py-3">
                <span className="block font-medium">{t.productName}</span>
                <span className="block text-xs text-muted-foreground">
                  {t.sku} · {t.party}
                </span>
              </td>
              <td className="px-4 py-3">
                <TypeBadge type={t.type} />
              </td>
              <td className="px-4 py-3 font-semibold tabular-nums">
                <span className={t.type === "IN" ? "text-success" : "text-info"}>
                  {t.type === "IN" ? "+" : "−"}
                  {formatNumber(t.quantity)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatDate(t.date)}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{t.reference}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                  Completed
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
