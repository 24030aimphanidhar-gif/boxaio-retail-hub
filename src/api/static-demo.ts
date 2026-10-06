import type { mockData } from './bootstrap-data';
import type { Ledger } from '../features/checkout/types';
import { configureCatalogue } from '../../backend/src/domain/catalogue';
import { configureLedger, balanceFor } from '../../backend/src/domain/ledger';
import * as engine from '../../backend/src/domain/checkout';

const ledgerKey = 'boxaio_checkout_v1';
function readLedger(): Ledger {
  const raw = localStorage.getItem(ledgerKey);
  if (!raw) return { attempts: {}, orders: [], balances: {} };
  const value = JSON.parse(raw);
  if (!value.attempts || !Array.isArray(value.orders) || !value.balances)
    throw Error('Saved demo checkout data is invalid. Existing data was preserved.');
  return value;
}
function writeLedger(value: Ledger) {
  localStorage.setItem(ledgerKey, JSON.stringify(value));
}
let cataloguePromise: Promise<typeof mockData> | undefined;
async function catalogue() {
  if (!cataloguePromise) {
    cataloguePromise = fetch(import.meta.env.BASE_URL + 'mock-data/catalogue.json', { cache: 'no-cache' })
      .then(async response => {
        if (!response.ok) throw Error('Mock JSON could not be loaded. Upload the mock-data folder.');
        const data = await response.json() as typeof mockData;
        configureCatalogue(data as Parameters<typeof configureCatalogue>[0]);
        return data;
      }).catch(error => { cataloguePromise = undefined; throw error; });
  }
  return cataloguePromise;
}

// Static hosting has no writable server. All mutations stay in this browser.
// Web Locks serialize checkout mutations across tabs when supported.
export async function staticApi<T>(route: string, options: RequestInit = {}): Promise<T> {
  const run = async (): Promise<T> => {
    const data = await catalogue();
    configureLedger(readLedger, writeLedger);
    const payload = options.body ? JSON.parse(String(options.body)) : {};
    const method = options.method || 'GET';
    const result = (value: unknown) => ({ value, ledger: readLedger() }) as T;
    if (route === '/bootstrap') {
      const seeds: Record<string, unknown> = {
        boxaio_addresses: data.addresses,
        boxaio_customer_orders_v2: data.customerOrders,
        boxaio_b2b_orders_v1: data.wholesaleOrders,
        boxaio_retailer_db_v1: data.retailer,
      };
      const state: Record<string, string> = {};
      for (const [key, seed] of Object.entries(seeds))
        state[key] = localStorage.getItem(key) ?? JSON.stringify(seed);
      return { catalogue: data, state, ledger: readLedger() } as T;
    }
    if (method === 'PUT' && route.startsWith('/state/')) {
      const key = decodeURIComponent(route.slice(7));
      if (!key.startsWith('boxaio_') || key === ledgerKey) throw Error('Invalid state key');
      if (payload.value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, payload.value);
      return { saved: true } as T;
    }
    if (route === '/checkout') return readLedger() as T;
    if (route === '/checkout/quote') return engine.calculate(payload.input) as T;
    if (route === '/checkout/attempts' && method === 'POST') {
      const id = new Headers(options.headers).get('Idempotency-Key');
      if (!id) throw Error('Checkout retry key is required');
      return result(engine.beginAttempt(payload.input, id, payload.expectedTotal));
    }
    const attempt = route.match(/^\/checkout\/attempts\/([-a-zA-Z0-9]+)\/(result|cancel)$/);
    if (attempt && method === 'POST') {
      if (attempt[2] === 'cancel') { engine.cancelAttempt(attempt[1]); return result(null); }
      if (!['success', 'failure', 'pending'].includes(payload.outcome)) throw Error('Invalid demo payment result');
      return result(engine.settleAttempt(attempt[1], payload.outcome));
    }
    const cancel = route.match(/^\/orders\/([-a-zA-Z0-9]+)\/cancel$/);
    if (cancel && method === 'POST') {
      const ledger = readLedger();
      const order = ledger.orders.find(o => o.id === cancel[1]);
      if (!order) throw Error('Order not found');
      if (!order.cancelled) {
        const balance = balanceFor(order.account, ledger);
        ledger.balances[order.account] = {
          points: balance.points + order.quote.points,
          wallet: balance.wallet + order.quote.wallet,
          credit: balance.credit + (order.input.payment === 'Retailer credit' ? order.quote.total : 0),
        };
        order.cancelled = true;
        writeLedger(ledger);
      }
      return result(null);
    }
    throw Error('Unsupported static demo operation: ' + route);
  };
  if (navigator.locks) return navigator.locks.request('boxaio-static-checkout', run);
  return run();
}
