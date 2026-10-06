> Hosting update: the default commands now use static JSON/browser storage. See [HOSTING-FILEZILLA.md](../HOSTING-FILEZILLA.md). The Node API described below is optional: use dev:api / build:api / start:api from the project root.

# Backend

`src/server.mjs` uses Node's HTTP server. `src/database.mjs` persists JSON snapshots. `src/domain` contains TypeScript business rules, compiled to `dist/domain` by `scripts/build.mjs`. It imports only local domain modules and JSON data; it does not depend on frontend code.

All APIs are under `/Boxaio-Grocery/api`. Except health, supply `X-Demo-Workspace` with the browser's generated workspace ID. This identifies a demo data partition, not an authenticated user.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Service health and base URL |
| GET | `/bootstrap` | Catalogue, saved app state and checkout ledger |
| GET | `/catalogue` | JSON catalogue and demo datasets |
| GET | `/products?q=tomato` | Search consumer products |
| GET | `/products/:id` | Product detail |
| GET | `/distributors` | Distributor data |
| GET | `/checkout` | Persisted attempts, orders and balances |
| GET | `/orders?account=email` | Confirmed checkout records |
| PUT | `/state/:key` | Persist a permitted app-state key, `{value: string or null}` |
| POST | `/checkout/quote` | Revalidate and quote `{input}` |
| POST | `/checkout/attempts` | `{input, expectedTotal}` plus `Idempotency-Key` header |
| POST | `/checkout/attempts/:id/result` | Mock `{outcome: "success" or "failure" or "pending"}` |
| POST | `/checkout/attempts/:id/cancel` | Cancel an unconfirmed attempt |
| POST | `/orders/:id/cancel` | Cancel and restore mock balances/reservations once |

Requests have a 2 MB size limit. The generic state endpoint cannot overwrite the checkout ledger. Checkout totals are recalculated from backend JSON; client prices are ignored. Confirmed attempts return the original order when repeated. All mock checkout mutations run synchronously in one Node process and save with atomic file replacement.

`runtime/demo-db.json` is generated automatically. Keep this file to retain demo changes. Tests use temporary isolated databases and do not clear the user's runtime file. `data/checkout.json` documents the empty ledger shape; runtime ledgers start with that empty state.

The explicit result endpoint is a simulator, not a real payment webhook. Replace it with authenticated, provider-verified payment handling before real commerce. No external messages are sent.
