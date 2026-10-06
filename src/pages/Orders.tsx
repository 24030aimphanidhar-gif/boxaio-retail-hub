import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Download, Package, Repeat, Search, X } from "lucide-react";
import { toast } from "sonner";
import { cancelOrder, DemoOrder, downloadInvoice, money, readOrders } from "../lib/demo-orders";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
export function Orders() {
  const [orders, setOrders] = useState(readOrders);
  const [tab, setTab] = useState("All orders");
  const [query, setQuery] = useState("");
  const [cancel, setCancel] = useState("");
  const { addToCart } = useCart();
  function reorder(o: DemoOrder) {
    let count = 0;
    o.items.forEach((i) => {
      const p = products.find((p) => p._id === i.productId);
      if (p?.inStock) {
        addToCart(p, i.quantity, i.type);
        count++;
      }
    });
    count
      ? toast.success(count + " products added to your basket")
      : toast.error("These products are currently unavailable");
  }
  const filtered = orders.filter(
    (o) =>
      (tab === "All orders" || o.status === tab) &&
      (!query ||
        (o.id + " " + o.items.map((i) => i.name).join(" "))
          .toLowerCase()
          .includes(query.toLowerCase()))
  );
  return (
    <div className="wrap orders-page">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>My orders</span>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">ALL YOUR GOOD FINDS</span>
          <h1>Your orders</h1>
          <p>Track your deliveries, revisit favourites, or buy them again.</p>
        </div>
        <Link href="/products" className="outline-button">
          Continue shopping <ArrowRight size={15} />
        </Link>
      </div>
      <div className="order-stats">
        <div>
          <Package size={21} />
          <span>
            <strong>{orders.length}</strong>
            <small>Total orders</small>
          </span>
        </div>
        <div>
          <Package size={21} />
          <span>
            <strong>
              {orders.filter((o) => ["Processing", "Shipped"].includes(o.status)).length}
            </strong>
            <small>On their way</small>
          </span>
        </div>
        <div>
          <Repeat size={21} />
          <span>
            <strong>
              {money(
                orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0)
              )}
            </strong>
            <small>Total ordered</small>
          </span>
        </div>
      </div>
      <div className="orders-toolbar">
        <div className="pill-tabs">
          {["All orders", "Processing", "Shipped", "Delivered", "Cancelled"].map((t) => (
            <button key={t} className={tab === t ? "selected" : ""} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <label className="small-search">
          <Search size={15} />
          <input
            aria-label="Search orders"
            placeholder="Search orders or products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="order-list">
        {filtered.length ? (
          filtered.map((o) => (
            <article className="order-panel" key={o.id}>
              <header>
                <div>
                  <strong>{o.id}</strong>
                  <span>
                    Placed{" "}
                    {new Date(o.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span className={"order-status " + o.status.toLowerCase()}>{o.status}</span>
                <strong>{money(o.total)}</strong>
              </header>
              <div className="order-items">
                {o.items.map((i, n) => (
                  <div key={n}>
                    <img src={i.image} alt="" />
                    <span>
                      <strong>{i.name}</strong>
                      <small>
                        {i.quantity} × {i.unit}
                      </small>
                    </span>
                    <b>{money(i.price * i.quantity)}</b>
                  </div>
                ))}
              </div>
              <footer>
                <span>
                  {o.status === "Cancelled"
                    ? "This demo order was cancelled"
                    : `Delivery: ${o.deliveryDate} · ${o.slot}`}
                </span>
                <div>
                  <button onClick={() => downloadInvoice(o)}>
                    <Download size={14} /> Receipt
                  </button>
                  <button onClick={() => reorder(o)}>
                    <Repeat size={14} /> Buy again
                  </button>
                  {o.status === "Processing" && (
                    <button onClick={() => setCancel(o.id)}>Cancel</button>
                  )}
                  <Link href={"/orders/" + o.id + "/tracking"}>
                    Track order <ArrowRight size={14} />
                  </Link>
                </div>
              </footer>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <Package size={35} />
            <h2>No orders found</h2>
            <p>Try a different filter or start a new basket.</p>
          </div>
        )}
      </div>
      {cancel && (
        <div className="dialog-overlay" onClick={() => setCancel("")}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            className="confirm-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="cancel-title">Cancel this order?</h2>
            <p>
              The order will stay in your history as cancelled. You can reorder its products
              anytime.
            </p>
            <div>
              <button className="outline-button" autoFocus onClick={() => setCancel("")}>
                Keep order
              </button>
              <button
                className="solid-button"
                onClick={async () => {
                  try {
                    await cancelOrder(cancel);
                    setOrders(readOrders());
                    setCancel("");
                    toast.success("Order cancelled");
                  } catch (e) {
                    toast.error((e as Error).message);
                  }
                }}
              >
                Cancel order
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
