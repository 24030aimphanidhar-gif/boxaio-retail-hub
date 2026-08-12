import {
  BadgePercent,
  ChevronLeft, ChevronRight, Clock3, Flame, Grid,
  Leaf, List, Package, Rocket, Search, Sparkles, Star, ThumbsUp, TrendingUp, X
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ProductCard } from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { products, type MainCategory, type Product, type SubCategory } from '../data/products';

// ── Static config, derived from the real product schema ────────────────────

const mainCategories = [...new Set(products.map(p => p.mainCategory))] as MainCategory[];

const subCategoriesByMainCategory: Record<string, SubCategory[]> = {};
products.forEach(p => {
  if (!subCategoriesByMainCategory[p.mainCategory]) subCategoriesByMainCategory[p.mainCategory] = [];
  if (!subCategoriesByMainCategory[p.mainCategory].includes(p.subCategory)) {
    subCategoriesByMainCategory[p.mainCategory].push(p.subCategory);
  }
});

const categoryMeta: Record<string, { icon: string; tags: string }> = {
  'Fruits & Vegetables': { icon: '🍎', tags: 'Organic • Seasonal • Farm Fresh • Imported' },
  'Foodgrains, Oil & Masala': { icon: '🌾', tags: 'Everyday Staples • Bulk Packs • Cold-Pressed' },
  'Bakery, Cakes & Dairy': { icon: '🥛', tags: 'Fresh Daily • Farm Sourced • No Preservatives' },
  'Beverages': { icon: '🥤', tags: 'Chilled • Zero Sugar • Imported • Local' },
  'Snacks & Branded Foods': { icon: '🍿', tags: 'Crunchy • Party Packs • Kids Favourite' },
  'Beauty & Hygiene': { icon: '💄', tags: 'Dermat Tested • Cruelty Free • Everyday Care' },
  'Cleaning & Household': { icon: '🧹', tags: 'Powerful • Safe • Long Lasting' },
  'Eggs, Meat & Fish': { icon: '🥚', tags: 'Fresh Cut • Hygienically Packed • Same Day' },
  'Sauces & Spreads': { icon: '🥫', tags: 'Rich Flavour • No Additives' },
  'Breakfast & Cereals': { icon: '🥣', tags: 'Wholesome • High Fibre • Kids Approved' },
  'Baby Care': { icon: '👶', tags: 'Gentle • Dermat Tested • Trusted Brands' },
  'Frozen Foods': { icon: '❄️', tags: 'Ready to Cook • Locked-in Freshness' },
  'Organic Staples': { icon: '🌱', tags: 'Certified Organic • Pesticide Free' },
  'Kitchen, Garden & Pets': { icon: '🧺', tags: 'Durable • Everyday Essentials' },
  'Gourmet & World Food': { icon: '🍝', tags: 'Imported • Chef Curated' },
  'Pharma & Wellness': { icon: '💊', tags: 'Trusted • Genuine • Fast Delivery' },
  'Home & Kitchen': { icon: '🏠', tags: 'Durable • Everyday Essentials' },
  'Instant & Ready To Eat': { icon: '🍱', tags: 'Ready in Minutes • No Compromise on Taste' },
  'Biscuits & Chocolates': { icon: '🍪', tags: 'Crunchy • Sweet • Kids Approved' },
  'Tea, Coffee & Health Drinks': { icon: '☕', tags: 'Rich Aroma • Everyday Ritual' },
};
const fallbackMeta = { icon: '📦', tags: 'Quality Assured • Best Prices • Fast Delivery' };

const trendingCollections = [
  {
    title: 'Summer Fruits',
    subtitle: 'Up to 30% OFF',
    href: '/products?category=' + encodeURIComponent('Fruits & Vegetables'),
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Healthy Food',
    subtitle: 'Organic staples, curated',
    href: '/products?category=' + encodeURIComponent('Organic Staples'),
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Breakfast',
    subtitle: 'Start the day right',
    href: '/products?category=' + encodeURIComponent('Breakfast & Cereals'),
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=80',
  },
];

const staplesForBuyAgain: SubCategory[] = ['Rice & Rice Products', 'Milk', 'Eggs', 'Edible Oils', 'Atta & Flour'];

const RECENTLY_VIEWED_KEY = 'boxaio_recently_viewed';
const PAGE_SIZE = 12;
const FIRST_CHUNK = 8;

function readRecentlyViewed(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function recordRecentlyViewed(id: string) {
  try {
    const existing = readRecentlyViewed().filter(x => x !== id);
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([id, ...existing].slice(0, 8)));
  } catch {
    // storage unavailable — feature just won't persist, safe to ignore
  }
}

// ── Component ────────────────────────────────────────────────────────────

export function Products() {
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('default');
  const [bulkOnly, setBulkOnly] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [under99, setUnder99] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const categoryRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => setRecentIds(readRecentlyViewed()), []);

  // Initial category/search comes from the real URL (works regardless of what
  // wouter's `location` string includes) — click handlers below update state
  // directly afterwards, so filtering never depends on re-parsing the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const q = params.get('search');
    if (cat) setSelectedCategory(mainCategories.find(c => c.toLowerCase() === cat.toLowerCase()) || null);
    if (q) setSearchTerm(q);
  }, [location]);

  useEffect(() => {
    setSelectedSubCategory('');
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [searchTerm, selectedSubCategory, sortBy, bulkOnly, organicOnly, inStockOnly, premiumOnly, newOnly, under99]);

  const newProductIds = useMemo(() => new Set(products.slice(-15).map(p => p._id)), []);

  const categoriesWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => map.set(p.mainCategory, (map.get(p.mainCategory) || 0) + 1));
    return mainCategories.map(name => ({ name, count: map.get(name) || 0 }));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory) result = result.filter(p => p.mainCategory === selectedCategory);
    if (selectedSubCategory) result = result.filter(p => p.subCategory === selectedSubCategory);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lower) || p.brand.toLowerCase().includes(lower) || p.subCategory.toLowerCase().includes(lower)
      );
    }
    if (bulkOnly) result = result.filter(p => p.bulkPrice > 0);
    if (organicOnly) result = result.filter(p => p.isOrganic);
    if (inStockOnly) result = result.filter(p => p.inStock);
    if (premiumOnly) result = result.filter(p => p.normalPrice >= 200);
    if (newOnly) result = result.filter(p => newProductIds.has(p._id));
    if (under99) result = result.filter(p => p.normalPrice <= 99);

    if (sortBy === 'priceLow') result.sort((a, b) => a.normalPrice - b.normalPrice);
    else if (sortBy === 'priceHigh') result.sort((a, b) => b.normalPrice - a.normalPrice);
    else if (sortBy === 'discount') result.sort((a, b) => ((b.mrp - b.normalPrice) / b.mrp) - ((a.mrp - a.normalPrice) / a.mrp));
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [selectedCategory, selectedSubCategory, searchTerm, bulkOnly, organicOnly, inStockOnly, premiumOnly, newOnly, under99, sortBy, newProductIds]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const firstChunk = visibleProducts.slice(0, FIRST_CHUNK);
  const restChunk = visibleProducts.slice(FIRST_CHUNK);

  const availableSubCategories = selectedCategory ? subCategoriesByMainCategory[selectedCategory] || [] : [];
  const meta = selectedCategory ? categoryMeta[selectedCategory] || fallbackMeta : null;

  const bestPicks = useMemo(() => [...products].sort((a, b) => b.rating - a.rating).slice(0, 10), []);
  const buyAgainProducts = useMemo(() => products.filter(p => staplesForBuyAgain.includes(p.subCategory)).slice(0, 6), []);
  const recentlyViewedProducts = useMemo(() => recentIds.map(id => products.find(p => p._id === id)).filter(Boolean) as Product[], [recentIds]);
  const similarCategories = useMemo(() => mainCategories.filter(c => c !== selectedCategory).slice(0, 6), [selectedCategory]);

  const goToCategory = (name: MainCategory | null) => {
    setSelectedCategory(name);
    setSelectedSubCategory('');
    navigate(name ? `/products?category=${encodeURIComponent(name)}` : '/products');
  };

  const clearAll = () => {
    setSearchTerm('');
    setSelectedSubCategory('');
    setSortBy('default');
    setBulkOnly(false);
    setOrganicOnly(false);
    setInStockOnly(false);
    setPremiumOnly(false);
    setNewOnly(false);
    setUnder99(false);
    navigate('/products');
  };

  const activeFilterCount = [selectedSubCategory, searchTerm, bulkOnly, organicOnly, inStockOnly, premiumOnly, newOnly, under99, sortBy !== 'default']
    .filter(Boolean).length;

  const handleProductClick = (id: string) => recordRecentlyViewed(id);

  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right', amount = 260) => {
    if (!ref.current) return;
    ref.current.scrollTo({ left: dir === 'left' ? ref.current.scrollLeft - amount : ref.current.scrollLeft + amount, behavior: 'smooth' });
  };

  const quickActions: { label: string; icon: any; active: boolean; onClick: () => void }[] = [
    { label: 'Deals', icon: Flame, active: sortBy === 'discount', onClick: () => setSortBy(sortBy === 'discount' ? 'default' : 'discount') },
    { label: 'Best Sellers', icon: Star, active: sortBy === 'rating', onClick: () => setSortBy(sortBy === 'rating' ? 'default' : 'rating') },
    { label: 'Organic', icon: Leaf, active: organicOnly, onClick: () => setOrganicOnly(v => !v) },
    { label: 'Express', icon: Rocket, active: inStockOnly, onClick: () => setInStockOnly(v => !v) },
    { label: 'New', icon: Sparkles, active: newOnly, onClick: () => setNewOnly(v => !v) },
    { label: 'Under ₹99', icon: BadgePercent, active: under99, onClick: () => setUnder99(v => !v) },
    { label: 'Premium', icon: TrendingUp, active: premiumOnly, onClick: () => setPremiumOnly(v => !v) },
    { label: 'Bulk', icon: Package, active: bulkOnly, onClick: () => setBulkOnly(v => !v) },
  ];

  const renderCard = (p: Product, idx = 0) => (
    <div key={p._id} style={{ animationDelay: `${Math.min(idx * 40, 320)}ms` }} className="animate-slide-up" onClick={() => handleProductClick(p._id)}>
      <ProductCard product={p} isWishlisted={isInWishlist(p._id)} onToggleWishlist={() => toggleWishlist(p)} isNew={newProductIds.has(p._id)} />
    </div>
  );

  return (
    <div className="pt-16 pb-24 min-h-screen bg-gray-50">

      {/* ── Search + quick action strip ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for atta, rice, oil, milk..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              data-testid="input-product-search"
            />
          </div>
          {/* <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5">
            {quickActions.map(({ label, icon: Icon, active, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                  active ? 'bg-emerald-700 text-white shadow-sm' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div> */}
        </div>
      </div>

      {/* ── Category navigation ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 relative group">
          <button onClick={() => scrollRail(categoryRailRef, 'left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div ref={categoryRailRef} className="flex gap-2 overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {categoriesWithCounts.map(({ name, count }) => {
              const m = categoryMeta[name] || fallbackMeta;
              const active = selectedCategory === name;
              return (
                <button
                  key={name}
                  onClick={() => goToCategory(active ? null : name)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    active ? 'bg-emerald-700 text-white shadow-sm' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  <span>{m.icon}</span> {name}
                  <span className={`text-[10px] font-semibold ${active ? 'text-emerald-100' : 'text-gray-400'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => scrollRail(categoryRailRef, 'right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Selected category banner + subcategories ──
      {selectedCategory && meta && (
        <div className="bg-emerald-50/60 border-b border-emerald-100">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <h1 className="font-black text-gray-900 flex items-center gap-2 text-base">
                <span className="text-xl">{meta.icon}</span> {selectedCategory}
              </h1>
              <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-200">
                {filteredProducts.length} Products
              </span>
            </div>
            {availableSubCategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setSelectedSubCategory('')}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${!selectedSubCategory ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  All
                </button>
                {availableSubCategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${selectedSubCategory === sub ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* ── Sticky product toolbar ── */}
      <div className="bg-white/95 backdrop-blur border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-gray-500">
            Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> Products
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCategory && availableSubCategories.length > 0 && (
              <select
                value={selectedSubCategory}
                onChange={e => setSelectedSubCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white max-w-[160px]"
                data-testid="select-subcategory"
              >
                <option value="">All {selectedCategory}</option>
                {availableSubCategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            )}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="default">Sort: Recommended</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="rating">Top Rated</option>
            </select>
            <div className="flex bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-gray-600'}`} data-testid="button-view-grid">
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-gray-600'}`} data-testid="button-view-list">
                <List className="w-4 h-4" />
              </button>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="flex items-center gap-1 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ── Active filter chips ── */}
        {(selectedSubCategory || searchTerm) && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {selectedSubCategory && (
              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                {selectedSubCategory} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSubCategory('')} />
              </span>
            )}
            {searchTerm && (
              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                "{searchTerm}" <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
          </div>
        )}

        {/* ── Product grid ── */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 mb-14">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">Try adjusting your filters or search term.</p>
            <button onClick={clearAll} className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold px-8 py-3 rounded-full hover:shadow-lg transition-all">
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
              {firstChunk.map((p, idx) => renderCard(p, idx))}
            </div>

            {/* Mid-page discovery — breaks up the grid instead of one long wall of cards */}
            {restChunk.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5 text-rose-500" /> Trending Near You
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {trendingCollections.map(card => (
                    <Link key={card.title} href={card.href} className="group relative rounded-2xl overflow-hidden h-32 shadow-sm hover:shadow-xl transition-all">
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                        <h3 className="font-black text-base leading-tight">{card.title}</h3>
                        <p className="text-[11px] text-white/85 mb-1.5">{card.subtitle}</p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">
                          Shop Now <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {restChunk.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
                {restChunk.map((p, idx) => renderCard(p, idx))}
              </div>
            )}

            {visibleCount < filteredProducts.length && (
              <div className="text-center mb-14">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="bg-white border-2 border-emerald-600 text-emerald-700 font-bold px-8 py-3 rounded-full hover:bg-emerald-600 hover:text-white transition-all"
                >
                  Load More ({filteredProducts.length - visibleCount} left)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3 mb-14">
            {visibleProducts.map(p => {
              const savings = Math.round(((p.mrp - p.normalPrice) / p.mrp) * 100);
              return (
                <div key={p._id} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 hover:shadow-lg transition-all hover:-translate-y-0.5 group" onClick={() => handleProductClick(p._id)}>
                  <Link href={`/products/${p._id}`} className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mb-1">{p.subCategory}</p>
                    <Link href={`/products/${p._id}`}><h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 truncate hover:text-emerald-700">{p.name}</h3></Link>
                    <p className="text-xs text-gray-400 mb-1">{p.brand} • {p.normalUnit}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold text-emerald-700 text-lg">₹{p.normalPrice}</span>
                      <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                      {savings > 5 && <span className="text-[11px] bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-md">{savings}% off</span>}
                    </div>
                  </div>
                  <Link href={`/products/${p._id}`} className="flex items-center text-emerald-700 font-bold text-xs flex-shrink-0">
                    View <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
            {visibleCount < filteredProducts.length && (
              <div className="text-center mt-4">
                <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} className="bg-white border-2 border-emerald-600 text-emerald-700 font-bold px-8 py-3 rounded-full hover:bg-emerald-600 hover:text-white transition-all">
                  Load More
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Recently Viewed ── */}
        {recentlyViewedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 mb-4"><Clock3 className="w-5 h-5 text-gray-400" /> Recently Viewed</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
              {recentlyViewedProducts.map(p => (
                <div key={p._id} className="w-40 sm:w-48 flex-shrink-0" onClick={() => handleProductClick(p._id)}>
                  <ProductCard product={p} isWishlisted={isInWishlist(p._id)} onToggleWishlist={() => toggleWishlist(p)} compact />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Buy Again ── */}
        {buyAgainProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 mb-4"><ThumbsUp className="w-5 h-5 text-gray-400" /> Buy Again</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
              {buyAgainProducts.map(p => (
                <div key={p._id} className="w-40 sm:w-48 flex-shrink-0" onClick={() => handleProductClick(p._id)}>
                  <ProductCard product={p} isWishlisted={isInWishlist(p._id)} onToggleWishlist={() => toggleWishlist(p)} compact />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Best picks, shown only on the fully unfiltered browse view */}
        {!selectedCategory && !searchTerm && bestPicks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 mb-4"><Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Best Picks For You</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
              {bestPicks.map(p => (
                <div key={p._id} className="w-40 sm:w-48 flex-shrink-0" onClick={() => handleProductClick(p._id)}>
                  <ProductCard product={p} isWishlisted={isInWishlist(p._id)} onToggleWishlist={() => toggleWishlist(p)} compact isNew={newProductIds.has(p._id)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Explore More categories ── */}
        {/* <section className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 mb-4"><Boxes className="w-5 h-5 text-gray-400" /> Explore More</h2>
          <div className="flex gap-2 flex-wrap">
            {similarCategories.map(c => {
              const m = categoryMeta[c] || fallbackMeta;
              return (
                <button
                  key={c}
                  onClick={() => goToCategory(c)}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-sm rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition-all"
                >
                  <span>{m.icon}</span> {c}
                </button>
              );
            })}
          </div>
        </section> */}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}