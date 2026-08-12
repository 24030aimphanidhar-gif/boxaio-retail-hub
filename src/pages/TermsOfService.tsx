import { AlertCircle, CheckCircle, ChevronRight, Clock, CreditCard, FileText, Mail, Phone, Scale, ShoppingBag, Truck, Users } from 'lucide-react';
import { Link } from 'wouter';

export function TermsOfService() {
  const sections = [
    { id: 'acceptance', title: 'Acceptance', icon: CheckCircle },
    { id: 'account-registration', title: 'Account Registration', icon: Users },
    { id: 'orders-payments', title: 'Orders & Payments', icon: ShoppingBag },
    { id: 'pricing', title: 'Pricing', icon: CreditCard },
    { id: 'shipping', title: 'Shipping', icon: Truck },
    { id: 'returns', title: 'Returns', icon: Clock },
    { id: 'prohibited-conduct', title: 'Prohibited Conduct', icon: AlertCircle },
    { id: 'limitation-of-liability', title: 'Limitation of Liability', icon: Scale }
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
            <FileText className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using our services.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-emerald-300 rounded-full" />
            <span className="text-emerald-200 text-sm">Effective: January 1, 2025</span>
            <div className="w-2 h-2 bg-emerald-300 rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-emerald-600 font-semibold">Terms of Service</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation - Sticky */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Jump to Section</h3>
              <div className="space-y-2">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 group"
                    >
                      <Icon className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                      {section.title}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* Acceptance */}
            <div id="acceptance" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Acceptance of Terms</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-base">
                By accessing or using Boxaio's website, mobile application, or services, you agree to be bound by these 
                Terms of Service. If you disagree with any part, please do not use our services.
              </p>
            </div>

            {/* Account Registration */}
            <div id="account-registration" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Account Registration</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  To place orders, you must create an account. You agree to:
                </p>
                <ul className="space-y-2">
                  {[
                    'Provide accurate, current, and complete information',
                    'Maintain the security of your password and account',
                    'Accept responsibility for all activities under your account',
                    'Notify us immediately of any unauthorized use'
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mt-4">
                  <p className="text-sm text-amber-800">
                    We reserve the right to refuse service, terminate accounts, or cancel orders at our discretion.
                  </p>
                </div>
              </div>
            </div>

            {/* Orders & Payments */}
            <div id="orders-payments" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Orders & Payments</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  By placing an order, you agree to pay the specified price, including applicable taxes and delivery fees.
                </p>
                <ul className="space-y-2">
                  {[
                    'We accept payment via UPI, credit/debit cards, net banking, and cash on delivery (COD)',
                    'Orders are subject to availability and confirmation of payment',
                    'We reserve the right to cancel any order due to pricing errors or suspected fraud',
                    'Order confirmation email is sent upon successful payment'
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pricing */}
            <div id="pricing" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Pricing & Promotions</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  All prices are in Indian Rupees (INR) and include applicable GST unless stated otherwise.
                </p>
                <ul className="space-y-2">
                  {[
                    'Prices may change without notice, but changes won\'t affect confirmed orders',
                    'Discounts and promotional offers cannot be combined unless explicitly stated',
                    'Bulk pricing applies to minimum quantities as specified on product pages',
                    'We reserve the right to modify or discontinue promotions at any time'
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Shipping */}
            <div id="shipping" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shipping & Delivery</h2>
              </div>
              <ul className="space-y-2">
                {[
                  'Delivery estimates are provided in good faith but are not guaranteed',
                  'Free shipping applies to orders above ₹500 (may vary by location)',
                  'Risk of loss passes to you upon delivery',
                  'You must provide accurate delivery address and contact information',
                  'Failed delivery attempts may result in order cancellation'
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Returns */}
            <div id="returns" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Returns & Refunds</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Please refer to our <Link href="/returns-refunds" className="text-emerald-600 font-semibold hover:underline">Returns & Refunds Policy</Link> for detailed information. Summary:
              </p>
              <ul className="space-y-2">
                {[
                  '7-day return window for most products',
                  'Fresh produce complaints must be reported within 24 hours',
                  'Refunds processed within 5-7 business days',
                  'Original packaging required for returns'
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prohibited Conduct */}
            <div id="prohibited-conduct" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Prohibited Conduct</h2>
              </div>
              <ul className="space-y-2">
                {[
                  'Use our services for any illegal purpose',
                  'Attempt to gain unauthorized access to our systems',
                  'Interfere with or disrupt the website or servers',
                  'Scrape, crawl, or use bots without permission',
                  'Misrepresent your identity or affiliation',
                  'Resell products without authorization'
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitation of Liability */}
            <div id="limitation-of-liability" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Limitation of Liability</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  To the maximum extent permitted by law, Boxaio shall not be liable for:
                </p>
                <ul className="space-y-2">
                  {[
                    'Indirect, incidental, or consequential damages',
                    'Loss of profits, data, or business opportunities',
                    'Delay or failure to perform due to circumstances beyond our control'
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-gray-600">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                  <p className="text-sm text-amber-800">
                    Our total liability to you shall not exceed the total amount paid by you for products purchased 
                    through our services in the 3 months preceding the claim.
                  </p>
                </div>
              </div>
            </div>

            {/* Governing Law */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms shall be governed by the laws of India. Any disputes arising shall be subject to the 
                exclusive jurisdiction of courts in Bangalore, Karnataka.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Have Questions?</h2>
              </div>
              <p className="text-gray-700 mb-6 text-lg">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:legal@boxaio.in" className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl hover:shadow-md transition-all group">
                  <Mail className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 group-hover:text-emerald-600">legal@boxaio.in</span>
                </a>
                <a href="tel:18001234567" className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl hover:shadow-md transition-all group">
                  <Phone className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 group-hover:text-emerald-600">1800-123-4567</span>
                </a>
              </div>
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