import { useState, useEffect } from 'react';
import { ShoppingBag, X, Star } from 'lucide-react';

export function MobileAppBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('boxaio_app_banner_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('boxaio_app_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 animate-slide-up">
      <div className="m-3 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="p-4 flex items-center gap-3">
          {/* App icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight">Get the Boxaio App</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-current" />
                ))}
              </div>
              <span className="text-xs text-gray-500">4.8 &bull; App-only deals inside</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button className="bg-gray-900 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap hover:bg-gray-800 transition-colors">
              App Store
            </button>
            <button className="bg-gray-900 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap hover:bg-gray-800 transition-colors">
              Google Play
            </button>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all flex-shrink-0"
            data-testid="button-dismiss-app-banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
