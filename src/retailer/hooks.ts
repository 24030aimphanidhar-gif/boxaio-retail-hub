import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";

import { getStoreForRetailer } from "./data/service";
import type { Store } from "./types";

/**
 * Resolves the store the signed-in retailer is allowed to manage.
 * Every retailer screen reads its storeId from here — never from the URL — so
 * one retailer can't load another retailer's data by editing the address bar.
 */
export function useRetailerSession() {
  const { user, isRetailer, isAdmin } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setStore(null);
      setReady(true);
      return;
    }
    if (!isRetailer && !isAdmin) {
      setStore(null);
      setReady(true);
      return;
    }
    setStore(getStoreForRetailer(user.email, user.storeId) ?? null);
    setReady(true);
  }, [user, isRetailer, isAdmin]);

  const refreshStore = useCallback(() => {
    if (!user) return;
    setStore(getStoreForRetailer(user.email, user.storeId) ?? null);
  }, [user]);

  return { user, store, storeId: store?.id ?? "", ready, isRetailer, isAdmin, refreshStore };
}

/** Small async-data helper with loading/error state and a manual reload. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loader()
      .then((value) => {
        if (alive) {
          setData(value);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : "Something went wrong");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1), setData };
}

export function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
