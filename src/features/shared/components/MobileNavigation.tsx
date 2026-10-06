import {appPath} from '@/lib/paths';
import { Link, useLocation } from "@tanstack/react-router";
import { House, Grid2X2, Bookmark, ShoppingBag, UserRound, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
export function MobileNavigation({
  wholesale = false,
  count: businessCount = 0,
}: {
  wholesale?: boolean;
  count?: number;
}) {
  const { pathname: rawPathname } = useLocation();
  const pathname=appPath(rawPathname);
  const { getCartCount } = useCart();
  const count = wholesale ? businessCount : getCartCount();
  const links = wholesale
    ? [
        ["Shop", "/retailer/shop", House],
        ["Catalogue", "/retailer/catalogue", Bookmark],
        ["Orders", "/retailer/my-orders", Package],
        ["Basket", "/retailer/cart", ShoppingBag],
        ["My store", "/retailer/dashboard", UserRound],
      ]
    : [
        ["Home", "/", House],
        ["Categories", "/categories", Grid2X2],
        ["My catalogue", "/saved-lists", Bookmark],
        ["Basket", "/cart", ShoppingBag],
        ["Account", "/dashboard", UserRound],
      ];
  return (
    <nav
      className="mobile-app-nav"
      aria-label={wholesale ? "Business app navigation" : "Shopping app navigation"}
    >
      {links.map(([label, to, Icon]) => {
        const I = Icon as typeof House;
        const href = String(to);
        return (
          <Link
            key={href}
            to={href}
            activeOptions={{ exact: true }}
            className={pathname === href ? "selected" : ""}
          >
            <span>
              <I size={21} />
              {label === "Basket" && count > 0 && <b>{count > 99 ? "99+" : count}</b>}
            </span>
            <small>{String(label)}</small>
          </Link>
        );
      })}
    </nav>
  );
}
