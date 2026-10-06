import productSeed from "../../data/products.json";
import wholesaleSeed from "../../data/wholesale-products.json";
import distributorSeed from "../../data/distributors.json";
import couponSeed from "../../data/coupons.json";
import type { Product } from "./product-types";
import type { B2BProduct, Distributor } from "./wholesale-types";
export const products = productSeed as Product[];
export const B2B_PRODUCTS = wholesaleSeed as B2BProduct[];
export const DISTRIBUTORS = distributorSeed as Distributor[];
export const COUPONS = couponSeed;
export function getB2BProduct(id: string) {
  return B2B_PRODUCTS.find((p) => p.id === id) || null;
}
export function configureCatalogue(data: {
  products: Product[];
  wholesaleProducts: B2BProduct[];
  distributors: Distributor[];
  coupons: typeof COUPONS;
}) {
  products.splice(0, products.length, ...data.products);
  B2B_PRODUCTS.splice(0, B2B_PRODUCTS.length, ...data.wholesaleProducts);
  DISTRIBUTORS.splice(0, DISTRIBUTORS.length, ...data.distributors);
  COUPONS.splice(0, COUPONS.length, ...data.coupons);
}
