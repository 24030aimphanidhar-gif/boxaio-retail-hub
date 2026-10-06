import {appStorage} from '@/api/storage';
import { DeliveryCheck } from "@/features/shared/components/DeliveryCheck";
import { MobilePurchaseBar } from "@/features/shared/components/MobilePurchaseBar";
import { ProductImage } from "@/features/shared/components/ProductImage";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowRight, Heart, Leaf, ListPlus, Minus, Package, Plus, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { products } from "@/data/products";
import { getReviewsForProduct, Review } from "@/data/reviews";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSaveLists } from "@/context/SaveListsContext";
import { useAuth } from "@/context/AuthContext";
import { ProductCard } from "@/features/consumer/components/ProductCard";
import { money } from "@/lib/demo-orders";
function savedReviews(): Review[] {
  try {
    return JSON.parse(appStorage.getItem("boxaio_reviews") || "[]");
  } catch {
    return [];
  }
}
export function ProductDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const p = products.find((p) => p._id === id);
  const [pack, setPack] = useState<"normal" | "bulk">("normal");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("Details");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [custom, setCustom] = useState(savedReviews);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToSaveList, getListNames } = useSaveLists();
  const [list, setList] = useState("My Saved Items");
  if (!p)
    return (
      <div className="wrap empty-state">
        <Package size={35} />
        <h1>We couldn't find that product.</h1>
        <Link href="/products" className="solid-button">
          Browse essentials
        </Link>
      </div>
    );
  const price = pack === "normal" ? p.normalPrice : p.bulkPrice;
  const reviews = [...custom.filter((r) => r.productId === id), ...getReviewsForProduct(p._id)];
  function add(checkout = false) {
    if (!p?.inStock) return;
    addToCart(p, qty, pack);
    toast.success(p.name + " added to your basket");
    if (checkout) navigate("/checkout");
  }
  return (
    <div className="wrap detail-page">
      <MobilePurchaseBar
        total={price * qty}
        disabled={!p.inStock}
        onAdd={() => add()}
        onBuy={() => add(true)}
      />
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={"/products?category=" + encodeURIComponent(p.mainCategory)}>
          {p.mainCategory}
        </Link>
        <span>/</span>
        <span>{p.name}</span>
      </div>
      <div className="product-detail-grid">
        <div className="detail-photo">
          <ProductImage productId={p._id} src={p.image} alt={p.name} />
          {p.isOrganic && (
            <span className="saving-tag">
              <Leaf size={12} /> Organic pick
            </span>
          )}
        </div>
        <section className="detail-copy">
          <span className="eyebrow">
            {p.brand} · {p.subCategory}
          </span>
          <h1>{p.name}</h1>
          <div className="detail-rating">
            <Star size={15} fill="currentColor" /> {p.rating}
            <span>· {reviews.length} sample reviews</span>
            <span className={p.inStock ? "in-stock" : "out-stock"}>
              {p.inStock ? "In stock" : "Currently unavailable"}
            </span>
          </div>
          <p>{p.description}</p>
          <div className="detail-price">
            <strong>{money(price)}</strong>
            {pack === "normal" && <del>{money(p.mrp)}</del>}
            <small>per {pack === "normal" ? p.normalUnit : p.bulkUnit} · taxes included</small>
          </div>
          <p className="product-seller">
            Brand: <strong>{p.brand}</strong> · Sold by Boxaio Fresh Mart (demo)
          </p>
          <h3>Choose your pack</h3>
          <div className="pack-options">
            <button
              className={pack === "normal" ? "selected" : ""}
              onClick={() => {
                setPack("normal");
                setQty(1);
              }}
            >
              <strong>Standard pack</strong>
              <span>
                {p.normalUnit} · {money(p.normalPrice)}
              </span>
            </button>
            <button
              className={pack === "bulk" ? "selected" : ""}
              onClick={() => {
                setPack("bulk");
                setQty(1);
              }}
            >
              <strong>Bulk pack</strong>
              <span>
                {p.bulkUnit} · {money(p.bulkPrice)}
              </span>
            </button>
          </div>
          <div className="detail-buy">
            <div className="quantity-stepper">
              <button
                aria-label="Decrease quantity"
                disabled={qty <= 1}
                onClick={() => setQty(qty - 1)}
              >
                <Minus size={16} />
              </button>
              <span>{qty}</span>
              <button
                aria-label="Increase quantity"
                disabled={qty >= 99}
                onClick={() => setQty(qty + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
            <button disabled={!p.inStock} className="solid-button" onClick={() => add()}>
              Add to basket · {money(price * qty)}
              <Plus size={16} />
            </button>
            <button
              className={"outline-button " + (isInWishlist(p._id) ? "saved" : "")}
              aria-label="Save product"
              aria-pressed={isInWishlist(p._id)}
              onClick={() => toggleWishlist(p)}
            >
              <Heart size={18} fill={isInWishlist(p._id) ? "currentColor" : "none"} />
            </button>
          </div>
          <button
            className="outline-button detail-checkout"
            disabled={!p.inStock}
            onClick={() => add(true)}
          >
            Buy now <ArrowRight size={16} />
          </button>
          <div className="save-list-row">
            <ListPlus size={18} />
            <select
              aria-label="Shopping list"
              value={list}
              onChange={(e) => setList(e.target.value)}
            >
              {getListNames().map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <button
              onClick={() => {
                addToSaveList(p, list);
                toast.success("Saved to " + list);
              }}
            >
              Save to catalogue
            </button>
          </div>
          <DeliveryCheck />
          <div className="detail-benefit">
            <Truck size={18} />
            <span>Free delivery on orders over ₹500. Choose your time at checkout.</span>
          </div>
        </section>
      </div>
      <section className="detail-information">
        <div className="pill-tabs">
          {["Details", "Reviews", "Delivery & returns"].map((t) => (
            <button key={t} className={tab === t ? "selected" : ""} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        {tab === "Details" ? (
          <div className="form-panel">
            <h2>A little more about your pick</h2>
            <p>{p.description}</p>
            <dl className="detail-specs">
              <div>
                <dt>Brand</dt>
                <dd>{p.brand}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{p.mainCategory}</dd>
              </div>
              <div>
                <dt>Standard pack</dt>
                <dd>{p.normalUnit}</dd>
              </div>
              <div>
                <dt>Bulk pack</dt>
                <dd>{p.bulkUnit}</dd>
              </div>
            </dl>
          </div>
        ) : tab === "Delivery & returns" ? (
          <div className="form-panel">
            <h2>Delivered with a little care</h2>
            <p>
              Demo delivery is ₹50, or free when your product subtotal is over ₹500. Choose a
              delivery date and time at checkout. Orders can be cancelled while processing.
            </p>
            <Link href="/returns-refunds" className="back-link">
              Read the sample returns policy <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="reviews-layout">
            <section>
              {reviews.map((r) => (
                <article key={r.id} className="review-panel">
                  <strong>{r.author}</strong>
                  <span>
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                  <small>{r.date} · Sample review</small>
                </article>
              ))}
            </section>
            <form
              className="form-panel"
              onSubmit={(e) => {
                e.preventDefault();
                const row: Review = {
                  id: crypto.randomUUID(),
                  productId: p._id,
                  author: user?.profile.name || "Demo shopper",
                  avatar: "",
                  rating,
                  title: "My experience",
                  body: review.trim(),
                  date: new Date().toLocaleDateString("en-IN"),
                  verified: false,
                  helpful: 0,
                };
                if (!row.body) return;
                const next = [row, ...savedReviews()];
                try {
                  appStorage.setItem("boxaio_reviews", JSON.stringify(next));
                  setCustom(next);
                  setReview("");
                  toast.success("Your demo review is saved");
                } catch {
                  toast.error("Unable to save review");
                }
              }}
            >
              <h2>Share your experience</h2>
              <p>Reviews are saved locally for this demo.</p>
              <label>
                Your rating
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Your review
                <textarea
                  required
                  minLength={5}
                  maxLength={1500}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What did you think?"
                />
              </label>
              <button className="solid-button">Save review</button>
            </form>
          </div>
        )}
      </section>
      <section className="home-section">
        <div className="section-heading">
          <h2>A few more good finds</h2>
          <Link href={"/products?category=" + encodeURIComponent(p.mainCategory)}>
            Explore category <ArrowRight size={15} />
          </Link>
        </div>
        <div className="catalog-product-grid">
          {products
            .filter((x) => x.mainCategory === p.mainCategory && x._id !== p._id)
            .slice(0, 4)
            .map((x) => (
              <ProductCard
                key={x._id}
                product={x}
                onToggleWishlist={() => toggleWishlist(x)}
                isWishlisted={isInWishlist(x._id)}
              />
            ))}
        </div>
      </section>
    </div>
  );
}
