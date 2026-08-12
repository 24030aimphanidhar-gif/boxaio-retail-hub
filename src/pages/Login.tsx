import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { homeRouteForRole, useAuth } from '../context/AuthContext';
import { ShoppingBag, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, guestLogin } = useAuth();
  const [, navigate] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const signedIn = login(email, password);
      toast.success(
        signedIn.role === 'retailer' ? 'Welcome back to your store dashboard!' : 'Welcome back!',
      );
      navigate(signedIn.role === 'customer' ? '/dashboard' : homeRouteForRole(signedIn.role));
    }
  };

  const handleGuestLogin = () => {
    guestLogin();
    toast.success("Logged in as guest");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md rounded-3xl p-8 bg-white/80 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-1">Sign in to your Boxaio account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="email" 
              required
              placeholder="Email address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/50"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="password" 
              required
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/50"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-emerald-600 font-medium hover:underline">Forgot password?</a>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:brightness-110 transition-all">
            Sign In
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-sm text-gray-400 font-medium uppercase">Or continue with</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <button onClick={handleGuestLogin} className="w-full mt-6 border-2 border-emerald-500 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors">
          Continue as Guest
        </button>

        <p className="text-center mt-8 text-sm text-gray-600">
          Don't have an account? <Link href="/register" className="text-emerald-600 font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
