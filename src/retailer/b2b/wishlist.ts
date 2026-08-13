import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";

/** Per-retailer B2B wishlist (product ids), kept separate from the B2C wishlist. */
const EVENT = "boxaio-b2b-wishlist";

export function useB2BWishlist() {
  const { user } = useAuth();
  const key = `boxaio_b2b_wishlist_${user?.email ?? "guest"}`;
  const [ids, setIds] = useState<string[]>([]);

  const read = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      setIds(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setIds([]);
    }
  }, [key]);

  useEffect(() => {
    read();
    const handler = () => read();
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [read]);

  const toggle = useCallback(
    (productId: string) => {
      const next = ids.includes(productId)
        ? ids.filter((id) => id !== productId)
        : [...ids, productId];
      localStorage.setItem(key, JSON.stringify(next));
      setIds(next);
      window.dispatchEvent(new Event(EVENT));
      return next.includes(productId);
    },
    [ids, key],
  );

  return { ids, toggle, has: (id: string) => ids.includes(id) };
}
