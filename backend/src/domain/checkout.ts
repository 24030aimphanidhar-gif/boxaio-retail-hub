import { products } from "./catalogue";
import { getB2BProduct } from "./catalogue";
import {
  availableOffers,
  quoteProduct,
  roundMoney,
  validateCombinedStock,
} from "./pricing";
import { getDistributor } from "./distributors";
import { validateAddress } from "./addresses";
import { readLedger, writeLedger, balanceFor } from "./ledger";
import type {
  CheckoutInput,
  CheckoutLine,
  CheckoutMode,
  DeliveryChoice,
  Ledger,
  Quote,
  PaymentMethod,
  Address,
  Attempt,
  CheckoutRecord,
} from "./types";
export const PAYMENTS: PaymentMethod[] = [
  "UPI",
  "Card",
  "Net banking",
  "Wallet",
  "Cash on delivery",
  "Pay later",
  "Retailer credit",
  "Bank transfer",
];
export { COUPONS } from "./catalogue";
import { COUPONS } from "./catalogue";
export function day(offset = 0, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function reprice(
  mode: CheckoutMode,
  lines: CheckoutLine[],
): CheckoutLine[] {
  if (!lines.length) throw Error("Your basket is empty.");
  const fresh = lines.map((line) => {
    if (!Number.isInteger(line.quantity) || line.quantity < 1)
      throw Error("Check product quantities.");
    const p = products.find((p) => p._id === line.productId);
    if (!p) throw Error("A product is no longer available.");
    if (mode === "consumer") {
      if (!p.inStock || line.quantity > 99)
        throw Error(p.name + " is unavailable in that quantity.");
      const bulk = line.variant === "bulk";
      const price = bulk ? p.bulkPrice : p.normalPrice;
      return {
        ...line,
        name: p.name,
        image: p.image,
        unit: bulk ? p.bulkUnit : p.normalUnit,
        unitPrice: price,
        listPrice: bulk ? price : Math.max(p.mrp, price),
        category: p.mainCategory,
        sellerId: "boxaio-fresh",
        seller: "Boxaio Fresh Mart",
        stockUnits: line.quantity,
        gstRate: 5,
        freeDelivery: false,
      };
    }
    const product = getB2BProduct(line.productId)!;
    const offer = availableOffers(product).find(
      (o) => o.distributorId === line.sellerId,
    );
    if (!offer) throw Error("Selected distributor is unavailable.");
    const q = quoteProduct(product, offer, line.variant, line.quantity);
    if (q.error) throw Error(p.name + ": " + q.error);
    return {
      ...line,
      name: p.name,
      image: p.image,
      unit: q.variant.label,
      unitPrice: q.unitPrice,
      listPrice: q.listPrice,
      category: p.mainCategory,
      seller: offer.distributorName,
      stockUnits: q.baseUnits,
      gstRate: 5,
      freeDelivery: offer.freeDelivery,
    };
  });
  if (mode === "wholesale")
    validateCombinedStock(
      fresh.map((l) => ({
        productId: l.productId,
        distributorId: l.sellerId,
        variantId: l.variant,
        quantity: l.quantity,
        name: l.name,
        image: l.image,
        unit: l.unit,
        unitPrice: l.unitPrice,
      })),
      getB2BProduct,
    );
  return fresh;
}
function distance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const r = Math.PI / 180;
  const v =
    Math.sin(((b.lat - a.lat) * r) / 2) ** 2 +
    Math.cos(a.lat * r) *
      Math.cos(b.lat * r) *
      Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}
export function serviceability(
  mode: CheckoutMode,
  lines: CheckoutLine[],
  address: Address,
) {
  const errors: string[] = [];
  if (mode === "consumer") {
    const zones: [string, string][] = [
      ["Vijayawada", "520"],
      ["Hyderabad", "500"],
      ["Guntur", "522"],
      ["Bangalore", "560"],
      ["Bengaluru", "560"],
      ["Gudivada", "521"],
      ["Machilipatnam", "521"],
    ];
    if (
      !zones.some(
        ([city, pin]) =>
          address.city.toLowerCase() === city.toLowerCase() &&
          address.pincode.startsWith(pin),
      )
    )
      errors.push(
        "Boxaio Fresh Mart does not deliver to this city/PIN in the demo. Choose a supported address or store pickup.",
      );
  } else
    for (const id of new Set(lines.map((l) => l.sellerId))) {
      const d = getDistributor(id);
      if (!d) {
        errors.push("Supplier not found.");
        continue;
      }
      if (address.lat !== undefined && address.lng !== undefined) {
        if (
          distance(
            { lat: address.lat, lng: address.lng },
            { lat: d.latitude, lng: d.longitude },
          ) > d.serviceRadius
        )
          errors.push(
            d.name +
              " is outside its " +
              d.serviceRadius +
              " km delivery area.",
          );
      } else if (
        address.city.toLowerCase() !== "vijayawada" ||
        !address.pincode.startsWith("520")
      )
        errors.push(
          d.name + " serves Vijayawada 520xxx PIN areas in this demo.",
        );
    }
  return errors;
}
export function deliveries(
  mode: CheckoutMode,
  lines: CheckoutLine[],
  address: Address,
  now = new Date(),
): DeliveryChoice[] {
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const fee =
    mode === "consumer"
      ? subtotal > 500
        ? 0
        : 50
      : subtotal > 5000 || lines.every((l) => l.freeDelivery)
        ? 0
        : 199;
  const slots = ["09:00–12:00", "12:00–15:00", "15:00–18:00", "18:00–21:00"];
  const sameSlots = slots.filter(
    (s) => Number(s.slice(0, 2)) > now.getHours() + 1,
  );
  const supported = serviceability(mode, lines, address).length === 0;
  const single = new Set(lines.map((l) => l.sellerId)).size === 1;
  const rows: DeliveryChoice[] = supported
    ? [
        {
          id: "standard",
          label: "Standard delivery",
          date: day(2, now),
          charge: fee,
          cutoff: "Daily, 23:59",
          slots,
          pickup: false,
        },
        {
          id: "scheduled",
          label: "Scheduled delivery",
          date: day(2, now),
          charge: fee,
          cutoff: "Book at least 2 days ahead",
          slots,
          pickup: false,
        },
      ]
    : [];
  if (supported && now.getHours() < 20)
    rows.splice(1, 0, {
      id: "next",
      label: "Next-day delivery",
      date: day(1, now),
      charge: fee + 29,
      cutoff: "Today, 20:00",
      slots,
      pickup: false,
    });
  if (supported && single && now.getHours() < 14 && sameSlots.length)
    rows.splice(0, 0, {
      id: "same",
      label: "Same-day delivery",
      date: day(0, now),
      charge: fee + 79,
      cutoff: "Today, 14:00",
      slots: sameSlots,
      pickup: false,
    });
  if (single)
    rows.push({
      id: "pickup",
      label: "Store pickup",
      date: day(now.getHours() >= 16 ? 1 : 0, now),
      charge: 0,
      cutoff: "Pickup desk closes at 18:00",
      slots:
        now.getHours() >= 16
          ? slots.slice(0, 3)
          : slots
              .slice(0, 3)
              .filter((s) => Number(s.slice(0, 2)) > now.getHours()),
      pickup: true,
    });
  return rows.filter((r) => r.slots.length);
}
export function checkStock(items: CheckoutLine[], ledger: Ledger) {
  const requests = new Map<string, number>();
  for (const line of items) {
    const key = line.productId + "::" + line.sellerId;
    requests.set(key, (requests.get(key) || 0) + line.stockUnits);
  }
  for (const [key, amount] of requests) {
    const [id, seller] = key.split("::");
    const p = getB2BProduct(id);
    const stock =
      seller === "boxaio-fresh"
        ? 500
        : p?.offers.find((o) => o.distributorId === seller)?.stock || 0;
    const reserved = ledger.orders
      .filter((o) => !o.cancelled)
      .flatMap((o) => o.quote.items)
      .filter((l) => l.productId === id && l.sellerId === seller)
      .reduce((s, l) => s + l.stockUnits, 0);
    if (amount > stock - reserved)
      throw Error(
        (p?.name || "Product") +
          ": only " +
          Math.max(0, stock - reserved) +
          " base packs remain after existing reservations.",
      );
  }
}
export function calculate(
  input: CheckoutInput,
  ledger = readLedger(),
  now = new Date(),
): Quote {
  const items = reprice(input.mode, input.lines);
  const errors = [
    ...validateAddress(input.address),
    ...validateAddress(input.billing).map((e) => "Billing: " + e),
  ];
  const delivery = deliveries(input.mode, items, input.address, now).find(
    (d) => d.id === input.deliveryId,
  );
  if (!delivery) errors.push("Choose an available delivery option.");
  const selected = delivery || {
    id: "none",
    label: "Unavailable",
    date: "",
    charge: 0,
    cutoff: "",
    slots: [],
    pickup: false,
  };
  if (!selected.pickup)
    errors.push(...serviceability(input.mode, items, input.address));
  if (selected.id === "scheduled") {
    if (input.deliveryDate < day(2, now) || input.deliveryDate > day(14, now))
      errors.push("Choose a scheduled date between 2 and 14 days from today.");
    selected.date = input.deliveryDate;
  }
  if (!selected.slots.includes(input.slot))
    errors.push("Choose an available delivery slot.");
  const reservations = ledger.orders.filter(
    (o) =>
      !o.cancelled &&
      o.quote.delivery.date === selected.date &&
      o.input.slot === input.slot &&
      o.input.deliveryId === input.deliveryId,
  ).length;
  if (reservations >= 5)
    errors.push("This demo delivery slot is full. Choose another slot.");
  try {
    checkStock(items, ledger);
  } catch (e) {
    errors.push((e as Error).message);
  }
  const subtotal = roundMoney(
    items.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
  );
  const listSubtotal = roundMoney(
    items.reduce((s, l) => s + l.listPrice * l.quantity, 0),
  );
  const promotion =
    input.mode === "wholesale" && subtotal > 20000
      ? roundMoney(subtotal * 0.05)
      : 0;
  const code = input.coupon.trim().toUpperCase();
  const coupon = COUPONS.find((c) => c.code === code);
  let couponError = "",
    couponDiscount = 0;
  if (code) {
    if (!coupon) couponError = "Coupon not found.";
    else if (day(0, now) < coupon.start || day(0, now) > coupon.end)
      couponError = "This coupon is outside its validity dates.";
    else if (coupon.mode !== "any" && coupon.mode !== input.mode)
      couponError = "This coupon is not eligible for this account type.";
    else if (
      coupon.first &&
      ledger.orders.some((o) => o.account === input.account && !o.cancelled)
    )
      couponError = "This coupon is for your first checkout only.";
    else if (subtotal < coupon.min)
      couponError = "Minimum order value is ₹" + coupon.min + ".";
    else if (!coupon.payments.includes(input.payment))
      couponError = "Use " + coupon.payments.join(", ") + " with this coupon.";
    else if (
      ledger.orders.filter(
        (o) =>
          o.account === input.account &&
          o.input.coupon.toUpperCase() === code &&
          !o.cancelled,
      ).length >= coupon.limit
    )
      couponError = "Coupon usage limit reached.";
    else if (promotion)
      couponError =
        "Coupons cannot combine with the automatic bulk-order promotion.";
    else {
      const eligible = items
        .filter((l) => !coupon.category || l.category === coupon.category)
        .reduce((s, l) => s + l.unitPrice * l.quantity, 0);
      if (!eligible)
        couponError = "No eligible products/categories in this basket.";
      else
        couponDiscount = roundMoney(
          Math.min(coupon.max, (eligible * coupon.percent) / 100),
        );
    }
  }
  if (couponError) errors.push(couponError);
  const balance = balanceFor(input.account, ledger);
  const beforeRedemption = roundMoney(
    subtotal - promotion - couponDiscount + selected.charge,
  );
  if (!Number.isFinite(input.points) || !Number.isFinite(input.wallet))
    errors.push("Enter valid points and wallet amounts.");
  const points = Number.isFinite(input.points) ? input.points : 0;
  const wallet = Number.isFinite(input.wallet) ? input.wallet : 0;
  if (
    !Number.isInteger(points) ||
    points < 0 ||
    points > Math.min(balance.points, 200, Math.floor(subtotal * 0.2))
  )
    errors.push(
      "Points exceed your balance or the limit of 200 / 20% of the basket.",
    );
  if (points > 0 && coupon && !couponError && !coupon.points)
    errors.push("This coupon cannot combine with loyalty points.");
  if (
    wallet < 0 ||
    wallet > Math.min(balance.wallet, Math.max(0, beforeRedemption - points))
  )
    errors.push(
      "Wallet amount exceeds the available balance or payable amount.",
    );
  const total = roundMoney(Math.max(0, beforeRedemption - points - wallet));
  if (input.payment === "Wallet" && total > 0)
    errors.push(
      "Redeem enough wallet balance to cover the payable amount, or choose another payment method.",
    );
  if (input.payment === "Cash on delivery" && (total > 5000 || selected.pickup))
    errors.push("COD is available for delivered orders up to ₹5,000.");
  if (
    input.payment === "Pay later" &&
    (input.account === "guest" || total > 3000)
  )
    errors.push(
      "Demo Pay later requires a signed-in account and a total up to ₹3,000.",
    );
  if (
    input.payment === "Retailer credit" &&
    (input.mode !== "wholesale" ||
      input.account === "guest" ||
      total > balance.credit)
  )
    errors.push(
      "Retailer credit requires an approved business account with enough available credit.",
    );
  if (!PAYMENTS.includes(input.payment))
    errors.push("Select a payment method.");
  return {
    items,
    listSubtotal,
    subtotal,
    productDiscount: roundMoney(listSubtotal - subtotal),
    promotion,
    couponDiscount,
    couponError,
    points,
    wallet,
    gstIncluded: roundMoney(
      ((subtotal - promotion - couponDiscount) * 5) / 105,
    ),
    deliveryCharge: selected.charge,
    total,
    beforeRedemption,
    delivery: selected,
    errors: [...new Set(errors)],
  };
}
export function fingerprint(input: CheckoutInput) {
  return JSON.stringify(input);
}
export function beginAttempt(
  input: CheckoutInput,
  id: string,
  expectedTotal: number,
): Attempt {
  const ledger = readLedger();
  const existing = ledger.attempts[id];
  if (existing) {
    if (existing.fingerprint !== fingerprint(input))
      throw Error("Checkout details changed. Start a new payment attempt.");
    if (
      existing.status === "confirmed" ||
      existing.status === "pending" ||
      existing.status === "awaiting"
    )
      return existing;
  }
  const quote = calculate(input, ledger);
  if (quote.errors.length) throw Error(quote.errors[0]);
  if (Math.abs(quote.total - expectedTotal) > 0.009)
    throw Error("The payable amount changed. Review the updated summary.");
  const attempt: Attempt = {
    id,
    transactionId:
      existing?.transactionId ||
      "TX-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    fingerprint: fingerprint(input),
    input,
    quote,
    status: "awaiting",
    createdAt: new Date().toISOString(),
  };
  ledger.attempts[id] = attempt;
  writeLedger(ledger);
  return attempt;
}
export function settleAttempt(
  id: string,
  outcome: "success" | "failure" | "pending",
): CheckoutRecord | Attempt {
  const ledger = readLedger();
  const a = ledger.attempts[id];
  if (!a) throw Error("Checkout attempt not found.");
  if (a.status === "confirmed")
    return ledger.orders.find((o) => o.id === a.orderId)!;
  if (a.status === "cancelled") throw Error("This attempt was cancelled.");
  if (outcome !== "success") {
    a.status = outcome === "pending" ? "pending" : "failed";
    a.message =
      outcome === "pending"
        ? "Payment is pending. Check its status before retrying."
        : "Demo payment failed. No order or stock reservation was created.";
    writeLedger(ledger);
    return a;
  }
  const q = calculate(a.input, ledger);
  if (q.errors.length) throw Error(q.errors[0]);
  if (
    q.total !== a.quote.total ||
    q.delivery.date !== a.quote.delivery.date ||
    JSON.stringify(q.items) !== JSON.stringify(a.quote.items)
  )
    throw Error(
      "Price or availability changed. Cancel this attempt and review your basket.",
    );
  const orderId = "BX-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const paymentStatus =
    a.input.payment === "Cash on delivery"
      ? "Due on delivery"
      : a.input.payment === "Retailer credit" || a.input.payment === "Pay later"
        ? "Approved credit (demo)"
        : "Paid (demo)";
  const record: CheckoutRecord = {
    id: orderId,
    attemptId: id,
    transactionId: a.transactionId,
    createdAt: new Date().toISOString(),
    mode: a.input.mode,
    account: a.input.account,
    input: a.input,
    quote: q,
    paymentStatus,
    shipments: [...new Set(q.items.map((l) => l.sellerId))].map(
      (sellerId, index) => ({
        id: orderId + "-S" + (index + 1),
        sellerId,
        seller: q.items.find((l) => l.sellerId === sellerId)!.seller,
        lineKeys: q.items
          .filter((l) => l.sellerId === sellerId)
          .map((l) => l.key),
        date: q.delivery.date,
        slot: a.input.slot,
      }),
    ),
    notification:
      "Order confirmed in your Boxaio account. External messaging is not connected in this demo.",
  };
  const balance = balanceFor(a.input.account, ledger);
  ledger.balances[a.input.account] = {
    points: balance.points - q.points,
    wallet: roundMoney(balance.wallet - q.wallet),
    credit:
      balance.credit - (a.input.payment === "Retailer credit" ? q.total : 0),
  };
  ledger.orders.unshift(record);
  a.status = "confirmed";
  a.orderId = orderId;
  writeLedger(ledger);
  return record;
}
export function cancelAttempt(id: string) {
  const ledger = readLedger();
  const a = ledger.attempts[id];
  if (a && a.status !== "confirmed") {
    a.status = "cancelled";
    writeLedger(ledger);
  }
}
export async function checkoutLock<T>(fn: () => T | Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks)
    return navigator.locks.request("boxaio-checkout-write", fn);
  return fn();
}
