import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { ProductCard } from "@/features/consumer/components/ProductCard";
import { products } from "../data/products";
import { useWishlist } from "../context/WishlistContext";
const categories = [
  ["Fresh produce", "Fruits & Vegetables", "photo-1619566636858-adf3ef46400b"],
  ["Daily staples", "Foodgrains, Oil & Masala", "photo-1586201375761-83865001e31c"],
  ["Dairy & bakery", "Bakery, Cakes & Dairy", "photo-1628088069254-d97f442f760d"],
  ["Snacks & treats", "Snacks & Branded Foods", "photo-1621939514649-280e2ee25f60"],
  ["Beverages", "Beverages", "photo-1544145945-f90425340c7e"],
  ["Home essentials", "Cleaning & Household", "photo-1585421514738-01798e348b17"],
];
export function Home() {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [tab, setTab] = useState("Popular picks");
  const selected =
    tab === "Fresh & seasonal"
      ? products.filter((p) => p.mainCategory === "Fruits & Vegetables")
      : tab === "Best savings"
        ? [...products].sort(
            (a, b) => (b.mrp - b.normalPrice) / b.mrp - (a.mrp - a.normalPrice) / a.mrp
          )
        : [...products].sort((a, b) => b.rating - a.rating);
  return (
    <div className="home-page wrap">
      <div className="home-eyebrow">
        <span>
          <span className="live-dot" /> YOUR EVERYDAY, MADE BETTER
        </span>
        <span>Good food. Great value.</span>
      </div>
      <section className="fresh-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <Leaf size={14} /> FRESHNESS STARTS HERE
          </span>
          <h1>
            Good things.
            <br />
            Fresh beginnings.
          </h1>
          <p>
            From farm-fresh favourites to pantry must-haves.
            <br className="desktop-only" /> Everything you love, at prices you'll love too.
          </p>
          <Link href="/products" className="solid-button">
            Start shopping <ArrowRight size={17} />
          </Link>
          <div className="hero-proof">
            <span className="proof-avatars">🥑 🍊 🥬</span>
            <span>
              <strong>Fresh picks. Happy homes.</strong>
              <small>Quality essentials, thoughtfully selected.</small>
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85"
            alt="An abundant selection of fresh vegetables at a market"
            fetchPriority="high"
          />
          <div className="hero-sticker">
            <Leaf size={20} />
            <strong>
              A fresh
              <br />
              kind of everyday
            </strong>
            <span>SELECTED WITH CARE</span>
          </div>
          <div className="floating-note">
            <BadgeCheck size={25} />
            <div>
              <strong>Freshness you can count on</strong>
              <small>From the market to your doorstep</small>
            </div>
          </div>
        </div>
      </section>
      <section className="benefit-strip" aria-label="Shopping benefits">
        {[
          [Truck, "Delivered with care", "Free delivery over ₹500"],
          [Leaf, "Freshly picked", "Quality in every basket"],
          [ShieldCheck, "Shop with confidence", "Simple, transparent pricing"],
          [PackageCheck, "Easy returns", "We’re here to make it right"],
        ].map(([Icon, title, desc]) => {
          const I = Icon as typeof Truck;
          return (
            <div key={String(title)}>
              <I size={23} />
              <span>
                <strong>{String(title)}</strong>
                <small>{String(desc)}</small>
              </span>
            </div>
          );
        })}
      </section>
      <section className="home-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A LITTLE OF EVERYTHING</span>
            <h2>What's on your list?</h2>
          </div>
          <Link href="/categories">
            Explore all categories <ArrowRight size={16} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map(([name, category, photo], i) => (
            <Link
              href={"/products?category=" + encodeURIComponent(category)}
              key={name}
              className={"category-tile category-" + i}
            >
              <div>
                <img
                  src={"https://images.unsplash.com/" + photo + "?auto=format&fit=crop&w=300&q=80"}
                  alt=""
                  loading="lazy"
                />
              </div>
              <strong>{name}</strong>
              <small>
                {products.filter((p) => p.mainCategory === category).length} essentials{" "}
                <ArrowUpRight size={13} />
              </small>
            </Link>
          ))}
        </div>
      </section>
      <section className="home-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">GOOD PICKS, GREAT PRICES</span>
            <h2>Your next basket starts here</h2>
          </div>
          <Link href="/products">
            View all products <ArrowRight size={16} />
          </Link>
        </div>
        <div className="pill-tabs">
          {["Popular picks", "Fresh & seasonal", "Best savings"].map((t) => (
            <button key={t} className={tab === t ? "selected" : ""} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="fresh-product-grid">
          {selected.slice(0, 5).map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onToggleWishlist={() => toggleWishlist(p)}
              isWishlisted={isInWishlist(p._id)}
            />
          ))}
        </div>
      </section>
      <section className="promo-grid">
        <div className="promo-card promo-peach">
          <span className="eyebrow">THE EVERYDAY SAVINGS CLUB</span>
          <h2>
            A full basket.
            <br />A little less to spend.
          </h2>
          <p>Enjoy 10% off your demo order with BOXAIO10.</p>
          <Link href="/offers">
            Find your next favourite deal <ArrowRight size={17} />
          </Link>
          <span className="promo-number">
            10
            <span>
              %<small>OFF</small>
            </span>
          </span>
        </div>
        <div className="promo-card promo-green">
          <span className="eyebrow">BOXAIO FOR BUSINESS</span>
          <h2>
            Big on quality.
            <br />
            Better in bulk.
          </h2>
          <p>Wholesale shopping and a simpler way to run your store.</p>
          <Link href="/login?demo=retailer">
            Explore the retailer demo <ArrowUpRight size={17} />
          </Link>
          <PackageCheck className="promo-icon" />
        </div>
      </section>
      <section className="closing-note">
        <Sparkles size={21} />
        <p>Everyday shopping, with a little more care.</p>
        <span>Fresh essentials. Fair prices. One happy basket.</span>
      </section>
    </div>
  );
}
