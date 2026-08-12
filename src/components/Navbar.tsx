import { ChevronDown, Heart, LogOut, MapPin, Menu, Navigation, Search, ShoppingBag, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const cities = ['Vijayawada', 'Guntur','Gudivada', 'Machilipatnam', 'Hyderabad', 'Pedana', 'Pamarru', 'Kurnool', 'Nuziveedu'];

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Browse', href: '/products' },
  { label: 'Offers', href: '/offers' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function getGreetingShort(name: string) {
  const hour = new Date().getHours();
  const first = name.split(' ')[0];
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

// Get user's current location coordinates
const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Location failed';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Allow location access';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location timeout';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// Get location name from coordinates (city, mandal, village, or town)
const getLocationName = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'BoxaioApp/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.address) {
      // Priority order: city -> town -> village -> mandal -> county -> state
      const locationName = data.address.city || 
                          data.address.town || 
                          data.address.village || 
                          data.address.mandal ||
                          data.address.suburb ||
                          data.address.county ||
                          data.address.state_district ||
                          data.address.state ||
                          data.address.country;
      
      if (locationName && locationName !== 'India') {
        return locationName;
      }
      
      // If only country found, try to get a more specific area
      if (data.address.state_district) {
        return data.address.state_district;
      }
      
      // Fallback to coordinates display
      return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
    }
    
    return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
  }
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Vijayawada');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setSelectedCity(savedLocation);
    }
  }, []);

  const isActive = (href: string) =>
    href === '/' ? location === '/' : location.startsWith(href);

  const handleUseLocation = async () => {
    setLocating(true);
    setLocationError('');
    
    try {
      // Get coordinates
      const { lat, lng } = await getUserLocation();
      
      // Get location name from coordinates
      const locationName = await getLocationName(lat, lng);
      
      setSelectedCity(locationName);
      setCityOpen(false);
      
      // Save to localStorage
      localStorage.setItem('userLocation', locationName);
      localStorage.setItem('userLat', lat.toString());
      localStorage.setItem('userLng', lng.toString());
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Location failed';
      setLocationError(errorMsg);
      setTimeout(() => setLocationError(''), 3000);
    } finally {
      setLocating(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'glass-card shadow-lg shadow-black/5 bg-white/98' 
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo + Hamburger */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 -ml-2 text-gray-600 hover:text-emerald-600 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                data-testid="button-mobile-menu-open"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="flex items-center gap-2.5 group">
                <img 
                  src="/logo.png" 
                  alt="Boxaio Logo" 
                  className="w-8 h-8 group-hover:scale-105 transition-all"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32?text=B';
                  }}
                />
                <span className="text-xl font-black gradient-text hidden sm:block tracking-tight">Boxaio</span>
              </Link>
            </div>

            {/* Center: Nav links (desktop) */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive(href)
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {/* City Selector with Live Location */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setCityOpen(!cityOpen)}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="max-w-[120px] truncate">{selectedCity}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
                </button>
                {cityOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in">
                    {/* Live location button */}
                    <button
                      onClick={handleUseLocation}
                      disabled={locating}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-blue-600 font-bold hover:bg-blue-50 transition-colors border-b border-gray-100 disabled:opacity-60"
                    >
                      <Navigation className={`w-4 h-4 flex-shrink-0 ${locating ? 'animate-spin' : ''}`} />
                      {locating ? 'Detecting...' : ' Use my location'}
                    </button>
                    
                    {/* Location error message */}
                    {locationError && (
                      <div className="px-4 py-2 text-xs text-red-500 bg-red-50 mx-2 rounded-lg mb-1">
                        {locationError}
                      </div>
                    )}
                    
                    {/* Divider */}
                    <div className="px-4 py-2 text-xs text-gray-400 font-semibold">OR SELECT CITY</div>
                    
                    {/* City list */}
                    <div className="max-h-56 overflow-y-auto">
                      {cities.map(city => (
                        <button
                          key={city}
                          onClick={() => { setSelectedCity(city); setCityOpen(false); localStorage.setItem('userLocation', city); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            city === selectedCity ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <Link href="/products" className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                <Search className="w-5 h-5" />
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                <ShoppingBag className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center rounded-full">
                    {getCartCount() > 9 ? '9+' : getCartCount()}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-1 ml-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors"
                    title={getGreetingShort(user?.profile.name || '')}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                      {user?.profile.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate hidden lg:block">{user?.profile.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all ml-1"
                  data-testid="link-sign-in"
                >
                  <User className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Greeting sub-bar for logged in users */}
          {isAuthenticated && user && (
            <div className="hidden lg:flex items-center gap-2 pt-0.5 pb-1 text-xs text-gray-400">
              <span className="text-emerald-600 font-semibold">{getGreetingShort(user.profile.name)}</span>
              <span className="text-gray-300">•</span>
              <span>Delivering to <strong className="text-gray-700">{selectedCity}</strong></span>
              {getCartCount() > 0 && (
                <>
                  <span className="text-gray-300">•</span>
                  <Link href="/cart" className="text-emerald-600 font-semibold hover:underline">{getCartCount()} item{getCartCount() !== 1 ? 's' : ''} in cart</Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-[70] shadow-2xl transition-transform duration-300 md:hidden flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className={`bg-gradient-to-r from-emerald-600 to-teal-700 p-5 ${isAuthenticated ? 'pb-4' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="Boxaio Logo" 
                className="w-8 h-8 object-contain rounded-lg bg-white/20 p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32?text=B';
                }}
              />
              <span className="text-xl font-black text-white tracking-tight">Boxaio</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              data-testid="button-mobile-menu-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {isAuthenticated && user && (
            <div className="bg-white/10 rounded-xl px-3 py-2.5">
              <p className="text-emerald-100 text-xs font-medium">{getGreetingShort(user.profile.name)}</p>
              <p className="text-white font-bold text-sm">{user.profile.name}</p>
              <p className="text-emerald-200 text-xs">{user.email}</p>
            </div>
          )}
        </div>

        {/* City selector in mobile */}
        <div className="px-4 py-3 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
              <MapPin className="w-4 h-4" />
              <span className="flex-1 truncate">Delivering to: {selectedCity}</span>
            </div>
            <button
              onClick={handleUseLocation}
              disabled={locating}
              className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline disabled:opacity-60"
            >
              <Navigation className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
              {locating ? 'Locating...' : 'GPS'}
            </button>
          </div>
          {locationError && (
            <p className="text-xs text-red-500 mt-2">{locationError}</p>
          )}
        </div>

        {/* City selection grid in mobile */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Select your city</p>
          <div className="grid grid-cols-2 gap-2">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => { setSelectedCity(city); localStorage.setItem('userLocation', city); setMobileMenuOpen(false); }}
                className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  city === selectedCity ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-1 mb-6">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base transition-all ${
                  isActive(href) ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="pt-4 space-y-1">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-700 font-bold bg-emerald-50">
                  <User className="w-5 h-5" /> My Dashboard
                </Link>
                <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">
                  <ShoppingBag className="w-5 h-5" /> My Orders
                </Link>
                <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">
                  <Heart className="w-5 h-5" /> Wishlist
                  {wishlistCount > 0 && <span className="ml-auto bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>}
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </>
            ) : (
              <div className="px-3 space-y-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl font-bold text-sm"
                >
                  <User className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center w-full border-2 border-emerald-200 text-emerald-700 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom cart link */}
        <div className="p-4 bg-white border-t border-gray-100">
          <Link
            href="/cart"
            className="flex items-center justify-between w-full bg-gray-900 text-white py-3.5 px-5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> View Cart
            </div>
            {getCartCount() > 0 && (
              <span className="bg-emerald-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* City dropdown overlay closer */}
      {cityOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setCityOpen(false)} />
      )}
    </>
  );
}