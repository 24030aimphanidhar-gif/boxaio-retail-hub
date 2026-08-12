/**
 * Retailer domain types.
 *
 * These mirror the shape a real backend would return so the data service in
 * `src/retailer/data/service.ts` can be swapped for API/database calls without
 * touching any UI component.
 */

export type StoreStatus = "OPEN" | "CLOSED" | "TEMPORARILY_UNAVAILABLE";

export interface StoreHoursDay {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  closed: boolean;
  open24h: boolean;
  opensAt: string;
  closesAt: string;
}

export interface Store {
  id: string;
  retailerEmail: string;
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  retailerName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  gstNumber: string;
  status: StoreStatus;
  hours: StoreHoursDay[];
}

export type ProductStatus = "active" | "inactive";

export interface RetailerProduct {
  id: string;
  storeId: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  brand: string;
  imageUrl: string;
  sellingPrice: number;
  mrp: number;
  discountPercent: number;
  gstPercent: number;
  stock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  weight: string;
  sku: string;
  barcode?: string;
  status: ProductStatus;
  updatedAt: string;
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "picked_up"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  gstPercent: number;
}

export interface RetailerOrder {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  placedAt: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  gst: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "UPI" | "Card" | "Cash on Delivery" | "Wallet";
  paymentStatus: "paid" | "pending" | "refunded";
  status: OrderStatus;
  deliveryAddress: string;
  deliveryPartner?: string;
}

export type OfferType =
  | "percentage"
  | "flat"
  | "buy_x_get_y"
  | "product"
  | "category"
  | "min_order";

export type OfferStatus = "draft" | "scheduled" | "active" | "expired" | "disabled";

export interface Offer {
  id: string;
  storeId: string;
  name: string;
  type: OfferType;
  discountValue: number;
  productIds: string[];
  categories: string[];
  minOrderValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  used: number;
  status: OfferStatus;
}

export interface RetailerCustomer {
  id: string;
  storeId: string;
  name: string;
  /** Masked for privacy — retailers never see the full contact detail. */
  maskedPhone: string;
  orderCount: number;
  totalSpend: number;
  lastOrderAt: string;
  status: "active" | "inactive";
}

export interface Review {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "published" | "pending" | "hidden";
  reply?: string;
}

export type NotificationType =
  | "new_order"
  | "order_cancelled"
  | "low_stock"
  | "out_of_stock"
  | "new_review"
  | "offer_expiring"
  | "store_approval"
  | "announcement";

export interface RetailerNotification {
  id: string;
  storeId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DashboardSummary {
  totalProducts: number;
  todaysOrders: number;
  todaysSales: number;
  lowStockProducts: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface SalesPoint {
  label: string;
  sales: number;
  orders: number;
}

export interface SalesSummary {
  grossSales: number;
  discounts: number;
  gst: number;
  delivery: number;
  netSales: number;
  orderCount: number;
  averageOrderValue: number;
  series: SalesPoint[];
}

export type SalesRange = "today" | "week" | "month" | "year";

export function stockStatus(product: Pick<RetailerProduct, "stock" | "minStockLevel">): StockStatus {
  if (product.stock <= 0) return "out_of_stock";
  if (product.stock <= product.minStockLevel) return "low_stock";
  return "in_stock";
}

/** Allowed forward transitions a retailer may perform. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["picked_up"],
  picked_up: ["delivered"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  picked_up: "Picked Up",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}
