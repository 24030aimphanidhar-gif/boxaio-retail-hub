import { Clock, Copy, Gift, Package, Percent, ShieldCheck, ShoppingBag, Sparkles, Star, Tag, Truck, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'wouter';

const allOffers = [
  {
    title: 'Welcome Bonus',
    discount: '20% OFF',
    code: 'BOXAIO20',
    minOrder: 'No minimum order',
    validity: 'New users only',
    desc: 'Get 20% off your first order on Boxaio. One-time use only.',
    icon: Star,
    category: 'All',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Weekend Spree',
    discount: '₹250 OFF',
    code: 'WEEKEND250',
    minOrder: 'Min order ₹1,500',
    validity: 'Sat & Sun only',
    desc: 'Shop on weekends and save flat ₹250 on your grocery cart.',
    icon: ShoppingBag,
    category: 'All',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Free Delivery',
    discount: 'FREE SHIP',
    code: 'FREEDEL',
    minOrder: 'Min order ₹499',
    validity: 'All days',
    desc: 'Free delivery on all orders above ₹499. No catch, no fine print.',
    icon: Truck,
    category: 'All',
    image: 'https://images.unsplash.com/photo-1607482273987-6f7e94b5d4c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Bulk Bonanza',
    discount: '10% OFF',
    code: 'BULK10',
    minOrder: 'Min order ₹5,000',
    validity: 'Retailers only',
    desc: 'Flat 10% off on all bulk and wholesale orders for registered retailers.',
    icon: Gift,
    category: 'Rice & Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Festival Fiesta',
    discount: '15% OFF',
    code: 'FEST15',
    minOrder: 'Min order ₹800',
    validity: 'Limited time',
    desc: 'Celebrate with Boxaio. Get 15% off on festive grocery essentials.',
    icon: Zap,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Flash Sale',
    discount: '₹100 OFF',
    code: 'FLASH100',
    minOrder: 'Min order ₹600',
    validity: 'Today only',
    desc: 'Lightning deal — ₹100 flat off on all orders. Hurry before it ends!',
    icon: Clock,
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1628088062854-d1877a9f6fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Dairy Delight',
    discount: '12% OFF',
    code: 'DAIRY12',
    minOrder: 'Min order ₹400',
    validity: 'All days',
    desc: 'Enjoy 12% off on all dairy products including milk, butter, and cheese.',
    icon: Percent,
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1628088062854-d1877a9f6fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Spice Pack',
    discount: '25% OFF',
    code: 'SPICE25',
    minOrder: 'Min order ₹300',
    validity: 'All days',
    desc: 'Get 25% off on all spices and masala packs. Cook authentic Indian meals.',
    icon: Star,
    category: 'Spices',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

const filterCategories = ['All', 'Rice & Grains', 'Dairy', 'Snacks', 'Spices'];

export function Offers() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filtered = activeFilter === 'All' ? allOffers : allOffers.filter(o => o.category === activeFilter);

  return (
    <div className="pt-16 pb-20 min-h-screen bg-gray-50">

      {/* Hero — restrained, premium, one accent */}
      <div className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white py-16 px-4 mb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]">
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-semibold tracking-wide uppercase">Limited Time Deals</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">Exclusive Offers</h1>
          <p className="text-emerald-100/80 text-base max-w-lg mx-auto mb-8">
            Save on your daily groceries and bulk orders. Copy a code, apply at checkout, done.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {filterCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeFilter === cat ? 'bg-white text-emerald-900 shadow-lg' : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/15'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stats Bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-5 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Tag className="w-4.5 h-4.5 text-emerald-600" />
              <span className="text-gray-700 font-semibold text-sm">{filtered.length} Active Offers</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-amber-500" />
              <span className="text-gray-700 font-semibold text-sm">Limited Time</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-amber-700 font-semibold">New deals added weekly</span>
          </div>
        </div>

        {/* Offers Grid — unified emerald identity, image restrained to a strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
          {filtered.map((offer, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-200 hover:shadow-[0_12px_32px_-12px_rgba(4,120,87,0.25)] transition-all duration-300 hover:-translate-y-1 group">
              <div className="relative h-32 overflow-hidden">
                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-emerald-800 shadow-sm">
                    {offer.validity}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-1.5 border border-white/20">
                    <offer.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-black text-base drop-shadow-sm">{offer.discount}</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-base mb-0.5 tracking-tight">{offer.title}</h3>
                <p className="text-xs text-gray-400 font-medium mb-2">{offer.minOrder}</p>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">{offer.desc}</p>

                <div className="flex items-center gap-2 bg-emerald-50/60 p-2 rounded-xl border border-emerald-100 mb-3">
                  <span className="flex-1 font-mono font-bold text-center tracking-wider text-emerald-800 text-xs select-all">{offer.code}</span>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copiedCode === offer.code ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  href="/products"
                  className="w-full text-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 block text-sm"
                >
                  Shop Now →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* How to Use */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Easy Process</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">How to Use Coupons</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">Three simple steps to unlock your savings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Copy the Code', desc: "Click the copy icon next to any coupon code above. It's that simple.", icon: Copy },
              { step: '02', title: 'Add to Cart', desc: 'Browse through our wide range of products and add items to your cart.', icon: ShoppingBag },
              { step: '03', title: 'Apply at Checkout', desc: 'Paste your code in the checkout page and watch your savings grow.', icon: Tag },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center group">
                <div className="relative w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors duration-300">
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-700 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-black text-white">{step}</span>
                  </div>
                  <Icon className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Section */}
        <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-lg text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-900 font-bold text-xs px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5" />
                Referral Program
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Refer & Earn ₹500</h2>
              <p className="text-emerald-100/85 text-base leading-relaxed mb-6">
                Invite your friends to Boxaio. They get <strong className="text-white">20% off</strong> their first order, and you get <strong className="text-white">₹500 wallet credits</strong> once their order is delivered.
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-emerald-200 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Trusted by 10,000+ happy customers</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 w-full max-w-sm text-center flex-shrink-0">
              <p className="text-sm font-semibold text-emerald-200 mb-3 uppercase tracking-wider">Your Referral Code</p>
              <div className="text-2xl font-black font-mono tracking-widest mb-5 bg-white/10 py-3.5 rounded-xl border border-white/15">
                BOX-RAJ99
              </div>
              <button
                onClick={() => handleCopy('BOX-RAJ99')}
                className="w-full bg-white text-emerald-800 font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mb-3 group"
              >
                <Copy className="w-4 h-4 group-hover:scale-110 transition" /> Copy Referral Code
              </button>
              <p className="text-emerald-200/80 text-xs">Share via WhatsApp, SMS, or email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}