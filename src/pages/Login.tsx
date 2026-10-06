import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Leaf, ShoppingBag, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
export function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  function demo(retailer: boolean) {
    login(retailer ? "retailer@boxaio.com" : "ananya@example.com");
    toast.success(retailer ? "Your retailer workspace is ready" : "Welcome to Boxaio");
    navigate(retailer ? "/retailer/dashboard" : "/");
  }
  return (
    <div className="login-layout wrap">
      <section className="login-story">
        <Leaf size={34} />
        <span className="eyebrow">WELCOME TO YOUR EVERYDAY</span>
        <h1>
          A fresh start.
          <br />
          Every time.
        </h1>
        <p>
          Good food for your home.
          <br />
          Good tools for your business.
        </p>
        <div className="login-note">
          Explore a complete shopping and retailer experience with sample products, orders, and
          customers.
        </div>
      </section>
      <section className="login-form form-panel">
        <span className="eyebrow">MAKE YOURSELF AT HOME</span>
        <h2>Welcome to Boxaio</h2>
        <p>Choose a demo to explore. No account needed.</p>
        <button className="demo-choice" onClick={() => demo(false)}>
          <ShoppingBag size={24} />
          <span>
            <strong>Explore as a shopper</strong>
            <small>Browse, save favourites and place demo orders</small>
          </span>
          <ArrowRight size={17} />
        </button>
        <button className="demo-choice" onClick={() => demo(true)}>
          <Store size={24} />
          <span>
            <strong>Open retailer workspace</strong>
            <small>Manage products, stock, orders and wholesale</small>
          </span>
          <ArrowRight size={17} />
        </button>
        <div className="form-divider">or try a demo sign-in</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const user = login(email, password);
            navigate(user.role === "retailer" ? "/retailer/dashboard" : "/");
            toast.success("Demo session started");
          }}
        >
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Demo password
            <input
              type="password"
              required
              minLength={4}
              value={password}
              placeholder="Any 4+ characters"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="solid-button">
            Continue <ArrowRight size={15} />
          </button>
        </form>
        <small>Demo sign-in only. Do not use a real password.</small>
        <Link className="back-link" href="/">
          Continue browsing
        </Link>
      </section>
    </div>
  );
}
