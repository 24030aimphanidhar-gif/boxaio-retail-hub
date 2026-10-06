import {appStorage} from '@/api/storage';
import type { Ledger, CheckoutRecord, Balance } from "./types";
const KEY = "boxaio_checkout_v1";
export function activeCheckoutAccount() {
  try {
    const u = JSON.parse(appStorage.getItem("boxaio_user") || "null");
    return u && u.role !== "guest" ? u.email : "guest";
  } catch {
    return "guest";
  }
}
export function readLedger(): Ledger {
  if (typeof localStorage === "undefined") return { attempts: {}, orders: [], balances: {} };
  const raw = appStorage.getItem(KEY);
  if (!raw) return { attempts: {}, orders: [], balances: {} };
  const value = JSON.parse(raw);
  if (value && Array.isArray(value.orders) && value.attempts && value.balances) return value;
  throw Error("Checkout storage is invalid. Existing records were preserved.");
}
export function releaseCheckout(id: string) {
  const ledger = readLedger();
  const order = ledger.orders.find((o) => o.id === id);
  if (!order || order.cancelled) return;
  const b = balanceFor(order.account, ledger);
  ledger.balances[order.account] = {
    points: b.points + order.quote.points,
    wallet: b.wallet + order.quote.wallet,
    credit: b.credit + (order.input.payment === "Retailer credit" ? order.quote.total : 0),
  };
  order.cancelled = true;
  writeLedger(ledger);
}
export function writeLedger(value: Ledger) {
  appStorage.setItem(KEY, JSON.stringify(value));
  window.dispatchEvent(new Event("boxaio-checkout"));
}
export function checkoutOrders() {
  return readLedger().orders;
}
export function balanceFor(account: string, ledger = readLedger()): Balance {
  return ledger.balances[account] || { points: 500, wallet: 1000, credit: 50000 };
}
export function customerProjection(record: CheckoutRecord) {
  const { quote: q, input: i } = record;
  return {
    id: record.id,
    date: record.createdAt,
    status: record.cancelled ? ("Cancelled" as const) : ("Processing" as const),
    items: q.items.map((l) => ({
      productId: l.productId,
      name: l.name,
      quantity: l.quantity,
      price: l.unitPrice,
      image: l.image,
      unit: l.unit,
      type: (l.variant === "normal" ? "normal" : "bulk") as "normal" | "bulk",
    })),
    subtotal: q.subtotal,
    discount: q.promotion + q.couponDiscount + q.points + q.wallet,
    shipping: q.deliveryCharge,
    total: q.total,
    address: [
      i.address.name,
      i.address.street,
      i.address.line2,
      i.address.city,
      i.address.state,
      i.address.pincode,
    ]
      .filter(Boolean)
      .join(", "),
    deliveryDate: q.delivery.date,
    slot: i.slot,
    payment: i.payment,
    checkout: record,
  };
}
export function wholesaleProjection(record: CheckoutRecord) {
  const { quote: q, input: i } = record;
  return {
    id: record.id,
    retailerEmail: i.account,
    placedAt: record.createdAt,
    items: q.items.map((l) => ({
      productId: l.productId,
      name: l.name,
      image: l.image,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      unit: l.unit,
      distributorId: l.sellerId,
      distributor: l.seller,
      variantId: l.variant,
      baseUnits: l.stockUnits,
      freeDelivery: l.freeDelivery,
    })),
    subtotal: q.subtotal,
    discount: q.promotion + q.couponDiscount + q.points + q.wallet,
    deliveryFee: q.deliveryCharge,
    total: q.total,
    status: "placed" as const,
    paymentMethod: i.payment === "Retailer credit" ? ("Credit (30 days)" as const) : i.payment,
    deliveryAddress: [
      i.address.name,
      i.address.street,
      i.address.line2,
      i.address.city,
      i.address.state,
      i.address.pincode,
    ]
      .filter(Boolean)
      .join(", "),
    checkout: record,
  };
}
export function downloadCheckoutInvoice(o: CheckoutRecord) {
  const i = o.input,
    q = o.quote;
  const content = [
    "BOXAIO | DEMO INVOICE",
    o.id,
    "Transaction: " + o.transactionId,
    "Payment: " + o.paymentStatus,
    ...q.items.map(
      (l) =>
        `${l.name} | ${l.seller} | ${l.quantity} x ${l.unit} | INR ${(l.unitPrice * l.quantity).toFixed(2)}`
    ),
    `Item subtotal before discounts: INR ${q.listSubtotal.toFixed(2)}`,
    `Product savings: INR ${q.productDiscount.toFixed(2)}`,
    `Promotion: INR ${q.promotion.toFixed(2)}`,
    `Coupon ${i.coupon}: INR ${q.couponDiscount.toFixed(2)}`,
    `Mock GST included: INR ${q.gstIncluded.toFixed(2)}`,
    `Delivery: INR ${q.deliveryCharge.toFixed(2)}`,
    `Points: INR ${q.points.toFixed(2)}`,
    `Wallet: INR ${q.wallet.toFixed(2)}`,
    `Final payable: INR ${q.total.toFixed(2)}`,
    "Ship to: " + [i.address.name, i.address.street, i.address.city, i.address.pincode].join(", "),
    "Bill to: " + [i.billing.name, i.billing.street, i.billing.city, i.billing.pincode].join(", "),
    "Delivery: " + q.delivery.date + " / " + i.slot,
    "Demo invoice only. No real payment or tax invoice was generated.",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = o.id + "-demo-invoice.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
