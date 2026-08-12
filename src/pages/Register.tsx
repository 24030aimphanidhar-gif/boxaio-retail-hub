import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Store, ShoppingBag, Mail, Lock, Phone, MapPin, Building2, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';

export function Register() {
  const [userType, setUserType] = useState<'consumer' | 'retailer'>('consumer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    businessName: '', gstNumber: '', address: '',
  });

  const { register: registerAuth } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const created = registerAuth(formData, userType);
    toast.success('Account created successfully! Welcome to Boxaio.');
    navigate(created.role === 'retailer' ? '/retailer' : '/dashboard');
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const benefits = [
    'Exclusive member-only deals & offers',
    'Free delivery on orders above ₹500',
    'Real-time order tracking',
    'Easy returns & refunds',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 pt-16 pb-16 flex items-start md:items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">

        {/* Left panel — visible on desktop */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-emerald-700 to-teal-800 rounded-3xl p-10 text-white w-80 flex-shrink-0 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-teal-300" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 border border-white/30">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold mb-2">Join Boxaio</h2>
            <p className="text-emerald-100 text-sm mb-8 leading-relaxed">
              India's premium grocery marketplace with bulk pricing for everyone.
            </p>
            <div className="space-y-3">
              {benefits.map(b => (
                <div key={b} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 bg-emerald-500/30 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-400/30">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-emerald-100">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Start saving on premium groceries today</p>
          </div>

          {/* Account Type */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { type: 'consumer' as const, icon: UserCircle, label: 'Consumer', sub: 'Personal & home use' },
              { type: 'retailer' as const, icon: Store, label: 'Retailer / B2B', sub: 'Wholesale bulk ordering' },
            ].map(({ type, icon: Icon, label, sub }) => (
              <button
                key={type}
                type="button"
                onClick={() => setUserType(type)}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  userType === type
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-gray-200 hover:border-emerald-200'
                }`}
              >
                <Icon className={`w-7 h-7 ${userType === type ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${userType === type ? 'text-emerald-700' : 'text-gray-700'}`}>{label}</span>
                <span className="text-xs text-gray-400 text-center leading-tight">{sub}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type-specific fields */}
            {userType === 'consumer' ? (
              <div className="relative">
                <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  required
                  name="name"
                  onChange={handleInput}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    required
                    name="businessName"
                    onChange={handleInput}
                    placeholder="Business / Shop Name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all"
                  />
                </div>
                <div className="relative">
                  <input
                    required
                    name="gstNumber"
                    onChange={handleInput}
                    placeholder="GST Number (e.g. 29ABCDE1234F1Z5)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all font-mono uppercase"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  required
                  type="email"
                  name="email"
                  onChange={handleInput}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  required
                  type="tel"
                  name="phone"
                  onChange={handleInput}
                  placeholder="Phone Number"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  onChange={handleInput}
                  placeholder="Password (min 6 chars)"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="confirm"
                  onChange={handleInput}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
              <textarea
                required
                name="address"
                onChange={handleInput}
                placeholder={userType === 'retailer' ? 'Business Address' : 'Delivery Address'}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all resize-none h-20"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded border-gray-300" />
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree to Boxaio's{' '}
                <span className="text-emerald-600 hover:underline font-medium">Terms of Service</span> and{' '}
                <span className="text-emerald-600 hover:underline font-medium">Privacy Policy</span>. I consent to receiving order updates via SMS and email.
              </span>
            </label>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold py-4 rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all text-base"
              data-testid="button-register-submit"
            >
              Create Account
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
