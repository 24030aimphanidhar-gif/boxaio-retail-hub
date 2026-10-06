import { Link } from "wouter";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  ListChecks,
  MapPin,
  Package,
  Settings,
  Store,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { readOrders, money } from "../lib/demo-orders";
import { useWishlist } from "../context/WishlistContext";
export function Dashboard() {
  const { user } = useAuth();
  const orders = readOrders();
  const { wishlistCount } = useWishlist();
  return (
    <div className="wrap orders-page">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Your account</span>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR LITTLE CORNER OF BOXAIO</span>
          <h1>Hello, {user?.profile.name.split(" ")[0] || "shopper"}.</h1>
          <p>Your favourites, your orders, your everyday.</p>
        </div>
        <Link href="/edit-profile" className="outline-button">
          Edit profile <Settings size={15} />
        </Link>
      </div>
      <div className="order-stats">
        <div>
          <Package size={24} />
          <span>
            <strong>{orders.length}</strong>
            <small>Orders placed</small>
          </span>
        </div>
        <div>
          <Heart size={24} />
          <span>
            <strong>{wishlistCount}</strong>
            <small>Saved favourites</small>
          </span>
        </div>
        <div>
          <Package size={24} />
          <span>
            <strong>
              {orders.filter((o) => o.status === "Shipped" || o.status === "Processing").length}
            </strong>
            <small>On their way</small>
          </span>
        </div>
      </div>
      <div className="account-grid">
        {[
          [Package, "Your orders", "Track, reorder and download receipts", "/orders"],
          [Heart, "Your favourites", "All the good things you saved", "/wishlist"],
          [ListChecks, "Shopping lists", "Plan your next basket", "/saved-lists"],
          [CalendarDays, "Scheduled orders", "Manage your regular essentials", "/schedule-orders"],
          [MapPin, "Delivery addresses", "Keep your delivery details handy", "/addresses"],
          [Store, "Retailer workspace", "Explore tools for your business", "/login"],
        ].map(([Icon, title, description, href]) => {
          const I = Icon as typeof Package;
          return (
            <Link href={String(href)} key={String(title)} className="account-tile">
              <I size={24} />
              <div>
                <h2>{String(title)}</h2>
                <p>{String(description)}</p>
              </div>
              <ArrowRight size={16} />
            </Link>
          );
        })}
      </div>
      <div className="section-heading" style={{ marginTop: 35 }}>
        <h2>Recent orders</h2>
        <Link href="/orders">
          View all <ArrowRight size={15} />
        </Link>
      </div>
      {orders.slice(0, 3).map((o) => (
        <Link key={o.id} href={"/orders/" + o.id + "/tracking"} className="recent-order">
          <Package size={22} />
          <span>
            <strong>{o.id}</strong>
            <small>
              {new Date(o.date).toLocaleDateString("en-IN")} · {o.items.length} products
            </small>
          </span>
          <span className={"order-status " + o.status.toLowerCase()}>{o.status}</span>
          <strong>{money(o.total)}</strong>
          <ArrowRight size={16} />
        </Link>
      ))}
    </div>
  );
}
