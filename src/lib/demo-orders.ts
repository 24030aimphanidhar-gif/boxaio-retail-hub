import { cancelConfirmedOrder } from "@/api/checkout";
import { appStorage } from "@/api/storage";
import { mockData } from "@/api/bootstrap-data";
import {
  checkoutOrders,
  customerProjection,
  releaseCheckout,
  downloadCheckoutInvoice,
  activeCheckoutAccount,
} from "@/features/checkout/storage";
import type { CheckoutRecord } from "@/features/checkout/types";
import { products } from "../data/products";
export interface DemoOrder {
  checkout?: CheckoutRecord;
  id: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    unit: string;
    type: "normal" | "bulk";
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: string;
  deliveryDate: string;
  slot: string;
  payment: string;
}
const KEY = "boxaio_customer_orders_v2";
function legacyReadOrders(): DemoOrder[] {
  try {
    const saved = appStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* Start with demo records if storage is corrupted. */
  }
  return structuredClone(mockData.customerOrders) as DemoOrder[];
}
export function readOrders(): DemoOrder[] {
  const account = activeCheckoutAccount();
  const legacy = legacyReadOrders().filter((o) => !o.checkout || o.checkout.account === account);
  return [
    ...checkoutOrders()
      .filter(
        (o) => o.mode === "consumer" && o.account === account && !legacy.some((l) => l.id === o.id)
      )
      .map(customerProjection),
    ...legacy,
  ];
}
export function saveOrders(orders: DemoOrder[]) {
  appStorage.setItem(KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("boxaio-orders"));
}
export function createOrder(order: Omit<DemoOrder, "id" | "date" | "status">) {
  const next: DemoOrder = {
    ...order,
    id: "BX-" + Date.now().toString(36).toUpperCase(),
    date: new Date().toISOString(),
    status: "Processing",
  };
  saveOrders([next, ...readOrders()]);
  return next;
}
export async function cancelOrder(id: string) {
  const target = readOrders().find((o) => o.id === id && o.status === "Processing");
  if (target?.checkout) await cancelConfirmedOrder(id);
  saveOrders(
    readOrders().map((o) =>
      o.id === id && o.status === "Processing" ? { ...o, status: "Cancelled" } : o
    )
  );
}
export function downloadInvoice(order: DemoOrder) {
  if (order.checkout) return downloadCheckoutInvoice(order.checkout);
  const text = [
    "BOXAIO — DEMO ORDER RECEIPT",
    order.id,
    new Date(order.date).toLocaleString(),
    "",
    ...order.items.map(
      (i) => `${i.name} (${i.unit}) × ${i.quantity} = INR ${(i.price * i.quantity).toFixed(2)}`
    ),
    "",
    `Subtotal: INR ${order.subtotal.toFixed(2)}`,
    `Discount: INR ${order.discount.toFixed(2)}`,
    `Delivery: INR ${order.shipping.toFixed(2)}`,
    `Total: INR ${order.total.toFixed(2)}`,
    "",
    `Deliver to: ${order.address}`,
    `Payment: ${order.payment}`,
    "Mock transaction. No payment was collected.",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = order.id + "-receipt.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const money = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
