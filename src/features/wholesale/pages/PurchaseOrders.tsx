import { downloadCheckoutInvoice } from "@/features/checkout/storage";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown,
  Download,
  Package,
  Search,
  ShoppingBag,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { QuickReorder } from "@/features/wholesale/components/QuickReorder";
import { fetchMyOrders, markOrderDelivered } from "@/retailer/b2b/service";
import { B2B_ORDER_STATUS_LABELS, type B2BOrder } from "@/retailer/b2b/types";
import { useAsync, useRetailerSession } from "@/retailer/hooks";
import { money } from "@/lib/demo-orders";
const date = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
function receipt(o: B2BOrder) {
  if (o.checkout) return downloadCheckoutInvoice(o.checkout);
  const text = [
    "BOXAIO — DEMO PURCHASE RECEIPT",
    o.id,
    date(o.placedAt),
    "Status: " + B2B_ORDER_STATUS_LABELS[o.status],
    ...o.items.map(
      (i) =>
        `${i.name} | ${i.distributor || "Sample supplier"} | ${i.quantity} x ${i.unit} | INR ${(i.quantity * i.unitPrice).toFixed(2)}`
    ),
    `Subtotal: INR ${o.subtotal.toFixed(2)}`,
    `Discount: INR ${o.discount.toFixed(2)}`,
    `Delivery: INR ${o.deliveryFee.toFixed(2)}`,
    `Total: INR ${o.total.toFixed(2)}`,
    o.deliveryAddress,
    "Mock order. No payment was collected.",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = o.id + "-purchase-receipt.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function PurchaseOrders() {
  const { user } = useRetailerSession();
  const orders = useAsync(() => fetchMyOrders(user?.email || ""), [user?.email]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const rows = orders.data || [];
  const active = rows.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const delivered = rows.filter((o) => o.status === "delivered");
  const filtered = rows
    .filter(
      (o) =>
        (status === "all" ||
          (status === "active"
            ? !["delivered", "cancelled"].includes(o.status)
            : o.status === status)) &&
        `${o.id} ${o.items.map((i) => i.name + " " + i.distributor).join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase())
    )
    .sort((a, b) =>
      sort === "value"
        ? b.total - a.total
        : sort === "oldest"
          ? +new Date(a.placedAt) - +new Date(b.placedAt)
          : +new Date(b.placedAt) - +new Date(a.placedAt)
    );
  async function confirm(id: string) {
    if (busy) return;
    setBusy(id);
    try {
      await markOrderDelivered(id);
      orders.reload();
      toast.success("Delivery confirmed. Your catalogue is up to date.");
    } catch {
      toast.error("Could not save delivery. Please try again.");
    } finally {
      setBusy(null);
    }
  }
  return (
    <main className="wrap business-page purchase-page">
      <div className="business-page-heading">
        <div>
          <span className="eyebrow">YOUR BUSINESS, WELL STOCKED</span>
          <h1>Purchase orders</h1>
          <p>Track each restock, review supplier details, and order your essentials again.</p>
        </div>
        <Link to="/retailer/shop" className="solid-button">
          <ShoppingBag size={16} />
          New purchase
        </Link>
      </div>
      <div className="business-stats">
        <div>
          <Package size={22} />
          <span>
            <strong>{rows.length}</strong>
            <small>Total orders</small>
          </span>
        </div>
        <div>
          <Truck size={22} />
          <span>
            <strong>{active.length}</strong>
            <small>In progress</small>
          </span>
        </div>
        <div>
          <CheckCircle2 size={22} />
          <span>
            <strong>{delivered.length}</strong>
            <small>Delivered</small>
          </span>
        </div>
      </div>
      <div className="business-tabs" role="group" aria-label="Filter purchase orders">
        {[
          ["all", "All orders"],
          ["active", "In progress"],
          ["delivered", "Delivered"],
          ["cancelled", "Cancelled"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={status === value}
            className={status === value ? "selected" : ""}
            onClick={() => setStatus(value)}
          >
            {label}{" "}
            <span>
              {value === "all"
                ? rows.length
                : value === "active"
                  ? active.length
                  : rows.filter((o) => o.status === value).length}
            </span>
          </button>
        ))}
      </div>
      <div className="business-toolbar">
        <label className="business-search">
          <Search size={17} />
          <input
            aria-label="Search purchase orders"
            placeholder="Search order ID, product or distributor"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Sort purchase orders"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="value">Highest value</option>
        </select>
      </div>
      <p className="business-count">
        {filtered.length} orders · Open an order to review packs, supplier prices, and delivery
        details.
      </p>
      {orders.loading ? (
        <p className="empty-state">Loading purchases…</p>
      ) : orders.error ? (
        <div className="empty-state" role="alert">
          <p>{orders.error}</p>
          <button className="outline-button" onClick={orders.reload}>
            Try again
          </button>
        </div>
      ) : !filtered.length ? (
        <div className="empty-state">
          <Package size={36} />
          <h2>{rows.length ? "No matching orders" : "Your first restock starts here"}</h2>
          <p>
            {rows.length
              ? "Try a different search or order status."
              : "Browse wholesale essentials and choose your preferred supplier."}
          </p>
          {rows.length ? (
            <button
              className="outline-button"
              onClick={() => {
                setStatus("all");
                setQuery("");
              }}
            >
              Reset filters
            </button>
          ) : (
            <Link to="/retailer/shop" className="solid-button">
              Browse wholesale
            </Link>
          )}
        </div>
      ) : (
        <div className="purchase-list">
          {filtered.map((o) => {
            const open = expanded === o.id;
            return (
              <article className={"purchase-order " + (open ? "is-expanded" : "")} key={o.id}>
                <div className="purchase-order-top">
                  <div>
                    <strong>{o.id}</strong>
                    <small>
                      Placed {date(o.placedAt)} · {o.items.length} product{" "}
                      {o.items.length === 1 ? "variation" : "variations"}
                    </small>
                  </div>
                  <span className={"order-status " + o.status}>
                    {B2B_ORDER_STATUS_LABELS[o.status]}
                  </span>
                </div>
                <div className="purchase-order-summary">
                  <div className="purchase-preview">
                    {o.items.slice(0, 3).map((i, n) => (
                      <img
                        key={n}
                        src={i.image || "/product-placeholder.svg"}
                        alt={i.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/product-placeholder.svg";
                        }}
                      />
                    ))}
                    <p>
                      {o.items
                        .slice(0, 2)
                        .map((i) => i.name)
                        .join(", ")}
                      {o.items.length > 2 ? ` +${o.items.length - 2} more` : ""}
                    </p>
                  </div>
                  <div className="purchase-total">
                    <small>Order total</small>
                    <strong>{money(o.total)}</strong>
                  </div>
                  <button
                    className="outline-button"
                    aria-expanded={open}
                    aria-controls={"details-" + o.id}
                    onClick={() => setExpanded(open ? null : o.id)}
                  >
                    {open ? "Hide details" : "View order"}
                    <ChevronDown size={15} />
                  </button>
                </div>
                {open && (
                  <div id={"details-" + o.id} className="purchase-order-details">
                    <div className="purchase-progress">
                      {["placed", "packed", "shipped", "delivered"].map((s, n) => (
                        <span
                          key={s}
                          className={
                            o.status !== "cancelled" &&
                            ["placed", "packed", "shipped", "delivered"].indexOf(o.status) >= n
                              ? "done"
                              : ""
                          }
                        >
                          <i>{n + 1}</i>
                          {s === "placed"
                            ? "Placed"
                            : s === "packed"
                              ? "Packed"
                              : s === "shipped"
                                ? "On the way"
                                : "Delivered"}
                        </span>
                      ))}
                    </div>
                    <div className="purchase-detail-grid">
                      <div>
                        <h3>Products & suppliers</h3>
                        {o.items.map((i, n) => (
                          <div className="purchase-line" key={n}>
                            <div>
                              <Link
                                to="/retailer/item/$productId"
                                params={{ productId: i.productId }}
                                search={{ supplier: i.distributorId, variant: i.variantId }}
                              >
                                {i.name}
                              </Link>
                              <small>
                                {i.distributor || "Sample supplier"} · {i.unit}
                              </small>
                              <small>
                                {i.quantity} packs × {money(i.unitPrice)}
                              </small>
                            </div>
                            <strong>{money(i.unitPrice * i.quantity)}</strong>
                          </div>
                        ))}
                        <div className="purchase-address">
                          <h3>Delivery address</h3>
                          <p>{o.deliveryAddress}</p>
                          <small>Payment method · {o.paymentMethod} (demo)</small>
                          {o.checkout && (
                            <>
                              <p>
                                {o.checkout.paymentStatus} · Expected{" "}
                                {o.checkout.quote.delivery.date}, {o.checkout.input.slot}
                              </p>
                              {o.checkout.shipments.map((s) => (
                                <p key={s.id}>
                                  {s.seller} · {s.id} · {s.lineKeys.length} product lines
                                </p>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                      <aside>
                        <div className="purchase-breakdown">
                          <h3>Order summary</h3>
                          <dl>
                            <div>
                              <dt>Subtotal</dt>
                              <dd>{money(o.subtotal)}</dd>
                            </div>
                            <div>
                              <dt>Discount</dt>
                              <dd>−{money(o.discount)}</dd>
                            </div>
                            <div>
                              <dt>Delivery</dt>
                              <dd>{o.deliveryFee ? money(o.deliveryFee) : "Free"}</dd>
                            </div>
                            <div className="total">
                              <dt>Total</dt>
                              <dd>{money(o.total)}</dd>
                            </div>
                          </dl>
                          <button className="outline-button" onClick={() => receipt(o)}>
                            <Download size={14} />
                            Download receipt
                          </button>
                          {!["delivered", "cancelled"].includes(o.status) && (
                            <button
                              className="solid-button"
                              disabled={!!busy}
                              onClick={() => void confirm(o.id)}
                            >
                              {busy === o.id ? "Saving…" : "Confirm delivery"}
                            </button>
                          )}
                          <p>Demo purchase · no payment collected.</p>
                        </div>
                        <QuickReorder order={o} compact />
                      </aside>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
