import { Link } from "wouter";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { ProductCard } from "@/features/consumer/components/ProductCard";
import { toast } from "sonner";
export function Wishlist() {
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  return (
    <div className="wrap orders-page">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Favourites</span>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">ALL THE GOOD THINGS YOU SAVED</span>
          <h1>Your favourites</h1>
          <p>{wishlist.length} finds worth coming back for.</p>
        </div>
        {wishlist.length > 0 && (
          <button
            className="outline-button"
            onClick={() => {
              const available = wishlist.filter((p) => p.inStock);
              available.forEach((p) => addToCart(p, 1, "normal"));
              available.length
                ? toast.success(available.length + " products added to your basket")
                : toast.info("Your saved products are currently unavailable");
            }}
          >
            <ShoppingBag size={16} /> Add available to basket
          </button>
        )}
      </div>
      {wishlist.length ? (
        <div className="catalog-product-grid offers-grid">
          {wishlist.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onToggleWishlist={() => toggleWishlist(p)}
              isWishlisted={isInWishlist(p._id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={38} />
          <h2>Make room for your favourites.</h2>
          <p>Tap the heart on any product to save it here.</p>
          <Link href="/products" className="solid-button">
            Find something good <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
