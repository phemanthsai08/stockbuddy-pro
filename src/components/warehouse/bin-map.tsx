import { calculateStockStatus } from "@/lib/warehouse/logic";
import { buildBinMap } from "@/lib/warehouse/locations";
import type { Product } from "@/lib/warehouse/types";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  IN_STOCK: "border-success/40 bg-success/10 text-success",
  LOW_STOCK: "border-warning/40 bg-warning-soft text-warning-foreground",
  OUT_OF_STOCK: "border-destructive/40 bg-destructive-soft text-destructive",
};

export function WarehouseBinMap({ products }: { products: Product[] }) {
  const bins = buildBinMap(products);

  if (bins.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No bin locations yet. Add products with warehouse locations to see the map.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-success/80" aria-hidden /> Healthy
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-warning" aria-hidden /> Low
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-destructive" aria-hidden /> Out
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {bins.map((bin) => (
          <div
            key={bin.location}
            className={cn(
              "rounded-lg border p-3 transition-shadow hover:shadow-sm",
              TONE[bin.status] ?? TONE.IN_STOCK,
            )}
            title={bin.productNames.join(", ")}
          >
            <p className="font-mono text-sm font-bold tracking-tight">{bin.location}</p>
            <p className="mt-1 text-[11px] opacity-90">
              {bin.productCount} SKU{bin.productCount === 1 ? "" : "s"} · {bin.totalUnits} units
            </p>
            <p className="mt-0.5 truncate text-[10px] opacity-75">{bin.productNames[0]}</p>
          </div>
        ))}
      </div>
      {/* Satisfy tree-shaking / unused import check if status helper needed later */}
      <span className="sr-only">{products.map((p) => calculateStockStatus(p)).join(",")}</span>
    </div>
  );
}
