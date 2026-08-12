/**
 * Retailer data service.
 *
 * Single access point for every retailer screen. Today it persists to
 * localStorage and seeds itself from the shared catalogue in `src/data`.
 * Every function is async and scoped by `storeId`, so the implementation can be
 * replaced with real API / database calls without changing any UI code.
 *
 * SECURITY NOTE: `storeId` scoping here is the client-side half of tenant
 * isolation. When this is moved onto a backend, the same scoping must be
 * enforced server-side (row level security on store_id) — never trust the
 * storeId supplied by the browser.
 */
import { products as catalogue } from "@/data/products";

import {
  canTransition,
  stockStatus,
  type DashboardSummary,
  type Offer,
  type OrderStatus,
  type RetailerCustomer,
  type RetailerNotification,
  type RetailerOrder,
  type RetailerProduct,
  type Review,
  type SalesRange,
  type SalesSummary,
  type Store,
  type StoreHoursDay,
} from "../types";

const DB_KEY = "boxaio_retailer_db_v1";

export interface RetailerDb {
  stores: Store[];
  products: RetailerProduct[];
  orders: RetailerOrder[];
  offers: Offer[];
  customers: RetailerCustomer[];
  reviews: Review[];
  notifications: RetailerNotification[];
}

const DAYS: StoreHoursDay["day"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function defaultHours(): StoreHoursDay[] {
  return DAYS.map((day) => ({
    day,
    closed: day === "Sunday",
    open24h: false,
    opensAt: "07:00",
    closesAt: "22:00",
  }));
}

export const STORES: Store[] = [
  {
    id: "store-vja-01",
    retailerEmail: "retailer@boxaio.com",
    name: "Vijayawada Fresh Mart",
    retailerName: "Ravi Kumar",
    phone: "+91 98490 11223",
    email: "retailer@boxaio.com",
    addressLine: "12-4-88, MG Road, Governorpet",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    pincode: "520002",
    latitude: 16.5062,
    longitude: 80.648,
    deliveryRadiusKm: 8,
    gstNumber: "37ABCDE1234F1Z5",
    status: "OPEN",
    hours: defaultHours(),
  },
  {
    id: "store-hyd-01",
    retailerEmail: "retailer2@boxaio.com",
    name: "Hyderabad Daily Needs",
    retailerName: "Sana Begum",
    phone: "+91 90000 44556",
    email: "retailer2@boxaio.com",
    addressLine: "Plot 21, Jubilee Hills Road No. 36",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500033",
    latitude: 17.385,
    longitude: 78.4867,
    deliveryRadiusKm: 12,
    gstNumber: "36PQRSX9876K1Z2",
    status: "OPEN",
    hours: defaultHours(),
  },
];

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function seedProducts(): RetailerProduct[] {
  const rows: RetailerProduct[] = [];
  catalogue.forEach((product, index) => {
    // Each catalogue item is stocked by one or both stores, so availability
    // genuinely differs per location.
    const stores =
      index % 5 === 0
        ? [STORES[0]!]
        : index % 7 === 0
          ? [STORES[1]!]
          : [STORES[0]!, STORES[1]!];

    stores.forEach((store, storeIdx) => {
      const rand = pseudoRandom(index + storeIdx * 91);
      const stock = Math.floor(rand * 90);
      const priceShift = storeIdx === 1 ? 1.04 : 1;
      rows.push({
        id: `${store.id}__${product._id}`,
        storeId: store.id,
        name: product.name,
        description: product.description,
        category: product.mainCategory,
        subCategory: product.subCategory,
        brand: product.brand,
        imageUrl: product.image,
        sellingPrice: Math.round(product.normalPrice * priceShift),
        mrp: Math.round(product.mrp * priceShift),
        discountPercent: Math.max(
          0,
          Math.round(((product.mrp - product.normalPrice) / product.mrp) * 100),
        ),
        gstPercent: [0, 5, 12, 18][index % 4]!,
        stock,
        minStockLevel: 10,
        maxStockLevel: 200,
        unit: product.normalUnit,
        weight: product.normalUnit,
        sku: `${store.id.slice(-6).toUpperCase()}-${product._id.replace("prod_", "")}`,
        status: rand > 0.06 ? "active" : "inactive",
        updatedAt: new Date(Date.now() - index * 3600_000).toISOString(),
      });
    });
  });
  return rows;
}

const CUSTOMER_NAMES = [
  "Aarav Sharma",
  "Divya Reddy",
  "Imran Khan",
  "Meera Nair",
  "Karthik Rao",
  "Sneha Patel",
  "Rahul Verma",
  "Anita Joseph",
];

const PAYMENTS: RetailerOrder["paymentMethod"][] = ["UPI", "Card", "Cash on Delivery", "Wallet"];
const STATUSES: OrderStatus[] = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "picked_up",
  "delivered",
  "delivered",
  "cancelled",
];

function seedOrders(prods: RetailerProduct[]): RetailerOrder[] {
  const orders: RetailerOrder[] = [];
  let counter = 10231;

  STORES.forEach((store, storeIdx) => {
    const storeProducts = prods.filter((p) => p.storeId === store.id);
    for (let i = 0; i < 60; i++) {
      const rand = pseudoRandom(i + storeIdx * 37);
      const daysAgo = i < 12 ? 0 : Math.floor(rand * 120);
      const placedAt = new Date(Date.now() - daysAgo * 86400_000 - i * 900_000);
      const itemCount = 1 + Math.floor(rand * 3);
      const items = Array.from({ length: itemCount }, (_, k) => {
        const p = storeProducts[(i * 7 + k * 13) % storeProducts.length]!;
        return {
          productId: p.id,
          name: p.name,
          quantity: 1 + Math.floor(pseudoRandom(i + k) * 4),
          unitPrice: p.sellingPrice,
          gstPercent: p.gstPercent,
        };
      });
      const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
      const discount = Math.round(subtotal * (rand > 0.6 ? 0.08 : 0));
      const gst = Math.round(
        items.reduce((sum, it) => sum + (it.unitPrice * it.quantity * it.gstPercent) / 100, 0),
      );
      const deliveryFee = subtotal > 499 ? 0 : 29;
      const status = daysAgo === 0 ? STATUSES[i % 5]! : STATUSES[i % STATUSES.length]!;
      const name = CUSTOMER_NAMES[(i + storeIdx) % CUSTOMER_NAMES.length]!;

      orders.push({
        id: `BX${counter++}`,
        storeId: store.id,
        customerId: `cust-${((i + storeIdx) % CUSTOMER_NAMES.length) + 1}`,
        customerName: name,
        placedAt: placedAt.toISOString(),
        items,
        subtotal,
        discount,
        gst,
        deliveryFee,
        total: subtotal - discount + gst + deliveryFee,
        paymentMethod: PAYMENTS[i % PAYMENTS.length]!,
        paymentStatus: status === "cancelled" ? "refunded" : rand > 0.25 ? "paid" : "pending",
        status,
        deliveryAddress: `${store.city}, ${store.state}`,
        ...(status === "picked_up" || status === "delivered"
          ? { deliveryPartner: "BOXAIO Express" }
          : {}),
      });
    }
  });

  return orders.sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
}

function seedCustomers(orders: RetailerOrder[]): RetailerCustomer[] {
  const map = new Map<string, RetailerCustomer>();
  orders.forEach((order) => {
    const key = `${order.storeId}:${order.customerId}`;
    const existing = map.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpend += order.total;
      if (order.placedAt > existing.lastOrderAt) existing.lastOrderAt = order.placedAt;
    } else {
      map.set(key, {
        id: key,
        storeId: order.storeId,
        name: order.customerName,
        maskedPhone: `+91 •••• ${(1000 + (order.customerId.length * 137) % 9000).toString()}`,
        orderCount: 1,
        totalSpend: order.total,
        lastOrderAt: order.placedAt,
        status: "active",
      });
    }
  });
  return [...map.values()].map((c) => ({
    ...c,
    totalSpend: Math.round(c.totalSpend),
    status: Date.now() - new Date(c.lastOrderAt).getTime() > 45 * 86400_000 ? "inactive" : "active",
  }));
}

function seedOffers(): Offer[] {
  const now = Date.now();
  const iso = (offsetDays: number) => new Date(now + offsetDays * 86400_000).toISOString();
  return [
    {
      id: "offer-1",
      storeId: "store-vja-01",
      name: "Weekend Fresh 15%",
      type: "percentage",
      discountValue: 15,
      productIds: [],
      categories: ["Fruits & Vegetables"],
      minOrderValue: 299,
      startDate: iso(-3),
      endDate: iso(7),
      usageLimit: 500,
      used: 128,
      status: "active",
    },
    {
      id: "offer-2",
      storeId: "store-vja-01",
      name: "Flat ₹50 off above ₹799",
      type: "min_order",
      discountValue: 50,
      productIds: [],
      categories: [],
      minOrderValue: 799,
      startDate: iso(2),
      endDate: iso(20),
      usageLimit: 300,
      used: 0,
      status: "scheduled",
    },
    {
      id: "offer-3",
      storeId: "store-hyd-01",
      name: "Buy 2 Get 1 — Dairy",
      type: "buy_x_get_y",
      discountValue: 1,
      productIds: [],
      categories: ["Bakery, Cakes & Dairy"],
      minOrderValue: 0,
      startDate: iso(-30),
      endDate: iso(-2),
      usageLimit: 200,
      used: 187,
      status: "expired",
    },
  ];
}

function seedReviews(prods: RetailerProduct[]): Review[] {
  const comments = [
    "Fresh and delivered on time. Will order again.",
    "Good quality but packaging could be better.",
    "Excellent price compared to the local market.",
    "One item was missing, support resolved it quickly.",
    "Consistently fresh produce from this store.",
  ];
  return prods.slice(0, 14).map((p, i) => ({
    id: `rev-${i + 1}`,
    storeId: p.storeId,
    productId: p.id,
    productName: p.name,
    customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length]!,
    rating: 3 + (i % 3),
    comment: comments[i % comments.length]!,
    createdAt: new Date(Date.now() - i * 36 * 3600_000).toISOString(),
    status: i % 6 === 0 ? "pending" : "published",
  }));
}

function seedNotifications(orders: RetailerOrder[], prods: RetailerProduct[]): RetailerNotification[] {
  const rows: RetailerNotification[] = [];
  STORES.forEach((store) => {
    const storeOrders = orders.filter((o) => o.storeId === store.id).slice(0, 3);
    storeOrders.forEach((order, i) =>
      rows.push({
        id: `ntf-${store.id}-order-${order.id}`,
        storeId: store.id,
        type: "new_order",
        title: `New order #${order.id}`,
        message: `${order.customerName} placed an order worth ₹${Math.round(order.total)}.`,
        createdAt: order.placedAt,
        read: i > 1,
      }),
    );
    const low = prods.filter((p) => p.storeId === store.id && stockStatus(p) !== "in_stock").slice(0, 2);
    low.forEach((p) =>
      rows.push({
        id: `ntf-${p.id}-stock`,
        storeId: store.id,
        type: stockStatus(p) === "out_of_stock" ? "out_of_stock" : "low_stock",
        title: stockStatus(p) === "out_of_stock" ? "Out of stock" : "Low stock alert",
        message: `${p.name} has ${p.stock} units left.`,
        createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
        read: false,
      }),
    );
    rows.push({
      id: `ntf-${store.id}-announcement`,
      storeId: store.id,
      type: "announcement",
      title: "BOXAIO festive campaign",
      message: "Submit your festive offers before Friday to be featured on the home page.",
      createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
      read: false,
    });
  });
  return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function buildSeed(): RetailerDb {
  const prods = seedProducts();
  const orders = seedOrders(prods);
  return {
    stores: STORES,
    products: prods,
    orders,
    offers: seedOffers(),
    customers: seedCustomers(orders),
    reviews: seedReviews(prods),
    notifications: seedNotifications(orders, prods),
  };
}

let memoryDb: RetailerDb | null = null;

function readDb(): RetailerDb {
  if (memoryDb) return memoryDb;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(DB_KEY);
      if (raw) {
        memoryDb = JSON.parse(raw) as RetailerDb;
        return memoryDb;
      }
    } catch {
      /* fall through to seed */
    }
  }
  memoryDb = buildSeed();
  writeDb(memoryDb);
  return memoryDb;
}

function writeDb(db: RetailerDb) {
  memoryDb = db;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* quota / private mode — in-memory copy still works for this session */
  }
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 120));
}

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ── Stores ─────────────────────────────────────────────────────────────── */

export function getStoreForRetailer(email: string, storeId?: string): Store | undefined {
  const db = readDb();
  return (
    db.stores.find((s) => (storeId ? s.id === storeId : false)) ??
    db.stores.find((s) => s.retailerEmail.toLowerCase() === email.toLowerCase()) ??
    db.stores[0]
  );
}

export async function fetchStore(storeId: string) {
  return delay(readDb().stores.find((s) => s.id === storeId) ?? null);
}

export async function saveStore(storeId: string, patch: Partial<Store>) {
  const db = readDb();
  db.stores = db.stores.map((s) => (s.id === storeId ? { ...s, ...patch, id: s.id } : s));
  writeDb(db);
  return delay(db.stores.find((s) => s.id === storeId)!);
}

/* ── Products ───────────────────────────────────────────────────────────── */

export async function fetchProducts(storeId: string) {
  return delay(readDb().products.filter((p) => p.storeId === storeId));
}

export async function fetchProduct(storeId: string, id: string) {
  return delay(readDb().products.find((p) => p.storeId === storeId && p.id === id) ?? null);
}

export async function createProduct(
  storeId: string,
  input: Omit<RetailerProduct, "id" | "storeId" | "updatedAt">,
) {
  const db = readDb();
  const product: RetailerProduct = {
    ...input,
    id: uid(`${storeId}__p`),
    storeId,
    updatedAt: new Date().toISOString(),
  };
  db.products = [product, ...db.products];
  writeDb(db);
  return delay(product);
}

export async function updateProduct(storeId: string, id: string, patch: Partial<RetailerProduct>) {
  const db = readDb();
  db.products = db.products.map((p) =>
    p.id === id && p.storeId === storeId
      ? { ...p, ...patch, id: p.id, storeId: p.storeId, updatedAt: new Date().toISOString() }
      : p,
  );
  writeDb(db);
  return delay(db.products.find((p) => p.id === id)!);
}

export async function updateStock(storeId: string, id: string, stock: number) {
  if (stock < 0) throw new Error("Stock cannot be negative");
  return updateProduct(storeId, id, { stock });
}

/* ── Orders ─────────────────────────────────────────────────────────────── */

export async function fetchOrders(storeId: string) {
  return delay(readDb().orders.filter((o) => o.storeId === storeId));
}

export async function fetchOrder(storeId: string, id: string) {
  return delay(readDb().orders.find((o) => o.storeId === storeId && o.id === id) ?? null);
}

export async function updateOrderStatus(storeId: string, id: string, next: OrderStatus) {
  const db = readDb();
  const order = db.orders.find((o) => o.storeId === storeId && o.id === id);
  if (!order) throw new Error("Order not found for this store");
  if (!canTransition(order.status, next)) {
    throw new Error(`Cannot move an order from ${order.status} to ${next}`);
  }
  order.status = next;
  writeDb(db);
  return delay(order);
}

/* ── Offers ─────────────────────────────────────────────────────────────── */

export async function fetchOffers(storeId: string) {
  return delay(readDb().offers.filter((o) => o.storeId === storeId));
}

export async function saveOffer(storeId: string, offer: Partial<Offer> & { id?: string }) {
  const db = readDb();
  if (offer.id) {
    db.offers = db.offers.map((o) => (o.id === offer.id && o.storeId === storeId ? { ...o, ...offer } : o));
  } else {
    db.offers = [
      {
        id: uid("offer"),
        storeId,
        name: offer.name ?? "Untitled offer",
        type: offer.type ?? "percentage",
        discountValue: offer.discountValue ?? 0,
        productIds: offer.productIds ?? [],
        categories: offer.categories ?? [],
        minOrderValue: offer.minOrderValue ?? 0,
        startDate: offer.startDate ?? new Date().toISOString(),
        endDate: offer.endDate ?? new Date(Date.now() + 7 * 86400_000).toISOString(),
        usageLimit: offer.usageLimit ?? 100,
        used: 0,
        status: offer.status ?? "draft",
      },
      ...db.offers,
    ];
  }
  writeDb(db);
  return delay(db.offers.filter((o) => o.storeId === storeId));
}

export async function deleteOffer(storeId: string, id: string) {
  const db = readDb();
  db.offers = db.offers.filter((o) => !(o.id === id && o.storeId === storeId));
  writeDb(db);
  return delay(true);
}

/* ── Customers, reviews, notifications ──────────────────────────────────── */

export async function fetchCustomers(storeId: string) {
  return delay(readDb().customers.filter((c) => c.storeId === storeId));
}

export async function fetchReviews(storeId: string) {
  return delay(readDb().reviews.filter((r) => r.storeId === storeId));
}

export async function replyToReview(storeId: string, id: string, reply: string) {
  const db = readDb();
  db.reviews = db.reviews.map((r) => (r.id === id && r.storeId === storeId ? { ...r, reply } : r));
  writeDb(db);
  return delay(db.reviews.filter((r) => r.storeId === storeId));
}

export async function fetchNotifications(storeId: string) {
  return delay(readDb().notifications.filter((n) => n.storeId === storeId));
}

export async function markNotificationsRead(storeId: string, ids?: string[]) {
  const db = readDb();
  db.notifications = db.notifications.map((n) =>
    n.storeId === storeId && (!ids || ids.includes(n.id)) ? { ...n, read: true } : n,
  );
  writeDb(db);
  return delay(db.notifications.filter((n) => n.storeId === storeId));
}

/* ── Analytics ──────────────────────────────────────────────────────────── */

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export async function fetchDashboardSummary(storeId: string): Promise<DashboardSummary> {
  const db = readDb();
  const prods = db.products.filter((p) => p.storeId === storeId);
  const orders = db.orders.filter((o) => o.storeId === storeId);
  const today = new Date();
  const todays = orders.filter((o) => isSameDay(new Date(o.placedAt), today));

  return delay({
    totalProducts: prods.length,
    todaysOrders: todays.length,
    todaysSales: Math.round(
      todays.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0),
    ),
    lowStockProducts: prods.filter((p) => stockStatus(p) === "low_stock").length,
    pendingOrders: orders.filter((o) => ["placed", "accepted", "preparing"].includes(o.status)).length,
    completedOrders: orders.filter((o) => o.status === "delivered").length,
  });
}

function rangeStart(range: SalesRange): Date {
  const now = new Date();
  const start = new Date(now);
  if (range === "today") start.setHours(0, 0, 0, 0);
  if (range === "week") start.setDate(now.getDate() - 6);
  if (range === "month") start.setDate(now.getDate() - 29);
  if (range === "year") start.setMonth(now.getMonth() - 11);
  return start;
}

export async function fetchSales(
  storeId: string,
  range: SalesRange,
  custom?: { from: string; to: string },
): Promise<SalesSummary> {
  const db = readDb();
  const from = custom ? new Date(custom.from) : rangeStart(range);
  const to = custom ? new Date(custom.to) : new Date();
  to.setHours(23, 59, 59, 999);

  const orders = db.orders.filter((o) => {
    if (o.storeId !== storeId || o.status === "cancelled") return false;
    const at = new Date(o.placedAt);
    return at >= from && at <= to;
  });

  const grossSales = orders.reduce((s, o) => s + o.subtotal, 0);
  const discounts = orders.reduce((s, o) => s + o.discount, 0);
  const gst = orders.reduce((s, o) => s + o.gst, 0);
  const delivery = orders.reduce((s, o) => s + o.deliveryFee, 0);
  const netSales = orders.reduce((s, o) => s + o.total, 0);

  const buckets = new Map<string, { sales: number; orders: number }>();
  const keyFor = (d: Date) =>
    range === "today"
      ? `${d.getHours().toString().padStart(2, "0")}:00`
      : range === "year"
        ? d.toLocaleString("en-IN", { month: "short" })
        : d.toLocaleString("en-IN", { day: "2-digit", month: "short" });

  orders.forEach((o) => {
    const key = keyFor(new Date(o.placedAt));
    const bucket = buckets.get(key) ?? { sales: 0, orders: 0 };
    bucket.sales += o.total;
    bucket.orders += 1;
    buckets.set(key, bucket);
  });

  const series = [...buckets.entries()]
    .map(([label, v]) => ({ label, sales: Math.round(v.sales), orders: v.orders }))
    .reverse();

  return delay({
    grossSales: Math.round(grossSales),
    discounts: Math.round(discounts),
    gst: Math.round(gst),
    delivery: Math.round(delivery),
    netSales: Math.round(netSales),
    orderCount: orders.length,
    averageOrderValue: orders.length ? Math.round(netSales / orders.length) : 0,
    series,
  });
}

/* ── Customer storefront availability (location aware) ──────────────────── */

/** Stores serving a city selected by a customer. */
export function storesForCity(city: string): Store[] {
  const db = readDb();
  return db.stores.filter((s) => s.city.toLowerCase() === city.trim().toLowerCase());
}

/**
 * Catalogue product ids that are actually purchasable in a city, i.e. some
 * store in that city stocks them, is active and has stock.
 */
export function availableCatalogueIdsForCity(city: string): Set<string> {
  const db = readDb();
  const storeIds = new Set(storesForCity(city).map((s) => s.id));
  const ids = new Set<string>();
  db.products.forEach((p) => {
    if (!storeIds.has(p.storeId)) return;
    if (p.status !== "active" || p.stock <= 0) return;
    const catalogueId = p.id.includes("__") ? p.id.split("__")[1]! : p.id;
    ids.add(catalogueId);
  });
  return ids;
}

export function knownCities(): string[] {
  return [...new Set(readDb().stores.map((s) => s.city))];
}

export function resetRetailerData() {
  writeDb(buildSeed());
}
