import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = {
  products: 'products', wholesaleProducts: 'wholesale-products', distributors: 'distributors',
  coupons: 'coupons', reviews: 'reviews', testimonials: 'testimonials', addresses: 'addresses',
  customerOrders: 'customer-orders', wholesaleOrders: 'wholesale-orders', retailer: 'retailer', accounts: 'accounts',
};
const data = Object.fromEntries(Object.entries(names).map(([key, name]) =>
  [key, JSON.parse(fs.readFileSync(path.join(root, 'backend/data', name + '.json'), 'utf8'))]));
const output = path.join(root, 'public/mock-data');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'catalogue.json'), JSON.stringify(data));
console.log('Prepared public JSON mock data for static hosting.');
