import {appStorage} from '@/api/storage';
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  Box as Leaf,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  Store,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export function Navbar() {
  const [path, navigate] = useLocation();
  const { user, login, logout } = useAuth();
  const { getCartCount, getCartTotal } = useCart();
  const { wishlistCount } = useWishlist();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState(() => appStorage.getItem("boxaio_city") || "Vijayawada");
  useEffect(() => setOpen(false), [path]);
  const links = [
    ["Shop all", "/products"],
    ["Categories", "/categories"],
    ["Offers & savings", "/offers"],
    ["My orders", "/orders"],
    ["My catalogue", "/saved-lists"],
  ];
  function business() {
    login("retailer@boxaio.com");
    navigate("/retailer/shop");
  }
  return (
    <>
      <div className="announcement">
        <span>Fresh finds. Everyday prices. Delivered to your door.</span>
        <span>
          Free delivery on orders over ₹500 <ArrowUpRight size={13} />
        </span>
      </div>
      <header className="shop-header">
        <div className="header-main wrap">
          <Link href="/" className="brand" aria-label="Boxaio home">
            <span className="brand-icon">
              <Leaf size={23} />
            </span>
            boxaio<span className="brand-dot">.</span>
          </Link>
          <label className="delivery-select">
            <MapPin size={18} />
            <span>
              <small>Delivering to</small>
              <select
                aria-label="Delivery city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  appStorage.setItem("boxaio_city", e.target.value);
                }}
              >
                {["Vijayawada", "Hyderabad", "Guntur", "Gudivada", "Machilipatnam"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </span>
          </label>
          <form
            className="header-search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/products?search=" + encodeURIComponent(search.trim()));
            }}
          >
            <Search size={18} />
            <input
              aria-label="Search products"
              placeholder="Search for groceries, brands and more"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button aria-label="Submit search">
              <ArrowUpRight size={18} />
            </button>
          </form>
          <Link
            href="/wishlist"
            className="icon-link"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <Heart size={21} />
            {wishlistCount > 0 && <b>{wishlistCount}</b>}
          </Link>
          <Link href={user ? "/dashboard" : "/login"} className="account-link">
            <User size={21} />
            <span>
              <small>{user ? "Welcome back" : "Your account"}</small>
              {user ? user.profile.name.split(" ")[0] : "Sign in"}
            </span>
          </Link>
          <Link href="/cart" className="basket-link">
            <ShoppingBag size={20} />
            <span>
              ₹{getCartTotal().toLocaleString("en-IN")}
              <small>{getCartCount()} items</small>
            </span>
          </Link>
          <button
            className="mobile-toggle"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <div className={"nav-row wrap " + (open ? "is-open" : "")}>
          <nav aria-label="Main navigation">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className={path === href ? "active" : ""}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="nav-business">
            <button onClick={business}>
              <Store size={16} /> Retailer workspace <ArrowUpRight size={14} />
            </button>
            {user && (
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
