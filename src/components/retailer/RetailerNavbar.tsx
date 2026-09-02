import { Link, useLocation } from "@tanstack/react-router";
import {
  Heart,
  LayoutGrid,
  LogOut,
  Menu,
  Percent,
  Search,
  ShoppingCart,
  Store,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { useRetailerSession } from "@/retailer/hooks";

const LINKS: { label: string; to: string; exact?: boolean }[] = [
  { label: "Home", to: "/retailer", exact: true },
  { label: "Shop", to: "/retailer/shop" },
  { label: "Business Categories", to: "/retailer/business-categories" },
  { label: "Shop by Distributor", to: "/retailer/distributors" },
  { label: "Wholesale Deals", to: "/retailer/deals" },

  { label: "My Product Catalogue", to: "/retailer/catalogue" },
  { label: "My Orders", to: "/retailer/my-orders" },
];

/** B2B storefront header — separate from the B2C `Navbar`. */
export function RetailerNavbar() {
  const { pathname } = useLocation();
  const { count } = useB2BCart();
  const { store } = useRetailerSession();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (link: (typeof LINKS)[number]) =>
    link.exact ? pathname === link.to : pathname.startsWith(link.to);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/retailer" className="flex items-center gap-2">
          <span className="rounded-lg bg-primary px-2 py-1 text-sm font-black text-primary-foreground">
            BOXAIO
          </span>
          <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:block">
            Business
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link to="/retailer/shop" aria-label="Search wholesale products">
            <Button variant="ghost" size="icon">
              <Search className="size-5" />
            </Button>
          </Link>
          <Link to="/retailer/wishlist" aria-label="Wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="size-5" />
            </Button>
          </Link>
          <Link to="/retailer/cart" aria-label="Bulk cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="size-5" />
            </Button>
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Link>
          <Link to="/retailer/dashboard" className="hidden sm:block">
            <Button variant="outline" size="sm">
              <Store className="mr-2 size-4" /> My Store
            </Button>
          </Link>
          <Link to="/retailer/profile" className="hidden sm:block" aria-label="Profile">
            <Button variant="ghost" size="icon">
              <User className="size-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Sign out"
            onClick={logout}
          >
            <LogOut className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      <div className="hidden border-t border-border bg-muted/40 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5 text-xs text-muted-foreground">
          <LayoutGrid className="size-3.5" />
          <span>Wholesale pricing for {store?.name ?? "your business"}</span>
          <span className="ml-auto flex items-center gap-1">
            <Percent className="size-3.5" /> Bulk discounts applied automatically at checkout
          </span>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background px-4 py-2 lg:hidden">
          {[...LINKS, { label: "My Store", to: "/retailer/dashboard" }, { label: "Profile", to: "/retailer/profile" }].map(
            (link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      ) : null}
    </header>
  );
}
