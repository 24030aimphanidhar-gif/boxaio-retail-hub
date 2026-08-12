import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Crosshair,
  Edit2,
  FileText,
  Home,
  Loader2,
  Map,
  MapPin,
  ShieldCheck,
  Tag, TrendingUp,
  Truck, Wallet
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { products } from '../data/products';

const paymentMethods = [
  { id: 'upi', icon: Wallet, label: 'UPI / QR Code', sub: 'PhonePe, Google Pay, Paytm, BHIM' },
  { id: 'card', icon: CreditCard, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay, Amex' },
  { id: 'cod', icon: Truck, label: 'Cash on Delivery', sub: 'Pay when your order arrives' },
];

interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  landmark?: string;
  addressType?: 'home' | 'work' | 'other';
}

interface DeliverySlot {
  date: string;
  time: string;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  pincode: string;
}

export function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const [, navigate] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [currentStep, setCurrentStep] = useState<'address' | 'slot' | 'payment'>('address');
  const [address, setAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    landmark: '',
    addressType: 'home',
  });
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot>({ date: '', time: '' });
  const [panCard, setPanCard] = useState('');
  const [showPanModal, setShowPanModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getCartTotal();
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 500 ? 0 : 50;
  const gst = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + shipping + gst;
  const requiresPan = total > 5000;

  // Calculate total savings (MRP - actual price)
  const totalSavings = cart.reduce((sum, item) => {
    const product = products.find(p => p._id === item.id);
    if (product) {
      return sum + ((product.mrp - product.normalPrice) * item.quantity);
    }
    return sum;
  }, 0);

  // Get current location
  const getCurrentLocation = () => {
    setIsLocating(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLocating(false);
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const addressData = {
              lat: latitude,
              lng: longitude,
              address: [
                data.address.road,
                data.address.suburb,
                data.address.neighbourhood
              ].filter(Boolean).join(', ') || data.display_name.split(',')[0],
              city: data.address.city || data.address.town || data.address.village || '',
              pincode: data.address.postcode || '',
            };
            
            setAddress(prev => ({
              ...prev,
              address: addressData.address,
              city: addressData.city,
              pincode: addressData.pincode,
            }));
            
            toast.success('Location detected successfully!');
          } else {
            toast.error('Could not get address from location');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.error('Could not fetch address details');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Please allow location access to use this feature';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Autofill from saved addresses (mock data - in real app, fetch from user's saved addresses)
  const savedAddresses = [
    { id: 1, name: 'Home', address: 'Block A, Flat 302, Green Valley Apts', city: 'Bangalore', pincode: '560102', landmark: 'Near Central Mall' },
    { id: 2, name: 'Office', address: 'Floor 5, Tech Park, Electronic City', city: 'Bangalore', pincode: '560100', landmark: 'Opposite to Metro Station' },
  ];

  const handleUseSavedAddress = (savedAddr: typeof savedAddresses[0]) => {
    setAddress(prev => ({
      ...prev,
      address: savedAddr.address,
      city: savedAddr.city,
      pincode: savedAddr.pincode,
      landmark: savedAddr.landmark,
    }));
    setShowAddressSuggestions(false);
    toast.success(`Using ${savedAddr.name} address`);
  };

  const handleCoupon = () => {
    if (coupon.toUpperCase() === 'BOXAIO10' || coupon.toUpperCase() === 'WELCOME') {
      setCouponApplied(true);
      toast.success('Coupon applied! 10% off on your order.');
    } else {
      toast.error('Invalid coupon code. Try BOXAIO10.');
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.firstName || !address.lastName || !address.email || !address.phone || !address.address || !address.city || !address.pincode) {
      toast.error('Please fill all address fields');
      return;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    setCurrentStep('slot');
  };

  const handleSlotSubmit = () => {
    if (!deliverySlot.date || !deliverySlot.time) {
      toast.error('Please select a delivery date and time slot');
      return;
    }
    if (requiresPan && !panCard) {
      setShowPanModal(true);
      return;
    }
    setCurrentStep('payment');
  };

  const handlePanSubmit = () => {
    if (!panCard || panCard.length < 10) {
      toast.error('Please enter a valid PAN card number');
      return;
    }
    setShowPanModal(false);
    setCurrentStep('payment');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Order placed successfully! Scheduled for delivery on ${deliverySlot.date} between ${deliverySlot.time}.`);
    clearCart();
    navigate('/orders');
  };

  const handleEditAddress = () => {
    setCurrentStep('address');
  };

  const handleEditSlot = () => {
    setCurrentStep('slot');
  };

  // Get suggested products (products not in cart)
  const cartIds = new Set(cart.map(item => item.id));
  const suggestedProducts = products.filter(p => !cartIds.has(p._id)).slice(0, 4);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isStepComplete = {
    address: address.firstName && address.lastName && address.email && address.phone && address.address && address.city && address.pincode,
    slot: deliverySlot.date && deliverySlot.time,
    payment: true,
  };

  // Get address type icon
  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Building className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="pt-20 pb-24 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 py-8 px-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/cart" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Secure Checkout</h1>
            <div className="flex items-center gap-2 mt-1">
              {[
                { step: 'address', label: 'Address', icon: MapPin },
                { step: 'slot', label: 'Delivery Slot', icon: Calendar },
                { step: 'payment', label: 'Payment', icon: CreditCard }
              ].map(({ step, label, icon: Icon }, idx) => (
                <div key={step} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 'address') setCurrentStep('address');
                      else if (step === 'slot' && isStepComplete.address) setCurrentStep('slot');
                      else if (step === 'payment' && isStepComplete.address && isStepComplete.slot) setCurrentStep('payment');
                      else toast.error(`Please complete ${step === 'slot' ? 'address' : step === 'payment' ? 'address & slot' : ''} first`);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep === step ? 'bg-white text-emerald-700 ring-2 ring-white/50' :
                      (step === 'address' && isStepComplete.address) ||
                      (step === 'slot' && isStepComplete.slot) ||
                      (step === 'payment' && isStepComplete.address && isStepComplete.slot)
                        ? 'bg-white text-emerald-700'
                        : 'bg-white/20 text-white'
                    }`}>
                      {((step === 'address' && isStepComplete.address) ||
                        (step === 'slot' && isStepComplete.slot) ||
                        (step === 'payment' && isStepComplete.address && isStepComplete.slot)) ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className={`text-xs md:text-sm font-medium hidden sm:inline-block ${
                      currentStep === step ? 'text-white font-bold' : 'text-emerald-200'
                    }`}>
                      {label}
                    </span>
                  </button>
                  {idx < 2 && <div className="w-6 h-px bg-white/30 mx-0.5" />}
                </div>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-emerald-200 text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:block">SSL Encrypted</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: Steps */}
          <div className="flex-1 space-y-6">

            {/* Step 1: Address */}
            <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all ${currentStep !== 'address' && isStepComplete.address ? 'opacity-70' : ''}`}>
              <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                    isStepComplete.address ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isStepComplete.address ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                  </div>
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Delivery Address
                </h2>
                <div className="flex gap-2">
                  {currentStep === 'address' && (
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isLocating}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      {isLocating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Crosshair className="w-4 h-4" />
                      )}
                      Use My Location
                    </button>
                  )}
                  {currentStep !== 'address' && isStepComplete.address && (
                    <button type="button" onClick={handleEditAddress} className="flex items-center gap-1 text-sm text-emerald-600 font-semibold hover:underline">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                </div>
              </div>
              
              {currentStep === 'address' ? (
                <form onSubmit={handleAddressSubmit} className="p-5 md:p-6">
                  {/* Saved Addresses Dropdown */}
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => setShowAddressSuggestions(!showAddressSuggestions)}
                      className="flex items-center gap-2 text-sm text-emerald-600 font-semibold hover:underline mb-3"
                    >
                      <Map className="w-4 h-4" />
                      Use a saved address
                    </button>
                    {showAddressSuggestions && (
                      <div className="space-y-2 animate-fade-in">
                        {savedAddresses.map(addr => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleUseSavedAddress(addr)}
                            className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all flex items-center gap-3"
                          >
                            {addr.name === 'Home' ? <Home className="w-4 h-4 text-emerald-600" /> : <Building className="w-4 h-4 text-blue-600" />}
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{addr.name}</p>
                              <p className="text-xs text-gray-500">{addr.address}, {addr.city} - {addr.pincode}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">First Name *</label>
                      <input
                        required
                        type="text"
                        value={address.firstName}
                        onChange={e => setAddress({ ...address, firstName: e.target.value })}
                        placeholder="First Name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Last Name *</label>
                      <input
                        required
                        type="text"
                        value={address.lastName}
                        onChange={e => setAddress({ ...address, lastName: e.target.value })}
                        placeholder="Last Name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={address.email}
                        onChange={e => setAddress({ ...address, email: e.target.value })}
                        placeholder="Email Address"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone Number *</label>
                      <input
                        required
                        type="tel"
                        value={address.phone}
                        onChange={e => setAddress({ ...address, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Street Address *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          required
                          value={address.address}
                          onChange={e => setAddress({ ...address, address: e.target.value })}
                          placeholder="House No., Building, Street, Landmark"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Landmark (Optional)</label>
                      <input
                        value={address.landmark}
                        onChange={e => setAddress({ ...address, landmark: e.target.value })}
                        placeholder="Nearby landmark"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">City *</label>
                      <input
                        required
                        value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })}
                        placeholder="City"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Pincode *</label>
                      <input
                        required
                        type="text"
                        value={address.pincode}
                        onChange={e => setAddress({ ...address, pincode: e.target.value })}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Address Type</label>
                      <div className="flex gap-3">
                        {[
                          { value: 'home', label: 'Home', icon: Home },
                          { value: 'work', label: 'Work', icon: Building },
                          { value: 'other', label: 'Other', icon: MapPin },
                        ].map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setAddress({ ...address, addressType: type.value as any })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                              address.addressType === type.value
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {locationError && (
                    <div className="mb-4 p-3 bg-red-50 rounded-xl text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {locationError}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    Continue to Delivery Slot
                  </button>
                </form>
              ) : isStepComplete.address && (
                <div className="p-5 md:p-6 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {getAddressTypeIcon(address.addressType || 'home')}
                        <p className="font-semibold text-gray-900">{address.firstName} {address.lastName}</p>
                      </div>
                      <p className="text-sm text-gray-600">{address.address}</p>
                      {address.landmark && <p className="text-sm text-gray-500">Landmark: {address.landmark}</p>}
                      <p className="text-sm text-gray-600">{address.city} - {address.pincode}</p>
                      <p className="text-sm text-gray-600">📞 {address.phone}</p>
                      <p className="text-sm text-gray-600">📧 {address.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Delivery Slot */}
            <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all ${currentStep !== 'slot' && isStepComplete.slot ? 'opacity-70' : ''} ${currentStep === 'address' ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                    isStepComplete.slot ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isStepComplete.slot ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                  </div>
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Delivery Slot
                </h2>
                {currentStep !== 'slot' && isStepComplete.slot && (
                  <button type="button" onClick={handleEditSlot} className="flex items-center gap-1 text-sm text-emerald-600 font-semibold hover:underline">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>
              
              {currentStep === 'slot' ? (
                <div className="p-5 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Delivery Date *</label>
                      <input
                        type="date"
                        value={deliverySlot.date}
                        onChange={e => setDeliverySlot({ ...deliverySlot, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Time Slot *</label>
                      <select
                        value={deliverySlot.time}
                        onChange={e => setDeliverySlot({ ...deliverySlot, time: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 text-sm"
                      >
                        <option value="">Select time slot</option>
                        <option value="09:00-11:00">09:00 AM - 11:00 AM</option>
                        <option value="11:00-13:00">11:00 AM - 01:00 PM</option>
                        <option value="13:00-15:00">01:00 PM - 03:00 PM</option>
                        <option value="15:00-17:00">03:00 PM - 05:00 PM</option>
                        <option value="17:00-19:00">05:00 PM - 07:00 PM</option>
                      </select>
                    </div>
                  </div>
                  
                  {requiresPan && (
                    <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800">PAN Card Required</span>
                      </div>
                      <p className="text-xs text-amber-700">Order total exceeds ₹5000. PAN card details are required as per government regulations.</p>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleSlotSubmit}
                    className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    Continue to Payment
                  </button>
                </div>
              ) : isStepComplete.slot && (
                <div className="p-5 md:p-6 bg-gray-50">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-900">Scheduled Delivery</p>
                    <p className="text-sm text-gray-600">{formatDate(deliverySlot.date)}</p>
                    <p className="text-sm text-gray-600">Time: {deliverySlot.time}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment */}
            <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all ${currentStep !== 'payment' ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="p-5 md:p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">3</div>
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Payment Method
                </h2>
              </div>
              <div className="p-5 md:p-6 space-y-3">
                {paymentMethods.map(({ id, icon: Icon, label, sub }) => (
                  <div key={id}>
                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === id ? 'border-emerald-500 bg-emerald-50/60' : 'border-gray-200 bg-white hover:border-emerald-200'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={id}
                        checked={paymentMethod === id}
                        onChange={() => setPaymentMethod(id)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className={`p-2 rounded-xl ${paymentMethod === id ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${paymentMethod === id ? 'text-emerald-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <span className={`font-bold text-sm ${paymentMethod === id ? 'text-emerald-800' : 'text-gray-700'}`}>{label}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                      </div>
                    </label>
                    {paymentMethod === 'upi' && id === 'upi' && currentStep === 'payment' && (
                      <div className="mt-2 ml-4 animate-fade-in">
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">UPI ID</label>
                        <input 
                          type="text" 
                          placeholder="Enter UPI ID (e.g. name@okhdfc)" 
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                      </div>
                    )}
                    {paymentMethod === 'card' && id === 'card' && currentStep === 'payment' && (
                      <div className="mt-2 ml-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Card Number</label>
                            <input type="text" placeholder="Card Number" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Expiry Date</label>
                            <input type="text" placeholder="MM / YY" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">CVV</label>
                            <input type="text" placeholder="CVV" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-5">Order Summary</h3>

              {/* Items with MRP */}
              <div className="space-y-3 mb-5 max-h-52 overflow-y-auto hide-scrollbar pr-1">
                {cart.map(item => {
                  const product = products.find(p => p._id === item.id);
                  const savings = product ? Math.round(((product.mrp - product.normalPrice) / product.mrp) * 100) : 0;
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="font-bold text-emerald-700 text-xs">₹{item.price}</span>
                          {product && product.mrp > item.price && (
                            <span className="text-xs text-gray-400 line-through">MRP: ₹{product.mrp}</span>
                          )}
                          {savings > 0 && (
                            <span className="text-xs bg-rose-100 text-rose-600 font-bold px-1 rounded">Save {savings}%</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-emerald-700 text-sm flex-shrink-0">₹{item.price * item.quantity}</div>
                    </div>
                  );
                })}
              </div>

              {/* Total Savings Display */}
              {totalSavings > 0 && (
                <div className="mb-4 p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-700 font-semibold">Total Savings</span>
                    <span className="font-bold text-emerald-800">₹{totalSavings}</span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">You saved ₹{totalSavings} compared to MRP!</p>
                </div>
              )}

              {/* Coupon */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Coupon Code
                </p>
                {couponApplied ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold text-sm">{coupon.toUpperCase()} applied!</span>
                    <button
                      type="button"
                      onClick={() => { setCouponApplied(false); setCoupon(''); }}
                      className="ml-auto text-xs text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon (try BOXAIO10)"
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleCoupon}
                      className="px-4 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-semibold">Coupon Discount</span>
                    <span className="font-bold text-emerald-600">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST (5%)</span>
                  <span className="font-medium text-gray-900">₹{gst}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 pb-3 border-b border-gray-100">
                  <span>Shipping</span>
                  <span className={`font-bold ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-900 text-lg">Total</span>
                  <span className="font-extrabold text-emerald-700 text-2xl">₹{total}</span>
                </div>
              </div>

              {/* Schedule Summary */}
              {deliverySlot.date && deliverySlot.time && (
                <div className="mb-4 p-3 bg-amber-50 rounded-xl text-xs">
                  <p className="font-semibold text-amber-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Scheduled Delivery
                  </p>
                  <p className="text-amber-700 mt-1">
                    {formatDate(deliverySlot.date)} between {deliverySlot.time}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={currentStep !== 'payment'}
                className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                  currentStep === 'payment'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:shadow-xl hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShieldCheck className="w-5 h-5" /> Place Order Securely
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-3">
                By placing this order you agree to our{' '}
                <span className="text-emerald-600 hover:underline cursor-pointer">Terms & Conditions</span>
              </p>

              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>256-bit SSL Encrypted &bull; PCI DSS Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Products */}
        {suggestedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">You might also like</h3>
              </div>
              <Link href="/products" className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestedProducts.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isWishlisted={isInWishlist(product._id)}
                  onToggleWishlist={() => toggleWishlist(product)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PAN Card Modal */}
      {showPanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPanModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">PAN Card Required</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              As per government regulations, PAN card details are required for orders above ₹5000.
            </p>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">PAN Card Number</label>
            <input
              type="text"
              value={panCard}
              onChange={e => setPanCard(e.target.value.toUpperCase())}
              placeholder="Enter your PAN card number"
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPanModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePanSubmit}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
              >
                Submit & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}