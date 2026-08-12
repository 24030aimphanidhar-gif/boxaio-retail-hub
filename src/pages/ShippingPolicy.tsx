import { AlertCircle, Calendar, CheckCircle, ChevronRight, Clock, Gift, Mail, MapPin, Package, TrendingUp, Truck } from 'lucide-react';
import { Link } from 'wouter';

export function ShippingPolicy() {
  const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
    '05:00 PM - 07:00 PM',
    '07:00 PM - 09:00 PM'
  ];

  return (
    <div className="pt-20 pb-24 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white py-20 px-4 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-teal-300" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-xl">
            <Truck className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">Shipping Policy</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Fast, reliable delivery to your doorstep across India.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-emerald-300 rounded-full" />
            <span className="text-emerald-200 text-sm">Last updated: January 1, 2025</span>
            <div className="w-2 h-2 bg-emerald-300 rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-emerald-600 font-semibold">Shipping Policy</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Areas */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Delivery Areas</h2>
              </div>
              <p className="text-gray-600 mb-4">We currently deliver to the following cities:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {cities.map(city => (
                  <div key={city} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{city}</span>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  We're expanding to more cities soon. Follow us for updates!
                </p>
              </div>
            </div>

            {/* Delivery Timeframes */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Delivery Timeframes</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { city: 'Tier 1 Cities', days: '1-2 days', note: 'Same-day available for early orders', gradient: 'from-emerald-50 to-teal-50' },
                  { city: 'Tier 2 Cities', days: '2-4 days', note: 'Metro areas like Pune, Ahmedabad', gradient: 'from-blue-50 to-cyan-50' },
                  { city: 'Other Areas', days: '3-6 days', note: 'Extended delivery zones', gradient: 'from-amber-50 to-orange-50' }
                ].map(item => (
                  <div key={item.city} className={`bg-gradient-to-br ${item.gradient} rounded-xl p-4 text-center border border-white/50`}>
                    <p className="font-bold text-gray-800 text-sm">{item.city}</p>
                    <p className="text-2xl font-extrabold text-emerald-600 my-2">{item.days}</p>
                    <p className="text-xs text-gray-500">{item.note}</p>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800">
                  Orders placed before 12 PM are processed same-day. Delivery estimates are calculated from order confirmation.
                </p>
              </div>
            </div>

            {/* Delivery Slots */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Preferred Delivery Slots</h2>
              </div>
              <p className="text-gray-600 mb-4">Choose your preferred delivery time during checkout:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {timeSlots.map(slot => (
                  <div key={slot} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-700 text-sm">{slot}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">*Subject to availability in your area</p>
            </div>

            {/* Order Tracking */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Order Tracking</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">Once your order ships, you'll receive:</p>
                <ul className="space-y-2">
                  {[
                    'SMS confirmation with tracking link',
                    'Email with order status updates',
                    'Real-time tracking on My Orders page'
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    📍 Live tracking available for all shipped orders. You'll receive updates at every stage.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Charges Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white sticky top-24">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">FREE SHIPPING</h3>
                <p className="text-emerald-200 text-sm">on all orders above ₹500</p>
              </div>
              <div className="border-t border-white/20 pt-4 mt-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Orders below ₹500:</span>
                    <span className="font-bold">Flat ₹50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bulk orders:</span>
                    <span>Based on weight</span>
                  </div>
                  <div className="flex justify-between">
                    <span>B2B orders:</span>
                    <span>Custom rates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Failed Deliveries Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900">Failed Deliveries</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span><strong>Wrong address/contact</strong> - Additional charges may apply</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span><strong>Recipient unavailable</strong> - 2 delivery attempts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span><strong>Customer refusal</strong> - Refund minus shipping</span>
                </li>
              </ul>
            </div>

            {/* Bulk Orders Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <h3 className="font-bold text-gray-900 mb-2">Bulk Orders?</h3>
              <p className="text-sm text-gray-600 mb-4">
                For orders over 50kg or 50+ units, contact our B2B team.
              </p>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">📧 bulk@boxaio.in</p>
                <p className="text-xs text-gray-500">📞 1800-123-4567 (Ext. 2)</p>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-emerald-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900">Shipping Support</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Questions about your shipment?</p>
              <a href="mailto:shipping@boxaio.in" className="text-emerald-600 font-semibold text-sm hover:underline block">
                shipping@boxaio.in
              </a>
              <a href="tel:18001234567" className="text-emerald-600 font-semibold text-sm hover:underline block mt-2">
                1800-123-4567
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-400 mt-12 pt-8 border-t border-gray-200">
          <p>© 2018 - {new Date().getFullYear()} Boxaio. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}