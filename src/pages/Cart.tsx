import { ArrowRight, CheckSquare, Lock, LogIn, ShieldCheck, ShoppingCart, Square, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, isGuest, user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Calculate totals for selected items only
  const getSelectedTotal = () => {
    return cart
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getSelectedCount = () => {
    return cart
      .filter(item => selectedItems.has(item.id))
      .reduce((count, item) => count + item.quantity, 0);
  };

  const subtotal = getSelectedTotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + gst;

  // Toggle individual item selection
  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === cart.length);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.map(item => item.id)));
    }
    setSelectAll(!selectAll);
  };

  // Bulk remove selected items
  const bulkRemoveSelected = () => {
    if (selectedItems.size === 0) {
      toast.error('No items selected');
      return;
    }
    
    selectedItems.forEach(itemId => {
      removeFromCart(itemId);
    });
    
    setSelectedItems(new Set());
    setSelectAll(false);
    toast.success(`Removed ${selectedItems.size} item(s) from cart`);
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to checkout');
      return;
    }

    if (!isAuthenticated || isGuest) {
      toast.error('Please sign in to proceed to checkout', {
        action: { label: 'Sign In', onClick: () => navigate('/login') },
        duration: 5000,
      });
      return;
    }
    
    // Store selected items in session storage for checkout
    sessionStorage.setItem('checkoutItems', JSON.stringify(Array.from(selectedItems)));
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg mb-8">
          <ShoppingCart className="w-16 h-16 text-emerald-200" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Looks like you haven't added anything to your cart yet. Discover our fresh groceries and great deals.
        </p>
        <Link href="/products" className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold py-3 px-8 rounded-full hover:shadow-xl transition-all hover:-translate-y-1">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

      {/* Guest login nudge */}
      {isGuest && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-800 text-sm">You are browsing as a guest</p>
            <p className="text-amber-600 text-xs mt-0.5">Sign in to checkout, save your cart, and access exclusive member deals.</p>
          </div>
          <Link href="/login" className="flex-shrink-0 bg-amber-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-1.5">
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {/* Selection Controls */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors"
            >
              {selectAll ? (
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {selectAll ? 'Deselect All' : 'Select All'}
              </span>
            </button>
            
            {selectedItems.size > 0 && (
              <button
                onClick={bulkRemoveSelected}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove Selected ({selectedItems.size})
              </button>
            )}
          </div>

          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow relative">
              {/* Selection Checkbox */}
              <button
                onClick={() => toggleItemSelection(item.id)}
                className="absolute top-4 left-4 sm:static sm:self-start"
              >
                {selectedItems.has(item.id) ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400 hover:text-emerald-600" />
                )}
              </button>
              
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl flex-shrink-0 border border-gray-100 ml-6 sm:ml-0" />
              <div className="flex-1 text-center sm:text-left min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  {item.type === 'bulk' ? 'Wholesale Pack' : 'Standard Pack'}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mt-2 truncate">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">Unit: {item.unit}</p>
                <div className="font-extrabold text-emerald-700 text-xl">₹{item.price}</div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border border-gray-100">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="font-bold text-gray-900 w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="text-base font-bold text-gray-900">₹{item.price * item.quantity}</div>
                <button
                  onClick={() => {
                    removeFromCart(item.id);
                    if (selectedItems.has(item.id)) {
                      const newSelected = new Set(selectedItems);
                      newSelected.delete(item.id);
                      setSelectedItems(newSelected);
                      setSelectAll(false);
                    }
                  }}
                  className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              clearCart();
              setSelectedItems(new Set());
              setSelectAll(false);
            }}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors mt-2 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Clear entire cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
              {selectedItems.size > 0 && selectedItems.size !== cart.length && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected)
                </span>
              )}
            </h3>

            {selectedItems.size === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No items selected</p>
                <p className="text-sm text-gray-300">Select items from your cart to see order summary</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({getSelectedCount()} items)</span>
                    <span className="font-semibold text-gray-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>GST (5%)</span>
                    <span className="font-semibold text-gray-900">₹{gst}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-bold ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                      You qualify for free shipping (order above ₹500)
                    </p>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Total</span>
                    <span className="font-extrabold text-emerald-700 text-2xl">₹{total}</span>
                  </div>
                </div>

                {/* Selection Info */}
                <div className="mb-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p>Checking out {selectedItems.size} of {cart.length} item(s)</p>
                  <p className="mt-1">Selected items: {cart.filter(item => selectedItems.has(item.id)).map(item => item.name).join(', ')}</p>
                </div>
              </>
            )}

            {/* Auth gate checkout button */}
            {(!isAuthenticated || isGuest) ? (
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <LogIn className="w-5 h-5" /> Sign In to Checkout
                </Link>
                <p className="text-center text-xs text-gray-400">
                  <Link href="/register" className="text-emerald-600 font-semibold hover:underline">Create an account</Link>
                  {' '}to access checkout, order tracking & exclusive deals
                </p>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={selectedItems.size === 0}
                className={`w-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                  selectedItems.size === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-xl hover:-translate-y-0.5'
                }`}
                data-testid="button-proceed-to-checkout"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            )}

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>SSL Encrypted &bull; PCI DSS Compliant checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Truck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Free delivery on orders above ₹500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}