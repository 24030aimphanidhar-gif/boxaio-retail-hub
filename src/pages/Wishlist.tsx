import { Heart, ShoppingBag, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export function Wishlist() {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-12 flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 min-h-screen px-4">
        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-container shadow-xl mb-6 border-4 border-rose-100">
          <Heart className="w-14 h-14 text-rose-300" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your wishlist awaits</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">Sign in to save your favourite items, track price drops, and get back to them any time.</p>
        <div className="flex gap-3">
          <Link href="/login" className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold py-3 px-8 rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Sign In
          </Link>
          <Link href="/products" className="border-2 border-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full hover:border-emerald-400 transition-all">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 py-12 px-4 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-pink-300" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30">
              <Heart className="w-7 h-7 text-white fill-current" />
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-extrabold">My Wishlist</h1>
              <p className="text-rose-100 mt-1">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
            </div>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all items from wishlist?')) {
                  clearWishlist();
                  toast.success('Wishlist cleared');
                }
              }}
              className="text-white/80 hover:text-white text-sm font-semibold flex items-center gap-1"
              aria-label="Clear all wishlist items"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-rose-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nothing saved yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Tap the heart icon on any product to add it here. Your wishlist is waiting to be filled!</p>
            <Link href="/products" className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold py-3 px-8 rounded-full hover:shadow-xl transition-all inline-block">
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm">{wishlist.length} saved items</p>
              <button
                onClick={() => {
                  wishlist.forEach(p => addToCart(p, 1, 'normal'));
                  toast.success('All wishlist items added to cart!');
                }}
                className="flex items-center gap-2 text-sm font-bold text-emerald-700 border-2 border-emerald-200 px-5 py-2 rounded-full hover:bg-emerald-50 transition-colors"
                aria-label="Add all to cart"
              >
                <ShoppingBag className="w-4 h-4" /> Add All to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlist.map(product => {
                const savings = Math.round(((product.mrp - product.normalPrice) / product.mrp) * 100);
                return (
                  <div key={product._id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
                    <button
                      onClick={() => {
                        toggleWishlist(product);
                        toast.success('Removed from wishlist');
                      }}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {savings > 5 && (
                      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                        {savings}% OFF
                      </div>
                    )}

                    <Link href={`/product/${product._id}`} className="block aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </Link>

                    <div className="p-4">
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">{product.mainCategory}</p>
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-0.5 hover:text-emerald-700 transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-xs text-gray-400 mb-2">{product.brand}</p>

                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">({product.reviews})</span>
                      </div>

                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className="font-extrabold text-emerald-700 text-base">₹{product.normalPrice}</span>
                        <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold mb-3">Bulk: ₹{product.bulkPrice} / {product.bulkUnit}</p>

                      <button
                        onClick={() => {
                          addToCart(product, 1, 'normal');
                          toast.success(`${product.name} added to cart!`);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg transition-all"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Also export as default for compatibility
export default Wishlist;