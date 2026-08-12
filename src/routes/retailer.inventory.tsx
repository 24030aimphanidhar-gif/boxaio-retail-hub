import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingRows, PageHeader, Pill, StatCard } from "@/retailer/components/ui-bits";
import { fetchProducts, updateStock } from "@/retailer/data/service";
import { useAsync, useRetailerSession } from "@/retailer/hooks";
import { stockStatus } from "@/retailer/types";

export const Route = createFileRoute("/retailer/inventory")({
  component: Inventory,
});

function Inventory() {
  const { storeId } = useRetailerSession();
  const { data, loading, reload } = useAsync(() => fetchProducts(storeId), [storeId]);
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const rows = (data ?? []).slice().sort((a, b) => a.stock - b.stock);

  const save = async (id: string, value: number) => {
    try {
      await updateStock(storeId, id, value);
      toast.success("Stock updated");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update stock");
    }
  };

  return (
    <div>
      <PageHeader title="Inventory" description="Track stock levels and restock before you run out." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Out of stock" value={rows.filter((p) => stockStatus(p) === "out_of_stock").length} tone="danger" />
        <StatCard label="Low stock" value={rows.filter((p) => stockStatus(p) === "low_stock").length} tone="warning" />
        <StatCard label="Healthy stock" value={rows.filter((p) => stockStatus(p) === "in_stock").length} tone="success" />
      </div>
      {loading ? (
        <LoadingRows rows={8} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Min level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Update stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.minStockLevel}</td>
                  <td className="px-4 py-3">
                    {stockStatus(p) === "out_of_stock" ? (
                      <Pill tone="danger">Out of stock</Pill>
                    ) : stockStatus(p) === "low_stock" ? (
                      <Pill tone="warning">{p.stock} left</Pill>
                    ) : (
                      <Pill tone="success">{p.stock} units</Pill>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        className="w-24"
                        value={drafts[p.id] ?? p.stock}
                        onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: Number(e.target.value) }))}
                      />
                      <Button size="sm" onClick={() => save(p.id, drafts[p.id] ?? p.stock)}>Save</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
