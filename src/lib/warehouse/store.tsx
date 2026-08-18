/**
 * StockNova — React state layer.
 * Bridges the pure business logic with LocalStorage persistence and React UI.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import * as fulfillment from "./fulfillment";
import * as logic from "./logic";
import { EMPTY_DATA, loadData, resetData, saveData } from "./storage";
import type { MovementInput } from "./logic";
import type { FulfillOrderInput } from "./fulfillment";
import type { ProductInput, WarehouseData } from "./types";

interface WarehouseContextValue {
  data: WarehouseData;
  ready: boolean;
  addProduct: (input: ProductInput) => boolean;
  updateProduct: (id: string, input: ProductInput) => boolean;
  deleteProduct: (id: string) => boolean;
  stockIn: (input: MovementInput) => boolean;
  stockOut: (input: MovementInput) => boolean;
  fulfillOrder: (input: FulfillOrderInput) => boolean;
  resetDemoData: () => void;
}

const WarehouseContext = createContext<WarehouseContextValue | null>(null);

export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WarehouseData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  const commit = useCallback((next: WarehouseData) => {
    setData(next);
    saveData(next);
  }, []);

  const run = useCallback(
    (result: logic.Result<WarehouseData>, successMessage: string): boolean => {
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      commit(result.value);
      toast.success(successMessage);
      return true;
    },
    [commit],
  );

  const value = useMemo<WarehouseContextValue>(
    () => ({
      data,
      ready,
      addProduct: (input) => run(logic.addProduct(data, input), "Product added successfully"),
      updateProduct: (id, input) =>
        run(logic.updateProduct(data, id, input), "Product updated successfully"),
      deleteProduct: (id) => run(logic.deleteProduct(data, id), "Product deleted"),
      stockIn: (input) => run(logic.stockIn(data, input), "Stock In recorded successfully"),
      stockOut: (input) => run(logic.stockOut(data, input), "Stock Out recorded successfully"),
      fulfillOrder: (input) =>
        run(fulfillment.fulfillOrder(data, input), "Order fulfilled — inventory updated"),
      resetDemoData: () => {
        setData(resetData());
        toast.success("Demo data restored");
      },
    }),
    [data, ready, run],
  );

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
}

export function useWarehouse(): WarehouseContextValue {
  const ctx = useContext(WarehouseContext);
  if (!ctx) throw new Error("useWarehouse must be used inside <WarehouseProvider>");
  return ctx;
}

export function useWarehouseStats() {
  const { data } = useWarehouse();
  return useMemo(
    () => ({
      stats: logic.calculateDashboard(data),
      categories: logic.categoryBreakdown(data.products),
      movement: logic.movementSeries(data.transactions, 7),
      status: logic.statusBreakdown(data.products),
      lowStock: logic.getLowStockItems(data.products),
      outOfStock: logic.getOutOfStockItems(data.products),
    }),
    [data],
  );
}
