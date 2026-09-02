/**
 * B2B storefront domain types.
 *
 * These describe the retailer-as-a-buyer experience (wholesale shopping on
 * BOXAIO). They are intentionally separate from `src/retailer/types.ts`, which
 * models the retailer's own store management area.
 */

/** A supplier offer attached to a B2B product. */
export interface DistributorOffer {
  distributorId: string;
  distributorName: string;
  /** Distributor-specific selling price per unit. */
  price: number;
  /** Retailer margin against MRP, in percent. */
  marginPct: number;
  freeDelivery: boolean;
  stock: number;
  /** e.g. "Tomorrow" */
  deliveryEstimate: string;
}

export interface B2BProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  /** Primary supplying distributor name (first offer). */
  distributor: string;
  image: string;
  /** Current wholesale price per bulk unit. Always read live — never cached. */
  b2bPrice: number;
  mrp: number;
  /** e.g. "10 kg Bag" */
  unit: string;
  /** Minimum order quantity in units. */
  moq: number;
  /** Quantity step above the MOQ. */
  increment: number;
  stock: number;
  sku: string;
  offer?: string;
  description: string;
  /** Selectable pack sizes shown on distributor listings. */
  packSizes: string[];
  /** One or more distributor offers for this product. */
  offers: DistributorOffer[];
}


export interface B2BOrderItem {
  productId: string;
  name: string;
  quantity: number;
  /** Price paid at the time of purchase (historical). */
  unitPrice: number;
  unit: string;
  image: string;
  /** Distributor that supplied this line, when chosen from a distributor offer. */
  distributor?: string;
}


export type B2BOrderStatus = "placed" | "packed" | "shipped" | "delivered" | "cancelled";

export interface B2BOrder {
  id: string;
  retailerEmail: string;
  placedAt: string;
  items: B2BOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: B2BOrderStatus;
  paymentMethod: "Credit (30 days)" | "UPI" | "Bank Transfer";
  deliveryAddress: string;
}

/**
 * One catalogue entry per product the retailer has purchased.
 * It only stores purchase history — pricing/stock is always resolved from the
 * live product record so the catalogue can never show a stale price.
 */
export interface CatalogueEntry {
  productId: string;
  product: B2BProduct;
  lastPurchasedAt: string;
  lastPurchasedQty: number;
  lastPurchasedPrice: number;
  purchaseCount: number;
  totalQuantityPurchased: number;
}

export const B2B_ORDER_STATUS_LABELS: Record<B2BOrderStatus, string> = {
  placed: "Order Placed",
  packed: "Packed",
  shipped: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function clampBulkQty(product: B2BProduct, qty: number) {
  const max = Math.max(product.moq, product.stock);
  const steps = Math.round((qty - product.moq) / product.increment);
  const snapped = product.moq + Math.max(0, steps) * product.increment;
  if (snapped < product.moq) return product.moq;
  if (snapped > max) return max;
  return snapped;
}
