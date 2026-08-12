import { ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { products } from '../data/products';

// Get unique main categories from products
const getUniqueCategories = () => {
  const categories = new Set(products.map(p => p.mainCategory));
  return Array.from(categories).sort();
};

// Category metadata for display
const categoryMeta: Record<string, { image: string; color: string; icon: string; description: string }> = {
  'Fruits & Vegetables': {
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa2b8?w=800&auto=format&fit=crop',
    color: 'from-green-500 to-emerald-600',
    icon: '🍎',
    description: 'Fresh vegetables, fruits, herbs and organic produce',
  },
  'Foodgrains, Oil & Masala': {
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop',
    color: 'from-amber-500 to-orange-600',
    icon: '🌾',
    description: 'Rice, atta, dals, oils, spices and dry fruits',
  },
  'Bakery, Cakes & Dairy': {
    image: 'https://images.unsplash.com/photo-1628088069254-d97f442f760d?w=800&auto=format&fit=crop',
    color: 'from-blue-400 to-sky-600',
    icon: '🥛',
    description: 'Fresh milk, bread, cakes, butter, cheese and paneer',
  },
  'Beverages': {
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&auto=format&fit=crop',
    color: 'from-purple-500 to-indigo-600',
    icon: '🥤',
    description: 'Tea, coffee, juices, soft drinks and health drinks',
  },
  'Snacks & Branded Foods': {
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&auto=format&fit=crop',
    color: 'from-orange-400 to-red-500',
    icon: '🍿',
    description: 'Chips, biscuits, chocolates, noodles and ready-to-cook',
  },
  'Beauty & Hygiene': {
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&auto=format&fit=crop',
    color: 'from-pink-400 to-rose-500',
    icon: '💄',
    description: 'Skin care, hair care, bath and oral care',
  },
  'Cleaning & Household': {
    image: 'https://images.unsplash.com/photo-1610553541865-bf8cf151cbd5?w=800&auto=format&fit=crop',
    color: 'from-cyan-500 to-blue-600',
    icon: '🧹',
    description: 'Detergents, floor cleaners, dishwash and fresheners',
  },
  'Kitchen, Garden & Pets': {
    image: 'https://images.unsplash.com/photo-1584822246739-fda6e6af6e30?w=800&auto=format&fit=crop',
    color: 'from-teal-500 to-emerald-600',
    icon: '🍳',
    description: 'Cookware, garden tools and pet supplies',
  },
  'Eggs, Meat & Fish': {
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&auto=format&fit=crop',
    color: 'from-red-600 to-orange-600',
    icon: '🥚',
    description: 'Fresh eggs, chicken, mutton and seafood',
  },
  'Gourmet & World Food': {
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
    color: 'from-purple-600 to-pink-600',
    icon: '🌍',
    description: 'International cuisines and premium ingredients',
  },
  'Baby Care': {
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b7?w=800&auto=format&fit=crop',
    color: 'from-sky-400 to-blue-500',
    icon: '👶',
    description: 'Diapers, baby food and skincare',
  },
  'Frozen Foods': {
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&auto=format&fit=crop',
    color: 'from-cyan-400 to-teal-500',
    icon: '❄️',
    description: 'Frozen parathas, vegetables and snacks',
  },
  'Organic Staples': {
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop',
    color: 'from-emerald-600 to-green-700',
    icon: '🌱',
    description: 'Certified organic rice, pulses and oils',
  },
  'Pharma & Wellness': {
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop',
    color: 'from-indigo-500 to-purple-600',
    icon: '💊',
    description: 'Health supplements and wellness products',
  },
  'Home & Kitchen': {
    image: 'https://images.unsplash.com/photo-1584822246739-fda6e6af6e30?w=800&auto=format&fit=crop',
    color: 'from-stone-500 to-stone-700',
    icon: '🏠',
    description: 'Kitchen tools, storage and home decor',
  },
  'Instant & Ready To Eat': {
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&auto=format&fit=crop',
    color: 'from-yellow-500 to-orange-500',
    icon: '🍜',
    description: 'Instant noodles, ready meals and mixes',
  },
  'Breakfast & Cereals': {
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop',
    color: 'from-amber-400 to-yellow-500',
    icon: '🥣',
    description: 'Corn flakes, oats, muesli and breakfast bars',
  },
  'Sauces & Spreads': {
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop',
    color: 'from-red-500 to-orange-500',
    icon: '🥫',
    description: 'Jams, ketchup, mayonnaise and pasta sauces',
  },
  'Biscuits & Chocolates': {
    image: 'https://images.unsplash.com/photo-1549007953-2d2f6fab3eb3?w=800&auto=format&fit=crop',
    color: 'from-amber-600 to-brown-600',
    icon: '🍪',
    description: 'Cookies, biscuits, chocolates and candies',
  },
  'Tea, Coffee & Health Drinks': {
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&auto=format&fit=crop',
    color: 'from-emerald-700 to-teal-700',
    icon: '☕',
    description: 'Premium tea, coffee and health beverages',
  },
};

export function Categories() {
  const categories = getUniqueCategories();

  const countByCategory = (cat: string) =>
    products.filter(p => p.mainCategory === cat).length;

  const minPriceByCategory = (cat: string) => {
    const prices = products.filter(p => p.mainCategory === cat).map(p => p.normalPrice);
    return prices.length ? Math.min(...prices) : 0;
  };

  return (
    <div className="pt-16 pb-24 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-800 text-white py-16 px-4 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 right-20 w-72 h-72 rounded-full bg-white" />
          <div className="absolute bottom-0 -left-10 w-56 h-56 rounded-full bg-teal-300" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <nav className="flex items-center gap-2 text-emerald-200 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-semibold">Shop by Category</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Shop by Category</h1>
          <p className="text-emerald-100 text-lg max-w-xl">
            Everything your kitchen and home needs — from daily staples to premium ingredients.
            Bulk deals available across all categories.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <span className="bg-white/20 backdrop-blur border border-white/30 px-4 py-2 rounded-full text-sm">
              {categories.length} Categories
            </span>
            <span className="bg-white/20 backdrop-blur border border-white/30 px-4 py-2 rounded-full text-sm">
              {products.length}+ Products
            </span>
            <span className="bg-white/20 backdrop-blur border border-white/30 px-4 py-2 rounded-full text-sm">
              Free Shipping on Bulk Orders
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const meta = categoryMeta[cat] || {
              image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop',
              color: 'from-gray-500 to-gray-600',
              icon: '📦',
              description: `${countByCategory(cat)} products available`,
            };
            const count = countByCategory(cat);
            const minPrice = minPriceByCategory(cat);
            
            return (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="group block animate-slide-up"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white border border-gray-100 h-56">
                  {/* Background image */}
                  <img
                    src={meta.image}
                    alt={cat}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-75 group-hover:opacity-80 transition-opacity duration-300`} />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                    <div className="flex items-start justify-between">
                      <div className="text-3xl drop-shadow-lg">{meta.icon}</div>
                      <div className="bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        {count} items
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-extrabold mb-1 drop-shadow">{cat}</h2>
                      <p className="text-white/85 text-xs md:text-sm mb-3 line-clamp-2">{meta.description}</p>
                      <div className="flex items-center justify-between">
                        {minPrice > 0 && (
                          <span className="text-white/80 text-xs font-medium">From ₹{minPrice}</span>
                        )}
                        <div className={`flex items-center gap-1 bg-white/20 backdrop-blur border border-white/30 px-3 py-1.5 rounded-full text-xs font-bold group-hover:bg-white group-hover:text-gray-900 transition-all ${!minPrice && 'ml-auto'}`}>
                          Shop Now <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-emerald-700 to-teal-800 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-teal-300" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3">Bulk Buyer? Save More.</h2>
            <p className="text-emerald-100 max-w-xl mx-auto mb-6 text-sm md:text-base">
              All categories offer bulk wholesale pricing. Order in bulk and save up to 30% versus standard retail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-800 font-extrabold py-3 px-8 rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Browse All Products <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/bulk-order"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-extrabold py-3 px-8 rounded-full hover:bg-emerald-500 hover:-translate-y-0.5 transition-all border border-white/20"
              >
                Request Bulk Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}