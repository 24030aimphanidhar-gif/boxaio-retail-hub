import { ArrowRight, ChevronRight, Clock, Package, RefreshCw, Search, ShoppingBag, Star, TrendingUp, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

interface PastOrder {
  id: string;
  date: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  status: 'Delivered' | 'Shipped' | 'Processing';
}

const mockPastOrders: PastOrder[] = [
  {
    id: 'ORD-9821',
    date: 'May 10, 2025',
    items: [
      { id: 'prod_001', name: 'India Gate Basmati Rice', quantity: 2, price: 189, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop' },
      { id: 'prod_002', name: 'Fortune Sunflower Oil', quantity: 1, price: 149, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop' },
      { id: 'prod_003', name: 'MDH Chana Masala', quantity: 2, price: 85, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&auto=format&fit=crop' },
    ],
    total: 1450,
    status: 'Delivered',
  },
  {
    id: 'ORD-9814',
    date: 'May 6, 2025',
    items: [
      { id: 'prod_005', name: 'Amul Butter', quantity: 3, price: 55, image: 'https://images.unsplash.com/photo-1628088069254-d97f442f760d?w=100&auto=format&fit=crop' },
      { id: 'prod_006', name: 'Haldirams Aloo Bhujia', quantity: 2, price: 99, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=100&auto=format&fit=crop' },
    ],
    total: 890,
    status: 'Delivered',
  },
  {
    id: 'ORD-9807',
    date: 'Apr 28, 2025',
    items: [
      { id: 'prod_008', name: 'Alphonso Mango', quantity: 6, price: 299, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100&auto=format&fit=crop' },
      { id: 'prod_009', name: 'Aashirvaad Atta', quantity: 2, price: 235, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&auto=format&fit=crop' },
    ],
    total: 2340,
    status: 'Delivered',
  },
];

export function ReorderPage() {
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PastOrder | null>(null);

  const filteredOrders = mockPastOrders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReorderAll = (order: PastOrder) => {
    order.items.forEach(item => {
      const product = products.find(p => p._id === item.id);
      if (product) {
        addToCart(product, item.quantity, 'normal');
      }
    });
    toast.success(`All items from ${order.id} added to cart!`, {
      action: { label: 'View Cart', onClick: () => navigate('/cart') },
    });
  };

  const handleReorderItem = (item: PastOrder['items'][0], orderId: string) => {
    const product = products.find(p => p._id === item.id);
    if (product) {
      addToCart(product, item.quantity, 'normal');
      toast.success(`${item.name} added to cart!`);
    }
  };

  const handleReorderWithModifications = (order: PastOrder) => {
    setSelectedOrder(order);
  };

  const getTotalSavings = (order: PastOrder) => {
    // Calculate savings based on MRP (mock calculation)
    return Math.round(order.total * 0.15);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-emerald-600">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard" className="hover:text-emerald-600">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-600 font-medium">Reorder</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Reorder Past Purchases
            </h1>
            <p className="text-gray-500 mt-1">Quickly repurchase your favorite items from previous orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Past Orders</p>
                <p className="text-2xl font-bold text-gray-900">{mockPastOrders.length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹4,680</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Items Purchased</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Savings</p>
                <p className="text-2xl font-bold text-emerald-600">₹702</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your order history here</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all">
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">{order.id}</h3>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {order.date}
                        </span>
                        <span>•</span>
                        <span>{order.items.length} items</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Total Amount</p>
                        <p className="text-xl font-bold text-emerald-600">₹{order.total}</p>
                        <p className="text-xs text-green-600">Saved ₹{getTotalSavings(order)}</p>
                      </div>
                      <button
                        onClick={() => handleReorderAll(order)}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reorder All
                      </button>
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <div>
                              <span className="font-bold text-emerald-600 text-sm">₹{item.price}</span>
                              <span className="text-xs text-gray-400 ml-1">x{item.quantity}</span>
                            </div>
                            <button
                              onClick={() => handleReorderItem(item, order.id)}
                              className="text-xs text-emerald-600 font-semibold hover:underline"
                            >
                              Reorder
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleReorderWithModifications(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Modify & Reorder
                    </button>
                    <Link
                      href={`/orders/${order.id}/tracking`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}