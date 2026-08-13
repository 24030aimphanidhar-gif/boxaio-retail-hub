import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";

import { clampBulkQty, type B2BOrderItem, type B2BProduct } from "./types";

/**
 * B2B (bulk) cart — completely separate from the B2C `CartContext` so the two
 * shopping experiences never mix. Persisted per retailer account.
 */
export interface B2BCartItem {
  productId: string;
  name: string;
  image: string;
  unit: string;
  quantity: number;
  /** Snapshot for display; checkout re-reads the live price. */
  price: number;
  moq: number;
  offer?: string;
}

interface B2BCartContextType {
  items: B2BCartItem[];
  addBulkToCart: (product: B2BProduct, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  toOrderItems: () => B2BOrderItem[];
}

const B2BCartContext = createContext<B2BCartContextType | undefined>(undefined);

export function B2BCartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = `boxaio_b2b_cart_${user?.email ?? "guest"}`;
  const [items, setItems] = useState<B2BCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    try {
      const raw = localStorage.getItem(key);
      setItems(raw ? (JSON.parse(raw) as B2BCartItem[]) : []);
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, key, hydrated]);

  const value = useMemo<B2BCartContextType>(() => {
    const addBulkToCart = (product: B2BProduct, quantity: number) => {
      const qty = clampBulkQty(product, quantity);
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + qty, price: product.b2bPrice }
              : i,
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            image: product.image,
            unit: product.unit,
            quantity: qty,
            price: product.b2bPrice,
            moq: product.moq,
            ...(product.offer ? { offer: product.offer } : {}),
          },
        ];
      });
    };

    return {
      items,
      addBulkToCart,
      setQuantity: (productId, quantity) =>
        setItems((prev) =>
          prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        ),
      removeItem: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
      clearCart: () => setItems([]),
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
      toOrderItems: () =>
        items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          unit: i.unit,
          image: i.image,
        })),
    };
  }, [items]);

  return <B2BCartContext.Provider value={value}>{children}</B2BCartContext.Provider>;
}

export function useB2BCart() {
  const ctx = useContext(B2BCartContext);
  if (!ctx) throw new Error("useB2BCart must be used within B2BCartProvider");
  return ctx;
}
