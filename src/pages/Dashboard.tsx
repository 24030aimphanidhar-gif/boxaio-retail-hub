import {
  Bell,
  Bookmark,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Gift,
  Heart,
  LayoutGrid,
  Lock,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  Shield,
  ShoppingBag,
  Star,
  TrendingUp,
  Truck,
  User,
  X,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

const mockOrders = [
  {
    id: 'ORD-9821', date: 'May 10, 2025', amount: 1450, status: 'Delivered', items: 4,
    products: [
      { name: 'India Gate Basmati Rice', qty: 2, price: 189, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop' },
      { name: 'Fortune Sunflower Oil', qty: 1, price: 149, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop' },
      { name: 'Amul Butter', qty: 1, price: 55, image: 'https://images.unsplash.com/photo-1628088069254-d97f442f760d?w=100&auto=format&fit=crop' },
    ],
  },
  {
    id: 'ORD-9814', date: 'May 6, 2025', amount: 890, status: 'Shipped', items: 2,
    products: [
      { name: 'Aashirvaad Whole Wheat Atta', qty: 1, price: 235, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&auto=format&fit=crop' },
      { name: 'Haldirams Aloo Bhujia', qty: 3, price: 99, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=100&auto=format&fit=crop' },
    ],
  },
  {
    id: 'ORD-9807', date: 'Apr 28, 2025', amount: 2340, status: 'Delivered', items: 7,
    products: [
      { name: 'Toor Dal Premium', qty: 5, price: 165, image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=100&auto=format&fit=crop' },
      { name: 'MDH Chana Masala', qty: 2, price: 85, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&auto=format&fit=crop' },
    ],
  },
];

const statusColors: Record<string, string> = {
  Delivered: 'bg-emerald-100 text-emerald-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Processing: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
};

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name.split(' ')[0]}!`;
  if (hour < 17) return `Good afternoon, ${name.split(' ')[0]}!`;
  return `Good evening, ${name.split(' ')[0]}!`;
}

const guestFeatures = [
  {
    icon: Package,
    title: 'Order Tracking',
    desc: 'Track all your orders in real-time with live delivery updates.',
    locked: true,
    href: '/orders',
  },
  {
    icon: Heart,
    title: 'Wishlist',
    desc: 'Save your favorite products for quick access and easy reordering.',
    locked: true,
    href: '/wishlist',
  },
  {
    icon: Bookmark,
    title: 'Saved Lists',
    desc: 'Create and organize products into custom lists for different purposes.',
    locked: true,
    href: '/saved-lists',
  },
  {
    icon: RefreshCw,
    title: 'Reorder in One Click',
    desc: 'Quickly repeat past orders without rebuilding your cart.',
    locked: true,
    href: '/reorder',
  },
  {
    icon: CalendarClock,
    title: 'Schedule Future Orders',
    desc: 'Set up recurring deliveries and schedule groceries in advance.',
    locked: true,
    href: '/schedule-orders',
  },
  {
    icon: Gift,
    title: 'Exclusive Member Deals',
    desc: 'Access coupons, early sales, and referral bonuses.',
    locked: true,
    href: '/offers',
  },
  {
    icon: Truck,
    title: 'Free Delivery Subscription',
    desc: 'Free shipping on all orders when you become a Gold member.',
    locked: true,
    href: '/offers',
  },
  {
    icon: ShoppingBag,
    title: 'Browse & Add to Cart',
    desc: 'Browse all products and add to cart without signing in.',
    locked: false,
    href: '/products',
  },
  {
    icon: Star,
    title: 'View Reviews & Ratings',
    desc: 'Read customer reviews before buying — always available.',
    locked: false,
    href: '/products',
  },
];

interface ScheduleOrderModalProps {
  onClose: () => void;
}

function ScheduleOrderModal({ onClose }: ScheduleOrderModalProps) {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [frequency, setFrequency] = useState('once');

  const timeSlots = ['6:00 AM - 9:00 AM', '9:00 AM - 12:00 PM', '12:00 PM - 3:00 PM', '3:00 PM - 6:00 PM', '6:00 PM - 9:00 PM'];
  const frequencies = [
    { value: 'once', label: 'One-time delivery' },
    { value: 'weekly', label: 'Every week' },
    { value: 'biweekly', label: 'Every 2 weeks' },
    { value: 'monthly', label: 'Every month' },
  ];

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { toast.error('Please select a delivery date'); return; }
    if (!timeSlot) { toast.error('Please choose a time slot'); return; }
    toast.success(`Order scheduled for ${date}, ${timeSlot}. We will send a reminder!`);
    onClose();
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Schedule Delivery</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Close">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSchedule} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Date</label>
            <input
              type="date"
              min={minDateStr}
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              aria-label="Delivery date"
              title="Select delivery date"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Time Slot</label>
            <div className="space-y-2">
              {timeSlots.map(slot => (
                <label key={slot} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${timeSlot === slot ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                  <input type="radio" name="timeSlot" value={slot} checked={timeSlot === slot} onChange={() => setTimeSlot(slot)} className="text-blue-600 focus:ring-blue-500" />
                  <Clock className={`w-4 h-4 ${timeSlot === slot ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-semibold ${timeSlot === slot ? 'text-blue-700' : 'text-gray-700'}`}>{slot}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Repeat Frequency</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
              aria-label="Repeat frequency"
              title="Select frequency"
            >
              {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-4 rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Confirm Schedule
          </button>
        </form>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user, logout, isAuthenticated, isGuest } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'account'>('overview');
  const [showSchedule, setShowSchedule] = useState(false);
  const { addToCart } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleReorder = (order: typeof mockOrders[0]) => {
    order.products.forEach(p => {
      const fullProduct = products.find(prod => prod.name.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()));
      if (fullProduct) addToCart(fullProduct, p.qty, 'normal');
    });
    toast.success(`${order.id} added to cart — ready to checkout!`, {
      action: { label: 'View Cart', onClick: () => navigate('/cart') },
    });
  };

  // Guest mode UI
  if (!isAuthenticated || isGuest) {
    return (
      <div className="pt-16 pb-24 min-h-screen bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-50">
        {/* Hero */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white py-16 px-4 mb-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white/30">
              <User className="w-10 h-10 text-white/80" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              {isGuest ? 'You are browsing as a Guest' : 'Your Boxaio Account'}
            </h1>
            <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8">
              {isGuest
                ? 'Create a free account to unlock the full Boxaio experience — orders, tracking, deals and more.'
                : 'Sign in to access your orders, wishlist, exclusive deals, and member benefits.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-emerald-800 font-extrabold py-3.5 px-8 rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 justify-center">
                <Zap className="w-5 h-5" /> Create Free Account
              </Link>
              <Link href="/login" className="border-2 border-white/40 text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 justify-center">
                <User className="w-5 h-5" /> Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">What you unlock with a free account</h2>
          <p className="text-gray-500 text-center mb-8">Compare what guests can do versus signed-in members.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guestFeatures.map(({ icon: Icon, title, desc, locked, href }) => (
              <Link
                key={title}
                href={href}
                className={`rounded-2xl border p-5 flex gap-4 transition-all ${locked ? 'bg-white border-gray-100 opacity-80 hover:shadow-md' : 'bg-emerald-50 border-emerald-200 hover:shadow-md'} cursor-pointer`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${locked ? 'bg-gray-100' : 'bg-emerald-100'}`}>
                  {locked ? <Lock className="w-5 h-5 text-gray-400" /> : <Icon className="w-5 h-5 text-emerald-600" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${locked ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'}`}>
                      {locked ? 'Members only' : 'Available now'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-extrabold py-4 px-10 rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg">
              <CheckCircle2 className="w-5 h-5" /> Join for Free — Takes 1 minute
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Type assertion since we know user is not null here
  const currentUser = user!;

  return (
    <div className="pt-20 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50">

      {/* Greeting Banner */}
      <div className="relative bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 md:p-10 text-white mb-8 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-teal-300" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/40 text-3xl md:text-4xl font-black uppercase shadow-xl">
              {currentUser.profile.name.charAt(0)}
            </div>
            <div>
              <p className="text-emerald-200 text-sm font-medium tracking-wider uppercase mb-1">
                {getGreeting(currentUser.profile.name)}
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-1">{currentUser.profile.name}</h1>
              <p className="text-emerald-100 text-sm mb-3">{currentUser.email}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-500/30 backdrop-blur border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {currentUser.userType} Account
                </span>
                <span className="bg-amber-400/20 border border-amber-300/30 px-3 py-1 rounded-full text-xs font-bold text-amber-200">
                  Gold Member
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/schedule-orders"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              title="Schedule Order"
            >
              <CalendarClock className="w-4 h-4" /> Schedule Order
            </Link>
            <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors" title="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 px-5 py-2.5 rounded-full font-semibold text-sm transition-colors" title="Logout">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Tab row - Updated to link to separate pages */}
        <div className="relative z-10 flex flex-wrap gap-1 mt-8 bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'overview' ? 'bg-white text-emerald-800' : 'text-white/70 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Overview
          </button>
          <Link
            href="/orders"
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-white/70 hover:text-white"
          >
            <Package className="w-3.5 h-3.5" />
            Orders
          </Link>
          <Link
            href="/reorder"
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-white/70 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reorder
          </Link>
          <Link
            href="/schedule-orders"
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-white/70 hover:text-white"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Scheduled
          </Link>
          <Link
            href="/addresses"
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-white/70 hover:text-white"
          >
            <MapPin className="w-3.5 h-3.5" />
            Addresses
          </Link>
          <Link
            href="/edit-profile"
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-white/70 hover:text-white"
          >
            <User className="w-3.5 h-3.5" />
            Account
          </Link>
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Package, label: 'My Orders', href: '/orders', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Heart, label: 'Wishlist', href: '/wishlist', color: 'text-rose-500', bg: 'bg-rose-50' },
                { icon: Bookmark, label: 'Saved Lists', href: '/saved-lists', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: LayoutGrid, label: 'Categories', href: '/categories', color: 'text-violet-500', bg: 'bg-violet-50' },
              ].map(({ icon: Icon, label, href, color, bg }) => (
                <Link key={label} href={href} className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${bg} hover:shadow-md transition-all group border border-transparent hover:border-gray-100`}>
                  <div className={`w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{label}</span>
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Package, label: 'Total Orders', value: 12, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Heart, label: 'Wishlist Items', value: 8, color: 'text-rose-500', bg: 'bg-rose-50' },
                { icon: Bookmark, label: 'Saved Lists', value: 5, color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: Truck, label: 'Scheduled', value: 3, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Schedule Delivery CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarClock className="w-5 h-5 text-blue-200" />
                    <p className="text-sm font-bold text-blue-100 uppercase tracking-wider">Auto-Schedule</p>
                  </div>
                  <h3 className="text-xl font-extrabold mb-1">Schedule your groceries</h3>
                  <p className="text-blue-100 text-sm">Set weekly, bi-weekly, or monthly deliveries and never run out.</p>
                </div>
                <Link
                  href="/schedule-orders"
                  className="flex-shrink-0 bg-white text-blue-800 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm flex items-center gap-2 shadow-sm"
                >
                  <CalendarClock className="w-4 h-4" /> Schedule Now
                </Link>
              </div>
            </div>

            {/* Recent Orders with Reorder */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                </div>
                <Link
                  href="/orders"
                  className="text-sm text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {mockOrders.map(order => (
                  <div key={order.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{order.id}</p>
                          <p className="text-sm text-gray-400">{order.date} • {order.items} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{order.amount}</p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {order.products.map((p, i) => (
                        <img key={i} src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" title={p.name} />
                      ))}
                    </div>
                    <Link
                      href="/reorder"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors border border-emerald-200"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reorder
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Banner */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-amber-100 mb-1">Total Savings This Month</p>
                  <p className="text-3xl font-black">₹2,840</p>
                  <p className="text-amber-100 text-sm mt-1">Across 12 orders — keep saving!</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-5">Account Info</h2>
              <div className="space-y-4">
                {[
                  { label: 'Email', value: currentUser.email },
                  { label: 'Phone', value: '+91 98765 43210' },
                  { label: 'Member since', value: 'Jan 2025' },
                  ...(currentUser.userType === 'retailer' ? [{ label: 'GST Number', value: '29ABCDE1234F1Z5' }] : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="font-semibold text-gray-900 text-sm">{value}</p>
                  </div>
                ))}
              </div>
              <Link href="/edit-profile" className="mt-5 w-full block text-center text-sm text-emerald-600 font-semibold border border-emerald-200 rounded-xl py-2.5 hover:bg-emerald-50 transition-colors">
                Edit Profile
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Package, label: 'Orders', href: '/orders' },
                  { icon: Bookmark, label: 'Saved Lists', href: '/saved-lists' },
                  { icon: MapPin, label: 'Addresses', href: '/addresses' },
                  { icon: Shield, label: 'Support', href: '/contact' },
                ].map(({ icon: Icon, label, href }) => (
                  <Link key={label} href={href} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all group">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-emerald-700">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-2xl p-6 text-white">
              <p className="font-bold mb-1">Refer & Earn ₹500</p>
              <p className="text-emerald-100 text-sm mb-4">Invite friends and earn wallet credits on every referral.</p>
              <div className="bg-white/15 rounded-lg px-4 py-2 text-center font-mono font-bold tracking-widest text-sm mb-3">BOX-RAJ99</div>
              <Link href="/offers" className="block text-center text-sm font-bold bg-white text-emerald-800 py-2 rounded-lg hover:bg-emerald-50 transition-colors">
                View Offers
              </Link>
            </div>
          </div>
        </div>
      )}

      {showSchedule && <ScheduleOrderModal onClose={() => setShowSchedule(false)} />}
    </div>
  );
}