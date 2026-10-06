import {appPath} from '@/lib/paths';
import { MobileNavigation } from "@/features/shared/components/MobileNavigation";
import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRight, Heart, Box as Leaf, Menu, ShoppingBag, Store, X } from "lucide-react";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { useRetailerSession } from "@/retailer/hooks";
const links = [
  ["Overview", "/retailer"],
  ["Shop wholesale", "/retailer/shop"],
  ["Categories", "/retailer/business-categories"],
  ["Distributors", "/retailer/distributors"],
  ["Deals", "/retailer/deals"],
  ["My catalogue", "/retailer/catalogue"],
  ["Purchase orders", "/retailer/my-orders"],
];
export function RetailerNavbar() {
  const { pathname: rawPathname } = useLocation();
  const pathname=appPath(rawPathname);
  const { count, subtotal } = useB2BCart();
  const { store } = useRetailerSession();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  return (
    <>
      <header className="shop-header wholesale-header">
        <div className="wrap wholesale-main">
          <Link to="/retailer" className="brand">
            <span className="brand-icon">
              <Leaf size={23} />
            </span>
            boxaio.<span className="business-word">BUSINESS</span>
          </Link>
          <span className="wholesale-store">
            {store?.name}
            <small>Wholesale marketplace · demo</small>
          </span>
          <div className="wholesale-actions">
            <Link to="/retailer/dashboard" className="outline-button">
              <Store size={16} /> My store <ArrowUpRight size={13} />
            </Link>
            <Link to="/retailer/wishlist" className="icon-link" aria-label="Wholesale favourites">
              <Heart size={20} />
            </Link>
            <Link
              to="/retailer/cart"
              className="basket-link"
              aria-label={"Wholesale basket, " + count + " items"}
            >
              <ShoppingBag size={19} />
              <span>
                ₹{subtotal.toLocaleString("en-IN")}
                <small>{count} units</small>
              </span>
            </Link>
            <button
              className="mobile-toggle"
              aria-label="Toggle wholesale navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <div className={"nav-row wrap " + (open ? "is-open" : "")}>
          <nav aria-label="Wholesale navigation">
            {links.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/retailer" }}
                className={pathname === to ? "active" : ""}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link to="/" className="shop-home-link">
            Customer shop <ArrowUpRight size={13} />
          </Link>
        </div>
      </header>
      <MobileNavigation wholesale count={count} />
    </>
  );
}
