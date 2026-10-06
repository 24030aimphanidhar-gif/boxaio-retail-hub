> Hosting update: the default commands now use static JSON/browser storage. See [HOSTING-FILEZILLA.md](HOSTING-FILEZILLA.md). The Node API described below is optional: use dev:api / build:api / start:api from the project root.

# Architecture

The root is an npm workspace with `frontend` and `backend` packages.

1. Frontend bootstrap flushes unsaved app-state changes, then requests `/Boxaio-Grocery/api/bootstrap`.
2. Backend reads the catalogue from `backend/data/*.json` and the browser's demo workspace from `backend/runtime/demo-db.json`.
3. Frontend hydrates its cache, configures shared catalogue data, then mounts React.
4. Existing cart, address, saved-list and store-management actions use `src/api/storage.ts`. It preserves the synchronous cache interface while queueing JSON writes to the backend. An outbox survives failed requests and reloads.
5. Checkout uses dedicated HTTP endpoints. The backend owns attempt idempotency, transaction IDs, stock reservations, balance changes and confirmed records. Order history screens project those canonical records without making a second order.
6. Backend and frontend share pure domain rules under `backend/src/domain`; server entry points and file persistence are never imported into the browser bundle.

`frontend/vite.config.ts`, the router basepath, base-aware compatibility links, retailer path matching, product images and API client consistently use `/Boxaio-Grocery/`. Development proxies its API namespace to port 4000. The combined production server hosts built assets and returns `index.html` for nested app routes.

The backend serves a local demo. Workspace partitioning is convenience isolation, not authentication. Generic mock state remains client-editable. Real multi-user commerce requires authenticated server-side authorisation, database transactions, payment verification and notification providers.
