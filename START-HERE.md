# Boxaio Grocery

Consumer and retailer grocery demo with separate frontend/ and backend/ folders and editable JSON mock data.

The default build is ready for static Windows/IIS hosting at **https://swapnabharathi.sblsol.com/Boxaio-Grocery/**. Local development uses the same /Boxaio-Grocery/ base path and static data mode.

## Commands (project root, Node 22.12+)

```sh
npm install
npm run dev
```

Local: http://localhost:5173/Boxaio-Grocery/.

```sh
npm run build
npm run preview
```

Preview: http://localhost:4173/Boxaio-Grocery/. Upload the CONTENTS of frontend/dist to the site's Boxaio-Grocery folder. The build includes web.config and mock-data/catalogue.json. No server-side Node process is required for this mode.

See [HOSTING-FILEZILLA.md](HOSTING-FILEZILLA.md) for the exact upload steps, Windows prerequisites and troubleshooting.

## Structure

- frontend/src: React UI, API/static adapters, routes and checkout components.
- frontend/public: product image fallbacks and IIS configuration.
- frontend/dist: generated upload files.
- backend/data: editable JSON mock seeds, used in both modes.
- backend/src: optional Node JSON API and shared checkout domain rules.
- scripts/prepare-static.mjs: generates public mock JSON before development/build.
- frontend/tests and backend/tests: checkout, catalogue and persistence checks.

## Persistence and optional API mode

Static mode saves edits and simulated orders in browser storage, separately on localhost and the hosted domain. It does not share data across devices. Payment/login/notifications remain demos. No real payment provider or production authentication is connected.

The optional Node backend retains server JSON persistence. Use npm run dev:api, or npm run build:api then npm run start:api. Its URL is http://127.0.0.1:4000/Boxaio-Grocery/. It cannot run on static-only hosting. Run npm run build again before uploading static files.

Edit backend/data JSON and rebuild to update products/suppliers/offers. Existing orders remain snapshots. Run npm run typecheck and npm test to verify changes.
