import {appStorage} from '@/api/storage';
import type { CheckoutRecord } from "@/features/checkout/types";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { B2BOrderItem, B2BProduct, DistributorOffer } from "./types";
import { getB2BProduct } from "./service";
import { availableOffers, quoteProduct, validateCombinedStock, orderTotals } from "./pricing";
export interface B2BCartItem {
  key: string;
  productId: string;
  name: string;
  image: string;
  unit: string;
  quantity: number;
  price: number;
  moq: number;
  increment: number;
  max: number;
  offer?: string;
  distributorId: string;
  distributorName: string;
  variantId: string;
  freeDelivery: boolean;
  discountPct: number;
  error: string;
}
interface CartContext {
  items: B2BCartItem[];
  addBulkToCart: (
    p: B2BProduct,
    qty: number,
    offer?: DistributorOffer,
    variantId?: string
  ) => boolean;
  setQuantity: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  consumeOrder: (order: CheckoutRecord) => void;
  count: number;
  subtotal: number;
  toOrderItems: () => B2BOrderItem[];
}
const Context = createContext<CartContext | undefined>(undefined);
const orderItem = (i: B2BCartItem): B2BOrderItem => ({
  productId: i.productId,
  name: i.name,
  image: i.image,
  unit: i.unit,
  unitPrice: i.price,
  quantity: i.quantity,
  distributor: i.distributorName,
  distributorId: i.distributorId,
  variantId: i.variantId,
  freeDelivery: i.freeDelivery,
  discountPct: i.discountPct,
});
function materialize(raw: Partial<B2BCartItem>): B2BCartItem | null {
  const p = getB2BProduct(raw.productId || "");
  if (!p) return null;
  const offer = raw.distributorId
    ? p.offers.find((o) => o.distributorId === raw.distributorId)
    : availableOffers(p)[0];
  if (!offer) return null;
  const variantId = raw.variantId || "standard";
  const q = quoteProduct(p, offer, variantId, raw.quantity);
  return {
    key: `${p.id}::${offer.distributorId}::${variantId}`,
    productId: p.id,
    name: p.name,
    image: p.image,
    unit: q.variant.label,
    quantity: q.quantity,
    price: q.unitPrice,
    moq: q.variant.moq,
    increment: q.variant.increment,
    max: q.max,
    distributorId: offer.distributorId,
    distributorName: offer.distributorName,
    variantId,
    freeDelivery: offer.freeDelivery,
    discountPct: q.discountPct,
    error: q.error,
  };
}
export function B2BCartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = "boxaio_b2b_cart_" + (user?.email || "guest");
  const [items, setItems] = useState<B2BCartItem[]>([]);
  const current = useRef<B2BCartItem[]>([]);
  const [loaded, setLoaded] = useState("");
  useEffect(() => {
    let rows: B2BCartItem[] = [];
    try {
      rows = (JSON.parse(appStorage.getItem(key) || "[]") as Partial<B2BCartItem>[])
        .map(materialize)
        .filter((i): i is B2BCartItem => !!i);
    } catch {}
    current.current = rows;
    setItems(rows);
    setLoaded(key);
  }, [key]);
  function commit(rows: B2BCartItem[]) {
    if (loaded !== key) return false;
    try {
      appStorage.setItem(key, JSON.stringify(rows));
      current.current = rows;
      setItems(rows);
      return true;
    } catch {
      toast.error("Could not save your basket. Please allow browser storage.");
      return false;
    }
  }
  function checked(rows: B2BCartItem[]) {
    try {
      validateCombinedStock(rows.map(orderItem), getB2BProduct);
      return commit(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Check your quantities");
      return false;
    }
  }
  function addBulkToCart(
    p: B2BProduct,
    qty: number,
    offer?: DistributorOffer,
    variantId = "standard"
  ) {
    const supplier = offer || availableOffers(p)[0];
    if (!supplier) {
      toast.error("No available supplier for this product");
      return false;
    }
    const id = `${p.id}::${supplier.distributorId}::${variantId}`;
    const old = current.current.find((i) => i.key === id);
    const line = materialize({
      productId: p.id,
      quantity: (old?.quantity || 0) + qty,
      distributorId: supplier.distributorId,
      variantId,
    });
    if (!line) return false;
    return checked([...current.current.filter((i) => i.key !== id), line]);
  }
  function setQuantity(id: string, qty: number) {
    const rows = current.current.map((i) =>
      i.key === id ? materialize({ ...i, quantity: qty })! : i
    );
    checked(rows);
  }
  const total = orderTotals(items.map(orderItem));
  return (
    <Context.Provider
      value={{
        items,
        addBulkToCart,
        setQuantity,
        removeItem: (id) => {
          commit(current.current.filter((i) => i.key !== id));
        },
        clearCart: () => {
          commit([]);
        },
        consumeOrder: (order) => {
          const marker = "boxaio_consumed_" + order.id;
          if (appStorage.getItem(marker)) return;
          const next = current.current
            .map((i) => ({
              ...i,
              quantity: Math.max(
                0,
                i.quantity - (order.quote.items.find((l) => l.key === i.key)?.quantity || 0)
              ),
            }))
            .filter((i) => i.quantity > 0);
          if (commit(next)) appStorage.setItem(marker, "1");
        },
        count: items.reduce((s, i) => s + i.quantity, 0),
        subtotal: total.subtotal,
        toOrderItems: () => current.current.map(orderItem),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useB2BCart() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Bulk cart provider required");
  return ctx;
}
