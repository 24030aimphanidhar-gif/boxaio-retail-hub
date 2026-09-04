import { createFileRoute } from "@tanstack/react-router";
import { Search, Store } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DistributorProductRow } from "@/components/retailer/DistributorProductRow";
import { cn } from "@/lib/utils";
import { DISTRIBUTORS, productsByDistributor } from "@/retailer/b2b/service";

export const Route = createFileRoute("/retailer/distributors/")({
  head: () => ({
    meta: [
      { title: "Shop by Distributor | BOXAIO Business" },
      {
        name: "description",
        content:
          "Compare wholesale offers from SAI TRADE, SGBL and RA AGRO — price, margin, free delivery and stock.",
      },
      { property: "og:title", content: "Shop by Distributor | BOXAIO Business" },
      {
        property: "og:description",
        content: "Distributor-wise wholesale offers with margin, MRP and delivery estimates.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ShopByDistributor,
});

function ShopByDistributor() {
  const [active, setActive] = useState<string>(DISTRIBUTORS[0]!.id);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(20);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return productsByDistributor(active).filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q),
    );
  }, [active, query]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Shop by Distributor</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Compare supplier offers — price, margin and delivery — before you buy in bulk.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {DISTRIBUTORS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => {
              setActive(d.id);
              setVisible(20);
            }}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              active === d.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            <Store className="size-4" /> {d.name}
          </button>
        ))}
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this distributor's products…"
          className="pl-9"
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{rows.length} products supplied</p>

      <div className="mt-3 space-y-3">
        {rows.slice(0, visible).map((p) => (
          <DistributorProductRow key={p.id} product={p} preferredDistributorId={active} />
        ))}
        {rows.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No products match your search for this distributor.
          </Card>
        ) : null}
      </div>

      {visible < rows.length ? (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + 20)}>
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
