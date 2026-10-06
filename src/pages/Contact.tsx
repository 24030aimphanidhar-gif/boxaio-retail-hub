import {appStorage} from '@/api/storage';
import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
const faqs = [
  [
    "Where can I track an order?",
    "Open My orders and choose Track order. All statuses and deliveries in this project are simulated.",
  ],
  [
    "How do I use a coupon?",
    "Enter BOXAIO10 on the checkout page and select Apply for 10% off your product subtotal.",
  ],
  [
    "Can I explore the retailer tools?",
    "Choose Retailer workspace in the navigation, or open the retailer demo from the sign-in page.",
  ],
  [
    "Where is my data saved?",
    "Demo orders, baskets, favourites and store updates are saved in your browser. Clearing site data resets them.",
  ],
];
export function Contact() {
  const [ticket, setTicket] = useState("");
  return (
    <div className="wrap orders-page">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Help & contact</span>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">A LITTLE HELP GOES A LONG WAY</span>
          <h1>We're here to help.</h1>
          <p>Explore common questions or create a sample support request.</p>
        </div>
      </div>
      <div className="contact-layout">
        <section className="form-panel">
          {ticket ? (
            <div className="empty-state">
              <CheckCircle2 size={35} />
              <h2>Request saved.</h2>
              <p>
                Your demo reference is {ticket}.<br />
                This request stays in your browser; no message was sent.
              </p>
              <button className="outline-button" onClick={() => setTicket("")}>
                Create another request
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const id = "HELP-" + Date.now().toString(36).toUpperCase();
                try {
                  const old = JSON.parse(appStorage.getItem("boxaio_support") || "[]");
                  appStorage.setItem(
                    "boxaio_support",
                    JSON.stringify([
                      { id, ...Object.fromEntries(form), date: new Date().toISOString() },
                      ...old,
                    ])
                  );
                  setTicket(id);
                } catch {
                  toast.error("Could not save the request");
                }
              }}
            >
              <h2>
                <MessageCircle size={21} /> How can we help?
              </h2>
              <p>Demo form only. Please use sample contact details.</p>
              <div className="form-grid">
                <label>
                  Your name
                  <input required name="name" placeholder="Ananya Rao" />
                </label>
                <label>
                  Email
                  <input required name="email" type="email" placeholder="ananya@example.com" />
                </label>
              </div>
              <label>
                Topic
                <select name="topic">
                  <option>Order & delivery</option>
                  <option>Product question</option>
                  <option>Retailer support</option>
                  <option>Something else</option>
                </select>
              </label>
              <label>
                Your message
                <textarea
                  required
                  name="message"
                  minLength={10}
                  placeholder="Tell us a little more…"
                />
              </label>
              <button className="solid-button">
                Save demo request <ArrowRight size={16} />
              </button>
            </form>
          )}
        </section>
        <section>
          <h2 className="faq-title">A few helpful answers</h2>
          {faqs.map(([q, a]) => (
            <details className="faq-item" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      </div>
    </div>
  );
}
