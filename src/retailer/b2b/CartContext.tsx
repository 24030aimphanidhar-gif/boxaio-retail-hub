import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";

import { clampBulkQty, type B2BOrderItem, type B2BProduct, type DistributorOffer } from "./types";

/**
 * B2B (bulk) cart — completely separate from the B2C `CartContext` so the two
 * shopping experiences never mix. Persisted per retailer account.
 */
export interface B2BCartItem {
  /** Unique line key: product + distributor (same product from two suppliers = two lines). */
  key: string;
  productId: string;
  name: string;
  image: string;
  unit: string;
  quantity: number;
  /** Snapshot for display; checkout re-reads the live price. */
  price: number;
  moq: number;
  offer?: string;
  distributorId?: string;
  distributorName?: string;
}

interface B2BCartContextType {
  items: B2BCartItem[];
  addBulkToCart: (product: B2BProduct, quantity: number, offer?: DistributorOffer) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  toOrderItems: () => B2BOrderItem[];
}

const B2BCartContext = createContext<B2BCartContextType | undefined>(undefined);

const lineKey = (productId: string, distributorId?: string) =>
  distributorId ? `${productId}::${distributorId}` : productId;

export function B2BCartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = `boxaio_b2b_cart_${user?.email ?? "guest"}`;
  const [items, setItems] = useState<B2BCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as B2BCartItem[]) : [];
      // Backwards compatible with carts saved before distributor support.
      setItems(parsed.map((i) => ({ ...i, key: i.key ?? i.productId })));
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
    const addBulkToCart = (product: B2BProduct, quantity: number, offer?: DistributorOffer) => {
      const qty = clampBulkQty(product, quantity);
      const price = offer?.price ?? product.b2bPrice;
      const k = lineKey(product.id, offer?.distributorId);
      setItems((prev) => {
        const existing = prev.find((i) => i.key === k);
        if (existing) {
          return prev.map((i) =>
            i.key === k ? { ...i, quantity: i.quantity + qty, price } : i,
          );
        }
        return [
          ...prev,
          {
            key: k,
            productId: product.id,
            name: product.name,
            image: product.image,
            unit: product.unit,
            quantity: qty,
            price,
            moq: product.moq,
            ...(product.offer ? { offer: product.offer } : {}),
            ...(offer
              ? { distributorId: offer.distributorId, distributorName: offer.distributorName }
              : {}),
          },
        ];
      });
    };

    return {
      items,
      addBulkToCart,
      setQuantity: (k, quantity) =>
        setItems((prev) => prev.map((i) => (i.key === k ? { ...i, quantity } : i))),
      removeItem: (k) => setItems((prev) => prev.filter((i) => i.key !== k)),
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
          ...(i.distributorName ? { distributor: i.distributorName } : {}),
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
