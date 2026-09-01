/**
 * B2B storefront data service (retailer buying from BOXAIO).
 *
 * Wholesale products are derived live from the shared BOXAIO catalogue, so
 * prices, offers and stock always reflect current values. Only purchase
 * ORDERS are persisted; "My Product Catalogue" is derived from those orders,
 * which guarantees one entry per product (no duplicates) and current pricing.
 *
 * SECURITY NOTE: every read is scoped by retailer email. When this moves to a
 * backend, the same scoping must be enforced server-side — Retailer A must
 * never be able to read Retailer B's orders or catalogue.
 */
import { products as catalogue } from "@/data/products";

import type { B2BOrder, B2BOrderItem, B2BProduct, CatalogueEntry } from "./types";

const ORDERS_KEY = "boxaio_b2b_orders_v1";

function rand(seed: number) {
  const x = Math.sin(seed * 13.37) * 10000;
  return x - Math.floor(x);
}

const OFFERS = [
  "Extra 5% off on 100+ units",
  "Buy 10 get 1 free",
  "Free delivery above ₹5,000",
  "Festive wholesale deal",
];

/** The distributors BOXAIO buys wholesale stock from. Single source of truth. */
export const DISTRIBUTORS = [
  { id: "sai-trade", name: "SAI TRADE" },
  { id: "sgbl", name: "SGBL" },
  { id: "ra-agro", name: "RA AGRO" },
] as const;

export function getDistributor(id: string) {
  return DISTRIBUTORS.find((d) => d.id === id) ?? null;
}

const PACK_SIZES = ["500 Ml", "1 Ltr", "2 Ltr", "5 Ltr", "15 Ltr"];

function buildOffers(index: number, basePrice: number, mrp: number, stock: number) {
  // Deterministic: every product gets 1–3 distributor offers with slightly
  // different pricing so retailers can compare suppliers.
  const count = 1 + Math.floor(rand(index + 21) * 3);
  const start = index % DISTRIBUTORS.length;
  return Array.from({ length: count }, (_, k) => {
    const d = DISTRIBUTORS[(start + k) % DISTRIBUTORS.length]!;
    const price = Math.round((basePrice * (1 + (k - 0.5) * 0.012)) * 100) / 100;
    return {
      distributorId: d.id,
      distributorName: d.name,
      price,
      marginPct: Math.max(2, Math.round(((mrp - price) / Math.max(mrp, 1)) * 100)),
      freeDelivery: rand(index + k + 31) > 0.25,
      stock: Math.max(0, Math.round(stock * (0.6 + rand(index + k + 41) * 0.4))),
      deliveryEstimate: rand(index + k + 51) > 0.5 ? "Tomorrow" : "In 2 days",
    };
  });
}

/** Live wholesale catalogue. Always computed — never cached with a price. */
export const B2B_PRODUCTS: B2BProduct[] = catalogue.map((p, i) => {
  const moq = Math.max(2, p.bulkMinQty || 10);
  const stockBase = Math.floor(rand(i + 3) * 400);
  const stock = p.inStock ? stockBase : 0;
  return {
    id: p._id,
    name: p.name,
    brand: p.brand,
    category: p.mainCategory,
    subCategory: p.subCategory,
    image: p.image,
    b2bPrice: p.bulkPrice,
    mrp: p.mrp,
    unit: p.bulkUnit,
    moq,
    increment: Math.max(1, Math.round(moq / 2)),
    stock,
    sku: `BX-${p._id.replace("prod_", "").toUpperCase()}`,
    ...(rand(i + 11) > 0.72 ? { offer: OFFERS[i % OFFERS.length]! } : {}),
    description: p.description,
    packSizes: [p.bulkUnit, ...PACK_SIZES.filter((s) => s !== p.bulkUnit)].slice(
      0,
      2 + Math.floor(rand(i + 61) * 3),
    ),
    offers: buildOffers(i, p.bulkPrice, p.mrp, stock),
  };
});

const PRODUCT_INDEX = new Map(B2B_PRODUCTS.map((p) => [p.id, p]));

export function getB2BProduct(id: string) {
  return PRODUCT_INDEX.get(id) ?? null;
}

/** Products supplied by a given distributor. */
export function productsByDistributor(distributorId: string) {
  return B2B_PRODUCTS.filter((p) => p.offers.some((o) => o.distributorId === distributorId));
}

export const B2B_CATEGORIES = [...new Set(B2B_PRODUCTS.map((p) => p.category))].sort();


/* ------------------------------------------------------------------ orders */

function seedOrders(): B2BOrder[] {
  const retailers = ["retailer@boxaio.com", "retailer2@boxaio.com"];
  const orders: B2BOrder[] = [];
  let counter = 10231;

  retailers.forEach((email, rIdx) => {
    for (let i = 0; i < 7; i++) {
      const daysAgo = 4 + i * 11;
      const placedAt = new Date(Date.now() - daysAgo * 86400_000);
      const itemCount = 3 + Math.floor(rand(i + rIdx * 5) * 4);
      const items: B2BOrderItem[] = Array.from({ length: itemCount }, (_, k) => {
        // Deliberately overlapping picks so some products repeat across orders
        // and become "frequently purchased".
        const p = B2B_PRODUCTS[(i * 3 + k * (7 + rIdx)) % 24]!;
        return {
          productId: p.id,
          name: p.name,
          quantity: p.moq * (1 + Math.floor(rand(i + k + rIdx) * 3)),
          unitPrice: Math.round(p.b2bPrice * (0.92 + rand(i + k) * 0.1)),
          unit: p.unit,
          image: p.image,
        };
      });
      const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
      const discount = Math.round(subtotal * 0.03);
      orders.push({
        id: `BX${counter++}`,
        retailerEmail: email,
        placedAt: placedAt.toISOString(),
        items,
        subtotal,
        discount,
        deliveryFee: 0,
        total: subtotal - discount,
        status: "delivered",
        paymentMethod: "Credit (30 days)",
        deliveryAddress:
          rIdx === 0
            ? "12-4-88, MG Road, Governorpet, Vijayawada 520002"
            : "Plot 21, Jubilee Hills Road No. 36, Hyderabad 500033",
      });
    }
  });
  return orders;
}

function readOrders(): B2BOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw) as B2BOrder[];
  } catch {
    /* fall through to seeding */
  }
  const seeded = seedOrders();
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(seeded));
  } catch {
    /* storage unavailable — keep in memory for this session */
  }
  return seeded;
}

function writeOrders(rows: B2BOrder[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(rows));
}

const delay = () => new Promise((r) => setTimeout(r, 120));

export async function fetchMyOrders(retailerEmail: string): Promise<B2BOrder[]> {
  await delay();
  return readOrders()
    .filter((o) => o.retailerEmail === retailerEmail)
    .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt));
}

export async function placeB2BOrder(
  retailerEmail: string,
  items: B2BOrderItem[],
  deliveryAddress: string,
): Promise<B2BOrder> {
  await delay();
  const all = readOrders();
  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const discount = subtotal > 20000 ? Math.round(subtotal * 0.05) : 0;
  const order: B2BOrder = {
    id: `BX${10500 + all.length}`,
    retailerEmail,
    placedAt: new Date().toISOString(),
    items,
    subtotal,
    discount,
    deliveryFee: subtotal > 5000 ? 0 : 199,
    total: subtotal - discount + (subtotal > 5000 ? 0 : 199),
    status: "placed",
    paymentMethod: "Credit (30 days)",
    deliveryAddress,
  };
  writeOrders([order, ...all]);
  return order;
}

/**
 * Marking an order delivered is what feeds "My Product Catalogue" — the
 * catalogue is derived from completed orders, so no manual saving is needed.
 */
export async function markOrderDelivered(orderId: string): Promise<void> {
  await delay();
  writeOrders(
    readOrders().map((o) => (o.id === orderId ? { ...o, status: "delivered" as const } : o)),
  );
}

/* --------------------------------------------------------------- catalogue */

/**
 * Builds the retailer's personal catalogue from their completed orders.
 * One entry per product (deduped by productId); pricing/stock come from the
 * live product record, purchase history from the orders.
 */
export async function fetchMyCatalogue(retailerEmail: string): Promise<CatalogueEntry[]> {
  await delay();
  const orders = readOrders()
    .filter((o) => o.retailerEmail === retailerEmail && o.status === "delivered")
    .sort((a, b) => +new Date(a.placedAt) - +new Date(b.placedAt));

  const map = new Map<string, CatalogueEntry>();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const product = getB2BProduct(item.productId);
      if (!product) return; // product retired from BOXAIO
      const existing = map.get(item.productId);
      if (existing) {
        existing.lastPurchasedAt = order.placedAt;
        existing.lastPurchasedQty = item.quantity;
        existing.lastPurchasedPrice = item.unitPrice;
        existing.purchaseCount += 1;
        existing.totalQuantityPurchased += item.quantity;
        return;
      }
      map.set(item.productId, {
        productId: item.productId,
        product,
        lastPurchasedAt: order.placedAt,
        lastPurchasedQty: item.quantity,
        lastPurchasedPrice: item.unitPrice,
        purchaseCount: 1,
        totalQuantityPurchased: item.quantity,
      });
    });
  });

  return [...map.values()];
}

export function frequentlyPurchased(entries: CatalogueEntry[]) {
  return [...entries]
    .sort(
      (a, b) =>
        b.purchaseCount - a.purchaseCount ||
        b.totalQuantityPurchased - a.totalQuantityPurchased,
    )
    .slice(0, 8);
}

export function recentlyPurchased(entries: CatalogueEntry[]) {
  return [...entries]
    .sort((a, b) => +new Date(b.lastPurchasedAt) - +new Date(a.lastPurchasedAt))
    .slice(0, 8);
}
