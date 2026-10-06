import type {
  B2BProduct,
  DistributorOffer,
  B2BOrderItem,
} from "./wholesale-types";
import { canViewCatalogue, getDistributor } from "./distributors";
export interface PackVariant {
  id: string;
  label: string;
  multiplier: number;
  moq: number;
  increment: number;
}
export const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
export function packVariants(p: B2BProduct): PackVariant[] {
  return [
    {
      id: "standard",
      label: p.unit,
      multiplier: 1,
      moq: p.moq,
      increment: p.increment,
    },
    {
      id: "double",
      label: `Case · 2 × ${p.unit}`,
      multiplier: 2,
      moq: Math.max(1, Math.ceil(p.moq / 2)),
      increment: 1,
    },
    {
      id: "master",
      label: `Master case · 5 × ${p.unit}`,
      multiplier: 5,
      moq: 1,
      increment: 1,
    },
  ];
}
export function availableOffers(p: B2BProduct) {
  return p.offers.filter((o) => {
    const d = getDistributor(o.distributorId);
    return d && canViewCatalogue(d);
  });
}
export function quoteProduct(
  p: B2BProduct,
  offer: DistributorOffer,
  variantId = "standard",
  quantity?: number,
) {
  const variant = packVariants(p).find((v) => v.id === variantId);
  if (!variant) throw new Error("This pack is no longer available.");
  const qty = quantity ?? variant.moq;
  const max = Math.floor(offer.stock / variant.multiplier);
  const baseUnits = qty * variant.multiplier;
  const discountPct = baseUnits >= 25 ? 6 : baseUnits >= 10 ? 3 : 0;
  const listPrice = roundMoney(offer.price * variant.multiplier),
    unitPrice = roundMoney(listPrice * (1 - discountPct / 100));
  const error = !availableOffers(p).some(
    (o) => o.distributorId === offer.distributorId,
  )
    ? "Supplier catalogue is unavailable."
    : max < variant.moq
      ? "Insufficient stock for the minimum order."
      : !Number.isInteger(qty) || qty < variant.moq
        ? `Minimum ${variant.moq} packs.`
        : (qty - variant.moq) % variant.increment !== 0
          ? `Order in steps of ${variant.increment} above the minimum.`
          : qty > max
            ? `Only ${max} packs available.`
            : "";
  return {
    variant,
    quantity: qty,
    max,
    baseUnits,
    discountPct,
    listPrice,
    unitPrice,
    total: roundMoney(unitPrice * qty),
    savings: roundMoney((listPrice - unitPrice) * qty),
    error,
  };
}
export function orderTotals(items: B2BOrderItem[]) {
  const subtotal = roundMoney(
    items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
  );
  const discount = subtotal > 20000 ? roundMoney(subtotal * 0.05) : 0;
  const deliveryFee =
    !items.length || subtotal > 5000 || items.every((i) => i.freeDelivery)
      ? 0
      : 199;
  return {
    subtotal,
    discount,
    deliveryFee,
    total: roundMoney(subtotal - discount + deliveryFee),
  };
}
export function validateCombinedStock(
  items: B2BOrderItem[],
  find: (id: string) => B2BProduct | null,
) {
  const used = new Map<string, number>();
  for (const item of items) {
    const p = find(item.productId);
    const offer = p?.offers.find((o) => o.distributorId === item.distributorId);
    if (!p || !offer)
      throw new Error("A supplier or product is no longer available.");
    const q = quoteProduct(p, offer, item.variantId, item.quantity);
    if (q.error) throw new Error(p.name + ": " + q.error);
    const key = p.id + "::" + offer.distributorId;
    const count = (used.get(key) || 0) + q.baseUnits;
    used.set(key, count);
    if (count > offer.stock)
      throw new Error(
        `${p.name}: combined pack quantities exceed ${offer.distributorName}'s stock.`,
      );
  }
}
