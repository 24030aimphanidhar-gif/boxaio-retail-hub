import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "../context/CartContext";
import { money } from "../lib/demo-orders";
import { toast } from "sonner";
export function Cart() {
  const { cart, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50;
  if (!cart.length)
    return (
      <div className="wrap empty-state">
        <ShoppingBag size={40} />
        <h1>Your basket is full of possibilities.</h1>
        <p>Let's find a few everyday favourites.</p>
        <Link href="/products" className="solid-button">
          Start shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  return (
    <div className="wrap checkout-page">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Your basket</span>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">A BASKET FULL OF GOOD THINGS</span>
          <h1>Your basket</h1>
          <p>{cart.reduce((s, i) => s + i.quantity, 0)} essentials, ready for your everyday.</p>
        </div>
        <Link href="/products" className="outline-button">
          Keep shopping <ArrowRight size={15} />
        </Link>
      </div>
      <div className="checkout-layout">
        <section className="basket-products">
          {cart.map((i) => (
            <article key={i.id} className="basket-item">
              <Link href={"/products/" + i.productId}>
                <img src={i.image} alt={i.name} />
              </Link>
              <div>
                <span className="eyebrow">
                  {i.type === "bulk" ? "BULK PACK" : "EVERYDAY ESSENTIAL"}
                </span>
                <Link href={"/products/" + i.productId}>
                  <h2>{i.name}</h2>
                </Link>
                <p>
                  {i.unit} · {money(i.price)} each
                </p>
                <button
                  onClick={() => {
                    removeFromCart(i.id);
                    toast.success(i.name + " removed");
                  }}
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
              <div className="quantity-stepper">
                <button
                  aria-label={"Decrease " + i.name}
                  disabled={i.quantity <= 1}
                  onClick={() => updateQuantity(i.id, i.quantity - 1)}
                >
                  <Minus size={14} />
                </button>
                <span>{i.quantity}</span>
                <button
                  aria-label={"Increase " + i.name}
                  disabled={i.quantity >= 99}
                  onClick={() => updateQuantity(i.id, i.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
              <strong>{money(i.price * i.quantity)}</strong>
            </article>
          ))}
          <div className="basket-delivery">
            {shipping
              ? `You're ${money(501 - subtotal)} away from free delivery.`
              : "A little extra goodness: your delivery is free."}
          </div>
        </section>
        <aside className="order-summary">
          <h2>Order summary</h2>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{shipping ? money(shipping) : "Free"}</dd>
            </div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{money(subtotal + shipping)}</dd>
            </div>
          </dl>
          <Link href="/checkout" className="solid-button basket-checkout">
            Continue to checkout <ArrowRight size={16} />
          </Link>
          <p className="summary-assurance">Apply BOXAIO10 at checkout for 10% off.</p>
          <small>Mock checkout. No real payment is collected.</small>
        </aside>
      </div>
    </div>
  );
}
