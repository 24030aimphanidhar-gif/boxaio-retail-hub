import { useSavedWholesale } from "@/features/wholesale/useSavedWholesale";
import { RetailerProductCard } from "@/features/wholesale/components/RetailerProductCard";
import { B2B_PRODUCTS } from "@/retailer/b2b/service";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Search, Package, Store, Repeat } from "lucide-react";
import { RetailerCatalogueCard } from "@/features/wholesale/components/RetailerCatalogueCard";
import { DistributorGrid } from "@/components/retailer/DistributorDirectory";
import { BusinessLocation } from "@/components/retailer/BusinessLocation";
import { QuickReorder } from "@/features/wholesale/components/QuickReorder";
import { fetchMyCatalogue, fetchMyOrders, distributorsWithDistance } from "@/retailer/b2b/service";
import { useBusinessLocation } from "@/retailer/b2b/location";
import { useAsync, useRetailerSession } from "@/retailer/hooks";
export const Route = createFileRoute("/retailer/catalogue")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: typeof s.tab === "string" ? s.tab : "mine",
  }),
  component: MyCatalogue,
});
function MyCatalogue() {
  const saved = useSavedWholesale();
  const { user } = useRetailerSession();
  const email = user?.email || "";
  const catalogue = useAsync(() => fetchMyCatalogue(email), [email]);
  const orders = useAsync(() => fetchMyOrders(email), [email]);
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { location } = useBusinessLocation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recent");
  const [radius, setRadius] = useState(5);
  const entries = catalogue.data || [];
  const filtered = entries
    .filter(
      (e) =>
        (category === "all" || e.product.category === category) &&
        `${e.product.name} ${e.product.brand} ${e.product.sku}`
          .toLowerCase()
          .includes(query.toLowerCase())
    )
    .sort((a, b) =>
      sort === "frequent"
        ? b.purchaseCount - a.purchaseCount
        : sort === "name"
          ? a.product.name.localeCompare(b.product.name)
          : +new Date(b.lastPurchasedAt) - +new Date(a.lastPurchasedAt)
    );
  const distributors = distributorsWithDistance(location).filter(
    (d) =>
      d.status === "active" &&
      (tab === "nearby" ? d.distanceKm <= radius : d.distanceKm > radius) &&
      `${d.name} ${d.area}`.toLowerCase().includes(query.toLowerCase())
  );
  function download() {
    const rows = [
      ["Product", "SKU", "Last pack", "Last quantity", "Last price", "Purchase count"],
      ...filtered.map((e) => [
        e.product.name,
        e.product.sku,
        e.lastUnit || e.product.unit,
        e.lastPurchasedQty,
        e.lastPurchasedPrice,
        e.purchaseCount,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => '"' + String(c).replaceAll('"', '""') + '"').join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "boxaio-my-catalogue.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="wrap business-page">
      <div className="business-page-heading">
        <div>
          <span className="eyebrow">BUILT AROUND YOUR BUSINESS</span>
          <h1>My product catalogue</h1>
          <p>
            Your purchased essentials, supplier prices, and nearby catalogues. All in one place.
          </p>
        </div>
        <button className="outline-button" disabled={!filtered.length} onClick={download}>
          <Download size={15} /> Export catalogue
        </button>
      </div>
      <div className="business-stats">
        <div>
          <Package size={22} />
          <span>
            <strong>{entries.length}</strong>
            <small>Purchased products</small>
          </span>
        </div>
        <div>
          <Repeat size={22} />
          <span>
            <strong>{(orders.data || []).filter((o) => o.status === "delivered").length}</strong>
            <small>Completed purchases</small>
          </span>
        </div>
        <div>
          <Store size={22} />
          <span>
            <strong>
              {
                distributorsWithDistance(location).filter(
                  (d) => d.status === "active" && d.distanceKm <= radius
                ).length
              }
            </strong>
            <small>Suppliers within {radius} km</small>
          </span>
        </div>
      </div>
      <div className="business-tabs">
        {[
          ["mine", "Purchased"],
          ["saved", "Saved products"],
          ["nearby", "Nearby distributors"],
          ["other", "Other catalogues"],
          ["reorder", "Quick reorder"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "selected" : ""}
            onClick={() => {
              setQuery("");
              void navigate({ search: { tab: id } });
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "nearby" || tab === "other" ? (
        <>
          <BusinessLocation />
          <div className="business-toolbar">
            <label className="business-search">
              <Search size={16} />
              <input
                aria-label="Search catalogue distributors"
                placeholder="Find a distributor or area"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="Nearby radius"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            >
              {[5, 10, 25].map((n) => (
                <option key={n} value={n}>
                  Within {n} km
                </option>
              ))}
            </select>
          </div>
          <p className="business-count">
            {distributors.length}{" "}
            {tab === "nearby" ? "nearby suppliers" : "suppliers outside your selected radius"}
          </p>
          <DistributorGrid
            distributors={distributors}
            from={tab === "nearby" ? "nearby" : "other"}
          />
        </>
      ) : tab === "saved" ? (
        <>
          <div className="business-toolbar">
            <label className="business-search">
              <Search size={16} />
              <input
                aria-label="Search saved wholesale products"
                placeholder="Search your saved products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          <div className="wholesale-grid">
            {B2B_PRODUCTS.filter(
              (p) =>
                saved.has(p.id) &&
                (p.name + " " + p.brand).toLowerCase().includes(query.toLowerCase())
            ).map((p) => (
              <RetailerProductCard key={p.id} product={p} />
            ))}
          </div>
          {!saved.ids.length && (
            <div className="empty-state">
              <Package size={30} />
              <h2>Build your restock list</h2>
              <p>Tap Save on a product to keep it here for your next purchase.</p>
              <Link to="/retailer/shop" className="solid-button">
                Browse wholesale
              </Link>
            </div>
          )}
        </>
      ) : tab === "reorder" ? (
        <div className="wholesale-grid">
          {(orders.data || [])
            .filter((o) => o.status === "delivered")
            .map((o) => (
              <QuickReorder key={o.id} order={o} />
            ))}
        </div>
      ) : (
        <>
          <div className="business-toolbar">
            <label className="business-search">
              <Search size={16} />
              <input
                aria-label="Search my catalogue"
                placeholder="Search product, brand or SKU"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="My catalogue category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {[...new Set(entries.map((e) => e.product.category))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="Sort my catalogue"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recent">Recently purchased</option>
              <option value="frequent">Most purchased</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          <p className="business-count">
            {filtered.length} products · Open a product to compare packs and suppliers. Purchase
            history keeps the original price.
          </p>
          {catalogue.loading ? (
            <p className="business-count">Loading your catalogue…</p>
          ) : catalogue.error ? (
            <p role="alert">{catalogue.error}</p>
          ) : (
            <div className="wholesale-grid">
              {filtered.map((e) => (
                <RetailerCatalogueCard key={e.productId} entry={e} />
              ))}
            </div>
          )}
          {!catalogue.loading && !filtered.length && (
            <div className="empty-state">
              <Package size={35} />
              <h2>
                {entries.length
                  ? "No products match"
                  : "Your catalogue starts with your first purchase"}
              </h2>
              <p>Delivered wholesale orders automatically add products here.</p>
              <Link to="/retailer/shop" className="solid-button">
                Explore wholesale
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
