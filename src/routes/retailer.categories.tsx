import { createFileRoute } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";
import { LoadingRows, PageHeader, Pill } from "@/retailer/components/ui-bits";
import { fetchProducts } from "@/retailer/data/service";
import { useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/categories")({
  component: Categories,
});

function Categories() {
  const { storeId } = useRetailerSession();
  const { data, loading } = useAsync(() => fetchProducts(storeId), [storeId]);

  const grouped = new Map<string, { total: number; active: number; subs: Set<string> }>();
  (data ?? []).forEach((p) => {
    const entry = grouped.get(p.category) ?? { total: 0, active: 0, subs: new Set<string>() };
    entry.total += 1;
    if (p.status === "active") entry.active += 1;
    entry.subs.add(p.subCategory);
    grouped.set(p.category, entry);
  });

  return (
    <div>
      <PageHeader title="Categories" description="How your catalogue is organised across BOXAIO categories." />
      {loading ? (
        <LoadingRows rows={6} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...grouped.entries()].map(([name, info]) => (
            <Card key={name} className="p-5">
              <h2 className="text-base font-semibold text-foreground">{name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill tone="info">{info.total} products</Pill>
                <Pill tone="success">{info.active} active</Pill>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{[...info.subs].join(" · ")}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
