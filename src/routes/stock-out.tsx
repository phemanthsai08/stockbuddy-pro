import { createFileRoute } from "@tanstack/react-router";

import { MovementForm } from "@/components/warehouse/movement-form";
import { PageHeader } from "@/components/warehouse/page-header";
import { TransactionsTable } from "@/components/warehouse/transactions-table";
import { useWarehouse } from "@/lib/warehouse/store";

export const Route = createFileRoute("/stock-out")({
  head: () => ({
    meta: [
      { title: "Stock Out — StockNova" },
      {
        name: "description",
        content:
          "Dispatch stock to customers and branches. StockNova validates available quantity and prevents negative inventory.",
      },
      { property: "og:title", content: "Stock Out — StockNova" },
      {
        property: "og:description",
        content: "Record outgoing shipments with automatic stock availability checks.",
      },
    ],
  }),
  component: StockOutPage,
});

function StockOutPage() {
  const { data, stockOut } = useWarehouse();
  const recent = data.transactions.filter((t) => t.type === "OUT").slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Out"
        description="Dispatch stock. Requests larger than available quantity are rejected."
      />
      <MovementForm mode="OUT" onSubmit={stockOut} />

      <section className="card-surface overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="font-display text-base font-semibold">Recent Stock Out</h2>
          <p className="text-xs text-muted-foreground">Last outgoing movements</p>
        </div>
        <TransactionsTable transactions={recent} />
      </section>
    </div>
  );
}
