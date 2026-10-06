import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { orderTotals } from "@/retailer/b2b/pricing";
import { money } from "@/lib/demo-orders";
export const Route = createFileRoute("/retailer/cart")({ component: BulkCart });
function BulkCart() {
  const { items, setQuantity, removeItem, toOrderItems } = useB2BCart();
  const totals = orderTotals(toOrderItems());
  const suppliers = [...new Set(items.map((i) => i.distributorName))];
  return (
    <div className="wrap business-page">
      <div className="business-page-heading">
        <div>
          <span className="eyebrow">YOUR NEXT RESTOCK</span>
          <h1>Your bulk basket</h1>
          <p>
            {items.length} product variations from {suppliers.length} distributors.
          </p>
        </div>
        <Link to="/retailer/shop" className="outline-button">
          Keep shopping
        </Link>
      </div>
      {!items.length ? (
        <div className="empty-state">
          <Package size={35} />
          <h2>Ready for a fresh restock?</h2>
          <Link to="/retailer/catalogue" search={{ tab: "mine" }} className="solid-button">
            Shop my catalogue
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <section>
            {suppliers.map((supplier) => (
              <div className="supplier-basket-group" key={supplier}>
                <h2>{supplier}</h2>
                {items
                  .filter((i) => i.distributorName === supplier)
                  .map((i) => (
                    <article className="bulk-basket-line" key={i.key}>
                      <img src={i.image} alt="" />
                      <div>
                        <h3>{i.name}</h3>
                        <p>{i.unit}</p>
                        <small>
                          {money(i.price)} / pack ·{" "}
                          {i.discountPct
                            ? `${i.discountPct}% volume savings`
                            : "Standard wholesale price"}
                        </small>
                        <div className="bulk-line-controls">
                          <div className="quantity-stepper">
                            <button
                              aria-label={"Decrease " + i.name + " " + i.variantId}
                              disabled={i.quantity <= i.moq}
                              onClick={() => setQuantity(i.key, i.quantity - i.increment)}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              aria-label={"Quantity " + i.name + " " + i.variantId}
                              type="number"
                              min={i.moq}
                              max={i.max}
                              step={i.increment}
                              value={i.quantity}
                              onChange={(e) => setQuantity(i.key, Number(e.target.value))}
                            />
                            <button
                              aria-label={"Increase " + i.name + " " + i.variantId}
                              disabled={i.quantity + i.increment > i.max}
                              onClick={() => setQuantity(i.key, i.quantity + i.increment)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            aria-label={"Remove " + i.name + " " + i.variantId}
                            onClick={() => removeItem(i.key)}
                          >
                            <Trash2 size={15} />
                          </button>
                          <strong>{money(i.price * i.quantity)}</strong>
                        </div>
                        {i.error && (
                          <p role="alert" className="supply-error">
                            {i.error}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            ))}
          </section>
          <aside className="order-summary">
            <h2>Wholesale order summary</h2>
            <dl>
              <div>
                <dt>After volume savings</dt>
                <dd>{money(totals.subtotal)}</dd>
              </div>
              <div>
                <dt>Order discount</dt>
                <dd>−{money(totals.discount)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>{totals.deliveryFee ? money(totals.deliveryFee) : "Free"}</dd>
              </div>
              <div className="summary-total">
                <dt>Total</dt>
                <dd>{money(totals.total)}</dd>
              </div>
            </dl>
            <p className="summary-assurance">
              5% extra order discount above ₹20,000. Free delivery above ₹5,000 or when all
              suppliers include delivery.
            </p>
            {items.every((i) => !i.error) && (
              <Link to="/retailer/checkout" className="solid-button basket-checkout">
                Review & checkout <ArrowRight size={15} />
              </Link>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
