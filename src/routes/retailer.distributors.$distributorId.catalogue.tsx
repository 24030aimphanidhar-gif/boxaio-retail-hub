import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Search, MapPin, Store } from "lucide-react";
import {
  getDistributor,
  canViewCatalogue,
  productsByDistributor,
  distanceKm,
} from "@/retailer/b2b/service";
import { useBusinessLocation } from "@/retailer/b2b/location";
import { RetailerProductCard } from "@/features/wholesale/components/RetailerProductCard";
import { BusinessLocation } from "@/components/retailer/BusinessLocation";
export const Route = createFileRoute("/retailer/distributors/$distributorId/catalogue")({
  validateSearch: (s: Record<string, unknown>): { from?: "nearby" | "other" | "browse" } =>
    s.from === "nearby" || s.from === "other" || s.from === "browse" ? { from: s.from } : {},
  component: DistributorCatalogue,
});
function DistributorCatalogue() {
  const { distributorId } = Route.useParams();
  const { from } = Route.useSearch();
  const d = getDistributor(distributorId);
  const { location } = useBusinessLocation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("name");
  const [stock, setStock] = useState(false);
  const all = productsByDistributor(distributorId);
  const rows = all
    .filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!stock ||
          (p.offers.find((o) => o.distributorId === distributorId)?.stock || 0) >= p.moq) &&
        `${p.name} ${p.brand} ${p.sku}`.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) =>
      sort === "price"
        ? (a.offers.find((o) => o.distributorId === distributorId)?.price || 0) -
          (b.offers.find((o) => o.distributorId === distributorId)?.price || 0)
        : a.name.localeCompare(b.name)
    );
  return (
    <div className="wrap business-page">
      <Link
        to={
          from === "nearby" || from === "other" ? "/retailer/catalogue" : "/retailer/distributors"
        }
        search={from === "nearby" || from === "other" ? { tab: from } : {}}
        className="back-link"
      >
        <ArrowLeft size={14} /> Back to{" "}
        {from === "nearby"
          ? "nearby distributors"
          : from === "other"
            ? "other catalogues"
            : "distributors"}
      </Link>
      {!d || !canViewCatalogue(d) ? (
        <div className="empty-state">
          <Store size={34} />
          <h1>{d?.name || "Distributor not found"}</h1>
          <p>
            {d?.status === "inactive"
              ? "This supplier is offline."
              : "This catalogue is unavailable or requires approval."}
          </p>
          <Link to="/retailer/distributors" className="outline-button">
            Find another supplier
          </Link>
        </div>
      ) : (
        <>
          <div className="supplier-hero">
            <div className="supplier-monogram">{d.name.slice(0, 2)}</div>
            <div>
              <span className="eyebrow">DISTRIBUTOR CATALOGUE</span>
              <h1>{d.businessName}</h1>
              <p>
                <MapPin size={14} />
                {d.address} ·{" "}
                {distanceKm(location, { lat: d.latitude, lng: d.longitude }).toFixed(1)} km from
                your location
              </p>
            </div>
            <div>
              <strong>{all.length}</strong>
              <small>products available</small>
            </div>
          </div>
          <BusinessLocation />
          <div className="business-toolbar">
            <label className="business-search">
              <Search size={16} />
              <input
                aria-label="Search distributor catalogue"
                placeholder="Search products, brands, or SKU"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="Distributor product category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {[...new Set(all.map((p) => p.category))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="Sort distributor products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name">Name A–Z</option>
              <option value="price">Supplier price: low first</option>
            </select>
            <label className="stock-filter">
              <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} />{" "}
              In stock
            </label>
          </div>
          <p className="business-count">
            {rows.length} products · {d.name} is preselected. Open a product to compare packs and
            other suppliers.
          </p>
          <div className="wholesale-grid">
            {rows.map((p) => (
              <RetailerProductCard
                key={p.id + "-" + d.id}
                product={p}
                preferredDistributorId={d.id}
              />
            ))}
          </div>
          {!rows.length && (
            <div className="empty-state">
              <Search size={30} />
              <h2>No products match</h2>
              <button
                className="outline-button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setStock(false);
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
