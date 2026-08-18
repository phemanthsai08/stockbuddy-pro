import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/warehouse/status-badge";
import {
  calculateStockStatus,
  formatNumber,
  todayISO,
  type MovementInput,
} from "@/lib/warehouse/logic";
import { useWarehouse } from "@/lib/warehouse/store";

interface MovementFormProps {
  mode: "IN" | "OUT";
  onSubmit: (input: MovementInput) => boolean;
}

function blankForm(): MovementInput {
  return { productId: "", quantity: 0, party: "", date: todayISO(), reference: "", notes: "" };
}

export function MovementForm({ mode, onSubmit }: MovementFormProps) {
  const { data } = useWarehouse();
  const [form, setForm] = useState<MovementInput>(blankForm);

  const products = useMemo(
    () => [...data.products].sort((a, b) => a.name.localeCompare(b.name)),
    [data.products],
  );
  const selected = products.find((p) => p.id === form.productId) ?? null;

  const set = <K extends keyof MovementInput>(key: K, value: MovementInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const projected = selected
    ? mode === "IN"
      ? selected.quantity + (Number(form.quantity) || 0)
      : selected.quantity - (Number(form.quantity) || 0)
    : null;

  return (
    <form
      className="card-surface grid gap-4 p-5 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (onSubmit(form)) setForm(blankForm());
      }}
    >
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="m-product">Product *</Label>
        <select
          id="m-product"
          className="h-9 rounded-md border border-input bg-card px-3 text-sm"
          value={form.productId}
          onChange={(e) => set("productId", e.target.value)}
        >
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku}) — {formatNumber(p.quantity)} in stock
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="m-qty">Quantity *</Label>
        <Input
          id="m-qty"
          type="number"
          min={1}
          value={form.quantity === 0 ? "" : String(form.quantity)}
          onChange={(e) => set("quantity", Number(e.target.value))}
          placeholder="25"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="m-party">{mode === "IN" ? "Supplier *" : "Destination / customer *"}</Label>
        <Input
          id="m-party"
          value={form.party}
          onChange={(e) => set("party", e.target.value)}
          placeholder={mode === "IN" ? "Cabletech Ltd" : "Retail Branch North"}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="m-date">Date *</Label>
        <Input
          id="m-date"
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="m-ref">{mode === "IN" ? "Reference number *" : "Order number *"}</Label>
        <Input
          id="m-ref"
          value={form.reference}
          onChange={(e) => set("reference", e.target.value)}
          placeholder={mode === "IN" ? "PO-10280" : "SO-88190"}
        />
      </div>

      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="m-notes">Notes</Label>
        <Textarea
          id="m-notes"
          rows={3}
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Optional remarks about this movement"
        />
      </div>

      {selected ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-surface px-4 py-3 text-sm sm:col-span-2">
          <span className="text-muted-foreground">
            Current stock: <strong className="text-foreground">{formatNumber(selected.quantity)}</strong>
          </span>
          <span className="text-muted-foreground">
            After this movement:{" "}
            <strong className={projected !== null && projected < 0 ? "text-destructive" : "text-foreground"}>
              {formatNumber(projected ?? 0)}
            </strong>
          </span>
          <span className="text-muted-foreground">Location: {selected.location}</span>
          <StatusBadge status={calculateStockStatus(selected)} />
        </div>
      ) : null}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">
          {mode === "IN" ? "Record Stock In" : "Record Stock Out"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setForm(blankForm())}>
          Clear form
        </Button>
      </div>
    </form>
  );
}
