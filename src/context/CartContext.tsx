import {appStorage} from '@/api/storage';
import type { CheckoutRecord } from "@/features/checkout/types";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../data/products";

interface CartItem {
  id: string; // unique id combining productId and type
  productId: string;
  name: string;
  price: number;
  quantity: number;
  type: "normal" | "bulk";
  image: string;
  unit: string;
  category: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, type: "normal" | "bulk") => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  consumeOrder: (order: CheckoutRecord) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = appStorage.getItem("boxaio_cart");
      if (stored) setCart(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    appStorage.setItem("boxaio_cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = (product: Product, quantity: number, type: "normal" | "bulk") => {
    const id = `${product._id}_${type}`;
    if (!product.inStock || !Number.isFinite(quantity) || quantity < 1) return;
    quantity = Math.min(99, Math.floor(quantity));
    const price = type === "normal" ? product.normalPrice : product.bulkPrice;
    const unit = type === "normal" ? product.normalUnit : product.bulkUnit;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item
        );
      }
      return [
        ...prev,
        {
          id,
          productId: product._id,
          name: product.name,
          price,
          quantity,
          type,
          image: product.image,
          unit,
          category: product.mainCategory,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (!Number.isFinite(qty) || qty < 1) return;
    qty = Math.min(99, Math.floor(qty));
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item)));
  };

  const clearCart = () => setCart([]);
  const getCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        consumeOrder: (order) => {
          const marker = "boxaio_consumed_" + order.id;
          if (!hydrated || !cart.length || appStorage.getItem(marker)) return;
          const next = cart
            .map((i) => ({
              ...i,
              quantity: Math.max(
                0,
                i.quantity - (order.quote.items.find((l) => l.key === i.id)?.quantity || 0)
              ),
            }))
            .filter((i) => i.quantity > 0);
          appStorage.setItem("boxaio_cart", JSON.stringify(next));
          appStorage.setItem(marker, "1");
          setCart(next);
        },
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within CartProvider");
  return context;
}
