import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RetailerProductCard } from "@/components/retailer/RetailerProductCard";
import { B2B_BRANDS, B2B_CATEGORIES, B2B_PRODUCTS, DISTRIBUTORS } from "@/retailer/b2b/service";

type ShopSearch = { category?: string; brand?: string; distributor?: string };

export const Route = createFileRoute("/retailer/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    ...(typeof search["category"] === "string" ? { category: search["category"] } : {}),
    ...(typeof search["brand"] === "string" ? { brand: search["brand"] } : {}),
    ...(typeof search["distributor"] === "string" ? { distributor: search["distributor"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Wholesale Shop | BOXAIO Business" },
      {
        name: "description",
        content: "Browse BOXAIO wholesale products with B2B pricing, MOQ and bulk discounts.",
      },
      { property: "og:title", content: "Wholesale Shop | BOXAIO Business" },
      {
        property: "og:description",
        content: "Bulk grocery buying for retailers — wholesale prices, MOQ and bulk offers.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RetailerShop,
});

function RetailerShop() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("relevance");
  const [visible, setVisible] = useState(24);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = B2B_PRODUCTS.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)),
    );
    if (sort === "price_low") rows = [...rows].sort((a, b) => a.b2bPrice - b.b2bPrice);
    if (sort === "price_high") rows = [...rows].sort((a, b) => b.b2bPrice - a.b2bPrice);
    if (sort === "moq") rows = [...rows].sort((a, b) => a.moq - b.moq);
    return rows;
  }, [query, category, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Wholesale Shop</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {results.length} products available at business pricing
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wholesale products…"
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="all">All categories</option>
          {B2B_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="moq">Lowest MOQ</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.slice(0, visible).map((p) => (
          <RetailerProductCard key={p.id} product={p} />
        ))}
      </div>

      {visible < results.length ? (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + 24)}>
            Load more products
          </Button>
        </div>
      ) : null}
    </div>
  );
}
