import { useState } from "react";
import { Heart, Minus, Plus, Star, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";
import { ProductImage } from "@/features/shared/components/ProductImage";
import { SaveProductButton } from "@/features/shared/components/SaveProductButton";
interface Props {
  product: Product;
  onToggleWishlist: () => void;
  isWishlisted: boolean;
  compact?: boolean;
  isNew?: boolean;
}
export function ProductCard({ product: p, onToggleWishlist, isWishlisted }: Props) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState(1);
  const item = cart.find((i) => i.productId === p._id && i.type === "normal");
  const qty = item?.quantity || selected;
  const saving = Math.max(0, Math.round((1 - p.normalPrice / p.mrp) * 100));
  function change(n: number) {
    if (item) {
      n === 0 ? removeFromCart(item.id) : updateQuantity(item.id, n);
    } else setSelected(Math.max(1, n));
  }
  function add(buy = false) {
    if (!p.inStock) return;
    if (!item) addToCart(p, qty, "normal");
    if (buy) navigate("/checkout");
    else toast.success(`${qty} × ${p.name} in your basket`);
  }
  return (
    <article
      className="fresh-product consumer-card market-card"
      data-testid={"card-product-" + p._id}
    >
      <div className="product-photo">
        <Link href={"/products/" + p._id} aria-label={"View " + p.name}>
          <ProductImage productId={p._id} src={p.image} alt={p.name} loading="lazy" />
        </Link>
        {saving > 0 && <span className="saving-tag">{saving}% OFF</span>}
        <button
          className={"save-product " + (isWishlisted ? "saved" : "")}
          aria-label={(isWishlisted ? "Remove " : "Save ") + p.name + " wishlist"}
          aria-pressed={isWishlisted}
          onClick={onToggleWishlist}
        >
          <Heart size={17} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-info">
        <span className="market-brand">{p.brand}</span>
        <Link href={"/products/" + p._id} className="product-name">
          {p.name}
        </Link>
        <div className="market-rating">
          <Star size={11} fill="currentColor" />
          <strong>{p.rating}</strong>
          <span>({p.reviews})</span>
          <span className="market-unit">{p.normalUnit}</span>
        </div>
        <div className="market-price">
          <strong>₹{p.normalPrice}</strong>
          {p.mrp > p.normalPrice && <del>₹{p.mrp}</del>}
          <small>{p.inStock ? "In stock" : "Sold out"}</small>
        </div>
        <div className="market-quantity">
          <span>Qty</span>
          <div className="quantity-stepper">
            <button
              aria-label={"Decrease " + p.name}
              disabled={!p.inStock || (!item && qty <= 1)}
              onClick={() => change(qty - 1)}
            >
              <Minus size={14} />
            </button>
            <span aria-live="polite">{qty}</span>
            <button
              aria-label={"Increase " + p.name}
              disabled={!p.inStock || qty >= 99}
              onClick={() => change(qty + 1)}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="market-actions">
          {item ? (
            <Link className="market-add" href="/cart">
              <ShoppingCart size={14} />
              In basket
            </Link>
          ) : (
            <button
              className="market-add"
              disabled={!p.inStock}
              aria-label={"Add " + p.name + " to cart"}
              onClick={() => add()}
            >
              <Plus size={14} />
              Add
            </button>
          )}
          <button
            className="market-buy"
            disabled={!p.inStock}
            aria-label={"Buy " + p.name + " now"}
            onClick={() => add(true)}
          >
            Buy now
          </button>
        </div>
        <div className="market-card-footer">
          <SaveProductButton product={p} />
          <Link href={"/products/" + p._id}>Details</Link>
        </div>
      </div>
    </article>
  );
}
