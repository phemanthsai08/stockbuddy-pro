import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Download, MapPin, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/warehouse/page-header";
import {
  buildPickList,
  pickListTotalUnits,
  pickListTotalValue,
  type FulfillmentLine,
  type PickListItem,
} from "@/lib/warehouse/fulfillment";
import { downloadCSV, formatCurrency, formatNumber, todayISO, toCSV } from "@/lib/warehouse/logic";
import { useWarehouse } from "@/lib/warehouse/store";

export const Route = createFileRoute("/fulfillment")({
  head: () => ({
    meta: [
      { title: "Order Fulfillment — StockNova" },
      {
        name: "description",
        content:
          "Build multi-line customer orders, generate location-sorted pick lists, export CSV, and fulfill stock in one atomic operation.",
      },
      { property: "og:title", content: "Order Fulfillment — StockNova" },
      {
        property: "og:description",
        content: "Smart warehouse order fulfillment with efficient bin-ordered picking.",
      },
    ],
  }),
  component: FulfillmentPage,
});

const SELECT_CLASS = "h-9 w-full rounded-md border border-input bg-card px-3 text-sm";

interface DraftLine {
  key: string;
  productId: string;
  quantity: string;
}

function FulfillmentPage() {
  const { data, ready, fulfillOrder } = useWarehouse();

  const [customer, setCustomer] = useState("Retail Branch North");
  const [reference, setReference] = useState(() => `ORD-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { key: "1", productId: "", quantity: "1" },
  ]);
  const [pickList, setPickList] = useState<PickListItem[] | null>(null);

  const availableProducts = useMemo(
    () => data.products.filter((p) => p.quantity > 0).sort((a, b) => a.name.localeCompare(b.name)),
    [data.products],
  );

  const toLines = (): FulfillmentLine[] =>
    lines
      .filter((l) => l.productId)
      .map((l) => ({
        productId: l.productId,
        quantity: Number(l.quantity),
      }));

  const handlePreview = () => {
    const result = buildPickList(data.products, toLines());
    if (!result.ok) {
      toast.error(result.error);
      setPickList(null);
      return;
    }
    setPickList(result.value);
    toast.success(`Pick list ready — ${result.value.length} stop(s) in location order`);
  };

  const handleFulfill = () => {
    const ok = fulfillOrder({
      lines: toLines(),
      customer,
      reference,
      date,
      notes,
    });
    if (ok) {
      setPickList(null);
      setLines([{ key: String(Date.now()), productId: "", quantity: "1" }]);
      setReference(`ORD-${Date.now().toString().slice(-6)}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Fulfillment"
        description="Build a multi-line order, preview a location-sorted pick list, export CSV, then fulfill atomically (no partial picks)."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Order details</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ful-customer">Customer / destination</Label>
              <Input
                id="ful-customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Customer or branch name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ful-ref">Order reference</Label>
              <Input
                id="ful-ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ful-date">Date</Label>
              <Input
                id="ful-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ful-notes">Notes (optional)</Label>
              <Input
                id="ful-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Priority, dock, etc."
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Line items</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setLines((prev) => [
                    ...prev,
                    { key: String(Date.now()), productId: "", quantity: "1" },
                  ])
                }
              >
                <Plus className="size-4" aria-hidden /> Add line
              </Button>
            </div>

            {lines.map((line, index) => (
              <div key={line.key} className="flex flex-wrap items-end gap-2">
                <div className="min-w-[200px] flex-1 space-y-1.5">
                  <Label htmlFor={`line-p-${line.key}`}>Product {index + 1}</Label>
                  <select
                    id={`line-p-${line.key}`}
                    className={SELECT_CLASS}
                    value={line.productId}
                    onChange={(e) => {
                      const productId = e.target.value;
                      setLines((prev) =>
                        prev.map((l) => (l.key === line.key ? { ...l, productId } : l)),
                      );
                      setPickList(null);
                    }}
                  >
                    <option value="">Select product…</option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — {p.quantity} @ {p.location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24 space-y-1.5">
                  <Label htmlFor={`line-q-${line.key}`}>Qty</Label>
                  <Input
                    id={`line-q-${line.key}`}
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => {
                      setLines((prev) =>
                        prev.map((l) =>
                          l.key === line.key ? { ...l, quantity: e.target.value } : l,
                        ),
                      );
                      setPickList(null);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Remove line"
                  disabled={lines.length === 1}
                  onClick={() => {
                    setLines((prev) => prev.filter((l) => l.key !== line.key));
                    setPickList(null);
                  }}
                >
                  <Trash2 className="size-4 text-destructive" aria-hidden />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" onClick={handlePreview} disabled={!ready}>
              <ClipboardList className="size-4" aria-hidden /> Preview pick list
            </Button>
          </div>
        </section>

        <section className="card-surface flex flex-col p-5">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <h2 className="font-display text-base font-semibold">Pick list (location order)</h2>
              <p className="text-xs text-muted-foreground">
                Stops are sorted by aisle/bin so pickers walk an efficient path through the warehouse.
              </p>
            </div>
          </div>

          {!pickList ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Add products and click <strong>Preview pick list</strong> to see the walking order.
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span>
                  Stops: <strong>{pickList.length}</strong>
                </span>
                <span>
                  Units: <strong>{formatNumber(pickListTotalUnits(pickList))}</strong>
                </span>
                <span>
                  Value: <strong>{formatCurrency(pickListTotalValue(pickList))}</strong>
                </span>
              </div>
              <ol className="mt-4 flex-1 space-y-2">
                {pickList.map((item) => (
                  <li
                    key={item.productId}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {item.step}
                    </span>
                    <span className="rounded-md bg-card px-2 py-0.5 font-mono text-xs font-semibold">
                      {item.location}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{item.sku}</span>
                    </span>
                    <span className="tabular-nums font-semibold">× {formatNumber(item.quantity)}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const csv = toCSV(
                      pickList.map((item) => ({
                        Step: item.step,
                        Location: item.location,
                        SKU: item.sku,
                        Product: item.name,
                        Qty: item.quantity,
                      })),
                    );
                    downloadCSV(`pick-list-${reference}.csv`, csv);
                    toast.success("Pick list exported");
                  }}
                >
                  <Download className="size-4" aria-hidden /> Export CSV
                </Button>
                <Button type="button" className="flex-1" onClick={handleFulfill}>
                  Fulfill order and update inventory
                </Button>
              </div>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Atomic: either every line succeeds or nothing is changed.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
