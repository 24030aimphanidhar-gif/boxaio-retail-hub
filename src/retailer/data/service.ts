import { appStorage } from "@/api/storage";
import { mockData } from "@/api/bootstrap-data";
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

export const STORES = mockData.retailer.stores as Store[];
function buildSeed(): RetailerDb {
  return structuredClone(mockData.retailer) as RetailerDb;
}

let memoryDb: RetailerDb | null = null;

function readDb(): RetailerDb {
  if (memoryDb) return memoryDb;
  if (typeof window !== "undefined") {
    try {
      const raw = appStorage.getItem(DB_KEY);
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
    appStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* quota / private mode — in-memory copy still works for this session */
  }
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 120));
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

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
  input: Omit<RetailerProduct, "id" | "storeId" | "updatedAt">
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
      : p
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
    db.offers = db.offers.map((o) =>
      o.id === offer.id && o.storeId === storeId ? { ...o, ...offer } : o
    );
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
    n.storeId === storeId && (!ids || ids.includes(n.id)) ? { ...n, read: true } : n
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
      todays.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0)
    ),
    lowStockProducts: prods.filter((p) => stockStatus(p) === "low_stock").length,
    pendingOrders: orders.filter((o) => ["placed", "accepted", "preparing"].includes(o.status))
      .length,
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
  custom?: { from: string; to: string }
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
