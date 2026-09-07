import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageSearch, MapPin, Search, Sparkles, Clock } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickReorder } from "@/components/retailer/QuickReorder";
import { RetailerCatalogueCard } from "@/components/retailer/RetailerCatalogueCard";
import { DistributorGrid } from "@/components/retailer/DistributorDirectory";
import {
  DEFAULT_RETAILER_LOCATION,
  NEARBY_RADIUS_KM,
  distributorsWithDistance,
  fetchMyCatalogue,
  fetchMyOrders,
  frequentlyPurchased,
  locationOptions,
  nearbyDistributors,
  readRetailerLocation,
  recentlyPurchased,
  saveRetailerLocation,
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

  const [tab, setTab] = useState<"mine" | "nearby" | "other">("mine");
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

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ["mine", "My Products"],
            ["nearby", "Nearby Distributors"],
            ["other", "Other Catalogues"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors " +
              (tab === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab !== "mine" ? (
        <DistributorPanel mode={tab} email={email} />
      ) : catalogue.loading ? (
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

/**
 * Nearby (within 5 KM of the retailer's saved location) and Other (authorised)
 * distributor catalogues. Kept strictly separate from "My Products", which is
 * only what this retailer has actually purchased.
 */
function DistributorPanel({ mode, email }: { mode: "nearby" | "other"; email: string }) {
  const [location, setLocation] = useState(() => readRetailerLocation(email));
  const [search, setSearch] = useState("");
  const areas = useMemo(() => locationOptions(), []);

  const chooseArea = (area: string) => {
    const opt = areas.find((a) => a.area === area);
    if (!opt) return;
    saveRetailerLocation(email, opt.location);
    setLocation(opt.location);
  };

  const useLocation = () => {
    const loc = DEFAULT_RETAILER_LOCATION;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          saveRetailerLocation(email, next);
          setLocation(next);
        },
        () => {
          saveRetailerLocation(email, loc);
          setLocation(loc);
        },
      );
      return;
    }
    saveRetailerLocation(email, loc);
    setLocation(loc);
  };

  const q = search.trim().toLowerCase();
  const all = location ? distributorsWithDistance(location) : [];
  const near = location ? nearbyDistributors(location, NEARBY_RADIUS_KM) : [];
  const nearIds = new Set(near.map((d) => d.id));
  const base = mode === "nearby" ? near : all.filter((d) => !nearIds.has(d.id));
  const rows = base.filter(
    (d) =>
      d.status === "active" &&
      (!q ||
        d.name.toLowerCase().includes(q) ||
        d.businessName.toLowerCase().includes(q) ||
        d.area.toLowerCase().includes(q)),
  );

  if (!location) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
        <MapPin className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 font-semibold text-foreground">
          Set your location to discover nearby distributors
        </p>
        <Button className="mt-5" onClick={useLocation}>
          Set Location
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {mode === "nearby"
              ? `Nearby Distributors · Within ${NEARBY_RADIUS_KM} KM`
              : "Other Catalogues"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === "nearby"
              ? "Suppliers closest to your store, nearest first."
              : "Authorised distributors outside your 5 KM radius."}
          </p>
        </div>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search distributor, business or area…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-4">
        <DistributorGrid
          distributors={rows}
          from={mode}
          empty={
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {mode === "nearby"
                ? `No distributors within ${NEARBY_RADIUS_KM} KM of your store yet.`
                : "No other distributor catalogues match your search."}
            </div>
          }
        />
      </div>
    </div>
  );
}
