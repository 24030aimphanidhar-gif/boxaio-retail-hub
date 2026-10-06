import {appPath} from '@/lib/paths';
import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Heart, Bookmark, Check, Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useB2BWishlist } from "@/retailer/b2b/wishlist";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { availableOffers, quoteProduct } from "@/retailer/b2b/pricing";
import type { B2BProduct } from "@/retailer/b2b/types";
import { products } from "@/data/products";
import { money } from "@/lib/demo-orders";
import { ProductImage } from "@/features/shared/components/ProductImage";
import { useSavedWholesale } from "@/features/wholesale/useSavedWholesale";
export function StockPill({ stock }: { stock: number }) {
  return (
    <span className={"supply-stock " + (!stock ? "empty" : "")}>
      {stock ? "In stock" : "Unavailable"}
    </span>
  );
}
export function RetailerProductCard({
  product: p,
  footer,
  preferredDistributorId,
  initialVariantId = "standard",
}: {
  product: B2BProduct;
  footer?: ReactNode;
  preferredDistributorId?: string;
  initialVariantId?: string;
  initialQuantity?: number;
}) {
  const { has, toggle } = useB2BWishlist();
  const saved = useSavedWholesale();
  const { addBulkToCart } = useB2BCart();
  const navigate = useNavigate();
  const location = useLocation();
  const offers = availableOffers(p);
  const sorted = [...offers].sort((a, b) => a.price - b.price);
  const offer =
    offers.find((o) => o.distributorId === preferredDistributorId) ||
    sorted.find((o) => !quoteProduct(p, o, initialVariantId).error) ||
    sorted[0];
  const base = offer ? quoteProduct(p, offer, initialVariantId) : null;
  const [qty, setQty] = useState(base?.variant.moq || p.moq);
  const q = offer ? quoteProduct(p, offer, initialVariantId, qty) : null;
  const original = products.find((x) => x._id === p.id);
  const search = {
    supplier: offer?.distributorId,
    variant: initialVariantId,
    from: appPath(location.pathname) + location.searchStr,
  };
  function add(buy = false) {
    if (!offer || !q || q.error) return;
    if (addBulkToCart(p, qty, offer, initialVariantId)) {
      if (buy) void navigate({ to: "/retailer/checkout" });
      else toast.success(`${qty} packs added from ${offer.distributorName}`);
    }
  }
  return (
    <article className="retail-product-card market-card" data-testid={"wholesale-" + p.id}>
      <div className="retail-card-photo">
        <Link
          to="/retailer/item/$productId"
          params={{ productId: p.id }}
          search={search}
          aria-label={"View " + p.name}
        >
          <ProductImage productId={p.id} src={p.image} alt={p.name} loading="lazy" />
        </Link>
        <span className="retail-card-badge">BULK</span>
        <button
          className={"save-product " + (has(p.id) ? "saved" : "")}
          aria-label={"Save " + p.name + " to business favourites"}
          aria-pressed={has(p.id)}
          onClick={() => toggle(p.id)}
        >
          <Heart size={17} fill={has(p.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="retail-card-body">
        <span className="market-brand">{p.brand}</span>
        <Link
          className="retail-card-title"
          to="/retailer/item/$productId"
          params={{ productId: p.id }}
          search={search}
        >
          {p.name}
        </Link>
        <div className="market-rating">
          <Star size={11} fill="currentColor" />
          <strong>{original?.rating || 4.5}</strong>
          <span>({original?.reviews || 0})</span>
          <span className="market-unit">{q?.variant.label || p.unit}</span>
        </div>
        <div className="market-price">
          <strong>{q ? money(q.unitPrice) : "Unavailable"}</strong>
          <small>/ pack</small>
        </div>
        <div className="market-quantity">
          <span>Min {base?.variant.moq || p.moq}</span>
          <div className="quantity-stepper">
            <button
              aria-label={"Decrease " + p.name + " bulk quantity"}
              disabled={!q || qty <= q.variant.moq}
              onClick={() => setQty(qty - (q?.variant.increment || 1))}
            >
              <Minus size={14} />
            </button>
            <span>{qty}</span>
            <button
              aria-label={"Increase " + p.name + " bulk quantity"}
              disabled={!q || qty + q.variant.increment > q.max}
              onClick={() => setQty(qty + (q?.variant.increment || 1))}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="market-actions">
          <button
            className="market-add"
            disabled={!q || !!q.error}
            aria-label={"Add " + p.name + " bulk packs"}
            onClick={() => add()}
          >
            <Plus size={14} />
            Add
          </button>
          <button
            className="market-buy"
            disabled={!q || !!q.error}
            aria-label={"Buy " + p.name + " bulk now"}
            onClick={() => add(true)}
          >
            Buy now
          </button>
        </div>
        <div className="market-card-footer">
          <button
            className="save-catalogue-action"
            aria-label={(saved.has(p.id) ? "Saved " : "Save ") + p.name + " to my catalogue"}
            onClick={() =>
              toast.success(
                saved.toggle(p.id) ? "Saved to My catalogue" : "Removed from saved catalogue"
              )
            }
          >
            {saved.has(p.id) ? <Check size={14} /> : <Bookmark size={14} />}
            <span>{saved.has(p.id) ? "Saved" : "Save"}</span>
          </button>
          <Link to="/retailer/item/$productId" params={{ productId: p.id }} search={search}>
            Packs & suppliers
          </Link>
        </div>
        {footer && (
          <details className="retail-card-history">
            <summary>Purchase history</summary>
            {footer}
          </details>
        )}
      </div>
    </article>
  );
}
