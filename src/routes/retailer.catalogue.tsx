import { useSavedWholesale } from "@/features/wholesale/useSavedWholesale";
import { RetailerProductCard } from "@/features/wholesale/components/RetailerProductCard";
import { B2B_PRODUCTS } from "@/retailer/b2b/service";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { LayoutGrid, List, ShoppingCart } from "lucide-react";
import { CatalogueSelectionContext } from "@/features/wholesale/selection";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { availableOffers, quoteProduct } from "@/retailer/b2b/pricing";
import { money } from "@/lib/demo-orders";
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
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [picked, setPicked] = useState<Record<string, { distributorId: string; variantId: string }>>({});
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const busy = useRef(false);
  const cart = useB2BCart();
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
  const lineFor = (id: string) => {
    const e = entries.find((x) => x.productId === id);
    const pick = picked[id];
    if (!e || !pick) return null;
    const offer = availableOffers(e.product).find((o) => o.distributorId === pick.distributorId);
    if (!offer) return { e, offer, q: null, qty: 0 };
    const base = quoteProduct(e.product, offer, pick.variantId);
    const qty = qtys[id] ?? base.variant.moq;
    return { e, offer, qty, q: quoteProduct(e.product, offer, pick.variantId, qty) };
  };
  const visiblePicked = filtered.filter((e) => picked[e.productId]);
  const selectedTotal = visiblePicked.reduce((s, e) => {
    const l = lineFor(e.productId);
    return s + (l?.q ? l.q.unitPrice * l.qty : 0);
  }, 0);
  const selectable = filtered
    .map((e) => {
      const offers = availableOffers(e.product);
      const o =
        offers.find((x) => x.distributorId === e.lastDistributorId) ||
        [...offers].sort((a, b) => a.price - b.price)[0];
      return o ? { id: e.productId, distributorId: o.distributorId, variantId: e.lastVariantId || "standard" } : null;
    })
    .filter((x): x is { id: string; distributorId: string; variantId: string } => !!x);
  const allSelected = selectable.length > 0 && selectable.every((x) => picked[x.id]);
  function toggleAll() {
    setPicked((prev) => {
      const next = { ...prev };
      for (const x of selectable) {
        if (allSelected) delete next[x.id];
        else next[x.id] = { distributorId: x.distributorId, variantId: x.variantId };
      }
      return next;
    });
  }
  function addSelected() {
    if (busy.current) return;
    if (!visiblePicked.length) return toast.info("Select products to add to your cart");
    busy.current = true;
    try {
      const lines = visiblePicked.map((e) => lineFor(e.productId)!);
      const pre = lines.filter((l) => !l.offer || !l.q || l.q.error);
      const { added, failed } = cart.addManyToCart(
        lines
          .filter((l) => l.offer && l.q && !l.q.error)
          .map((l) => ({ product: l.e.product, qty: l.qty, offer: l.offer, variantId: picked[l.e.productId].variantId }))
      );
      const problems = [
        ...pre.map((l) => ({ name: l.e.product.name, reason: l.q?.error || "Supplier unavailable" })),
        ...failed,
      ];
      if (added.length) {
        toast.success(`${added.length} product${added.length > 1 ? "s" : ""} added to cart`);
        setPicked((prev) => {
          const next = { ...prev };
          added.forEach((id) => delete next[id]);
          return next;
        });
      }
      if (problems.length)
        toast.error(`${problems.length} not added — still selected`, {
          description: problems.map((p) => `${p.name}: ${p.reason}`).join("\n"),
        });
    } finally {
      setTimeout(() => (busy.current = false), 400);
    }
  }
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
            <div className="view-toggle" role="group" aria-label="Catalogue view">
              <button aria-pressed={layout === "grid"} onClick={() => setLayout("grid")}>
                <LayoutGrid size={15} /> Grid
              </button>
              <button aria-pressed={layout === "list"} onClick={() => setLayout("list")}>
                <List size={15} /> List
              </button>
            </div>
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
            <CatalogueSelectionContext.Provider
              value={{
                layout,
                isSelected: (id) => !!picked[id],
                toggle: (id, distributorId, variantId) =>
                  setPicked((prev) => {
                    const next = { ...prev };
                    if (next[id]) delete next[id];
                    else next[id] = { distributorId, variantId };
                    return next;
                  }),
                qty: (id) => qtys[id],
                setQty: (id, v) => setQtys((prev) => ({ ...prev, [id]: v })),
              }}
            >
              {filtered.length > 0 && (
                <div className="selection-bar" role="region" aria-label="Selected products">
                  <label>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all displayed products"
                    />
                    Select all ({selectable.length})
                  </label>
                  <span className="sel-summary" aria-live="polite">
                    {visiblePicked.length} selected · <strong>{money(selectedTotal)}</strong>
                  </span>
                  <div className="sel-actions">
                    <button
                      className="outline-button"
                      disabled={!visiblePicked.length}
                      onClick={() => setPicked({})}
                    >
                      Clear selection
                    </button>
                    <button
                      className="solid-button"
                      disabled={!visiblePicked.length}
                      onClick={addSelected}
                    >
                      <ShoppingCart size={15} /> Add Selected to Cart
                    </button>
                  </div>
                </div>
              )}
              <div className={"wholesale-grid" + (layout === "list" ? " list-view" : "")}>
                {filtered.map((e) => (
                  <RetailerCatalogueCard key={e.productId} entry={e} />
                ))}
              </div>
            </CatalogueSelectionContext.Provider>
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
