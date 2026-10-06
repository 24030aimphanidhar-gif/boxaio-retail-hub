export type CheckoutMode = "consumer" | "wholesale";
export type PaymentMethod =
  | "UPI"
  | "Card"
  | "Net banking"
  | "Wallet"
  | "Cash on delivery"
  | "Pay later"
  | "Retailer credit"
  | "Bank transfer";
export interface Address {
  id: string;
  type: "Home" | "Work" | "Shop" | "Other";
  name: string;
  phone: string;
  street: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  instructions: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}
export interface CheckoutLine {
  key: string;
  productId: string;
  name: string;
  image: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  listPrice: number;
  category: string;
  sellerId: string;
  seller: string;
  variant: string;
  stockUnits: number;
  gstRate: number;
  freeDelivery: boolean;
}
export interface DeliveryChoice {
  id: string;
  label: string;
  date: string;
  charge: number;
  cutoff: string;
  slots: string[];
  pickup: boolean;
}
export interface CheckoutInput {
  mode: CheckoutMode;
  account: string;
  lines: CheckoutLine[];
  address: Address;
  billing: Address;
  deliveryId: string;
  deliveryDate: string;
  slot: string;
  coupon: string;
  points: number;
  wallet: number;
  payment: PaymentMethod;
}
export interface Quote {
  items: CheckoutLine[];
  listSubtotal: number;
  subtotal: number;
  productDiscount: number;
  promotion: number;
  couponDiscount: number;
  couponError: string;
  points: number;
  wallet: number;
  gstIncluded: number;
  deliveryCharge: number;
  total: number;
  beforeRedemption: number;
  delivery: DeliveryChoice;
  errors: string[];
}
export interface CheckoutRecord {
  cancelled?: boolean;
  id: string;
  attemptId: string;
  transactionId: string;
  createdAt: string;
  mode: CheckoutMode;
  account: string;
  input: CheckoutInput;
  quote: Quote;
  paymentStatus: "Paid (demo)" | "Due on delivery" | "Approved credit (demo)";
  shipments: {
    id: string;
    sellerId: string;
    seller: string;
    lineKeys: string[];
    date: string;
    slot: string;
  }[];
  notification: string;
}
export interface Attempt {
  id: string;
  transactionId: string;
  fingerprint: string;
  input: CheckoutInput;
  quote: Quote;
  status: "awaiting" | "pending" | "failed" | "confirmed" | "cancelled";
  createdAt: string;
  orderId?: string;
  message?: string;
}
export interface Balance {
  points: number;
  wallet: number;
  credit: number;
}
export interface Ledger {
  attempts: Record<string, Attempt>;
  orders: CheckoutRecord[];
  balances: Record<string, Balance>;
}
