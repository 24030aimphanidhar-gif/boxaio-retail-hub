import {appStorage} from '@/api/storage';
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
const event = "boxaio-wholesale-saved";
export function useSavedWholesale() {
  const { user } = useAuth();
  const key = "boxaio_wholesale_saved_" + (user?.email || "guest");
  const [ids, setIds] = useState<string[]>([]);
  const read = useCallback(() => {
    try {
      const value = JSON.parse(appStorage.getItem(key) || "[]");
      setIds(Array.isArray(value) ? value.filter((v) => typeof v === "string") : []);
    } catch {
      setIds([]);
    }
  }, [key]);
  useEffect(() => {
    read();
    window.addEventListener(event, read);
    return () => window.removeEventListener(event, read);
  }, [read]);
  function toggle(id: string) {
    let stored: string[] = [];
    try {
      const value = JSON.parse(appStorage.getItem(key) || "[]");
      stored = Array.isArray(value) ? value : [];
    } catch {}
    const next = stored.includes(id) ? stored.filter((x) => x !== id) : [...stored, id];
    appStorage.setItem(key, JSON.stringify(next));
    setIds(next);
    window.dispatchEvent(new Event(event));
    return next.includes(id);
  }
  return { ids, has: (id: string) => ids.includes(id), toggle };
}
