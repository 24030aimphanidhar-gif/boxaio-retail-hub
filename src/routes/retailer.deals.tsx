import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, List, ShoppingCart } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { RetailerProductCard } from "@/features/wholesale/components/RetailerProductCard";
import { CatalogueSelectionContext } from "@/features/wholesale/selection";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { availableOffers, quoteProduct } from "@/retailer/b2b/pricing";
import { money } from "@/lib/demo-orders";
import { B2B_PRODUCTS } from "@/retailer/b2b/service";

export const Route = createFileRoute("/retailer/deals")({
  head: () => ({
    meta: [
      { title: "Wholesale Deals | BOXAIO Business" },
      {
        name: "description",
        content: "Current bulk offers and wholesale discounts for BOXAIO business customers.",
      },
      { property: "og:title", content: "Wholesale Deals | BOXAIO Business" },
      { property: "og:description", content: "Live bulk discounts and business offers on BOXAIO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WholesaleDeals,
});

function WholesaleDeals() {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [picked, setPicked] = useState<Record<string, { distributorId: string; variantId: string }>>({});
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const busy = useRef(false);
  const cart = useB2BCart();

  const deals = useMemo(() => B2B_PRODUCTS.filter((p) => p.offer).slice(0, 24), []);
  const bestSavings = useMemo(
    () =>
      [...B2B_PRODUCTS]
        .sort((a, b) => (b.mrp - b.b2bPrice) / b.mrp - (a.mrp - a.b2bPrice) / a.mrp)
        .slice(0, 8),
    []
  );

  const shown = useMemo(() => {
    const ids = new Set<string>();
    [...deals, ...bestSavings].forEach((p) => ids.add(p.id));
    return B2B_PRODUCTS.filter((p) => ids.has(p.id));
  }, [deals, bestSavings]);

  const bestOffer = (id: string) => {
    const p = B2B_PRODUCTS.find((x) => x.id === id);
    if (!p) return null;
    const offers = availableOffers(p);
    return [...offers].sort((a, b) => a.price - b.price)[0] || null;
  };
  const lineFor = (id: string) => {
    const p = B2B_PRODUCTS.find((x) => x.id === id);
    const pick = picked[id];
    if (!p || !pick) return null;
    const offer = availableOffers(p).find((o) => o.distributorId === pick.distributorId);
    if (!offer) return { p, offer, qty: 0, q: null };
    const base = quoteProduct(p, offer, pick.variantId);
    const qty = qtys[id] ?? base.variant.moq;
    return { p, offer, qty, q: quoteProduct(p, offer, pick.variantId, qty) };
  };
  const visiblePicked = shown.filter((p) => picked[p.id]);
  const selectedTotal = visiblePicked.reduce((s, p) => {
    const l = lineFor(p.id);
    return s + (l?.q ? l.q.unitPrice * l.qty : 0);
  }, 0);
  const selectable = shown
    .map((p) => {
      const o = bestOffer(p.id);
      return o ? { id: p.id, distributorId: o.distributorId, variantId: "standard" } : null;
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
      const lines = visiblePicked.map((p) => lineFor(p.id)!);
      const pre = lines.filter((l) => !l.offer || !l.q || l.q.error);
      const { added, failed } = cart.addManyToCart(
        lines
          .filter((l) => l.offer && l.q && !l.q.error)
          .map((l) => ({ product: l.p, qty: l.qty, offer: l.offer, variantId: picked[l.p.id].variantId }))
      );
      const problems = [
        ...pre.map((l) => ({ name: l.p.name, reason: l.q?.error || "Supplier unavailable" })),
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

  const gridClasses =
    "retailer-home-products grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Wholesale Deals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Business offers applied automatically at checkout.
          </p>
        </div>
        <div className="view-toggle" role="group" aria-label="Deals view">
          <button aria-pressed={layout === "grid"} onClick={() => setLayout("grid")}>
            <LayoutGrid size={15} /> Grid
          </button>
          <button aria-pressed={layout === "list"} onClick={() => setLayout("list")}>
            <List size={15} /> List
          </button>
        </div>
      </div>

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
        {shown.length > 0 && (
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

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Running bulk offers</h2>
          <div className={(layout === "list" ? "wholesale-grid list-view" : gridClasses)}>
            {deals.map((p) => (
              <RetailerProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Biggest savings vs MRP</h2>
          <div className={(layout === "list" ? "wholesale-grid list-view" : gridClasses)}>
            {bestSavings.map((p) => (
              <RetailerProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </CatalogueSelectionContext.Provider>
    </div>
  );
}
