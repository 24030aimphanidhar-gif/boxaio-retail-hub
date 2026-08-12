import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, HelpCircle, Home, MapPin, Package, PhoneCall, Receipt, Repeat, Truck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useParams } from 'wouter';

interface TrackingStep {
  id: number;
  title: string;
  desc: string;
  date: string;
  status: 'completed' | 'current' | 'pending' | 'cancelled';
  icon: typeof Package;
}

const getTrackingSteps = (status: string, estimatedDate?: string, cancelledReason?: string): TrackingStep[] => {
  const baseSteps = [
    { id: 1, title: 'Order Placed', desc: 'Your order has been placed successfully.', date: 'May 10, 10:30 AM', icon: Package, status: 'completed' as const },
    { id: 2, title: 'Order Confirmed', desc: 'Seller has confirmed your order.', date: 'May 10, 11:05 AM', icon: CheckCircle2, status: 'completed' as const },
  ];

  if (status === 'Cancelled') {
    return [
      ...baseSteps,
      { id: 3, title: 'Order Cancelled', desc: cancelledReason || 'Order was cancelled as requested.', date: 'May 11, 09:00 AM', icon: XCircle, status: 'cancelled' as const },
    ];
  }

  const shippingSteps = [
    { id: 3, title: 'Shipped', desc: 'Your order is on its way to the hub.', date: estimatedDate ? `May 11, 09:00 AM` : 'Processing...', icon: Truck, status: status === 'Shipped' ? 'current' as const : status === 'Delivered' ? 'completed' as const : 'pending' as const },
    { id: 4, title: 'Out for Delivery', desc: 'Our delivery partner is heading to you.', date: estimatedDate || 'Estimated: Today', icon: Home, status: status === 'Delivered' ? 'completed' as const : 'pending' as const },
    { id: 5, title: 'Delivered', desc: 'Package delivered to your address.', date: status === 'Delivered' ? 'May 12, 2:30 PM' : estimatedDate || 'Estimated: Tomorrow', icon: CheckCircle2, status: status === 'Delivered' ? 'completed' as const : 'pending' as const },
  ];

  if (status === 'Processing') {
    shippingSteps[0] = { ...shippingSteps[0], status: 'pending', title: 'Preparing to Ship', desc: 'Your order is being packed.' };
  }

  return [...baseSteps, ...shippingSteps];
};

// Mock order data
const mockOrderDetails: Record<string, { status: string; estimatedDelivery?: string; cancelledReason?: string; items: any[] }> = {
  'ORD-9821-X': { status: 'Delivered', estimatedDelivery: 'May 12, 2025', items: [] },
  'ORD-9912-Y': { status: 'Shipped', estimatedDelivery: 'May 14, 2025', items: [] },
  'ORD-1002-Z': { status: 'Processing', estimatedDelivery: 'May 15, 2025', items: [] },
  'ORD-0887-A': { status: 'Cancelled', cancelledReason: 'Requested by customer', items: [] },
};

export function OrderTracking() {
  const params = useParams();
  const orderId = params.id || '';
  const orderData = mockOrderDetails[orderId] || { status: 'Processing', estimatedDelivery: 'May 15, 2025' };
  const steps = getTrackingSteps(orderData.status, orderData.estimatedDelivery, orderData.cancelledReason);
  
  const currentStep = steps.find(s => s.status === 'current');
  const completedCount = steps.filter(s => s.status === 'completed' || s.status === 'current').length;
  const progress = orderData.status === 'Cancelled' ? 100 : Math.round((completedCount / (steps.length - (orderData.status === 'Cancelled' ? 0 : 1))) * 100);

  const handleDownloadInvoice = () => {
    toast.success(`Invoice for ${orderId} is being downloaded.`);
  };

  const handleRepeatOrder = () => {
    toast.success(`Order ${orderId} has been repeated! Items added to cart.`);
  };

  const handleScheduleOrder = () => {
    toast.success(`Order ${orderId} scheduled for delivery on your preferred date.`);
  };

  const handleContactSupport = () => {
    toast.info('Connecting you to customer support...');
  };

  const isDelivered = orderData.status === 'Delivered';
  const isCancelled = orderData.status === 'Cancelled';
  const isShipped = orderData.status === 'Shipped';
  const isProcessing = orderData.status === 'Processing';

  return (
    <div className="pt-20 pb-24 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 mt-4 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        {/* Header card */}
        <div className={`rounded-3xl p-6 md:p-8 text-white mb-6 shadow-xl relative overflow-hidden ${
          isCancelled ? 'bg-gradient-to-r from-red-700 to-red-800' : 'bg-gradient-to-r from-emerald-700 to-teal-800'
        }`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white rounded-full" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <p className="text-emerald-200 text-sm font-medium mb-1">Order ID</p>
              <h1 className="text-2xl font-extrabold mb-1">{orderId}</h1>
              <p className="text-emerald-100 text-sm">Placed on {orderData.status === 'Delivered' ? 'May 10, 2025' : 'May 10, 2025'}</p>
            </div>
            <div className={`backdrop-blur border border-white/20 px-5 py-3 rounded-2xl text-center ${
              isCancelled ? 'bg-white/10' : 'bg-white/15'
            }`}>
              <p className="text-xs text-emerald-200 mb-0.5">
                {isDelivered ? 'Delivered on' : isCancelled ? 'Cancelled on' : 'Expected by'}
              </p>
              <p className="font-extrabold text-lg">
                {isDelivered ? 'May 12, 2025' : isCancelled ? 'May 11, 2025' : orderData.estimatedDelivery || 'Processing'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="relative z-10 mt-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur border border-white/20 ${
              isDelivered ? 'bg-emerald-500/30 text-white' : 
              isCancelled ? 'bg-red-500/30 text-white' :
              isShipped ? 'bg-blue-500/30 text-white' :
              'bg-amber-500/30 text-white'
            }`}>
              {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
               isCancelled ? <XCircle className="w-3.5 h-3.5" /> :
               isShipped ? <Truck className="w-3.5 h-3.5" /> :
               <Clock className="w-3.5 h-3.5" />}
              {orderData.status}
            </span>
          </div>

          {/* Progress bar - only if not cancelled */}
          {!isCancelled && (
            <div className="relative z-10 mt-6">
              <div className="flex justify-between text-xs text-emerald-200 mb-2">
                <span>Order Placed</span>
                <span>{currentStep?.title || (isDelivered ? 'Delivered' : 'In Transit')}</span>
                <span>Delivered</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="h-2 bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" /> Order Timeline
          </h2>

          <div className="relative">
            <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gray-100" />

            <div className="space-y-8">
              {steps.map(step => {
                const Icon = step.icon;
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                const isCancelled = step.status === 'cancelled';
                const isPending = step.status === 'pending';

                return (
                  <div key={step.id} className="relative flex items-start gap-5">
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isCompleted ? 'bg-emerald-600 shadow-lg shadow-emerald-200' :
                      isCurrent ? 'bg-blue-600 shadow-lg shadow-blue-200 ring-4 ring-blue-100' :
                      isCancelled ? 'bg-red-600 shadow-lg shadow-red-200' :
                      'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${isCompleted || isCurrent || isCancelled ? 'text-white' : 'text-gray-300'}`} />
                    </div>

                    <div className={`flex-1 pb-2 ${isPending && !isCancelled ? 'opacity-40' : ''}`}>
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className={`font-bold text-base ${
                            isCurrent ? 'text-blue-700' : 
                            isCancelled ? 'text-red-700' :
                            isCompleted ? 'text-gray-900' : 
                            'text-gray-500'
                          }`}>
                            {step.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">{step.date}</span>
                      </div>
                      {isCurrent && !isCancelled && (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                          Current Status
                        </div>
                      )}
                      {isCancelled && (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-100">
                          <AlertCircle className="w-3 h-3" />
                          Order Cancelled
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {isDelivered && (
            <>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                <Receipt className="w-4 h-4" /> Download Invoice
              </button>
              <button
                onClick={handleRepeatOrder}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-200 transition-colors"
              >
                <Repeat className="w-4 h-4" /> Reorder All
              </button>
            </>
          )}
          {isProcessing && (
            <button
              onClick={handleScheduleOrder}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-200 transition-colors"
            >
              <Calendar className="w-4 h-4" /> Schedule Delivery
            </button>
          )}
          {isShipped && (
            <button
              onClick={handleRepeatOrder}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-200 transition-colors"
            >
              <Repeat className="w-4 h-4" /> Buy Again
            </button>
          )}
          {isCancelled && (
            <button
              onClick={handleRepeatOrder}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              <Repeat className="w-4 h-4" /> Reorder Items
            </button>
          )}
        </div>

        {/* Delivery + Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900">Delivery Address</h3>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Priya Sharma</p>
            <p className="text-sm text-gray-500 leading-relaxed mb-2">
              Block A, Flat 302, Green Valley Apts,<br />HSR Layout, Bangalore - 560102
            </p>
            <p className="text-sm text-gray-500">+91 98765 43210</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 flex-1">
              {isDelivered ? 'Have an issue with your delivered order?' : 
               isCancelled ? 'Want to know why your order was cancelled?' :
               'Having issues with this order? Our support team is available.'}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleContactSupport}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
              >
                <PhoneCall className="w-4 h-4" /> Contact Support
              </button>
              {!isDelivered && !isCancelled && (
                <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                  Report an issue
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="mt-6 bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Need assistance?</p>
              <p className="text-xs text-amber-700">
                {isDelivered ? 'You can return or exchange items within 7 days of delivery.' :
                 isCancelled ? 'Contact support to understand why your order was cancelled.' :
                 isShipped ? 'Your order is on the way! Track it using the live tracking feature.' :
                 'Your order is being processed. You can schedule a preferred delivery time.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}