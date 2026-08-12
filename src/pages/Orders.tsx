import { ArrowRight, Calendar, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Clock, Download, Package, Repeat, Search, Star, TrendingUp, Truck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { ProductCard } from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { products } from '../data/products';

interface Order {
  id: string;
  date: string;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Cancelled';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    mrp: number;
    image: string;
  }>;
  total: number;
  payment: string;
  trackingId: string;
  estimatedDelivery?: string;
  deliveredDate?: string;
  cancelledReason?: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-9821-X',
    date: 'May 10, 2025',
    status: 'Delivered',
    items: [
      { id: 'prod_001', name: 'India Gate Basmati Rice', quantity: 2, price: 189, mrp: 220, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop' },
      { id: 'prod_002', name: 'Fortune Sunflower Oil', quantity: 1, price: 149, mrp: 175, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop' },
      { id: 'prod_003', name: 'MDH Chana Masala', quantity: 2, price: 85, mrp: 110, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&auto=format&fit=crop' },
    ],
    total: 1450,
    payment: 'UPI',
    trackingId: 'TRK9821X2025',
    deliveredDate: 'May 12, 2025',
  },
  {
    id: 'ORD-9912-Y',
    date: 'May 6, 2025',
    status: 'Shipped',
    items: [
      { id: 'prod_005', name: 'Amul Butter', quantity: 3, price: 55, mrp: 68, image: 'https://images.unsplash.com/photo-1628088069254-d97f442f760d?w=100&auto=format&fit=crop' },
      { id: 'prod_006', name: 'Haldirams Aloo Bhujia', quantity: 2, price: 99, mrp: 120, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=100&auto=format&fit=crop' },
    ],
    total: 890,
    payment: 'Credit Card',
    trackingId: 'TRK9912Y2025',
    estimatedDelivery: 'May 14, 2025',
  },
  {
    id: 'ORD-1002-Z',
    date: 'Apr 28, 2025',
    status: 'Processing',
    items: [
      { id: 'prod_008', name: 'Alphonso Mango', quantity: 2, price: 299, mrp: 350, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100&auto=format&fit=crop' },
      { id: 'prod_009', name: 'Aashirvaad Atta', quantity: 3, price: 235, mrp: 280, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&auto=format&fit=crop' },
      { id: 'prod_010', name: 'Sona Masoori Rice', quantity: 2, price: 145, mrp: 170, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop' },
    ],
    total: 4500,
    payment: 'COD',
    trackingId: 'TRK1002Z2025',
    estimatedDelivery: 'May 15, 2025',
  },
  {
    id: 'ORD-0887-A',
    date: 'Apr 15, 2025',
    status: 'Cancelled',
    items: [
      { id: 'prod_012', name: 'Catch Black Pepper', quantity: 1, price: 75, mrp: 95, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&auto=format&fit=crop' },
      { id: 'prod_013', name: 'Moong Dal', quantity: 2, price: 155, mrp: 180, image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=100&auto=format&fit=crop' },
    ],
    total: 2800,
    payment: 'UPI',
    trackingId: 'TRK0887A2025',
    cancelledReason: 'Requested by customer',
  },
];

const statusConfig: Record<string, { color: string; icon: typeof Package; label: string; bgLight: string; borderColor: string }> = {
  Delivered: { color: 'text-emerald-700', icon: CheckCircle2, label: 'Delivered', bgLight: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  Shipped: { color: 'text-blue-700', icon: Truck, label: 'Shipped', bgLight: 'bg-blue-50', borderColor: 'border-blue-200' },
  Processing: { color: 'text-amber-700', icon: Clock, label: 'Processing', bgLight: 'bg-amber-50', borderColor: 'border-amber-200' },
  Cancelled: { color: 'text-red-700', icon: XCircle, label: 'Cancelled', bgLight: 'bg-red-50', borderColor: 'border-red-200' },
};

const tabs = ['All Orders', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export function Orders() {
  const [activeTab, setActiveTab] = useState('All Orders');
  const [search, setSearch] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [ratingModal, setRatingModal] = useState<{ orderId: string; productId: string; productName: string } | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const { toggleWishlist, isInWishlist } = useWishlist();

  const toggleExpand = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const filtered = mockOrders
    .filter(o => activeTab === 'All Orders' || o.status === activeTab)
    .filter(o => !search || o.id.toLowerCase().includes(search.toLowerCase()));

  const counts = tabs.reduce<Record<string, number>>((acc, tab) => {
    acc[tab] = tab === 'All Orders' ? mockOrders.length : mockOrders.filter(o => o.status === tab).length;
    return acc;
  }, {});

  const handleRepeatOrder = (order: Order) => {
    toast.success(`Order ${order.id} has been repeated! Items added to cart.`);
  };

  const handleScheduleOrder = (order: Order) => {
    toast.success(`Order ${order.id} scheduled for delivery on your preferred date.`);
  };

  const handleInvoice = (order: Order) => {
    toast.success(`Invoice for ${order.id} is being downloaded.`);
  };

  const handleSubmitRating = () => {
    if (ratingValue === 0) {
      toast.error('Please select a rating');
      return;
    }
    toast.success(`Thank you for rating ${ratingModal?.productName}!`);
    setRatingModal(null);
    setRatingValue(0);
    setRatingComment('');
  };

  const getSuggestedProducts = (order: Order) => {
    const orderedIds = new Set(order.items.map(item => item.id));
    return products.filter(p => !orderedIds.has(p._id)).slice(0, 4);
  };

  const getStatusMessage = (order: Order) => {
    if (order.status === 'Delivered') return 'Your order has been delivered successfully';
    if (order.status === 'Shipped') return `Your order is on the way • Expected delivery ${order.estimatedDelivery}`;
    if (order.status === 'Processing') return `Your order is being processed • Expected delivery ${order.estimatedDelivery}`;
    if (order.status === 'Cancelled') return order.cancelledReason || 'Order was cancelled';
    return '';
  };

  const getStats = () => {
    const totalSpent = mockOrders.reduce((sum, order) => sum + order.total, 0);
    const deliveredCount = mockOrders.filter(o => o.status === 'Delivered').length;
    const processingCount = mockOrders.filter(o => o.status === 'Processing').length;
    return { totalSpent, deliveredCount, processingCount };
  };

  const stats = getStats();

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Premium Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-200 text-sm mb-2">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white font-medium">My Orders</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Order History</h1>
              <p className="text-emerald-200 text-sm mt-1">Track, manage, and reorder your purchases</p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <p className="text-emerald-200 text-[10px] uppercase tracking-wider">Total Spent</p>
                <p className="text-white font-bold text-lg">₹{stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <p className="text-emerald-200 text-[10px] uppercase tracking-wider">Orders</p>
                <p className="text-white font-bold text-lg">{mockOrders.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <p className="text-emerald-200 text-[10px] uppercase tracking-wider">Delivered</p>
                <p className="text-white font-bold text-lg">{stats.deliveredCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by order ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab}
                  {counts[tab] > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {counts[tab]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              {search ? `No orders matching "${search}"` : `You don't have any ${activeTab.toLowerCase().replace('all orders', '')} orders.`}
            </p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl hover:shadow-lg transition-all text-sm">
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const cfg = statusConfig[order.status];
              const StatusIcon = cfg.icon;
              const isExpanded = expandedOrders.has(order.id);
              const suggestedProducts = getSuggestedProducts(order);
              
              return (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 ${cfg.borderColor}`}
                >
                  {/* Order header */}
                  <div 
                    className={`p-5 cursor-pointer ${order.status === 'Cancelled' ? 'bg-red-50/30' : ''}`}
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bgLight}`}>
                          <StatusIcon className={`w-6 h-6 ${cfg.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-900 text-base">{order.id}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bgLight} ${cfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {order.date}
                            </span>
                            <span>•</span>
                            <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                            <span>•</span>
                            <span className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getStatusMessage(order)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {order.status !== 'Cancelled' && (
                          <Link
                            href={`/orders/${order.id}/tracking`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <Truck className="w-3.5 h-3.5" /> Track Order
                          </Link>
                        )}
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {/* Order Items */}
                      <div className="p-5 bg-gray-50/50">
                        <h4 className="font-semibold text-gray-900 text-sm mb-3">Order Items</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {order.items.map((item, idx) => {
                            const savings = Math.round(((item.mrp - item.price) / item.mrp) * 100);
                            return (
                              <div key={idx} className="bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex gap-3">
                                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="font-bold text-emerald-700 text-sm">₹{item.price}</span>
                                      <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                                      {savings > 0 && (
                                        <span className="text-[9px] bg-rose-100 text-rose-600 font-bold px-1.5 py-0.5 rounded">Save {savings}%</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                                    {order.status === 'Delivered' && (
                                      <button
                                        onClick={() => setRatingModal({ orderId: order.id, productId: item.id, productName: item.name })}
                                        className="flex items-center justify-center gap-1 w-full mt-2 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                                      >
                                        <Star className="w-3 h-3" /> Rate Product
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-5 flex flex-wrap gap-3 border-t border-gray-100 bg-white">
                        {order.status === 'Delivered' && (
                          <>
                            <button
                              onClick={() => handleInvoice(order)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                            >
                              <Download className="w-4 h-4" /> Download Invoice
                            </button>
                            <button
                              onClick={() => handleRepeatOrder(order)}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition-colors"
                            >
                              <Repeat className="w-4 h-4" /> Reorder All
                            </button>
                          </>
                        )}
                        {order.status === 'Processing' && (
                          <button
                            onClick={() => handleScheduleOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-200 transition-colors"
                          >
                            <Calendar className="w-4 h-4" /> Schedule Delivery
                          </button>
                        )}
                        {order.status === 'Shipped' && (
                          <Link
                            href={`/orders/${order.id}/tracking`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors"
                          >
                            <Truck className="w-4 h-4" /> Live Tracking
                          </Link>
                        )}
                        {order.status === 'Cancelled' && (
                          <button
                            onClick={() => handleRepeatOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                          >
                            <Repeat className="w-4 h-4" /> Buy Again
                          </button>
                        )}
                        <Link
                          href={`/orders/${order.id}/tracking`}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                        >
                          View Details <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Suggested Products */}
                      {suggestedProducts.length > 0 && order.status === 'Delivered' && (
                        <div className="p-5 border-t border-gray-100 bg-gradient-to-r from-emerald-50/30 to-transparent">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-emerald-600" />
                              <h4 className="font-bold text-gray-900">You Might Also Like</h4>
                            </div>
                            <Link href="/products" className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:underline">
                              Browse All <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {suggestedProducts.map(product => (
                              <ProductCard
                                key={product._id}
                                product={product}
                                isWishlisted={isInWishlist(product._id)}
                                onToggleWishlist={() => toggleWishlist(product)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setRatingModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Rate Your Experience</h3>
              <p className="text-gray-500 text-sm mt-1">{ratingModal.productName}</p>
            </div>
            
            <div className="flex gap-2 justify-center mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${star <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
            
            <textarea
              placeholder="Share your experience with this product (optional)"
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
              rows={3}
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRatingModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}