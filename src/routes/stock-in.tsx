import { createFileRoute } from "@tanstack/react-router";

import { MovementForm } from "@/components/warehouse/movement-form";
import { PageHeader } from "@/components/warehouse/page-header";
import { TransactionsTable } from "@/components/warehouse/transactions-table";
import { useWarehouse } from "@/lib/warehouse/store";

export const Route = createFileRoute("/stock-in")({
  head: () => ({
    meta: [
      { title: "Stock In — StockNova" },
      {
        name: "description",
        content:
          "Record incoming warehouse deliveries: select a product, enter quantity, supplier and reference to increase inventory instantly.",
      },
      { property: "og:title", content: "Stock In — StockNova" },
      {
        property: "og:description",
        content: "Log supplier deliveries and increase stock levels in StockNova.",
      },
    ],
  }),
  component: StockInPage,
});

function StockInPage() {
  const { data, stockIn } = useWarehouse();
  const recent = data.transactions.filter((t) => t.type === "IN").slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock In"
        description="Record incoming deliveries. Inventory quantities update immediately."
      />
      <MovementForm mode="IN" onSubmit={stockIn} />

      <section className="card-surface overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="font-display text-base font-semibold">Recent Stock In</h2>
          <p className="text-xs text-muted-foreground">Last incoming movements</p>
        </div>
        <TransactionsTable transactions={recent} />
      </section>
    </div>
  );
}
