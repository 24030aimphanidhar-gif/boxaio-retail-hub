import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageSearch, Search, Sparkles, Clock } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickReorder } from "@/components/retailer/QuickReorder";
import { RetailerCatalogueCard } from "@/components/retailer/RetailerCatalogueCard";
import {
  fetchMyCatalogue,
  fetchMyOrders,
  frequentlyPurchased,
  recentlyPurchased,
} from "@/retailer/b2b/service";
import { useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/catalogue")({
  head: () => ({
    meta: [
      { title: "My Product Catalogue | BOXAIO Business" },
      {
        name: "description",
        content:
          "Your personal BOXAIO wholesale catalogue — every product you have purchased, ready to reorder in bulk.",
      },
      { property: "og:title", content: "My Product Catalogue | BOXAIO Business" },
      {
        property: "og:description",
        content: "Reorder your frequently and recently purchased wholesale products in seconds.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyProductCatalogue,
});

function MyProductCatalogue() {
  const { user } = useRetailerSession();
  const email = user?.email ?? "";
  const catalogue = useAsync(() => fetchMyCatalogue(email), [email]);
  const orders = useAsync(() => fetchMyOrders(email), [email]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("frequent");

  const entries = catalogue.data ?? [];
  const categories = useMemo(
    () => [...new Set(entries.map((e) => e.product.category))].sort(),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = entries.filter((e) => {
      const p = e.product;
      const matches =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      const inCategory = category === "all" || p.category === category;
      const inStock =
        availability === "all" ||
        (availability === "in" ? p.stock > 0 : p.stock <= 0);
      return matches && inCategory && inStock;
    });
    if (sort === "frequent") rows = [...rows].sort((a, b) => b.purchaseCount - a.purchaseCount);
    if (sort === "recent")
      rows = [...rows].sort((a, b) => +new Date(b.lastPurchasedAt) - +new Date(a.lastPurchasedAt));
    if (sort === "name") rows = [...rows].sort((a, b) => a.product.name.localeCompare(b.product.name));
    if (sort === "price_low") rows = [...rows].sort((a, b) => a.product.b2bPrice - b.product.b2bPrice);
    return rows;
  }, [entries, query, category, availability, sort]);

  const deliveredOrders = (orders.data ?? []).filter((o) => o.status === "delivered").slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Product Catalogue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every product your business has purchased from BOXAIO — saved automatically, always at
            today&apos;s wholesale price.
          </p>
        </div>
        <Link to="/retailer/shop">
          <Button variant="outline">Browse full wholesale shop</Button>
        </Link>
      </div>

      {catalogue.loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Loading your catalogue…</p>
      ) : entries.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
          <PackageSearch className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-semibold text-foreground">Your catalogue is still empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Products you buy from BOXAIO appear here automatically once the order is delivered.
          </p>
          <Link to="/retailer/shop" className="mt-5 inline-block">
            <Button>Start wholesale shopping</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* A. Frequently purchased */}
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Sparkles className="size-5 text-primary" /> Frequently Purchased
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Ranked by how often your business reorders them.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {frequentlyPurchased(entries).slice(0, 4).map((e) => (
                <RetailerCatalogueCard key={e.productId} entry={e} />
              ))}
            </div>
          </section>

          {/* B. Recently purchased */}
          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Clock className="size-5 text-primary" /> Recently Purchased
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">From your latest delivered orders.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentlyPurchased(entries).slice(0, 4).map((e) => (
                <RetailerCatalogueCard key={e.productId} entry={e} />
              ))}
            </div>
          </section>

          {/* Quick reorder */}
          {deliveredOrders.length > 0 ? (
            <section className="mt-12">
              <h2 className="text-lg font-semibold text-foreground">Quick Reorder</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Re-add a previous order to your bulk cart — availability, MOQ and current B2B prices
                are re-checked automatically.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {deliveredOrders.map((order) => (
                  <QuickReorder key={order.id} order={order} />
                ))}
              </div>
            </section>
          ) : null}

          {/* C. All my products */}
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-foreground">All My Products</h2>
            <div className="mt-4 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search My Product Catalogue… (name, brand, category, SKU)"
                  className="pl-9"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="all">All availability</option>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="frequent">Sort: Most purchased</option>
                <option value="recent">Sort: Recently purchased</option>
                <option value="name">Sort: Name A–Z</option>
                <option value="price_low">Sort: Price low to high</option>
              </select>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {filtered.length} of {entries.length} catalogue products
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((e) => (
                <RetailerCatalogueCard key={e.productId} entry={e} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
