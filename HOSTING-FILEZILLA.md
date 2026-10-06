# Host Boxaio on Windows using FileZilla

Target: https://swapnabharathi.sblsol.com/Boxaio-Grocery/

This delivery is a static mock application: upload only the CONTENTS of frontend/dist. Node.js is needed on your development computer to build, but is NOT needed on the hosting server. The separate backend source remains available for a future API deployment.

## 1. Run the same mode locally

Install Node.js 22.12 or newer. Open a terminal in the project root (the folder containing frontend, backend and package.json):

```sh
npm install
npm run dev
```

Open http://localhost:5173/Boxaio-Grocery/ (or the exact localhost address Vite prints).

To check the exact upload build:

```sh
npm run build
npm run preview
```

Open http://localhost:4173/Boxaio-Grocery/.

Both commands use static JSON and browser storage by default. No environment file or domain change is required. frontend/.env.example documents VITE_DATA_MODE=static; copy it to frontend/.env.local only if you need an explicit local configuration. Never set it to api for a dist-only upload. Variables named VITE_* are public, so do not place passwords in them.

Do not open index.html by double-clicking it; use the preview command above.

## 2. Upload with FileZilla

1. Extract Boxaio-Grocery-upload.zip into a folder on your computer. It contains index.html, web.config, assets, products, mock-data and other public assets directly at its root.
2. Open FileZilla Client > File > Site Manager > New Site.
3. Enter the FTP/SFTP host, username, password, port and protocol supplied by your hosting provider. The HTTPS website URL is not necessarily the FTP host. Use SFTP or explicit FTP over TLS when supported. Do not enter the /Boxaio-Grocery URL in the Host field.
4. Connect. On the RIGHT (remote) side, open the website root for swapnabharathi.sblsol.com. Windows hosts often call this httpdocs or wwwroot, but use the directory your provider confirms.
5. Inside that site root, open or create the folder named exactly Boxaio-Grocery. If your FTP account already opens inside that folder, do not create another copy.
6. Download a backup of the existing Boxaio-Grocery folder before replacing files. Do not change other applications in the site root.
7. On the LEFT (local) side, open the extracted upload package, or frontend/dist after a fresh build.
8. Upload its CONTENTS to the remote Boxaio-Grocery folder. Upload assets/products/mock-data first, then index.html and web.config. The remote path must be Boxaio-Grocery/index.html, NOT Boxaio-Grocery/dist/index.html.
9. Wait for the transfer queue to finish. Check the Failed transfers tab and retry any failures.
10. Open https://swapnabharathi.sblsol.com/Boxaio-Grocery/ and hard-refresh with Ctrl+F5.

Expected remote layout:

```text
<website-root>/
  Boxaio-Grocery/
    index.html
    web.config
    assets/
    products/
    mock-data/
      catalogue.json
    ...other files from dist
```

Do not upload node_modules, backend/runtime, source files, .env files or the whole source ZIP into the public site folder. FileZilla transfers files; uploading a ZIP alone does not extract it. Extract locally first.

## 3. Windows IIS requirement

The supplied web.config assumes your Windows web server is IIS. It keeps the /Boxaio-Grocery/ prefix, serves JSON/images and rewrites application routes to index.html so refreshing product/checkout pages works. Ask your hosting provider to enable IIS Static Content and the IIS URL Rewrite module and allow this folder's web.config settings. If they use another Windows web server, ask for its equivalent SPA fallback to /Boxaio-Grocery/index.html.

Do not replace a parent website web.config with this file. Put it only in Boxaio-Grocery. If the folder already has custom IIS rules, keep a backup and have the provider merge them.

## 4. Verify after upload

- Open /Boxaio-Grocery/mock-data/catalogue.json: JSON should load, not a 404 or an HTML page.
- Open /Boxaio-Grocery/products/prod_001 directly, then refresh.
- Add a product, place a simulated order, refresh the confirmation and check order history.
- Open the retailer workspace and check bulk packs, supplier detail and saved catalogue.
- Check on a phone using HTTPS; location permission requires a secure origin.

Troubleshooting:

| Symptom | Check |
| --- | --- |
| Blank page or missing CSS | Upload all files to the correct folder; do not nest dist. Check Failed transfers and refresh. |
| Homepage works but refresh on a product gives 404 | web.config is missing, URL Rewrite is not installed, or parent rules intercept the request. Ask the host to enable the supplied SPA rewrite. |
| HTTP 500.19 after upload | Ask the host for the exact IIS error: URL Rewrite may be unavailable, a section may be locked, or inherited configuration may conflict. |
| Demo data cannot load | Upload mock-data/catalogue.json and confirm IIS serves .json as application/json. |
| Browser tries /api/bootstrap | An API build was uploaded. Run npm run build with VITE_DATA_MODE unset or static, then upload the new dist contents. |
| Old content persists | Ctrl+F5, check the uploaded index.html/assets and any hosting/CDN cache. |

## 5. Updating data and future changes

Edit the JSON seeds in backend/data, run npm run build, and upload the new frontend/dist contents again. The build generates mock-data/catalogue.json. Saved orders are snapshots and do not change when prices change.

Static hosting cannot write server JSON files. Orders, addresses, catalogue saves and other edits persist only in that browser on that origin. Another device, private window or localhost has separate state. Clearing browser site storage removes that browser's demo data. Payments, login and notifications remain simulated; do not use this build to collect real payments or confidential customer information.

The source also retains an optional Node API mode: npm run dev:api, or npm run build:api followed by npm run start:api. It requires a running Node server and cannot be activated by uploading dist alone. API mode uses port 4000 and /Boxaio-Grocery/api; switching data modes on the same origin should use a separate browser profile to avoid mixing demo caches. Run npm run build again before the next static upload.

References: [IIS URL Rewrite](https://learn.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference) and [FileZilla upload workflow](https://developer.wordpress.org/advanced-administration/upgrade/ftp/filezilla/).
