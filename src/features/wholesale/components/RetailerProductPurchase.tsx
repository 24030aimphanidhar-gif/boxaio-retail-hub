import { MobilePurchaseBar } from "@/features/shared/components/MobilePurchaseBar";
import { useNavigate } from "@tanstack/react-router";
import { useSavedWholesale } from "@/features/wholesale/useSavedWholesale";
import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart, Minus, Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { useB2BWishlist } from "@/retailer/b2b/wishlist";
import { availableOffers, packVariants, quoteProduct } from "@/retailer/b2b/pricing";
import type { B2BProduct } from "@/retailer/b2b/types";
import { money } from "@/lib/demo-orders";
export function StockPill({ stock }: { stock: number }) {
  return (
    <span className={"supply-stock " + (stock ? "" : "empty")}>
      {stock ? `${stock} base packs in stock` : "Out of stock"}
    </span>
  );
}
export function RetailerProductPurchase({
  product: p,
  footer,
  preferredDistributorId,
  initialVariantId = "standard",
  initialQuantity,
}: {
  product: B2BProduct;
  footer?: ReactNode;
  preferredDistributorId?: string;
  initialVariantId?: string;
  initialQuantity?: number;
}) {
  const navigate = useNavigate();
  const saved = useSavedWholesale();
  const offers = availableOffers(p);
  const [supplier, setSupplier] = useState(
    preferredDistributorId || offers[0]?.distributorId || ""
  );
  const [variant, setVariant] = useState(initialVariantId);
  const [quantity, setQuantity] = useState(
    initialQuantity || packVariants(p).find((v) => v.id === initialVariantId)?.moq || p.moq
  );
  const { addBulkToCart } = useB2BCart();
  const { has, toggle } = useB2BWishlist();
  const offer = offers.find((o) => o.distributorId === supplier) || offers[0];
  if (!offer)
    return (
      <article className="supply-card">
        <h3>{p.name}</h3>
        <p>No authorised supplier is currently available.</p>
      </article>
    );
  const quote = quoteProduct(p, offer, variant, quantity);
  const comparisons = offers.map((o) => ({ ...o, q: quoteProduct(p, o, variant, quantity) }));
  const best = Math.min(...comparisons.filter((o) => !o.q.error).map((o) => o.q.unitPrice));
  return (
    <article className="supply-card detail-purchase" data-testid={"wholesale-" + p.id}>
      <MobilePurchaseBar
        total={quote.total}
        disabled={!!quote.error}
        onAdd={() => {
          if (addBulkToCart(p, quantity, offer, variant))
            toast.success("Added to wholesale basket");
        }}
        onBuy={() => {
          if (addBulkToCart(p, quantity, offer, variant))
            void navigate({ to: "/retailer/checkout" });
        }}
      />
      <div className="supply-product">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/product-placeholder.svg";
          }}
        />
        <div>
          <span className="eyebrow">{p.brand}</span>
          <h3>{p.name}</h3>
          <p>{p.category}</p>
          <small>{p.sku}</small>
        </div>
        <button
          className="supply-heart"
          aria-label={"Save " + p.name + " to business favourites"}
          aria-pressed={has(p.id)}
          onClick={() => toggle(p.id)}
        >
          <Heart size={18} fill={has(p.id) ? "currentColor" : "none"} />
        </button>
      </div>
      {footer && <div className="supply-history">{footer}</div>}
      <label className="supply-label">
        Pack variation
        <select
          aria-label={"Pack variation for " + p.name}
          value={variant}
          onChange={(e) => {
            setVariant(e.target.value);
            setQuantity(packVariants(p).find((v) => v.id === e.target.value)!.moq);
          }}
        >
          {packVariants(p).map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </label>
      <div className="supply-compare-title">
        <strong>Compare distributor prices</strong>
        <span>{offers.length} suppliers</span>
      </div>
      <div className="supplier-options">
        {comparisons.map((o) => (
          <button
            key={o.distributorId}
            aria-pressed={o.distributorId === offer.distributorId}
            className={o.distributorId === offer.distributorId ? "chosen" : ""}
            onClick={() => setSupplier(o.distributorId)}
          >
            <span>
              <strong>{o.distributorName}</strong>
              <small>
                {o.q.max} packs · {o.freeDelivery ? "Free delivery" : "+ delivery"} ·{" "}
                {o.deliveryEstimate}
              </small>
            </span>
            <span>
              <b>{money(o.q.unitPrice)}</b>
              {o.q.unitPrice === best && !o.q.error && (
                <small className="best-price">Best price</small>
              )}
            </span>
          </button>
        ))}
      </div>
      <div className="supply-selected">
        <Link
          to="/retailer/distributors/$distributorId/catalogue"
          params={{ distributorId: offer.distributorId }}
        >
          View {offer.distributorName} catalogue <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="supply-quantity">
        <label>
          Quantity{" "}
          <small>
            Min {quote.variant.moq} · step {quote.variant.increment}
          </small>
        </label>
        <div className="quantity-stepper">
          <button
            aria-label={"Decrease " + p.name + " bulk quantity"}
            disabled={quantity <= quote.variant.moq}
            onClick={() =>
              setQuantity(Math.max(quote.variant.moq, quantity - quote.variant.increment))
            }
          >
            <Minus size={14} />
          </button>
          <input
            aria-label={"Bulk quantity for " + p.name}
            type="number"
            min={quote.variant.moq}
            max={quote.max}
            step={quote.variant.increment}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <button
            aria-label={"Increase " + p.name + " bulk quantity"}
            disabled={quantity + quote.variant.increment > quote.max}
            onClick={() => setQuantity(quantity + quote.variant.increment)}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="tier-note">
        {quote.discountPct
          ? `${quote.discountPct}% volume savings applied · save ${money(quote.savings)}`
          : "3% off from 10 base packs · 6% off from 25"}
      </div>
      {quote.error && (
        <p role="alert" className="supply-error">
          {quote.error}
        </p>
      )}
      <button
        className="solid-button supply-add"
        disabled={!!quote.error}
        onClick={() => {
          if (addBulkToCart(p, quantity, offer, variant))
            toast.success(
              `${quantity} × ${quote.variant.label} added from ${offer.distributorName}`
            );
        }}
      >
        Add to wholesale basket{" "}
        <span>
          {money(quote.total)} <Plus size={15} />
        </span>
      </button>
      <button
        className="market-buy detail-buy-now"
        disabled={!!quote.error}
        onClick={() => {
          if (addBulkToCart(p, quantity, offer, variant))
            void navigate({ to: "/retailer/checkout" });
        }}
      >
        Buy now · {money(quote.total)}
      </button>
      <div className="detail-secondary-actions">
        <button aria-pressed={has(p.id)} onClick={() => toggle(p.id)}>
          <Heart size={16} fill={has(p.id) ? "currentColor" : "none"} />
          {has(p.id) ? "Wishlisted" : "Wishlist"}
        </button>
        <button
          aria-pressed={saved.has(p.id)}
          onClick={() =>
            toast.success(
              saved.toggle(p.id) ? "Saved to My catalogue" : "Removed from saved catalogue"
            )
          }
        >
          {saved.has(p.id) ? "Saved to catalogue" : "Save to My catalogue"}
        </button>
      </div>
    </article>
  );
}
