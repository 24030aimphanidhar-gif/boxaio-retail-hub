import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';

interface CartItem {
  id: string; // unique id combining productId and type
  productId: string;
  name: string;
  price: number;
  quantity: number;
  type: 'normal' | 'bulk';
  image: string;
  unit: string;
  category: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, type: 'normal' | 'bulk') => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('boxaio_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('boxaio_cart', JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = (product: Product, quantity: number, type: 'normal' | 'bulk') => {
    const id = `${product._id}_${type}`;
    const price = type === 'normal' ? product.normalPrice : product.bulkPrice;
    const unit = type === 'normal' ? product.normalUnit : product.bulkUnit;

    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, {
        id,
        productId: product._id,
        name: product.name,
        price,
        quantity,
        type,
        image: product.image,
        unit,
        category: product.mainCategory
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => setCart([]);
  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within CartProvider');
  return context;
}
