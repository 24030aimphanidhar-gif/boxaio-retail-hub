import { CheckCircle, ChevronRight, Cookie, Database, Eye, FileText, Globe, Lock, Mail, MapPin, Phone, Server, Shield, Users } from 'lucide-react';
import { Link } from 'wouter';

export function PrivacyPolicy() {
  const sections = [
    { id: 'information-we-collect', title: 'Information We Collect', icon: Database },
    { id: 'how-we-use-it', title: 'How We Use It', icon: Eye },
    { id: 'cookies', title: 'Cookies & Tracking', icon: Cookie },
    { id: 'data-security', title: 'Data Security', icon: Lock },
    { id: 'your-rights', title: 'Your Rights', icon: Users },
    { id: 'third-parties', title: 'Third Parties', icon: Server }
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
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Your privacy matters. Learn how we collect, use, and protect your information.
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
          <span className="text-emerald-600 font-semibold">Privacy Policy</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
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
          <div className="flex-1 space-y-8">
            {/* Introduction */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Boxaio ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you visit our website or use our services. 
                Please read this policy carefully. By using our services, you consent to the practices described herein.
              </p>
            </div>

            {/* Information We Collect */}
            <div id="information-we-collect" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" /> Personal Information
                  </h3>
                  <ul className="space-y-2">
                    {[
                      'Name, email address, phone number, and delivery address',
                      'Payment information (processed securely)',
                      'Account credentials and profile information',
                      'Communication preferences and history'
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" /> Automatically Collected
                  </h3>
                  <ul className="space-y-2">
                    {[
                      'IP address, browser type, and device information',
                      'Pages visited, time spent, and click-through data',
                      'Location data (with your consent)',
                      'Order history and shopping preferences'
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use It */}
            <div id="how-we-use-it" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Process and fulfill your orders',
                  'Communicate about orders and promotions',
                  'Personalize your shopping experience',
                  'Improve our website and services',
                  'Prevent fraud and ensure security',
                  'Comply with legal obligations'
                ].map(item => (
                  <div key={item} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cookies */}
            <div id="cookies" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Cookies & Tracking</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, 
                and personalize content. You can control cookie preferences through your browser settings.
              </p>
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-900">Types of cookies we use:</strong> Essential cookies (required for site functionality), 
                  performance cookies (to analyze usage), functional cookies (to remember preferences), and advertising cookies 
                  (to show relevant offers).
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div id="data-security" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Data Security</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  '256-bit SSL encryption for all transactions',
                  'Regular security audits and assessments',
                  'Secure data centers with restricted access',
                  'PCI DSS compliance for payment processing'
                ].map(item => (
                  <div key={item} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                    <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-sm text-amber-800">
                  ⚠️ While we take every precaution, no method of internet transmission is 100% secure. 
                  You are responsible for maintaining your account password confidentiality.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div id="your-rights" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Your Privacy Rights</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  'Access your personal data',
                  'Correct inaccurate information',
                  'Request data deletion',
                  'Opt-out of marketing',
                  'Withdraw consent anytime'
                ].map(item => (
                  <div key={item} className="flex items-start gap-2 p-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-sm text-emerald-800">
                  To exercise these rights, contact us at <strong>support@boxaio.in</strong>
                </p>
              </div>
            </div>

            {/* Third Parties */}
            <div id="third-parties" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Third-Party Services</h2>
              </div>
              <ul className="space-y-2 mb-4">
                {[
                  'Payment processors (Razorpay, PhonePe, etc.)',
                  'Delivery partners (for order fulfillment)',
                  'Analytics providers (to improve our services)',
                  'Customer support tools'
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">
                  These parties are contractually obligated to protect your data and use it only for specified purposes.
                </p>
              </div>
            </div>

            {/* Children's Privacy */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our services are not directed to individuals under 18. We do not knowingly collect personal information 
                from minors. If you believe a minor has provided us with data, please contact us immediately.
              </p>
            </div>

            {/* Updates */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Policy Updates</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy periodically. Changes will be posted on this page with an updated 
                "Last updated" date. Significant changes will be notified via email or website notice.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-700 mb-6">If you have questions about this Privacy Policy, please contact us:</p>
              <div className="space-y-3">
                <p className="flex items-center gap-3"><Mail className="w-5 h-5 text-emerald-600" /> privacy@boxaio.in</p>
                <p className="flex items-center gap-3"><Phone className="w-5 h-5 text-emerald-600" /> 1800-123-4567</p>
                <p className="flex items-center gap-3"><MapPin className="w-5 h-5 text-emerald-600" /> HSR Layout, Bangalore - 560102</p>
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