import {appStorage} from '@/api/storage';
import {mockData} from '@/api/bootstrap-data';
import { checkoutOrders, wholesaleProjection } from "@/features/checkout/storage";
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

/** Distributor registry lives in one scalable data module. */
export {
  DISTRIBUTORS,
  DEFAULT_RETAILER_LOCATION,
  NEARBY_RADIUS_KM,
  canViewCatalogue,
  distanceKm,
  distributorsWithDistance,
  getDistributor,
  nearbyDistributors,
  readRetailerLocation,
  saveRetailerLocation,
} from "./distributors";
export type { DistributorWithDistance } from "./distributors";

import { DISTRIBUTORS } from "./distributors";
import { availableOffers, quoteProduct, orderTotals, validateCombinedStock } from "./pricing";

export {B2B_PRODUCTS,getB2BProduct} from '../../../backend/src/domain/catalogue';
import {B2B_PRODUCTS,getB2BProduct} from '../../../backend/src/domain/catalogue';
export function productsByDistributor(distributorId: string) {
  return B2B_PRODUCTS.filter((p) => p.offers.some((o) => o.distributorId === distributorId));
}

export const B2B_CATEGORIES = [...new Set(B2B_PRODUCTS.map((p) => p.category))].sort();

export const B2B_BRANDS = [...new Set(B2B_PRODUCTS.map((p) => p.brand))].sort();

/** First product image found for a category (used for browse rails). */
export function categoryImage(category: string) {
  return B2B_PRODUCTS.find((p) => p.category === category)?.image ?? "";
}

export function countByCategory(category: string) {
  return B2B_PRODUCTS.filter((p) => p.category === category).length;
}

export function countByBrand(brand: string) {
  return B2B_PRODUCTS.filter((p) => p.brand === brand).length;
}

/* ------------------------------------------------------------------ orders */

function seedOrders():B2BOrder[]{return structuredClone(mockData.wholesaleOrders) as B2BOrder[];}

function readOrders(): B2BOrder[] {
  const legacy = legacyReadOrders();
  return [
    ...checkoutOrders()
      .filter((o) => o.mode === "wholesale" && !legacy.some((l) => l.id === o.id))
      .map(wholesaleProjection),
    ...legacy,
  ];
}
function legacyReadOrders(): B2BOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = appStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw) as B2BOrder[];
  } catch {
    /* fall through to seeding */
  }
  const seeded = seedOrders();
  try {
    appStorage.setItem(ORDERS_KEY, JSON.stringify(seeded));
  } catch {
    /* storage unavailable — keep in memory for this session */
  }
  return seeded;
}

function writeOrders(rows: B2BOrder[]) {
  if (typeof window === "undefined") return;
  appStorage.setItem(ORDERS_KEY, JSON.stringify(rows));
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
  deliveryAddress: string
): Promise<B2BOrder> {
  await delay();
  if (!retailerEmail || !items.length || deliveryAddress.trim().length < 10)
    throw new Error("Complete the delivery address and add at least one item.");
  items = items.map((item) => {
    const p = getB2BProduct(item.productId);
    if (!p) throw new Error("Product no longer available.");
    const offer = item.distributorId
      ? p.offers.find((o) => o.distributorId === item.distributorId)
      : availableOffers(p)[0];
    if (!offer) throw new Error("Supplier no longer available.");
    const q = quoteProduct(p, offer, item.variantId, item.quantity);
    if (q.error) throw new Error(p.name + ": " + q.error);
    return {
      ...item,
      unit: q.variant.label,
      unitPrice: q.unitPrice,
      distributorId: offer.distributorId,
      distributor: offer.distributorName,
      variantId: q.variant.id,
      baseUnits: q.baseUnits,
      freeDelivery: offer.freeDelivery,
      discountPct: q.discountPct,
    };
  });
  validateCombinedStock(items, getB2BProduct);
  const all = readOrders();
  const order: B2BOrder = {
    id: "BX-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    retailerEmail,
    placedAt: new Date().toISOString(),
    items,
    ...orderTotals(items),
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
    readOrders().map((o) => (o.id === orderId ? { ...o, status: "delivered" as const } : o))
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
    const seenProducts = new Set<string>();
    order.items.forEach((item) => {
      const product = getB2BProduct(item.productId);
      if (!product) return; // product retired from BOXAIO
      const existing = map.get(item.productId);
      if (existing) {
        existing.lastPurchasedAt = order.placedAt;
        existing.lastPurchasedQty = item.quantity;
        existing.lastPurchasedPrice = item.unitPrice;
        existing.lastUnit = item.unit;
        existing.lastVariantId = item.variantId;
        existing.lastDistributorId = item.distributorId;
        existing.purchaseCount += seenProducts.has(item.productId) ? 0 : 1;
        seenProducts.add(item.productId);
        existing.totalQuantityPurchased += item.baseUnits ?? item.quantity;
        return;
      }
      map.set(item.productId, {
        productId: item.productId,
        product,
        lastPurchasedAt: order.placedAt,
        lastPurchasedQty: item.quantity,
        lastPurchasedPrice: item.unitPrice,
        lastUnit: item.unit,
        lastVariantId: item.variantId,
        lastDistributorId: item.distributorId,
        purchaseCount: 1,
        totalQuantityPurchased: item.baseUnits ?? item.quantity,
      });
      seenProducts.add(item.productId);
    });
  });

  return [...map.values()];
}

export function frequentlyPurchased(entries: CatalogueEntry[]) {
  return [...entries]
    .sort(
      (a, b) =>
        b.purchaseCount - a.purchaseCount || b.totalQuantityPurchased - a.totalQuantityPurchased
    )
    .slice(0, 8);
}

export function recentlyPurchased(entries: CatalogueEntry[]) {
  return [...entries]
    .sort((a, b) => +new Date(b.lastPurchasedAt) - +new Date(a.lastPurchasedAt))
    .slice(0, 8);
}
