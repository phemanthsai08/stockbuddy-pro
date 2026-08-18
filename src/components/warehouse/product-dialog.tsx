import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, type Product, type ProductInput } from "@/lib/warehouse/types";

const BLANK: ProductInput = {
  name: "",
  sku: "",
  category: CATEGORIES[0],
  quantity: 0,
  minimumStock: 0,
  location: "",
  unitPrice: 0,
  supplier: "",
};

function toInput(product: Product): ProductInput {
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = product;
  return rest;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSubmit: (input: ProductInput) => boolean;
}

export function ProductDialog({ open, onOpenChange, product, onSubmit }: ProductDialogProps) {
  const [form, setForm] = useState<ProductInput>(BLANK);

  useEffect(() => {
    if (open) setForm(product ? toInput(product) : BLANK);
  }, [open, product]);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            Fields marked with * are required. SKUs must be unique across the warehouse.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (onSubmit(form)) onOpenChange(false);
          }}
        >
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="p-name">Product name *</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Wireless Mouse"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-sku">SKU *</Label>
            <Input
              id="p-sku"
              value={form.sku}
              onChange={(e) => set("sku", e.target.value)}
              placeholder="ELC-1001"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-category">Category *</Label>
            <select
              id="p-category"
              className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-qty">Quantity *</Label>
            <Input
              id="p-qty"
              type="number"
              min={0}
              value={String(form.quantity)}
              onChange={(e) => set("quantity", Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-min">Minimum stock *</Label>
            <Input
              id="p-min"
              type="number"
              min={0}
              value={String(form.minimumStock)}
              onChange={(e) => set("minimumStock", Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-loc">Warehouse location *</Label>
            <Input
              id="p-loc"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="A-12"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-price">Unit price *</Label>
            <Input
              id="p-price"
              type="number"
              min={0}
              step="0.01"
              value={String(form.unitPrice)}
              onChange={(e) => set("unitPrice", Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="p-supplier">Supplier</Label>
            <Input
              id="p-supplier"
              value={form.supplier}
              onChange={(e) => set("supplier", e.target.value)}
              placeholder="Nexus Peripherals"
            />
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{product ? "Save changes" : "Add product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
