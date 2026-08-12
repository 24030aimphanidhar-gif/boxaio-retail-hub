import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Apple, ArrowRight, ArrowUp, Github, Linkedin, Mail, MapPin, Phone, Smartphone, Twitter, Youtube } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'wouter';

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      toast.success(`Thanks for subscribing! We'll send updates to ${newsletterEmail}`);
      setNewsletterEmail('');
    }
  };

  return (
    <>
      <footer className="bg-gradient-to-b from-[#0F2A1F] to-[#1E4A2F] text-white pt-14 pb-8 rounded-t-3xl mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* First Row - Main Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-12 lg:gap-16 mb-12">
            {/* Brand Col */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <img 
                  src="/logo.png" 
                  alt="Boxaio Logo" 
                  className="w-9 h-9 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="font-bold text-lg tracking-tight text-white">Boxaio</span>
              </Link>
              <p className="text-white/60 text-xs leading-relaxed mb-5 max-w-md">
                Boxaio connects your value chain, powers your customer journeys, and optimizes every value stream through intelligent solution pathways.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3 mb-5">
                {[
                  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/boxaio" },
                  { icon: Twitter, label: "Twitter", href: "https://twitter.com/boxaio" },
                  { icon: Github, label: "GitHub", href: "https://github.com/boxaio" },
                  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@boxaio" },
                ].map(({ icon: Icon, label, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-[#0F2A1F] transition-colors duration-300"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2.5">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "Products", href: "/products" },
                  { name: "Offers & Discounts", href: "/offers" },
                  { name: "Contact Support", href: "/contact" },
                  { name: "Categories", href: "/categories" }
                ].map((item, i) => (
                  <li key={i}>
                    <Link href={item.href} className="text-white/60 hover:text-emerald-400 transition-colors text-xs">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shop By Category */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white">Shop By Category</h4>
              <ul className="space-y-2.5">
                {[
                  { name: "Rice & Grains", href: "/products?category=Rice%20%26%20Grains" },
                  { name: "Spices & Masalas", href: "/products?category=Spices" },
                  { name: "Dairy & Bakery", href: "/products?category=Dairy" },
                  { name: "Snacks & Beverages", href: "/products?category=Snacks" },
                  { name: "Fresh Fruits", href: "/products?category=Fruits" }
                ].map((item, i) => (
                  <li key={i}>
                    <Link href={item.href} className="text-white/60 hover:text-emerald-400 transition-colors text-xs">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account & Support */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white">Account & Support</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/login" className="text-white/60 hover:text-emerald-400 transition-colors text-xs">
                    Sign In / Register
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="text-white/60 hover:text-emerald-400 transition-colors text-xs">
                    My Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-white/60 hover:text-emerald-400 transition-colors text-xs">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-white/60 hover:text-emerald-400 transition-colors text-xs">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-white/60 hover:text-emerald-400 transition-colors text-xs">
                    Shopping Cart
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Second Row - Contact, Stay Updated, Mobile App */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8 pb-8 border-b border-white/10">
            {/* Contact Information */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/60 hover:text-emerald-400 transition-colors text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href="tel:18001234567" className="hover:text-emerald-400">1800-123-4567</a>
                </div>
                <div className="flex items-center gap-3 text-white/60 hover:text-emerald-400 transition-colors text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href="mailto:support@boxaio.in" className="hover:text-emerald-400 break-all">support@boxaio.in</a>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>Boxaio Tower, HSR Layout, Bangalore - 560102</span>
                </div>
              </div>
            </div>

            {/* Stay Updated / Newsletter */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white">Stay Updated</h4>
              <p className="text-white/60 text-xs mb-3">Get latest offers & updates delivered to your inbox.</p>
              <form className="flex flex-col gap-2.5" onSubmit={handleNewsletterSubmit}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-emerald-500 text-xs py-2"
                />
                <Button type="submit" size="sm" className="w-full justify-between group text-xs bg-emerald-600 hover:bg-emerald-500">
                  Subscribe
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>

            {/* Mobile App Download Buttons */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white">Download App</h4>
              <div className="flex flex-row gap-3">
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-emerald-500 transition-all duration-300"
                >
                  <Smartphone className="w-4 h-4 group-hover:text-[#0F2A1F]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/60 group-hover:text-[#0F2A1F]/80">GET IT ON</span>
                    <span className="text-xs font-bold text-white group-hover:text-[#0F2A1F]">Google Play</span>
                  </div>
                </a>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-emerald-500 transition-all duration-300"
                >
                  <Apple className="w-4 h-4 group-hover:text-[#0F2A1F]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/60 group-hover:text-[#0F2A1F]/80">Download on</span>
                    <span className="text-xs font-bold text-white group-hover:text-[#0F2A1F]">App Store</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar - Legal Links */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-white/40 text-[11px] sm:text-xs text-center sm:text-left">
                © 2018 - {new Date().getFullYear()} Boxaio. All rights reserved.
              </p>
              
              {/* Legal Links Grid */}
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <Link 
                  href="/privacy" 
                  className="text-white/40 hover:text-emerald-400 transition-colors text-[11px] sm:text-xs whitespace-nowrap"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  className="text-white/40 hover:text-emerald-400 transition-colors text-[11px] sm:text-xs whitespace-nowrap"
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/shipping-policy" 
                  className="text-white/40 hover:text-emerald-400 transition-colors text-[11px] sm:text-xs whitespace-nowrap"
                >
                  Shipping Policy
                </Link>
                <Link 
                  href="/returns-refunds" 
                  className="text-white/40 hover:text-emerald-400 transition-colors text-[11px] sm:text-xs whitespace-nowrap"
                >
                  Returns & Refunds
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}