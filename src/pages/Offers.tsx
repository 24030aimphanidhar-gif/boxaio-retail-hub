import { useState } from "react";
import { Link } from "wouter";
import { Copy, Check, ArrowRight } from "lucide-react";
import { ProductCard } from "@/features/consumer/components/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { products } from "../data/products";
import { toast } from "sonner";
export function Offers() {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("All deals");
  const { toggleWishlist, isInWishlist } = useWishlist();
  const deals = [...products]
    .filter(
      (p) =>
        p.mrp > p.normalPrice &&
        (filter !== "Under ₹100" || p.normalPrice < 100) &&
        (filter !== "Organic picks" || p.isOrganic)
    )
    .sort((a, b) => 1 - b.normalPrice / b.mrp - (1 - a.normalPrice / a.mrp));
  return (
    <div className="wrap orders-page">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Offers & savings</span>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">MORE GOODNESS. LESS SPENDING.</span>
          <h1>Little prices. Big smiles.</h1>
          <p>Make room in your basket for these everyday savings.</p>
        </div>
      </div>
      <div className="offer-banner">
        <div>
          <span className="eyebrow">YOUR NEXT BASKET, FOR LESS</span>
          <h2>Take 10% off your demo order.</h2>
          <p>Use BOXAIO10 at checkout. Applies to the product subtotal.</p>
        </div>
        <button
          className="outline-button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText("BOXAIO10");
              setCopied(true);
              toast.success("Coupon copied");
            } catch {
              toast.info("Enter BOXAIO10 at checkout");
            }
          }}
        >
          {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? "Copied!" : "BOXAIO10"}
        </button>
      </div>
      <div className="pill-tabs">
        {["All deals", "Under ₹100", "Organic picks"].map((t) => (
          <button key={t} className={filter === t ? "selected" : ""} onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="catalog-product-grid offers-grid">
        {deals.slice(0, 24).map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onToggleWishlist={() => toggleWishlist(p)}
            isWishlisted={isInWishlist(p._id)}
          />
        ))}
      </div>
      <div className="load-more">
        <Link href="/products" className="outline-button">
          Explore all essentials <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
