import { appStorage } from "@/api/storage";
import { beginAttempt, settleAttempt, cancelAttempt } from "@/api/checkout";
import { Link } from "wouter";
import { ProductImage } from "@/features/shared/components/ProductImage";
import { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  Tag,
  CreditCard,
  ArrowRight,
  PackageCheck,
} from "lucide-react";
import { AddressBook, AddressEditor } from "./AddressBook";
import { readAddresses, validateAddress } from "../addresses";
import {
  calculate,
  deliveries,
  reprice,
  COUPONS,
  PAYMENTS,
  day,
  checkoutLock,
  fingerprint,
} from "../engine";
import { balanceFor, readLedger, downloadCheckoutInvoice } from "../storage";
import type {
  CheckoutMode,
  CheckoutLine,
  CheckoutInput,
  CheckoutRecord,
  Attempt,
  PaymentMethod,
  Quote,
} from "../types";
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
const steps = ["Address", "Delivery", "Offers", "Review", "Payment"];
export function CheckoutFlow({
  mode,
  account,
  lines,
  consume,
}: {
  mode: CheckoutMode;
  account: string;
  lines: CheckoutLine[];
  consume: (o: CheckoutRecord) => void;
}) {
  const cartUrl = mode === "consumer" ? "/cart" : "/retailer/cart",
    shopUrl = mode === "consumer" ? "/products" : "/retailer/shop";
  const sessionKey = "boxaio_attempt_" + mode + "_" + account;
  const [attempt, setAttempt] = useState<Attempt | null>(() => {
    const id = sessionStorage.getItem(sessionKey);
    return id ? readLedger().attempts[id] || null : null;
  });
  const [done, setDone] = useState<CheckoutRecord | null>(() =>
    attempt?.status === "confirmed"
      ? readLedger().orders.find((o) => o.id === attempt.orderId) || null
      : null
  );
  const restoredDone = useRef(!!done && !!appStorage.getItem("boxaio_consumed_" + done.id));
  useEffect(() => {
    if (restoredDone.current && lines.length) {
      restoredDone.current = false;
      setDone(null);
      setAttempt(null);
      sessionStorage.removeItem(sessionKey);
      setStep(0);
      setCoupon("");
      setCode("");
      setPoints(0);
      setWallet(0);
    }
  }, [lines.length]);
  const initial = attempt?.input;
  const [address, setAddress] = useState(
    () => initial?.address || readAddresses().find((a) => a.isDefault) || readAddresses()[0]
  );
  const [billing, setBilling] = useState(initial?.billing || address),
    [sameBilling, setSameBilling] = useState(!initial || initial.billing.id === initial.address.id),
    [editBilling, setEditBilling] = useState(false);
  const [step, setStep] = useState(initial ? 4 : 0),
    [deliveryId, setDeliveryId] = useState(initial?.deliveryId || "standard"),
    [date, setDate] = useState(initial?.deliveryDate || day(2)),
    [slot, setSlot] = useState(initial?.slot || "09:00–12:00");
  const [coupon, setCoupon] = useState(initial?.coupon || ""),
    [code, setCode] = useState(initial?.coupon || ""),
    [points, setPoints] = useState(initial?.points || 0),
    [wallet, setWallet] = useState(initial?.wallet || 0),
    [payment, setPayment] = useState<PaymentMethod>(
      initial?.payment || (mode === "wholesale" ? "Retailer credit" : "UPI")
    );
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tick, setTick] = useState(0);
  const lock = useRef(false);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);
  const locked = !!attempt && ["awaiting", "pending"].includes(attempt.status);
  const sourceLines = locked ? attempt.input.lines : lines;
  const input: CheckoutInput = {
    mode,
    account,
    lines: sourceLines,
    address,
    billing: sameBilling ? address : billing,
    deliveryId,
    deliveryDate: date,
    slot,
    coupon,
    points,
    wallet,
    payment,
  };
  let quote: Quote | undefined,
    quoteError = "";
  try {
    if (sourceLines.length) quote = calculate(input);
  } catch (e) {
    quoteError = (e as Error).message;
  }
  let choices: ReturnType<typeof deliveries> = [];
  try {
    if (sourceLines.length) choices = deliveries(mode, reprice(mode, sourceLines), address);
  } catch {}
  const balance = balanceFor(account),
    selected = choices.find((d) => d.id === deliveryId);
  useEffect(() => {
    if (done) {
      consume(done);
    }
  }, [done, lines.length]);
  function next() {
    setError("");
    if (step === 0) {
      const errors = [
        ...validateAddress(address),
        ...validateAddress(sameBilling ? address : billing),
      ];
      if (errors.length) {
        setError(errors[0]);
        return;
      }
    }
    if (
      step === 1 &&
      (!selected ||
        !selected.slots.includes(slot) ||
        (deliveryId === "scheduled" && (date < day(2) || date > day(14))))
    ) {
      setError("Choose an available delivery option, date and slot.");
      return;
    }
    if (step === 2 && quote?.couponError) {
      setError(quote.couponError);
      return;
    }
    setStep(Math.min(4, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function run(fn: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function result(outcome: "success" | "failure" | "pending", id = attempt?.id) {
    if (!id) return;
    const value = await checkoutLock(() => settleAttempt(id, outcome));
    if ("paymentStatus" in value) {
      setDone(value);
      setAttempt(readLedger().attempts[id]);
    } else setAttempt(value);
  }
  function place() {
    void run(async () => {
      if (!quote) throw Error(quoteError || "Review your basket.");
      let id =
        attempt?.fingerprint === fingerprint(input) && attempt.status !== "cancelled"
          ? attempt.id
          : crypto.randomUUID();
      sessionStorage.setItem(sessionKey, id);
      const value = await checkoutLock(() => beginAttempt(input, id, quote.total));
      setAttempt(value);
      if (value.status === "confirmed") {
        setDone(readLedger().orders.find((o) => o.id === value.orderId) || null);
        return;
      }
      if (
        ["Cash on delivery", "Retailer credit", "Pay later"].includes(payment) ||
        quote.total === 0
      )
        await result("success", id);
    });
  }
  function cancel() {
    void run(async () => {
      if (attempt) await checkoutLock(() => cancelAttempt(attempt.id));
      sessionStorage.removeItem(sessionKey);
      setAttempt(null);
    });
  }
  function totals(q: Quote) {
    return (
      <dl className="cx-totals">
        {[
          ["Items before discounts", q.listSubtotal],
          ["Product discounts", -q.productDiscount],
          ["Automatic promotion", -q.promotion],
          ["Coupon savings", -q.couponDiscount],
          ["Delivery charge", q.deliveryCharge],
          ["Loyalty points", -q.points],
          ["Wallet used", -q.wallet],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{money(Number(value))}</dd>
          </div>
        ))}
        <div className="cx-tax">
          <dt>Mock GST included (5%)</dt>
          <dd>{money(q.gstIncluded)}</dd>
        </div>
        <div className="cx-total">
          <dt>Final payable</dt>
          <dd>{money(q.total)}</dd>
        </div>
      </dl>
    );
  }
  function items(q: Quote) {
    return (
      <div className="cx-lines">
        {q.items.map((l) => (
          <div key={l.key}>
            <ProductImage productId={l.productId} src={l.image} alt={l.name} />
            <span>
              <b>{l.name}</b>
              <small>
                {l.quantity} × {l.unit} · {money(l.unitPrice)} each
              </small>
              <small>Sold by {l.seller}</small>
            </span>
            <strong>{money(l.quantity * l.unitPrice)}</strong>
          </div>
        ))}
      </div>
    );
  }
  if (done)
    return (
      <main className="wrap cx-page">
        <section className="cx-success">
          <CheckCircle2 size={44} />
          <span className="eyebrow">ORDER CONFIRMED</span>
          <h1>Order placed successfully</h1>
          <p>
            Your essentials are on their way. This is a demo order; no real payment was collected.
          </p>
          <div className="cx-success-meta">
            <div>
              <small>Customer Order ID</small>
              <b>{done.id}</b>
            </div>
            <div>
              <small>Payment status</small>
              <b>{done.paymentStatus}</b>
            </div>
            <div>
              <small>Total payable</small>
              <b>{money(done.quote.total)}</b>
            </div>
            <div>
              <small>Expected {done.quote.delivery.pickup ? "pickup" : "delivery"}</small>
              <b>
                {done.quote.delivery.date} · {done.input.slot}
              </b>
            </div>
          </div>
        </section>
        <div className="cx-layout">
          <section className="cx-panel">
            <h2>
              <PackageCheck size={20} />
              Products & shipments
            </h2>
            {items(done.quote)}
            {done.shipments.map((s) => (
              <div className="cx-note" key={s.id}>
                <b>
                  {s.seller} · {s.id}
                </b>
                <span>
                  {s.lineKeys.length} product lines · {s.date} · {s.slot}
                </span>
              </div>
            ))}
            <h3>{done.quote.delivery.pickup ? "Contact address" : "Delivery address"}</h3>
            <p>
              {done.input.address.name}, {done.input.address.street}, {done.input.address.line2},{" "}
              {done.input.address.city} {done.input.address.pincode}
            </p>
            <p>
              {done.input.address.phone} · {done.input.address.instructions}
            </p>
            <p className="cx-muted">{done.notification}</p>
            <div className="cx-actions">
              <Link
                className="solid-button"
                href={
                  mode === "consumer" ? "/orders/" + done.id + "/tracking" : "/retailer/my-orders"
                }
              >
                Track Order
              </Link>
              <button className="outline-button" onClick={() => downloadCheckoutInvoice(done)}>
                Download demo invoice
              </button>
              <Link
                className="outline-button"
                href={shopUrl}
                onClick={() => sessionStorage.removeItem(sessionKey)}
              >
                Continue Shopping
              </Link>
            </div>
          </section>
          <aside className="cx-panel">
            <h2>Payment summary</h2>
            {totals(done.quote)}
            <small>
              {done.transactionId} · {done.input.payment}
            </small>
          </aside>
        </div>
      </main>
    );
  if (!sourceLines.length)
    return (
      <div className="wrap empty-state">
        <Truck size={40} />
        <h1>Your basket is empty</h1>
        <p>Add products to start your checkout.</p>
        <Link className="solid-button" href={shopUrl}>
          Continue Shopping
        </Link>
      </div>
    );
  return (
    <main className="wrap cx-page" data-refresh={tick}>
      <div className="cx-heading">
        <div>
          <Link href={cartUrl} className="back-link">
            ← Edit basket
          </Link>
          <h1>{mode === "wholesale" ? "Wholesale checkout" : "Checkout"}</h1>
          <p>Address, delivery and a clear total before you confirm.</p>
        </div>
        <span className="cx-demo">
          <ShieldCheck size={17} />
          Demo checkout · no real collection
        </span>
      </div>
      <nav className="cx-steps" aria-label="Checkout progress">
        {steps.map((s, i) => (
          <button
            key={s}
            disabled={locked || busy}
            aria-current={step === i ? "step" : undefined}
            className={step === i ? "active" : step > i ? "complete" : ""}
            onClick={() => {
              setError("");
              setStep(i);
            }}
          >
            <span>{i + 1}</span>
            {s}
          </button>
        ))}
      </nav>
      <div className="cx-layout">
        <section className="cx-panel">
          {locked ? (
            <div className="cx-gateway">
              <CreditCard size={38} />
              <h2>{attempt.status === "pending" ? "Payment pending" : "Demo payment gateway"}</h2>
              <p>
                {attempt.status === "pending"
                  ? "Your payment is still being checked. This same transaction will be used when you check again."
                  : "Choose a simulated gateway result. No card, UPI PIN or bank credentials are needed."}
              </p>
              <strong>
                {money(attempt.quote.total)} · {attempt.input.payment}
              </strong>
              <small>{attempt.transactionId}</small>
              <div className="cx-actions">
                <button
                  className="solid-button"
                  disabled={busy}
                  onClick={() => void run(() => result("success"))}
                >
                  {attempt.status === "pending" ? "Check status: success" : "Simulate success"}
                </button>
                <button
                  className="outline-button"
                  disabled={busy}
                  onClick={() => void run(() => result("pending"))}
                >
                  Simulate pending
                </button>
                <button
                  className="outline-button"
                  disabled={busy}
                  onClick={() => void run(() => result("failure"))}
                >
                  Simulate failure
                </button>
              </div>
              <button disabled={busy} className="cx-text" onClick={cancel}>
                Cancel demo attempt and edit checkout
              </button>
              <p className="cx-muted">
                The mock gateway result is revalidated against current prices, stock and amount
                before an order is confirmed.
              </p>
            </div>
          ) : (
            <>
              {attempt?.status === "failed" && (
                <div className="cx-error" role="status">
                  Payment failed. No payable order was created. Retry with the same transaction
                  after reviewing your details.
                </div>
              )}
              {step === 0 && (
                <>
                  <AddressBook
                    selected={address}
                    onSelect={(a) => {
                      setAddress(a);
                      setDeliveryId("standard");
                      setSlot("09:00–12:00");
                    }}
                  />
                  <label className="cx-checkbox">
                    <input
                      type="checkbox"
                      checked={sameBilling}
                      onChange={(e) => setSameBilling(e.target.checked)}
                    />
                    Billing address is the same as delivery
                  </label>
                  {!sameBilling &&
                    (editBilling ? (
                      <AddressEditor
                        value={billing}
                        onSave={(a) => {
                          setBilling(a);
                          setEditBilling(false);
                        }}
                        onCancel={() => setEditBilling(false)}
                      />
                    ) : (
                      <div className="cx-note">
                        <b>Billing: {billing.name}</b>
                        <span>
                          {billing.street}, {billing.city} {billing.pincode}
                        </span>
                        <button className="cx-text" onClick={() => setEditBilling(true)}>
                          Edit billing address
                        </button>
                      </div>
                    ))}
                  <p className="cx-muted">
                    Seller coverage is checked when you select an address. Demo delivery cities:
                    Vijayawada, Hyderabad, Guntur, Bengaluru, Gudivada and Machilipatnam. Wholesale
                    coverage depends on the supplier.
                  </p>
                </>
              )}
              {step === 1 && (
                <>
                  <h2>
                    <Truck size={20} />
                    Choose delivery
                  </h2>
                  <p className="cx-muted">
                    Available options for {address.city} {address.pincode}. Cut-offs use your local
                    time.
                  </p>
                  <div className="cx-options">
                    {choices.map((d) => (
                      <label key={d.id} className={deliveryId === d.id ? "selected" : ""}>
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryId === d.id}
                          onChange={() => {
                            setDeliveryId(d.id);
                            setSlot(d.slots[0]);
                          }}
                        />
                        <span>
                          <b>{d.label}</b>
                          <small>
                            {d.date} · {d.charge ? money(d.charge) : "Free"}
                          </small>
                          <small>Cut-off: {d.cutoff}</small>
                          {d.pickup && (
                            <small>
                              Collect at your selected seller's demo pickup desk. Bring your order
                              ID.
                            </small>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                  {!choices.length && (
                    <p className="cx-error">
                      No delivery options for this address and seller combination. Change your
                      address or edit the basket.
                    </p>
                  )}
                  {deliveryId === "scheduled" && (
                    <label className="cx-field">
                      Delivery date
                      <input
                        type="date"
                        min={day(2)}
                        max={day(14)}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </label>
                  )}
                  {selected && (
                    <label className="cx-field">
                      Available slot
                      <select value={slot} onChange={(e) => setSlot(e.target.value)}>
                        {selected.slots.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </>
              )}
              {step === 2 && (
                <>
                  <h2>
                    <Tag size={20} />
                    Offers & savings
                  </h2>
                  <form
                    className="cx-coupon"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setCoupon(code.trim().toUpperCase());
                    }}
                  >
                    <input
                      aria-label="Coupon code"
                      placeholder="Enter coupon code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <button className="solid-button">Apply</button>
                  </form>
                  {coupon && (
                    <p className={quote?.couponError ? "cx-error" : "cx-note"}>
                      {quote?.couponError || coupon + " applied"}{" "}
                      <button
                        className="cx-text"
                        onClick={() => {
                          setCoupon("");
                          setCode("");
                        }}
                      >
                        Remove coupon
                      </button>
                    </p>
                  )}
                  <div className="cx-offers">
                    {COUPONS.filter(
                      (c) => c.code !== "EXPIRED" && (c.mode === "any" || c.mode === mode)
                    ).map((c) => {
                      let eligibility = "";
                      try {
                        eligibility = calculate({ ...input, coupon: c.code }).couponError;
                      } catch {}
                      return (
                        <article key={c.code}>
                          <b>
                            {c.code} · {c.title}
                          </b>
                          <small>
                            Min {money(c.min)} · Up to {money(c.max)} · {c.payments.join(" / ")}
                          </small>
                          <small>
                            Valid through {c.end} · {c.limit} uses ·{" "}
                            {c.points ? "Points allowed" : "Cannot combine with points"}
                          </small>
                          <small>{eligibility || "Eligible with current payment method"}</small>
                          <button
                            className="cx-text"
                            disabled={!!eligibility}
                            onClick={() => {
                              setCoupon(c.code);
                              setCode(c.code);
                            }}
                          >
                            Use offer
                          </button>
                        </article>
                      );
                    })}
                  </div>
                  <div className="cx-form-grid">
                    <label>
                      Loyalty points · {balance.points} available
                      <input
                        type="number"
                        min="0"
                        max={Math.min(
                          balance.points,
                          200,
                          Math.floor((quote?.subtotal || 0) * 0.2)
                        )}
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value))}
                      />
                      <small>1 point = ₹1. Maximum 200 points or 20% of items.</small>
                    </label>
                    <label>
                      Wallet · {money(balance.wallet)} available
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        max={balance.wallet}
                        value={wallet}
                        onChange={(e) => setWallet(Number(e.target.value))}
                      />
                      <small>Wallet and offer eligibility are checked again at payment.</small>
                    </label>
                  </div>
                  <p className="cx-note">
                    Product savings {money(quote?.productDiscount || 0)} are already applied.
                    Automatic business promotions cannot combine with coupons.
                  </p>
                </>
              )}
              {step === 3 && (
                <>
                  <div className="cx-panel-title">
                    <h2>Review your order</h2>
                    <Link className="cx-text" href={cartUrl}>
                      Edit products
                    </Link>
                  </div>
                  {quote && items(quote)}
                  <div className="cx-review-grid">
                    <article>
                      <h3>
                        Address <button onClick={() => setStep(0)}>Edit</button>
                      </h3>
                      <b>
                        {address.name} · {address.type}
                      </b>
                      <p>
                        {address.street}, {address.line2}, {address.city}, {address.state}{" "}
                        {address.pincode}
                      </p>
                      <small>
                        {address.phone} · {address.instructions}
                      </small>
                      <p>
                        Billing: {input.billing.street}, {input.billing.city}
                      </p>
                    </article>
                    <article>
                      <h3>
                        Delivery <button onClick={() => setStep(1)}>Edit</button>
                      </h3>
                      <b>{quote?.delivery.label}</b>
                      <p>
                        {quote?.delivery.date} · {slot}
                      </p>
                      <small>Charge: {money(quote?.deliveryCharge || 0)}</small>
                      <h3>
                        Offers <button onClick={() => setStep(2)}>Edit</button>
                      </h3>
                      <p>
                        {coupon || "No coupon applied"} · {points} points · {money(wallet)} wallet
                      </p>
                    </article>
                  </div>
                </>
              )}
              {step === 4 && (
                <>
                  <h2>
                    <ShieldCheck size={20} />
                    Select payment method
                  </h2>
                  <p className="cx-muted">
                    Payments are simulated. Never enter real payment credentials in this demo.
                  </p>
                  <div className="cx-options cx-payment">
                    {PAYMENTS.map((p) => (
                      <label key={p} className={payment === p ? "selected" : ""}>
                        <input
                          type="radio"
                          name="payment"
                          checked={payment === p}
                          disabled={p === "Retailer credit" && mode !== "wholesale"}
                          onChange={() => setPayment(p)}
                        />
                        <span>
                          <b>{p === "Card" ? "Credit / debit card" : p}</b>
                          <small>
                            {p === "Retailer credit"
                              ? "Business approval · " + money(balance.credit) + " demo credit"
                              : p === "Cash on delivery"
                                ? "Delivered orders up to ₹5,000"
                                : p === "Pay later"
                                  ? "Signed-in customers · up to ₹3,000"
                                  : p === "Bank transfer"
                                    ? "Confirmed only after simulated verification"
                                    : p === "Wallet"
                                      ? "Redeem your balance in Offers first"
                                      : "Simulated payment verification"}
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="cx-note">
                    By placing this demo order, you confirm the products, address and payable
                    amount. Repeated clicks reuse one checkout attempt.
                  </p>
                </>
              )}
              {step < 4 ? (
                <div className="cx-actions">
                  <button className="solid-button" onClick={next}>
                    Continue to {steps[step + 1].toLowerCase()}
                    <ArrowRight size={16} />
                  </button>
                  {step > 0 && (
                    <button className="outline-button" onClick={() => setStep(step - 1)}>
                      Back
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className="solid-button cx-place"
                  disabled={busy || !quote || !!quote.errors.length}
                  onClick={place}
                >
                  {busy
                    ? "Verifying…"
                    : (["Cash on delivery", "Retailer credit", "Pay later"].includes(payment)
                        ? "Place Order"
                        : "Pay and Place Order") +
                      " · " +
                      money(quote?.total || 0)}
                </button>
              )}
            </>
          )}
          {(error || quoteError) && (
            <p className="cx-error" role="alert">
              {error || quoteError}
            </p>
          )}
          {!locked && quote && quote.errors.length > 0 && (
            <div className="cx-error" role="status">
              <b>Before you place your order</b>
              <ul>
                {quote.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
        <aside className="cx-panel cx-summary">
          <h2>
            Order summary <small>{sourceLines.reduce((s, l) => s + l.quantity, 0)} packs</small>
          </h2>
          {quote && totals(quote)}
          <p className="cx-muted">
            Taxes are included using a 5% demo GST rate. Actual rates depend on the product and
            seller.
          </p>
          <div className="cx-assurance">
            <ShieldCheck size={19} />
            <span>
              Price & stock rechecked
              <br />
              One order per confirmed attempt
              <br />
              No real money collected
            </span>
          </div>
          <Link className="cx-text" href={cartUrl}>
            Edit basket
          </Link>
        </aside>
      </div>
    </main>
  );
}
