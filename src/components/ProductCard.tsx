import { BookmarkCheck, BookmarkPlus, Heart, Minus, Plus, ShoppingBag, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  onToggleWishlist: () => void;
  isWishlisted: boolean;
  compact?: boolean;
  /** Mark as part of the catalog's newest arrivals — drives the "New" badge. */
  isNew?: boolean;
}

// One clear badge per card, priority: big discount > new > bestseller > organic.
function getBadge(product: Product, savings: number, isNew: boolean) {
  if (savings >= 15) return { label: `${savings}% OFF`, className: 'bg-white/95 text-rose-600 ring-1 ring-rose-100' };
  if (isNew) return { label: 'NEW', className: 'bg-sky-600 text-white' };
  if (product.rating >= 4.8) return { label: 'Bestseller', className: 'bg-amber-500 text-white' };
  if (product.isOrganic) return { label: 'Organic', className: 'bg-emerald-600 text-white' };
  return null;
}

export function ProductCard({ product, onToggleWishlist, isWishlisted, compact = false, isNew = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isAuthenticated, isGuest } = useAuth();
  const [, navigate] = useLocation();
  const [qty, setQty] = useState(1);
  const savings = Math.round(((product.mrp - product.normalPrice) / product.mrp) * 100);
  const badge = getBadge(product, savings, isNew);

  const requireAuth = (action: string): boolean => {
    if (!isAuthenticated || isGuest) {
      toast.error(`Sign in to ${action}`, {
        action: { label: 'Sign In', onClick: () => navigate('/login') },
        duration: 4000,
      });
      return false;
    }
    return true;
  };

  const stopAnd = (e: React.MouseEvent, fn: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  const handleAddToCart = (e: React.MouseEvent) =>
    stopAnd(e, () => {
      addToCart(product, qty, 'normal');
      toast.success(`${qty} × ${product.name} added to cart!`);
      setQty(1);
    });

  const handleBuyNow = (e: React.MouseEvent) =>
    stopAnd(e, () => {
      if (!requireAuth('buy now')) return;
      addToCart(product, qty, 'normal');
      navigate('/checkout');
    });

  const handleWishlist = (e: React.MouseEvent) =>
    stopAnd(e, () => {
      onToggleWishlist();
      toast.success(isWishlisted ? 'Removed from saved list' : 'Added to saved list!');
    });

  const incQty = (e: React.MouseEvent) => stopAnd(e, () => setQty(q => Math.min(q + 1, 99)));
  const decQty = (e: React.MouseEvent) => stopAnd(e, () => setQty(q => Math.max(q - 1, 1)));

  return (
    <Link
      href={`/products/${product._id}`}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-200 hover:shadow-[0_8px_30px_-8px_rgba(4,120,87,0.25)] hover:-translate-y-1 transition-all duration-300"
      data-testid={`card-product-${product._id}`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${compact ? 'aspect-square' : 'aspect-[4/3]'} bg-gray-50`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {badge && (
          <div className={`absolute top-2.5 left-2.5 flex items-center gap-0.5 backdrop-blur text-[10px] font-black px-2 py-1 rounded-full shadow-sm ${badge.className}`}>
            {badge.label}
          </div>
        )}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all shadow-sm ${
            isWishlisted
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 backdrop-blur text-gray-400 hover:bg-white hover:text-rose-500'
          }`}
          data-testid={`button-wishlist-${product._id}`}
          title={isWishlisted ? 'Remove from saved list' : 'Save to list'}
        >
          {isWishlisted
            ? <BookmarkCheck className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-current`} />
            : <BookmarkPlus className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
          }
        </button>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <span className="bg-white/95 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 ${compact ? 'p-2.5' : 'p-3.5'}`}>
        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">{product.subCategory}</p>
        <h3 className={`font-bold text-gray-900 line-clamp-2 leading-snug mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className={`text-gray-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>{product.brand}</span>
          <span className="text-gray-200">•</span>
          <div className="flex items-center gap-0.5">
            <Star className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} fill-amber-400 text-amber-400`} />
            <span className={`font-semibold text-gray-700 ${compact ? 'text-[10px]' : 'text-xs'}`}>{product.rating}</span>
            <span className={`text-gray-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>({product.reviews.toLocaleString()})</span>
          </div>
        </div>

        {/* Price + quantity, side by side — price reflects selected quantity */}
        <div className="mt-auto">
          {compact ? (
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-sm font-extrabold text-emerald-700">₹{product.normalPrice}</span>
              <span className="text-[10px] text-gray-400 line-through">MRP ₹{product.mrp}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 mb-1">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold text-emerald-700">₹{product.normalPrice * qty}</span>
                  <span className="text-xs text-gray-400 line-through">MRP ₹{product.mrp * qty}</span>
                </div>
                {qty > 1 && <p className="text-[10px] text-gray-400">₹{product.normalPrice} × {qty}</p>}
              </div>

              {/* Quantity adjuster, right beside the price */}
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl flex-shrink-0">
                <button
                  onClick={decQty}
                  disabled={!product.inStock}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-emerald-700 disabled:opacity-30 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold text-gray-900 w-5 text-center">{qty}</span>
                <button
                  onClick={incQty}
                  disabled={!product.inStock}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-emerald-700 disabled:opacity-30 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <p className={`text-emerald-600 font-semibold mb-2.5 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
            Bulk: ₹{product.bulkPrice} / {product.bulkUnit}
          </p>

          {/* Actions */}
          {compact ? (
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed py-1.5 text-xs"
              data-testid={`button-add-to-cart-${product._id}`}
            >
              <ShoppingBag className="w-3 h-3" />
              Add
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs py-2 border border-gray-200"
                data-testid={`button-add-to-cart-${product._id}`}
                title="Add to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-emerald-800 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs py-2"
                data-testid={`button-buy-now-${product._id}`}
                title="Buy now"
              >
                <Zap className="w-3.5 h-3.5" />
                Buy
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Compact wishlist heart used in some list views
export function WishlistHeart({ isWishlisted, onClick }: { isWishlisted: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`p-1.5 rounded-full transition-all ${isWishlisted ? 'text-rose-500' : 'text-gray-300 hover:text-rose-400'}`}>
      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
    </button>
  );
}