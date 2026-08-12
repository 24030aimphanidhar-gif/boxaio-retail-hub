import { AlertCircle, Calendar, CheckCircle, ChevronRight, Clock, CreditCard, FileText, Headphones, Mail, MessageCircle, Package, Phone, RefreshCw, Shield, Star } from 'lucide-react';
import { Link } from 'wouter';

export function ReturnsRefunds() {
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
            <RefreshCw className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">Returns & Refunds</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Hassle-free returns and quick refunds. Your satisfaction is our priority.
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
          <span className="text-emerald-600 font-semibold">Returns & Refunds</span>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { icon: Clock, title: '7 Days', desc: 'Return window for most products', color: 'emerald' },
            { icon: Shield, title: '100% Secure', desc: 'Money-back guarantee', color: 'blue' },
            { icon: Clock, title: '24 Hours', desc: 'Fresh produce window', color: 'amber' },
            { icon: RefreshCw, title: 'Free Pickup', desc: 'No extra charges', color: 'purple' }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={`bg-gradient-to-br from-${color}-50 to-white rounded-2xl p-5 text-center border border-${color}-100 shadow-sm`}>
              <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Return Policy - Eligible */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Eligible for Return</h2>
              </div>
              <ul className="space-y-3">
                {[
                  'Damaged or defective products upon delivery',
                  'Wrong product shipped (different from ordered)',
                  'Expired or near-expiry products (less than 30 days)',
                  'Sealed non-perishable items within 7 days'
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Return Policy - Not Eligible */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Not Eligible for Return</h2>
              </div>
              <ul className="space-y-3">
                {[
                  'Fresh produce, dairy, and frozen items (except quality issues)',
                  'Opened or used products',
                  'Products without original packaging',
                  'Items marked as "Final Sale" or "Non-returnable"',
                  'Return requests after 7 days of delivery'
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Return Process */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">How to Return an Item</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[
                  { step: 1, title: 'Initiate Request', desc: 'Go to My Orders → Select Order → Request Return', icon: FileText },
                  { step: 2, title: 'Share Details', desc: 'Upload photos/videos of the issue', icon: Camera },
                  { step: 3, title: 'Pickup Scheduled', desc: "We'll arrange free pickup within 2-3 days", icon: Package },
                  { step: 4, title: 'Refund Processed', desc: 'Refund initiated after quality check', icon: CreditCard }
                ].map(({ step, title, desc, icon: Icon }) => (
                  <div key={step} className="text-center">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                      {step}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">
                  📦 For pickup, ensure product is in original packaging with all tags intact.
                </p>
              </div>
            </div>

            {/* Fresh Produce */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Fresh Produce & Dairy</h2>
              </div>
              <ul className="space-y-3 mb-4">
                {[
                  'Report any quality issues within 24 hours of delivery',
                  'Upload clear photos showing the issue',
                  "We'll process refund or replacement within 48 hours",
                  'Physical return is not required for fresh produce'
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-sm text-red-800">
                  ⚠️ No returns accepted after 24 hours of delivery for perishable items due to food safety regulations.
                </p>
              </div>
            </div>

            {/* Replacement & Cancellation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-600" /> Replacement Policy
                </h3>
                <p className="text-sm text-gray-600">
                  We offer free replacement for damaged or defective items. Replacements are shipped within 2-3 business days 
                  after return pickup.
                </p>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" /> Order Cancellation
                </h3>
                <p className="text-sm text-gray-600">
                  <strong>Before shipment:</strong> Full refund within 2-4 hours<br />
                  <strong>After shipment:</strong> Cancellation not possible, but you can return after delivery
                </p>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-4">
                {[
                  { q: 'Do I have to pay for return pickup?', a: 'No, return pickups are completely free for eligible returns.' },
                  { q: 'How long do I have to return an item?', a: '7 days from delivery date for most products. 24 hours for fresh produce.' },
                  { q: 'Can I return bulk orders?', a: 'Yes, bulk orders follow same policy. Contact B2B support for large quantity returns.' },
                  { q: 'What if I received a different product?', a: "Report immediately via My Orders → Request Return. We'll arrange pickup and send correct product." }
                ].map((faq, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-emerald-200 transition-all">
                    <p className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                      <Star className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {faq.q}
                    </p>
                    <p className="text-gray-600 text-sm pl-6">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Refund Timeline Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Refund Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-sm">UPI / Wallet</span>
                  <span className="font-bold">2-4 hours</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-sm">Credit/Debit Card</span>
                  <span className="font-bold">3-5 days</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-sm">Net Banking</span>
                  <span className="font-bold">3-5 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cash on Delivery</span>
                  <span className="font-bold">5-7 days</span>
                </div>
              </div>
              <p className="text-xs text-emerald-200 mt-4 text-center">
                *Refund timelines vary by bank
              </p>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                <Headphones className="w-6 h-6 text-amber-600" />
                <h3 className="font-bold text-gray-900">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Our customer service team is here to assist you with returns and refunds.
              </p>
              <div className="space-y-2">
                <a href="mailto:returns@boxaio.in" className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                  <Mail className="w-4 h-4" /> returns@boxaio.in
                </a>
                <a href="tel:18001234567" className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                  <Phone className="w-4 h-4" /> 1800-123-4567
                </a>
                <p className="text-xs text-gray-500 mt-2">9 AM - 8 PM, 7 days a week</p>
              </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <p className="text-sm text-blue-800">
                💡 <strong>Quick Tip:</strong> Keep your order invoice handy when requesting a return. It helps us process your request faster!
              </p>
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

// Helper component for Camera icon (if not in lucide-react)
const Camera = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);