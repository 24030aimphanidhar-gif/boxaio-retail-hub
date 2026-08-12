import { Calendar, CalendarClock, Check, ChevronRight, Clock, Plus, Truck, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

interface ScheduledOrder {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly';
  nextDeliveryDate: string;
  timeSlot: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: string;
}

const mockScheduledOrders: ScheduledOrder[] = [
  {
    id: 'SCH-001',
    productId: 'prod_001',
    productName: 'India Gate Basmati Rice',
    productImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop',
    quantity: 2,
    frequency: 'weekly',
    nextDeliveryDate: '2025-05-20',
    timeSlot: '9:00 AM - 12:00 PM',
    status: 'active',
    createdAt: '2025-05-01',
  },
  {
    id: 'SCH-002',
    productId: 'prod_002',
    productName: 'Fortune Sunflower Oil',
    productImage: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop',
    quantity: 1,
    frequency: 'biweekly',
    nextDeliveryDate: '2025-05-22',
    timeSlot: '12:00 PM - 3:00 PM',
    status: 'active',
    createdAt: '2025-05-05',
  },
  {
    id: 'SCH-003',
    productId: 'prod_003',
    productName: 'Amul Butter',
    productImage: 'https://images.unsplash.com/photo-1628088069254-d97f442f760d?w=100&auto=format&fit=crop',
    quantity: 3,
    frequency: 'monthly',
    nextDeliveryDate: '2025-06-01',
    timeSlot: '6:00 PM - 9:00 PM',
    status: 'paused',
    createdAt: '2025-04-15',
  },
];

const frequencyLabels = {
  once: 'One-time',
  weekly: 'Every Week',
  biweekly: 'Every 2 Weeks',
  monthly: 'Every Month',
};

const timeSlots = [
  '6:00 AM - 9:00 AM',
  '9:00 AM - 12:00 PM',
  '12:00 PM - 3:00 PM',
  '3:00 PM - 6:00 PM',
  '6:00 PM - 9:00 PM',
];

export function ScheduleOrderPage() {
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const [scheduledOrders, setScheduledOrders] = useState<ScheduledOrder[]>(mockScheduledOrders);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [scheduleForm, setScheduleForm] = useState({
    productId: '',
    quantity: 1,
    frequency: 'once' as const,
    deliveryDate: '',
    timeSlot: '',
  });

  const popularProducts = products.slice(0, 6);

  const handleScheduleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }
    if (!scheduleForm.timeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    const newSchedule: ScheduledOrder = {
      id: `SCH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      productId: scheduleForm.productId,
      productName: selectedProduct?.name || '',
      productImage: selectedProduct?.image || '',
      quantity: scheduleForm.quantity,
      frequency: scheduleForm.frequency,
      nextDeliveryDate: scheduleForm.deliveryDate,
      timeSlot: scheduleForm.timeSlot,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setScheduledOrders([newSchedule, ...scheduledOrders]);
    toast.success('Order scheduled successfully!');
    setShowScheduleModal(false);
    setScheduleForm({
      productId: '',
      quantity: 1,
      frequency: 'once',
      deliveryDate: '',
      timeSlot: '',
    });
    setSelectedProduct(null);
  };

  const handleCancelSchedule = (id: string) => {
    toast.custom((t) => (
      <div className="bg-white rounded-xl shadow-xl p-4 max-w-md mx-auto border-l-4 border-red-500">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <X className="w-5 h-5 text-red-600" aria-label="Cancel icon" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">Cancel Schedule?</h4>
            <p className="text-sm text-gray-500 mt-1">This will stop all future deliveries</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setScheduledOrders(scheduledOrders.filter(order => order.id !== id));
                  toast.dismiss(t);
                  toast.success('Schedule cancelled');
                }}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                aria-label="Confirm cancellation"
              >
                Cancel
              </button>
              <button
                onClick={() => toast.dismiss(t)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                aria-label="Keep schedule"
              >
                Keep
              </button>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handlePauseSchedule = (id: string) => {
    setScheduledOrders(scheduledOrders.map(order =>
      order.id === id ? { ...order, status: order.status === 'active' ? 'paused' : 'active' } : order
    ));
    toast.success('Schedule updated');
  };

  const handleReorderSchedule = (schedule: ScheduledOrder) => {
    const product = products.find(p => p._id === schedule.productId);
    if (product) {
      addToCart(product, schedule.quantity, 'normal');
      toast.success(`Added ${schedule.productName} to cart!`, {
        action: { label: 'View Cart', onClick: () => navigate('/cart') },
      });
    }
  };

  const getNextDeliveryDate = (date: string) => {
    const deliveryDate = new Date(date);
    return deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Active</span>;
      case 'paused':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Paused</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Completed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">Cancelled</span>;
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-emerald-600">Home</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <Link href="/dashboard" className="hover:text-emerald-600">Dashboard</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-emerald-600 font-medium">Scheduled Orders</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Scheduled Orders
              </h1>
              <p className="text-gray-500 mt-1">Manage your recurring deliveries and subscriptions</p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
              aria-label="Schedule new order"
            >
              <CalendarClock className="w-5 h-5" aria-hidden="true" />
              Schedule New Order
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Schedules</p>
                <p className="text-2xl font-bold text-gray-900">{scheduledOrders.filter(o => o.status === 'active').length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center" aria-hidden="true">
                <CalendarClock className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{scheduledOrders.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center" aria-hidden="true">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Next Delivery</p>
                <p className="text-sm font-bold text-gray-900">
                  {scheduledOrders.filter(o => o.status === 'active').length > 0 
                    ? getNextDeliveryDate(scheduledOrders.filter(o => o.status === 'active')[0].nextDeliveryDate)
                    : 'No schedules'}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center" aria-hidden="true">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Monthly Spend</p>
                <p className="text-2xl font-bold text-emerald-600">₹2,450</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center" aria-hidden="true">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Orders List */}
        {scheduledOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <CalendarClock className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No scheduled orders</h3>
            <p className="text-gray-500 mb-6">Schedule your first recurring order for automatic deliveries</p>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              aria-label="Schedule first order"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              Schedule Your First Order
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledOrders.map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="p-5">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={schedule.productImage}
                        alt={schedule.productName}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{schedule.productName}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                            {frequencyLabels[schedule.frequency]}
                          </span>
                          <span>•</span>
                          <span>Qty: {schedule.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                          <span className="text-xs text-gray-500">{schedule.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(schedule.status)}
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Next Delivery</p>
                        <p className="font-bold text-emerald-600">{getNextDeliveryDate(schedule.nextDeliveryDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handlePauseSchedule(schedule.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                      aria-label={schedule.status === 'active' ? 'Pause schedule' : 'Resume schedule'}
                    >
                      {schedule.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => handleReorderSchedule(schedule)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
                      aria-label={`Order ${schedule.productName} now`}
                    >
                      <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                      Order Now
                    </button>
                    <button
                      onClick={() => handleCancelSchedule(schedule.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                      aria-label="Cancel schedule"
                    >
                      Cancel Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowScheduleModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Schedule a New Order</h2>
                <button 
                  onClick={() => setShowScheduleModal(false)} 
                  className="p-2 hover:bg-gray-100 rounded-xl" 
                  aria-label="Close modal"
                  title="Close"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              
              <div className="p-5">
                {/* Product Selection */}
                {!selectedProduct ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Select Product</label>
                    <div className="grid grid-cols-2 gap-3">
                      {popularProducts.map(product => (
                        <button
                          key={product._id}
                          onClick={() => {
                            setSelectedProduct(product);
                            setScheduleForm({ ...scheduleForm, productId: product._id });
                          }}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
                          aria-label={`Select ${product.name}`}
                        >
                          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                            <p className="text-emerald-600 font-bold text-xs">₹{product.normalPrice}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleScheduleOrder} className="space-y-5">
                    {/* Selected Product */}
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{selectedProduct.name}</p>
                        <p className="text-emerald-600 font-bold">₹{selectedProduct.normalPrice}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(null);
                          setScheduleForm({ ...scheduleForm, productId: '' });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Remove selected product"
                      >
                        <X className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setScheduleForm({ ...scheduleForm, quantity: Math.max(1, scheduleForm.quantity - 1) })}
                          className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold text-lg">{scheduleForm.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setScheduleForm({ ...scheduleForm, quantity: scheduleForm.quantity + 1 })}
                          className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Frequency</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'once', label: 'One-time' },
                          { value: 'weekly', label: 'Every Week' },
                          { value: 'biweekly', label: 'Every 2 Weeks' },
                          { value: 'monthly', label: 'Every Month' },
                        ].map(freq => (
                          <button
                            key={freq.value}
                            type="button"
                            onClick={() => setScheduleForm({ ...scheduleForm, frequency: freq.value as any })}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              scheduleForm.frequency === freq.value
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                            }`}
                            aria-label={`Select ${freq.label} frequency`}
                          >
                            {freq.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Date */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">First Delivery Date</label>
                      <input
                        type="date"
                        min={minDateStr}
                        value={scheduleForm.deliveryDate}
                        onChange={e => setScheduleForm({ ...scheduleForm, deliveryDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                        aria-label="Select delivery date"
                      />
                    </div>

                    {/* Time Slot */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Time Slot</label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setScheduleForm({ ...scheduleForm, timeSlot: slot })}
                            className={`p-2 rounded-xl border-2 text-sm transition-all ${
                              scheduleForm.timeSlot === slot
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                            }`}
                            aria-label={`Select time slot ${slot}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowScheduleModal(false)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50"
                        aria-label="Cancel scheduling"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-4 py-3 rounded-xl hover:shadow-lg transition-all"
                        aria-label="Confirm schedule order"
                      >
                        <Check className="w-4 h-4 inline mr-2" aria-hidden="true" />
                        Schedule Order
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}