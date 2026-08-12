import { ArrowRight, Award, ChevronLeft, ChevronRight, Clock, Flame, Heart, Search, Shield, ShoppingBag, Star, TrendingUp, Truck, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';
import { ProductCard } from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { products } from '../data/products';
import { testimonials } from '../data/testimonials';

const carouselSlides = [
  {
    bg: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
    overlay: 'from-emerald-950/90 via-emerald-900/60 to-transparent',
    tag: 'Limited Time Offer',
    title: 'Festival Special',
    subtitle: 'Diwali Mega Sale',
    desc: 'Up to 50% off on festive essentials. Stock up for the season.',
    cta: 'Shop the Sale',
    href: '/products',
  },
  {
    bg: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=1600&auto=format&fit=crop&q=80',
    overlay: 'from-teal-950/90 via-teal-900/55 to-transparent',
    tag: 'Wholesale Prices',
    title: 'Bulk Savings',
    subtitle: 'For Retailers & Families',
    desc: 'Save up to 30% with bulk packs. Best prices for large orders.',
    cta: 'Explore Bulk Deals',
    href: '/products',
  },
  {
    bg: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1600&auto=format&fit=crop&q=80',
    overlay: 'from-emerald-950/90 via-emerald-800/55 to-transparent',
    tag: 'Farm to Doorstep',
    title: 'Fresh Arrivals',
    subtitle: 'Seasonal Produce',
    desc: 'Handpicked fresh fruits and vegetables straight from our farms.',
    cta: 'Shop Fresh Now',
    href: '/products?category=Fruits',
  },
];

// Get unique main categories from products for the category rail
const getMainCategoriesFromProducts = () => {
  const categoriesMap = new Map();
  products.forEach(product => {
    if (!categoriesMap.has(product.mainCategory)) {
      categoriesMap.set(product.mainCategory, {
        name: product.mainCategory,
        count: 1,
        image: product.image,
      });
    } else {
      const existing = categoriesMap.get(product.mainCategory);
      existing.count++;
      categoriesMap.set(product.mainCategory, existing);
    }
  });
  return Array.from(categoriesMap.values());
};

// Derive brand list straight from the product catalog — no data added, nothing removed
const getBrandsFromProducts = () => {
  const brandMap = new Map<string, { name: string; count: number; image: string }>();
  products.forEach(product => {
    if (!brandMap.has(product.brand)) {
      brandMap.set(product.brand, { name: product.brand, count: 1, image: product.image });
    } else {
      const existing = brandMap.get(product.brand)!;
      existing.count++;
    }
  });
  return Array.from(brandMap.values()).sort((a, b) => b.count - a.count);
};

const brandAccents = [
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-teal-600',
];

const stats = [
  { value: '50K+', label: 'Happy Customers', icon: Users },
  { value: '500+', label: 'Products', icon: ShoppingBag },
  { value: '30+', label: 'Cities Covered', icon: Truck },
  { value: '4.8', label: 'App Rating', icon: Star },
];

const features = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹500', color: 'text-emerald-600 bg-emerald-100' },
  { icon: Shield, title: 'Secure Payment', desc: '100% safe checkout', color: 'text-blue-600 bg-blue-100' },
  { icon: Clock, title: 'Quick Delivery', desc: '2-4 days nationwide', color: 'text-amber-600 bg-amber-100' },
  { icon: Award, title: 'Quality Guarantee', desc: '100% fresh products', color: 'text-purple-600 bg-purple-100' },
];

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [heroSearch, setHeroSearch] = useState('');
  const { toggleWishlist, isInWishlist } = useWishlist();
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const brandContainerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const categories = useMemo(getMainCategoriesFromProducts, []);
  const brands = useMemo(getBrandsFromProducts, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(c => (c + 1) % carouselSlides.length), 5500);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrentSlide(c => (c - 1 + carouselSlides.length) % carouselSlides.length);
  const next = () => setCurrentSlide(c => (c + 1) % carouselSlides.length);

  const scrollRow = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right', amount = 260) => {
    if (!ref.current) return;
    const newScrollLeft = direction === 'left' ? ref.current.scrollLeft - amount : ref.current.scrollLeft + amount;
    ref.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  const bestDeals = [...products]
    .sort((a, b) => (b.mrp - b.normalPrice) / b.mrp - (a.mrp - a.normalPrice) / a.mrp)
    .slice(0, 4);

  const featured = products.slice(4, 12);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Subscribed! Check your inbox for a 10% off coupon.');
      setEmail('');
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(heroSearch ? `/products?search=${encodeURIComponent(heroSearch)}` : '/products');
  };

  const getCategoryIcon = (categoryName: string) => {
    const icons: Record<string, string> = {
      'Fruits & Vegetables': '🍎',
      'Foodgrains, Oil & Masala': '🌾',
      'Bakery, Cakes & Dairy': '🥛',
      'Beverages': '🥤',
      'Snacks & Branded Foods': '🍿',
      'Beauty & Hygiene': '💄',
      'Cleaning & Household': '🧹',
      'Eggs, Meat & Fish': '🥚',
      'Sauces & Spreads': '🥫',
      'Breakfast & Cereals': '🥣',
      'Baby Care': '👶',
      'Frozen Foods': '❄️',
      'Organic Staples': '🌱',
    };
    return icons[categoryName] || '📦';
  };

  return (
    <div className="pb-24">

      {/* ── Hero ── */}
      <section className="relative h-[92vh] min-h-[640px] max-h-[820px] pt-16 overflow-hidden bg-gray-950">
        {carouselSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-out ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
          >
            <img src={slide.bg} alt={slide.title} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${slide.overlay}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
          </div>
        ))}

        <div className="relative h-full flex flex-col justify-center max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl text-white">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {carouselSlides[currentSlide].tag}
            </span>
            <p className="text-base font-semibold text-white/70 mb-2 tracking-wide">{carouselSlides[currentSlide].subtitle}</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-5 leading-[0.95] tracking-tight">
              {carouselSlides[currentSlide].title}
            </h1>
            <p className="text-lg text-white/75 mb-9 max-w-sm leading-relaxed">{carouselSlides[currentSlide].desc}</p>

            {/* Search — the everyday entry point, front and center */}
            <form onSubmit={handleHeroSearch} className="flex items-center gap-2 bg-white/95 backdrop-blur rounded-2xl p-2 pl-5 shadow-2xl mb-8 max-w-lg">
              <Search className="w-4.5 h-4.5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={e => setHeroSearch(e.target.value)}
                placeholder="Search for atta, rice, oil, milk..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 py-2.5"
              />
              <button
                type="submit"
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex-shrink-0"
              >
                Search
              </button>
            </form>

            <Link
              href={carouselSlides[currentSlide].href}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3.5 rounded-full font-bold hover:scale-105 hover:shadow-2xl transition-all"
            >
              {carouselSlides[currentSlide].cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Nav arrows */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 backdrop-blur border border-white/20 rounded-full items-center justify-center text-white hover:bg-white/25 transition-all hidden sm:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 backdrop-blur border border-white/20 rounded-full items-center justify-center text-white hover:bg-white/25 transition-all hidden sm:flex"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2.5 z-10 sm:justify-start sm:left-1/2 sm:-translate-x-1/2 sm:max-w-7xl sm:px-8">
          {carouselSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Feature strip pinned to hero base, glass panel */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-3">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3 px-2">
                  <div className="p-2 rounded-xl bg-white/15 text-white flex-shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-xs truncate">{title}</h3>
                    <p className="text-[11px] text-white/60 truncate">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop by Category — circular rail ── */}
      <section className="pt-14 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-7">
          <div>
            <p className="text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-1">Browse</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Shop by Category</h2>
          </div>
          <Link href="/categories" className="hidden md:flex items-center gap-1 text-emerald-600 font-semibold hover:underline text-sm">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative group">
          <button
            onClick={() => scrollRow(categoryContainerRef, 'left')}
            className="absolute left-0 top-8 -translate-x-4 z-10 w-9 h-9 bg-white rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300 hidden md:flex"
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>

          <div
            ref={categoryContainerRef}
            className="flex gap-5 overflow-x-auto scroll-smooth hide-scrollbar pb-2 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat, i) => (
              <Link
                key={i}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group/cat flex-shrink-0 w-24 sm:w-28 flex flex-col items-center gap-2.5 text-center"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-1 ring-gray-100 shadow-sm group-hover/cat:ring-2 group-hover/cat:ring-emerald-400 group-hover/cat:shadow-lg transition-all duration-300">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover/cat:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover/cat:bg-black/0 transition-colors" />
                  <span className="absolute bottom-1 right-1 text-base bg-white rounded-full w-7 h-7 flex items-center justify-center shadow">
                    {getCategoryIcon(cat.name)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-[13px] text-gray-800 leading-tight line-clamp-2 group-hover/cat:text-emerald-700 transition-colors">{cat.name}</h3>
                  <p className="text-[11px] text-gray-400">{cat.count} items</p>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scrollRow(categoryContainerRef, 'right')}
            className="absolute right-0 top-8 translate-x-4 z-10 w-9 h-9 bg-white rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300 hidden md:flex"
            aria-label="Next categories"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>

        <Link href="/categories" className="flex items-center justify-center gap-1 text-emerald-600 font-semibold mt-5 md:hidden text-sm">
          View all categories <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── Shop by Brand — new row ── */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-100 mt-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-1">Trusted Names</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Shop by Brand</h2>
          </div>
        </div>

        <div className="relative group">
          <button
            onClick={() => scrollRow(brandContainerRef, 'left', 200)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 bg-white rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300 hidden md:flex"
            aria-label="Previous brands"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>

          <div
            ref={brandContainerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth hide-scrollbar pb-2 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {brands.map((brand, i) => (
              <Link
                key={brand.name}
                href={`/products?search=${encodeURIComponent(brand.name)}`}
                className="flex-shrink-0 w-40 flex items-center gap-3 bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-lg rounded-2xl p-3 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${brandAccents[i % brandAccents.length]} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}>
                  {brand.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-xs truncate">{brand.name}</p>
                  <p className="text-[11px] text-gray-400">{brand.count} products</p>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scrollRow(brandContainerRef, 'right', 200)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 bg-white rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300 hidden md:flex"
            aria-label="Next brands"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </section>

      {/* ── Best Deals ── */}
      <section className="bg-gradient-to-b from-emerald-50/70 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Today's picks</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Best Deals</h2>
              </div>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-1 text-emerald-600 font-semibold hover:underline text-sm">
              All offers <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {bestDeals.map((p, idx) => (
              <div key={p._id} style={{ animationDelay: `${idx * 80}ms` }} className="animate-slide-up">
                <ProductCard product={p} isWishlisted={isInWishlist(p._id)} onToggleWishlist={() => toggleWishlist(p)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bulk Order CTA ── */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden min-h-[260px] flex items-center shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop&q=80"
            className="absolute inset-0 w-full h-full object-cover"
            alt="Bulk orders"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/70 to-emerald-900/20" />
          <div className="relative z-10 p-8 md:p-14 text-white max-w-lg">
            <span className="inline-block bg-amber-400 text-amber-900 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              B2B Program
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
              Bulk Orders? We've got you covered.
            </h2>
            <p className="text-emerald-100 text-base mb-8 leading-relaxed">
              Special wholesale pricing for retailers, restaurants, and caterers. Join 12,000+ businesses saving with Boxaio.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-emerald-900 px-8 py-3.5 rounded-full font-bold hover:scale-105 transition-all shadow-lg"
            >
              Join B2B Program <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured / Trending ── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Most popular</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Trending Now</h2>
            </div>
          </div>
          <Link href="/products" className="hidden md:flex items-center gap-1 text-emerald-600 font-semibold hover:underline text-sm">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
          {featured.map((p, idx) => (
            <div key={p._id} style={{ animationDelay: `${idx * 60}ms` }} className="animate-slide-up">
              <ProductCard product={p} isWishlisted={isInWishlist(p._id)} onToggleWishlist={() => toggleWishlist(p)} />
            </div>
          ))}
        </div>
        <div className="text-center mt-9">
          <Link href="/products" className="inline-flex items-center gap-2 border-2 border-emerald-600 text-emerald-700 font-bold px-8 py-3 rounded-full hover:bg-emerald-600 hover:text-white transition-all">
            Browse All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Stats Band ── */}
      <section className="mt-8 bg-gradient-to-r from-emerald-800 to-teal-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="w-6 h-6 text-emerald-300" />
                <span className="text-3xl md:text-4xl font-black">{value}</span>
                <span className="text-emerald-200 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-2">Social Proof</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">What our customers say</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">Join thousands of satisfied customers who trust Boxaio</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map(t => (
              <div key={t.id} className="bg-white p-6 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6 leading-relaxed text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-100" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Download Banner ── */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gray-950 to-emerald-950 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>
          <div className="relative z-10 text-white max-w-md text-center md:text-left">
            <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-4">
              Coming Soon
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Get the Boxaio App</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Faster checkout, exclusive app-only deals, real-time order tracking, and more. Available on iOS and Android.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3">
            <button className="flex items-center gap-3 bg-white text-gray-900 font-bold px-6 py-3 rounded-2xl hover:scale-105 transition-transform shadow-lg">
              <div className="text-left">
                <p className="text-[10px] text-gray-500 font-normal">Download on the</p>
                <p className="font-black text-sm">App Store</p>
              </div>
            </button>
            <button className="flex items-center gap-3 bg-white text-gray-900 font-bold px-6 py-3 rounded-2xl hover:scale-105 transition-transform shadow-lg">
              <div className="text-left">
                <p className="text-[10px] text-gray-500 font-normal">Get it on</p>
                <p className="font-black text-sm">Google Play</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-48 h-48 bg-white rounded-full -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-teal-300 rounded-full translate-y-1/2" />
          </div>
          <div className="relative z-10">
            <Heart className="w-9 h-9 text-rose-300 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Subscribe & Get 10% Off</h2>
            <p className="text-emerald-100 mb-8 max-w-md mx-auto leading-relaxed text-sm">
              Join 50,000+ smart shoppers. Get updates on weekly offers, fresh arrivals, and exclusive deals.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-5 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                data-testid="input-newsletter-email"
                required
              />
              <button
                type="submit"
                className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors text-sm whitespace-nowrap"
                data-testid="button-newsletter-subscribe"
              >
                Subscribe
              </button>
            </form>
            <p className="text-emerald-200 text-xs mt-4">No spam ever. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}