import {appStorage} from '@/api/storage';
import { useEffect, useState } from "react";
/** Browser-backed state reads the stored value before the first write. */
export function useStoredState<T>(key: string, fallback: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = appStorage.getItem(key);
      if (saved) return JSON.parse(saved) as T;
    } catch {}
    return typeof fallback === "function" ? (fallback as () => T)() : fallback;
  });
  useEffect(() => {
    appStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}
