import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createDatabase } from "./database.mjs";
const require = createRequire(import.meta.url);
const engine = require("../dist/domain/checkout.js");
const ledgerAdapter = require("../dist/domain/ledger.js");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const json = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, "data", name + ".json"), "utf8"));
export const catalogue = {
  products: json("products"),
  wholesaleProducts: json("wholesale-products"),
  distributors: json("distributors"),
  coupons: json("coupons"),
  reviews: json("reviews"),
  testimonials: json("testimonials"),
  addresses: json("addresses"),
  customerOrders: json("customer-orders"),
  wholesaleOrders: json("wholesale-orders"),
  retailer: json("retailer"),
  accounts: json("accounts"),
};
const BASE = "/Boxaio-Grocery";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
async function body(req) {
  let size = 0,
    chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 2 * 1024 * 1024) {
      const e = Error("Request too large");
      e.status = 413;
      throw e;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString() || "{}");
  } catch {
    throw Error("Invalid JSON body.");
  }
}
function send(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(value));
}
function validInput(i) {
  if (
    !i ||
    !["consumer", "wholesale"].includes(i.mode) ||
    typeof i.account !== "string" ||
    !i.account ||
    i.account.length > 150 ||
    !Array.isArray(i.lines) ||
    !i.lines.length ||
    i.lines.length > 200
  )
    throw Error("Invalid checkout input.");
  for (const a of [i.address, i.billing])
    if (
      !a ||
      !["name", "phone", "street", "city", "state", "pincode"].every(
        (k) => typeof a[k] === "string",
      )
    )
      throw Error("Complete delivery and billing addresses are required.");
  if (
    !["deliveryId", "deliveryDate", "slot", "coupon", "payment"].every(
      (k) => typeof i[k] === "string",
    ) ||
    !Number.isFinite(i.points) ||
    !Number.isFinite(i.wallet)
  )
    throw Error("Invalid checkout fields.");
  const keys = new Set();
  for (const l of i.lines) {
    if (
      !l ||
      typeof l.key !== "string" ||
      keys.has(l.key) ||
      typeof l.productId !== "string" ||
      typeof l.sellerId !== "string" ||
      !Number.isInteger(l.quantity) ||
      typeof l.variant !== "string"
    )
      throw Error("Invalid or duplicate product line.");
    keys.add(l.key);
  }
}
export function createApp({
  databasePath = process.env.BOXAIO_DB_FILE ||
    path.join(root, "runtime/demo-db.json"),
  frontendDir = path.resolve(root, "../frontend/dist"),
} = {}) {
  const db = createDatabase(databasePath, catalogue);
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      let route = url.pathname;
      if (route === "/" || route === BASE) {
        res.writeHead(302, { Location: BASE + "/" });
        res.end();
        return;
      }
      if (route === BASE + "/api/health") {
        send(res, 200, {
          status: "ok",
          service: "boxaio-json-mock-api",
          base: BASE + "/",
          mock: true,
        });
        return;
      }
      if (route.startsWith(BASE + "/api/")) {
        route = route.slice((BASE + "/api").length);
        const workspace = req.headers["x-demo-workspace"];
        if (
          typeof workspace !== "string" ||
          !/^[-a-zA-Z0-9]{8,80}$/.test(workspace)
        ) {
          send(res, 400, {
            error: "A valid X-Demo-Workspace header is required.",
          });
          return;
        }
        const payload = ["POST", "PUT", "PATCH"].includes(req.method)
          ? await body(req)
          : {};
        // All domain mutations below are synchronous, so one Node process serializes them.
        const state = db.get(workspace);
        ledgerAdapter.configureLedger(
          () => structuredClone(state.ledger),
          (value) => {
            state.ledger = structuredClone(value);
            db.save(workspace, state);
          },
        );
        if (req.method === "GET" && route === "/bootstrap") {
          send(res, 200, {
            catalogue,
            state: state.state,
            ledger: state.ledger,
          });
          return;
        }
        if (req.method === "GET" && route === "/catalogue") {
          send(res, 200, catalogue);
          return;
        }
        if (req.method === "GET" && route === "/products") {
          const q = (url.searchParams.get("q") || "").toLowerCase();
          send(
            res,
            200,
            catalogue.products.filter(
              (p) => !q || (p.name + " " + p.brand).toLowerCase().includes(q),
            ),
          );
          return;
        }
        if (req.method === "GET" && route.startsWith("/products/")) {
          const p = catalogue.products.find((p) => p._id === route.slice(10));
          send(res, p ? 200 : 404, p || { error: "Product not found" });
          return;
        }
        if (req.method === "GET" && route === "/distributors") {
          send(res, 200, catalogue.distributors);
          return;
        }
        if (req.method === "GET" && route === "/checkout") {
          send(res, 200, state.ledger);
          return;
        }
        if (req.method === "GET" && route === "/orders") {
          send(
            res,
            200,
            state.ledger.orders.filter(
              (o) =>
                !url.searchParams.get("account") ||
                o.account === url.searchParams.get("account"),
            ),
          );
          return;
        }
        if (req.method === "PUT" && route.startsWith("/state/")) {
          const key = decodeURIComponent(route.slice(7));
          if (
            !/^boxaio_[a-zA-Z0-9_.@+:-]{1,180}$/.test(key) ||
            [
              "boxaio_checkout_v1",
              "boxaio_user",
              "boxaio_demo_workspace",
              "boxaio_checkout_legacy_backup",
            ].includes(key)
          )
            throw Error("This state key is not writable.");
          if (payload.value !== null && typeof payload.value !== "string")
            throw Error("State value must be a string or null.");
          if (payload.value === null) delete state.state[key];
          else state.state[key] = payload.value;
          db.save(workspace, state);
          send(res, 200, { saved: true });
          return;
        }
        if (req.method === "POST" && route === "/checkout/quote") {
          validInput(payload.input);
          send(res, 200, engine.calculate(payload.input));
          return;
        }
        if (req.method === "POST" && route === "/checkout/attempts") {
          validInput(payload.input);
          const id = req.headers["idempotency-key"];
          if (typeof id !== "string" || !/^[-a-zA-Z0-9]{8,100}$/.test(id))
            throw Error("A valid Idempotency-Key header is required.");
          if (!Number.isFinite(payload.expectedTotal))
            throw Error("Expected total is required.");
          const value = engine.beginAttempt(
            payload.input,
            id,
            payload.expectedTotal,
          );
          send(res, 200, { value, ledger: state.ledger });
          return;
        }
        const attempt = route.match(
          /^\/checkout\/attempts\/([-a-zA-Z0-9]+)\/(result|cancel)$/,
        );
        if (req.method === "POST" && attempt) {
          let value = null;
          if (attempt[2] === "result") {
            if (!["success", "failure", "pending"].includes(payload.outcome))
              throw Error("Invalid mock payment result.");
            value = engine.settleAttempt(attempt[1], payload.outcome);
          } else engine.cancelAttempt(attempt[1]);
          send(res, 200, { value, ledger: state.ledger });
          return;
        }
        const cancel = route.match(/^\/orders\/([-a-zA-Z0-9]+)\/cancel$/);
        if (req.method === "POST" && cancel) {
          const order = state.ledger.orders.find((o) => o.id === cancel[1]);
          if (!order) {
            send(res, 404, { error: "Order not found" });
            return;
          }
          if (!order.cancelled) {
            const b = ledgerAdapter.balanceFor(order.account, state.ledger);
            state.ledger.balances[order.account] = {
              points: b.points + order.quote.points,
              wallet: b.wallet + order.quote.wallet,
              credit:
                b.credit +
                (order.input.payment === "Retailer credit"
                  ? order.quote.total
                  : 0),
            };
            order.cancelled = true;
            db.save(workspace, state);
          }
          send(res, 200, { value: null, ledger: state.ledger });
          return;
        }
        send(res, 404, { error: "API route not found" });
        return;
      }
      if (!["GET", "HEAD"].includes(req.method)) {
        send(res, 405, { error: "Method not allowed" });
        return;
      }
      if (!route.startsWith(BASE + "/")) {
        send(res, 404, { error: "Use " + BASE + "/" });
        return;
      }
      const relative = decodeURIComponent(route.slice(BASE.length + 1));
      let file = path.resolve(frontendDir, relative || "index.html");
      if (!file.startsWith(path.resolve(frontendDir) + path.sep)) {
        send(res, 403, { error: "Invalid path" });
        return;
      }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        if (path.extname(relative)) {
          send(res, 404, { error: "Asset not found" });
          return;
        }
        file = path.join(frontendDir, "index.html");
      }
      if (!fs.existsSync(file)) {
        send(res, 503, { error: "Frontend build missing. Run npm run build." });
        return;
      }
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": file.includes(path.sep + "assets" + path.sep)
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      });
      if (req.method === "HEAD") res.end();
      else fs.createReadStream(file).pipe(res);
    } catch (e) {
      console.error(req.method, req.url, e.message);
      send(res, e.status || 400, { error: e.message });
    }
  });
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT || 4000);
  createApp().listen(port, "127.0.0.1", () =>
    console.log(
      "Boxaio backend: http://127.0.0.1:" + port + BASE + "/ (JSON mock data)",
    ),
  );
}
