import { Link, useParams } from "wouter";
import { ArrowLeft, Check, Download, MapPin, Package, Truck } from "lucide-react";
import { downloadInvoice, money, readOrders } from "../lib/demo-orders";
export function OrderTracking() {
  const { id } = useParams();
  const order = readOrders().find((o) => o.id === id);
  if (!order)
    return (
      <div className="wrap empty-state">
        <Package size={35} />
        <h1>Order not found</h1>
        <p>This order isn't saved in this browser.</p>
        <Link href="/orders" className="solid-button">
          View your orders
        </Link>
      </div>
    );
  const stage = order.status === "Delivered" ? 3 : order.status === "Shipped" ? 2 : 0;
  return (
    <div className="wrap tracking-page">
      <Link href="/orders" className="back-link">
        <ArrowLeft size={15} /> Back to orders
      </Link>
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR DELIVERY AT A GLANCE</span>
          <h1>
            {order.status === "Cancelled"
              ? "Order cancelled"
              : order.status === "Delivered"
                ? "A little goodness, delivered."
                : "Good things are on their way."}
          </h1>
          <p>
            {order.id} · Placed {new Date(order.date).toLocaleDateString("en-IN")}
          </p>
        </div>
        <button className="outline-button" onClick={() => downloadInvoice(order)}>
          <Download size={15} /> Download receipt
        </button>
      </div>
      <div className="tracking-grid">
        <section className="form-panel">
          <h2>
            <Truck size={21} />{" "}
            {order.status === "Cancelled"
              ? "Delivery cancelled"
              : order.status === "Delivered"
                ? "Delivered on " + order.deliveryDate
                : "Expected " + order.deliveryDate}
          </h2>
          <p>{order.slot} · Demo delivery tracking</p>
          <ol className="tracking-timeline">
            {["Order confirmed", "Preparing your basket", "On the way", "Delivered"].map(
              (label, i) => (
                <li
                  key={label}
                  className={order.status !== "Cancelled" && i <= stage ? "done" : ""}
                >
                  <span>
                    {i <= stage && order.status !== "Cancelled" ? <Check size={16} /> : i + 1}
                  </span>
                  <div>
                    <strong>{label}</strong>
                    <p>
                      {order.status === "Cancelled"
                        ? "Cancelled"
                        : i < stage
                          ? "Completed"
                          : i === stage
                            ? "Current status"
                            : "We’ll update this when your order progresses."}
                    </p>
                  </div>
                </li>
              )
            )}
          </ol>
          <div className="tracking-info">
            This is a mock delivery. Statuses do not represent a real shipment.
          </div>
        </section>
        <aside className="order-summary">
          <h2>
            <MapPin size={19} /> Delivery details
          </h2>
          <p>{order.address}</p>
          <div className="summary-products">
            {order.items.map((i, n) => (
              <div key={n}>
                <img src={i.image} alt="" />
                <span>
                  <strong>{i.name}</strong>
                  <small>
                    {i.quantity} × {i.unit}
                  </small>
                </span>
              </div>
            ))}
          </div>
          <dl>
            <div className="summary-total">
              <dt>Order total</dt>
              <dd>{money(order.total)}</dd>
            </div>
          </dl>
          <Link href="/contact" className="outline-button">
            Need a hand? Contact support
          </Link>
        </aside>
      </div>
    </div>
  );
}
