import { createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, PageHeader } from "@/components/warehouse/page-header";
import { ProductDialog } from "@/components/warehouse/product-dialog";
import { StatusBadge } from "@/components/warehouse/status-badge";
import {
  calculateStockStatus,
  filterProducts,
  formatCurrency,
  formatDate,
  formatNumber,
  type InventoryFilters,
} from "@/lib/warehouse/logic";
import { useWarehouse } from "@/lib/warehouse/store";
import { CATEGORIES, type Product, type ProductInput } from "@/lib/warehouse/types";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — StockNova" },
      {
        name: "description",
        content:
          "Search, filter and manage every warehouse product: SKUs, quantities, minimum stock levels, locations, pricing and stock status.",
      },
      { property: "og:title", content: "Inventory Management — StockNova" },
      {
        property: "og:description",
        content: "Add, edit and monitor warehouse products with automatic stock status.",
      },
    ],
  }),
  component: InventoryPage,
});

const SELECT_CLASS = "h-9 rounded-md border border-input bg-card px-3 text-sm";

function InventoryPage() {
  const { data, addProduct, updateProduct, deleteProduct } = useWarehouse();
  const [filters, setFilters] = useState<InventoryFilters>({
    search: "",
    category: "all",
    status: "all",
    sortBy: "name-asc",
  });
  const [editing, setEditing] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const visible = useMemo(() => filterProducts(data.products, filters), [data.products, filters]);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (product: Product) => {
    setEditing(product);
    setDialogOpen(true);
  };

  const handleSubmit = (input: ProductInput) =>
    editing ? updateProduct(editing.id, input) : addProduct(input);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Every product in the warehouse with live stock status."
        actions={
          <Button onClick={openAdd}>
            <Plus className="size-4" aria-hidden /> Add Product
          </Button>
        }
      />

      <section className="card-surface grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <Label htmlFor="inv-search" className="sr-only">
            Search inventory
          </Label>
          <Search
            className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="inv-search"
            className="pl-9"
            placeholder="Search name, SKU, category, location…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="inv-category" className="sr-only">
            Filter by category
          </Label>
          <select
            id="inv-category"
            className={`${SELECT_CLASS} w-full`}
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="inv-status" className="sr-only">
            Filter by status
          </Label>
          <select
            id="inv-status"
            className={`${SELECT_CLASS} w-full`}
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="all">All statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>

        <div>
          <Label htmlFor="inv-sort" className="sr-only">
            Sort products
          </Label>
          <select
            id="inv-sort"
            className={`${SELECT_CLASS} w-full`}
            value={filters.sortBy}
            onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
          >
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="qty-asc">Quantity (low → high)</option>
            <option value="qty-desc">Quantity (high → low)</option>
            <option value="value-desc">Stock value (high → low)</option>
          </select>
        </div>
      </section>

      <section className="card-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-display text-base font-semibold">
            Products <span className="text-muted-foreground">({visible.length})</span>
          </h2>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            title="No products match your filters"
            description="Try a different search term, or clear the category and status filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th scope="col" className="px-4 py-3 font-semibold">SKU</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Product</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Qty</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Min</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Location</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Unit Price</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id} className="border-b border-border/70 last:border-0 hover:bg-surface">
                    <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className="block font-medium">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">{p.supplier}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{formatNumber(p.quantity)}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {formatNumber(p.minimumStock)}
                    </td>
                    <td className="px-4 py-3">{p.location}</td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(p.unitPrice)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={calculateStockStatus(p)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`View ${p.name}`}
                          onClick={() => setViewing(p)}
                        >
                          <Eye className="size-4" aria-hidden />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Edit ${p.name}`}
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Delete ${p.name}`}
                          onClick={() => setPendingDelete(p)}
                        >
                          <Trash2 className="size-4 text-destructive" aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        onSubmit={handleSubmit}
      />

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>Product details and current stock position.</DialogDescription>
          </DialogHeader>
          {viewing ? (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["SKU", viewing.sku],
                ["Category", viewing.category],
                ["Quantity", formatNumber(viewing.quantity)],
                ["Minimum stock", formatNumber(viewing.minimumStock)],
                ["Location", viewing.location],
                ["Unit price", formatCurrency(viewing.unitPrice)],
                ["Stock value", formatCurrency(viewing.quantity * viewing.unitPrice)],
                ["Supplier", viewing.supplier || "—"],
                ["Last updated", formatDate(viewing.updatedAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
                  <dd className="mt-0.5 font-medium">{value}</dd>
                </div>
              ))}
              <div className="col-span-2">
                <StatusBadge status={calculateStockStatus(viewing)} />
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.name}" (${pendingDelete.sku}) will be removed from the inventory. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteProduct(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
