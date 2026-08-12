import { ChevronDown, ChevronUp, Clock, HelpCircle, Mail, MapPin, Navigation, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const faqs = [
  { q: 'How do I track my order?', a: 'Go to My Orders in your dashboard. Click "Track Order" for real-time status updates. We also send SMS and email alerts at every step.' },
  { q: 'What is your return policy?', a: 'We offer 7-day no-questions-asked returns for sealed non-perishable items. For fresh produce, raise a complaint within 24 hours with a photo. Refunds are processed within 3-5 business days.' },
  { q: 'How do bulk discounts work?', a: 'Switch to the "Bulk Pack" option on any product page to see wholesale pricing. Bulk prices are 20-35% lower than standard prices. Minimum quantities apply per product.' },
  { q: 'What are your delivery timings?', a: 'We deliver 7 days a week, 8 AM to 9 PM. You can select your preferred delivery slot during checkout. Same-day delivery available in select cities.' },
  { q: 'Is there a minimum order amount?', a: 'No minimum order for standard packs. Bulk packs have a minimum quantity per product (usually 5 units). Free delivery is available on orders above ₹500.' },
  { q: 'How do I become a B2B retailer?', a: 'Register with your GST number and business details. Once verified (within 24 hours), you\'ll get access to wholesale pricing, bulk catalogs, and a dedicated account manager.' },
];

// Google Maps Embed URL for Swapna Bharathi Learning Solutions
const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.6!3d12.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU0JzEwLjAiTiA3N8KwMzYnMjAuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";

// Alternative: Direct Google Maps directions link
const DIRECTIONS_URL = "https://www.google.com/maps/dir//Swapna+Bharathi+Learning+Solutions+Pvt+Ltd";

export function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    (e.target as HTMLFormElement).reset();
  };

  const openInGoogleMaps = () => {
    window.open(DIRECTIONS_URL, '_blank');
  };

  return (
    <div className="pt-20 pb-24 min-h-screen bg-gray-50">

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white py-16 px-4 mb-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/30">
            <Phone className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Get in Touch</h1>
          <p className="text-emerald-100 text-lg max-w-xl mx-auto">
            Have a question about your order, bulk pricing, or anything else? We're here to help, 7 days a week.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-20">
          {/* Form — wider */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a message</h2>
            <p className="text-gray-500 text-sm mb-8">Fill in the form below and we'll respond within 24 hours.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                  <input required type="text" placeholder="Rahul" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                  <input required type="text" placeholder="Sharma" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input required type="email" placeholder="rahul@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all text-gray-700 bg-white">
                  <option>Order Issue</option>
                  <option>Bulk Order Inquiry</option>
                  <option>Product Query</option>
                  <option>Return & Refund</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                <textarea required placeholder="Describe your issue or question in detail..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all resize-none h-32" />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                data-testid="button-contact-submit"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-7">Contact Information</h3>
              <div className="space-y-6">
                {[
                  { icon: Phone, title: 'Call Us', lines: ['1800-123-4567 (Toll Free)', 'Mon–Sun, 9 AM to 8 PM'] },
                  { icon: Mail, title: 'Email Us', lines: ['support@boxaio.in', 'We reply within 24 hours'] },
                  { icon: MapPin, title: 'Head Office', lines: ['Swapna Bharathi Learning Solutions', '1-191 Vysya Bazar, Gudlavalleru, Andhra Pradesh'] },
                  { icon: Clock, title: 'Business Hours', lines: ['Monday – Sunday', '9:00 AM to 8:00 PM IST'] },
                ].map(({ icon: Icon, title, lines }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-0.5">{title}</p>
                      {lines.map((line, i) => (
                        <p key={i} className="text-emerald-200 text-sm">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Google Map instead of static image */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
              <div className="relative">
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-xs text-gray-500">Loading map...</p>
                    </div>
                  </div>
                )}
                <iframe
                  title="Boxaio Office Location"
                  src={GOOGLE_MAPS_EMBED_URL}
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setMapLoaded(true)}
                  className="w-full"
                />
              </div>
              
              {/* Map Actions */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900">Swapna Bharathi Learning Solutions</p>
                  <p className="text-xs text-gray-500">1-191 Vysya Bazar, Gudlavalleru, Andhra Pradesh</p>
                </div>
                <button
                  onClick={openInGoogleMaps}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            </div>

            {/* Office Hours Note */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Visit Our Office</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Walk-ins welcome during business hours. Please carry a valid ID for security clearance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div>
          <div className="text-center mb-12">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500">Answers to the most common questions from our customers.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                    <p className="pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}