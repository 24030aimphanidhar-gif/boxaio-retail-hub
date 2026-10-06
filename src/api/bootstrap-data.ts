import products from "../../../backend/data/products.json";
import wholesaleProducts from "../../../backend/data/wholesale-products.json";
import distributors from "../../../backend/data/distributors.json";
import coupons from "../../../backend/data/coupons.json";
import reviews from "../../../backend/data/reviews.json";
import testimonials from "../../../backend/data/testimonials.json";
import addresses from "../../../backend/data/addresses.json";
import customerOrders from "../../../backend/data/customer-orders.json";
import wholesaleOrders from "../../../backend/data/wholesale-orders.json";
import retailer from "../../../backend/data/retailer.json";
import accounts from "../../../backend/data/accounts.json";
export const mockData = {
  products,
  wholesaleProducts,
  distributors,
  coupons,
  reviews,
  testimonials,
  addresses,
  customerOrders,
  wholesaleOrders,
  retailer,
  accounts,
};
export function configureMockData(data: typeof mockData) {
  Object.assign(mockData, data);
}
