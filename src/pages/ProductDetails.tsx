import {
  ArrowLeft,
  Award,
  BookmarkCheck, BookmarkPlus,
  Check,
  ChevronRight,
  Clock, Heart,
  List,
  Lock, MessageSquarePlus,
  Package,
  Plus,
  Shield,
  ShoppingBag,
  Star,
  ThumbsUp,
  Truck,
  X,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation, useParams } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSaveLists } from '../context/SaveListsContext';
import { useWishlist } from '../context/WishlistContext';
import { products } from '../data/products';
import { getReviewsForProduct } from '../data/reviews';

const guaranteePoints = [
  'Direct sourcing from certified farms and FSSAI-licensed manufacturers',
  'Rigorous 5-step quality inspection before every dispatch',
  'Cold-chain logistics to preserve freshness of perishable goods',
  'All products tested for pesticide residue and quality compliance',
  'Best before date checked — only products with 60%+ shelf life dispatched',
];

const returnPoints = [
  '7-day hassle-free returns for sealed, non-perishable products',
  'For fresh produce, raise complaints within 24 hours with photo proof',
  'Full refund or replacement guaranteed — no questions asked',
  'Pickup scheduled within 48 hours of approved return request',
  'Refunds credited within 3-5 business days to original payment method',
];

const nutritionRows = [
  { label: 'Serving Size', value: '100g' },
  { label: 'Calories', value: '360 kcal' },
  { label: 'Total Fat', value: '0.5g' },
  { label: 'Carbohydrates', value: '79g' },
  { label: 'Protein', value: '7g' },
  { label: 'Fibre', value: '1.3g' },
  { label: 'Sodium', value: '0mg' },
];

export function ProductDetails() {
  const params = useParams();
  const [, navigate] = useLocation();
  const product = products.find(p => p._id === params.id);

  const [packType, setPackType] = useState<'normal' | 'bulk'>('normal');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [activeThumb, setActiveThumb] = useState(0);
  const [addedAnim, setAddedAnim] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showSaveListSelector, setShowSaveListSelector] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const {
    addToSaveList,
    removeFromSaveList,
    isInSaveList,
    getListNames,
    createList,
  } = useSaveLists();
  const { isAuthenticated, isGuest, user } = useAuth();

  if (!product) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
        <p className="text-gray-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold px-8 py-3 rounded-full hover:shadow-lg transition-all">
          Browse Products
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);
  const isInAnySaveList = isInSaveList(product._id);
  const currentPrice = packType === 'normal' ? product.normalPrice : product.bulkPrice;
  const savingsAmount = product.mrp - currentPrice;
  const savingsPct = Math.round((savingsAmount / product.mrp) * 100);
  const bulkSavingsPct = Math.max(0, Math.round(((product.normalPrice - product.bulkPrice / product.bulkMinQty) / product.normalPrice) * 100));
  const totalPrice = currentPrice * quantity;

  const relatedProducts = products.filter(p => p.mainCategory === product.mainCategory && p._id !== product._id).slice(0, 4);
  const reviews = getReviewsForProduct(product._id);
  const filteredReviews = ratingFilter === 0 ? reviews : reviews.filter(r => r.rating === ratingFilter);

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: reviews.filter(rev => rev.rating === r).length,
    pct: reviews.length ? Math.round((reviews.filter(rev => rev.rating === r).length / reviews.length) * 100) : 0,
  }));

  const handleAddToCart = () => {
    addToCart(product, quantity, packType);
    setAddedAnim(true);
    toast.success(`Added ${quantity}x ${product.name} to cart!`);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated || isGuest) {
      toast.error('Sign in to buy now', {
        action: { label: 'Sign In', onClick: () => navigate('/login') },
        duration: 4000,
      });
      return;
    }
    addToCart(product, quantity, packType);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated || isGuest) {
      toast.error('Sign in to add to wishlist', {
        action: { label: 'Sign In', onClick: () => navigate('/login') },
        duration: 4000,
      });
      return;
    }
    toggleWishlist(product);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const handleSaveToList = (listName?: string) => {
    if (!isAuthenticated || isGuest) {
      toast.error('Sign in to save items', {
        action: { label: 'Sign In', onClick: () => navigate('/login') },
        duration: 4000,
      });
      return;
    }
    if (listName) {
      addToSaveList(product, listName);
      toast.success(`Saved to "${listName}" list!`);
    } else {
      if (isInAnySaveList) {
        removeFromSaveList(product._id);
        toast.success('Removed from saved lists');
      } else {
        addToSaveList(product);
        toast.success('Saved to "My Saved Items"');
      }
    }
    setShowSaveListSelector(false);
  };

  const handleCreateAndSave = () => {
    const newListName = prompt('Enter list name (e.g., "Birthday Gifts", "Weekly Groceries")');
    if (newListName?.trim()) {
      createList(newListName.trim());
      setTimeout(() => {
        addToSaveList(product, newListName.trim());
        toast.success(`Saved to "${newListName}" list!`);
      }, 100);
    }
    setShowSaveListSelector(false);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) { toast.error('Please select a star rating'); return; }
    if (!reviewTitle.trim()) { toast.error('Please add a review title'); return; }
    toast.success('Your review has been submitted for moderation. Thank you!');
    setReviewRating(0); setReviewTitle(''); setReviewBody('');
  };

  const handleHelpful = (reviewId: string) => {
    setHelpfulVotes(prev => {
      const next = new Set(prev);
      next.has(reviewId) ? next.delete(reviewId) : next.add(reviewId);
      return next;
    });
  };

  const tabs = [
    { id: 'details', label: 'Product Details' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'guarantee', label: 'Quality Guarantee' },
    { id: 'returns', label: 'Return Policy' },
    { id: 'nutrition', label: 'Nutrition Info' },
  ];

  const listNames = getListNames();
  const thumbCount = 4;

  return (
    <div className="pt-16 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3 mt-4 flex-wrap">
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-emerald-600">Products</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/products?category=${encodeURIComponent(product.mainCategory)}`} className="hover:text-emerald-600">{product.mainCategory}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-emerald-600 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-5 transition-colors font-medium text-sm"
          aria-label="Back to Products"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[88px_1fr] lg:grid-cols-[96px_1fr_1fr] gap-4 lg:gap-10 mb-10">

          {/* Thumbnail rail (desktop, left of main image) */}
          <div className="hidden md:flex flex-col gap-3 order-2 lg:order-1">
            {Array.from({ length: thumbCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveThumb(i)}
                className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeThumb === i ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-emerald-300'}`}
              >
                <img src={product.image} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="order-1 lg:order-2">
            <div className="relative bg-white rounded-2xl overflow-hidden aspect-square max-h-[440px] shadow-sm border border-gray-100 group mx-auto">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 p-6"
              />
              {savingsPct > 10 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-lg z-10">
                  {savingsPct}% OFF
                </div>
              )}
              <button
                onClick={handleWishlistToggle}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all z-20 backdrop-blur-sm ${
                  isWishlisted
                    ? 'border-rose-400 bg-rose-500 text-white shadow-lg'
                    : 'border-gray-200 bg-white/90 text-gray-500 hover:border-rose-300 hover:text-rose-500 hover:bg-white'
                }`}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                  <span className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full">Out of Stock</span>
                </div>
              )}
            </div>
            {/* Mobile thumbnail strip */}
            <div className="flex md:hidden gap-2 mt-3 justify-center">
              {Array.from({ length: thumbCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeThumb === i ? 'border-emerald-500' : 'border-gray-200'}`}
                >
                  <img src={product.image} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-3.5 order-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/products?category=${encodeURIComponent(product.mainCategory)}`}
                className="bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-emerald-200 transition-colors"
              >
                {product.mainCategory}
              </Link>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 text-sm font-medium">{product.brand}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <span className="font-bold text-gray-800 text-sm">{product.rating}</span>
              <button onClick={() => setActiveTab('reviews')} className="text-gray-400 text-xs hover:text-emerald-600 hover:underline" aria-label="View reviews">
                ({product.reviews.toLocaleString()} reviews)
              </button>
              {product.inStock && (
                <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                  <Check className="w-3 h-3" /> In Stock
                </span>
              )}
            </div>

            {/* Price Panel */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-extrabold text-emerald-700">₹{currentPrice}</span>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium">MRP</span>
                  <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                </div>
                <span className="text-xs bg-rose-100 text-rose-600 font-bold px-1.5 py-0.5 rounded-lg">{savingsPct}% off</span>
              </div>
              <p className="text-emerald-700 text-xs font-semibold">You save ₹{savingsAmount} on this pack</p>
              {quantity > 1 && (
                <p className="text-gray-500 text-xs mt-1">
                  Total for {quantity} {packType === 'bulk' ? 'bulk packs' : 'packs'}: <strong className="text-gray-800">₹{totalPrice}</strong>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">* Inclusive of all taxes</p>
            </div>

            {/* Pack Size Selector */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wider">Choose Pack Size</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setPackType('normal'); setQuantity(1); }}
                  className={`p-3 rounded-xl border-2 transition-all text-left relative ${packType === 'normal' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 bg-white hover:border-emerald-200'}`}
                  aria-label="Standard pack"
                >
                  {packType === 'normal' && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  <div className="font-bold text-gray-900 text-base">{product.normalUnit}</div>
                  <div className="text-xs text-gray-500">Standard Pack</div>
                  <div className="text-emerald-700 font-extrabold text-lg mt-1">₹{product.normalPrice}</div>
                </button>

                <button
                  onClick={() => { setPackType('bulk'); setQuantity(product.bulkMinQty); }}
                  className={`p-3 rounded-xl border-2 transition-all text-left relative ${packType === 'bulk' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 bg-white hover:border-emerald-200'}`}
                  aria-label="Bulk pack"
                >
                  {packType === 'bulk' && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-base">{product.bulkUnit}</span>
                    {bulkSavingsPct > 0 && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1 py-0.5 rounded">Save {bulkSavingsPct}%</span>}
                  </div>
                  <div className="text-xs text-gray-500">Min {product.bulkMinQty}</div>
                  <div className="text-emerald-700 font-extrabold text-lg mt-1">₹{product.bulkPrice}</div>
                </button>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setQuantity(q => Math.max(packType === 'bulk' ? product.bulkMinQty : 1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 text-lg font-bold transition-colors"
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>
                <span className="w-10 text-center font-bold text-gray-900 text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 text-lg font-bold transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center justify-center gap-2 transition-all py-3 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-200 text-sm ${addedAnim ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : ''}`}
                aria-label="Add to cart"
              >
                {addedAnim ? <><Check className="w-4 h-4" /> Added!</> : <><ShoppingBag className="w-4 h-4" /> Add to Cart</>}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all py-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                aria-label="Buy now"
              >
                <Zap className="w-4 h-4" /> Buy Now
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSaveListSelector(!showSaveListSelector)}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    isInAnySaveList ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-gray-200 bg-white text-gray-400 hover:border-emerald-300 hover:text-emerald-500'
                  }`}
                  title="Save to list"
                  aria-label="Save to list"
                >
                  <BookmarkCheck className={`w-5 h-5 ${isInAnySaveList ? '' : 'hidden'}`} />
                  <BookmarkPlus className={`w-5 h-5 ${isInAnySaveList ? 'hidden' : ''}`} />
                </button>

                {showSaveListSelector && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-30 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700">Save to list</span>
                      <button onClick={() => setShowSaveListSelector(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {listNames.map(name => (
                        <button key={name} onClick={() => handleSaveToList(name)} className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition-colors flex items-center gap-2 text-sm" aria-label={`Save to ${name} list`}>
                          <List className="w-4 h-4 text-emerald-600" />
                          {name}
                        </button>
                      ))}
                      <button onClick={handleCreateAndSave} className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition-colors flex items-center gap-2 text-sm border-t border-gray-100 text-emerald-600" aria-label="Create new list">
                        <Plus className="w-4 h-4" />
                        Create new list
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹500' },
                { icon: Shield, title: 'Secure Payment', desc: '100% safe checkout' },
                { icon: Award, title: 'Verified Quality', desc: 'FSSAI certified' },
                { icon: Clock, title: 'Schedule Delivery', desc: 'Pick your time slot' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2 p-2.5 bg-white rounded-xl border border-gray-100">
                  <Icon className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{title}</p>
                    <p className="text-[10px] text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick info strip */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Sold By:</span><span className="font-semibold text-gray-900">Boxaio Essentials Pvt. Ltd.</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pack Size:</span><span className="font-semibold text-gray-900">{product.normalUnit}</span></div>
            </div>
          </div>
        </div>

        {/* Tab Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 font-semibold text-sm whitespace-nowrap transition-colors relative flex-shrink-0 ${activeTab === tab.id ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
                aria-label={`Tab: ${tab.label}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 rounded-t-full" />}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-7">
            {activeTab === 'details' && (
              <div>
                <p className="text-gray-600 leading-relaxed mb-5 text-sm">{product.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-gray-100 rounded-xl overflow-hidden">
                  {[
                    { label: 'Brand', value: product.brand },
                    { label: 'Main Category', value: product.mainCategory },
                    { label: 'Sub Category', value: product.subCategory },
                    { label: 'Standard Unit', value: product.normalUnit },
                    { label: 'Bulk Unit', value: product.bulkUnit },
                    { label: 'Standard Price', value: `₹${product.normalPrice}` },
                    { label: 'Bulk Price', value: `₹${product.bulkPrice}` },
                    { label: 'MRP (Max. Retail Price)', value: `₹${product.mrp}` },
                    { label: 'Availability', value: product.inStock ? 'In Stock' : 'Out of Stock' },
                    { label: 'Organic', value: product.isOrganic ? 'Yes' : 'No' },
                    { label: 'Vegetarian', value: product.isVegetarian ? 'Yes' : 'No' },
                  ].map(({ label, value }, idx) => (
                    <div key={label} className={`flex justify-between px-4 py-2.5 text-sm ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <span className="text-gray-500 font-medium">{label}</span>
                      <span className="font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col md:flex-row gap-6 mb-8 pb-6 border-b border-gray-100">
                  <div className="text-center flex-shrink-0">
                    <div className="text-6xl font-black text-gray-900">{product.rating}</div>
                    <div className="flex justify-center gap-0.5 my-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm">{product.reviews.toLocaleString()} ratings</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {ratingCounts.map(({ star, count, pct }) => (
                      <button
                        key={star}
                        onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                        className={`w-full flex items-center gap-3 group hover:opacity-80 transition-opacity ${ratingFilter === star ? 'opacity-100' : ''}`}
                        aria-label={`Filter by ${star} stars`}
                      >
                        <span className="text-sm font-bold text-gray-600 w-3 flex-shrink-0">{star}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${ratingFilter === star ? 'bg-amber-500' : 'bg-amber-300'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">{count}</span>
                      </button>
                    ))}
                    {ratingFilter > 0 && (
                      <button onClick={() => setRatingFilter(0)} className="text-xs text-emerald-600 font-semibold hover:underline mt-1" aria-label="Clear filter">
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>

                {!isAuthenticated || isGuest ? (
                  <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-amber-800 text-sm">Sign in to write a review</p>
                      <p className="text-amber-600 text-xs mt-0.5">Share your experience with other shoppers.</p>
                    </div>
                    <Link href="/login" className="flex-shrink-0 bg-amber-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors">
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <div className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageSquarePlus className="w-5 h-5 text-emerald-600" /> Write a Review
                    </h3>
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Your Rating</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button" onClick={() => setReviewRating(n)} className="transition-transform hover:scale-110" aria-label={`Rate ${n} stars`}>
                              <Star className={`w-7 h-7 ${n <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        required
                        value={reviewTitle}
                        onChange={e => setReviewTitle(e.target.value)}
                        placeholder="Review title (e.g. Great quality, fast delivery)"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                        aria-label="Review title"
                      />
                      <textarea
                        value={reviewBody}
                        onChange={e => setReviewBody(e.target.value)}
                        placeholder="Tell other shoppers about this product..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm resize-none h-20"
                        aria-label="Review content"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                          {user?.profile.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm text-gray-600">Posting as <strong>{user?.profile.name || 'User'}</strong></span>
                        <button type="submit" className="ml-auto bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-lg transition-all text-sm" aria-label="Submit review">
                          Submit Review
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-5">
                  {filteredReviews.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No reviews match this filter.</p>
                  ) : filteredReviews.map(review => (
                    <div key={review.id} className="pb-5 border-b border-gray-100 last:border-0">
                      <div className="flex items-start gap-3">
                        <img src={review.avatar} alt={review.author} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-100" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <span className="font-bold text-gray-900 text-sm">{review.author}</span>
                            {review.verified && (
                              <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Verified Purchase
                              </span>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">{review.date}</span>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                            ))}
                          </div>
                          <p className="font-bold text-gray-900 text-sm mb-1">{review.title}</p>
                          <p className="text-gray-600 text-sm leading-relaxed">{review.body}</p>
                          <button
                            onClick={() => handleHelpful(review.id)}
                            className={`mt-2.5 flex items-center gap-1.5 text-xs font-semibold transition-colors ${helpfulVotes.has(review.id) ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-600'}`}
                            aria-label="Mark as helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Helpful ({review.helpful + (helpfulVotes.has(review.id) ? 1 : 0)})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'guarantee' && (
              <div className="space-y-3.5">
                <p className="text-gray-600 leading-relaxed mb-3 text-sm">At Boxaio, quality is not a promise — it is our process.</p>
                {guaranteePoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-700" />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="space-y-3.5">
                <p className="text-gray-600 leading-relaxed mb-3 text-sm">We stand behind every product. If you are not satisfied, we will make it right.</p>
                {returnPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-700" />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div>
                <p className="text-gray-500 text-sm mb-4">Approximate nutritional values per 100g serving.</p>
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  {nutritionRows.map(({ label, value }, i) => (
                    <div key={label} className={`flex justify-between px-5 py-3 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <span className="text-gray-500 font-medium">{label}</span>
                      <span className="font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">* Values are approximate and may vary by lot/batch.</p>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} category={product.mainCategory} />}
      </div>
    </div>
  );
}

function RelatedProducts({ products: relProds, category }: { products: typeof products; category: string }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInSaveList, addToSaveList } = useSaveLists();
  const { isAuthenticated, isGuest } = useAuth();
  const { addToCart } = useCart();
  const [, navigate] = useLocation();

  const handleSaveToListQuick = (product: any) => {
    if (!isAuthenticated || isGuest) {
      toast.error('Sign in to save items');
      return;
    }
    addToSaveList(product);
    toast.success('Saved to list');
  };

  const handleProductClick = (productId: string) => navigate(`/products/${productId}`);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">You Might Also Like</h2>
        <Link href={`/products?category=${encodeURIComponent(category)}`} className="text-emerald-600 text-sm font-semibold hover:underline flex items-center gap-1">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relProds.map(p => (
          <div key={p._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
            <div onClick={() => handleProductClick(p._id)} className="cursor-pointer">
              <div className="aspect-square overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
            <div className="p-3">
              <div onClick={() => handleProductClick(p._id)} className="cursor-pointer">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 hover:text-emerald-600 transition-colors">{p.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-700">₹{p.normalPrice}</span>
                <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(p, 1, 'normal'); toast.success('Added to cart!'); }}
                  className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Add to cart"
                >
                  Cart
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                  className={`p-1.5 rounded-lg border transition-colors ${isInWishlist(p._id) ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-200 text-gray-400 hover:text-rose-400 hover:border-rose-200'}`}
                  aria-label={isInWishlist(p._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isInWishlist(p._id) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSaveToListQuick(p); }}
                  className={`p-1.5 rounded-lg border transition-colors ${isInSaveList(p._id) ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-gray-200 text-gray-400 hover:text-emerald-500 hover:border-emerald-200'}`}
                  aria-label={isInSaveList(p._id) ? 'Remove from saved lists' : 'Save to list'}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}