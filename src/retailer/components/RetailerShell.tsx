import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronLeft,
  ClipboardList,
  Clock,
  Home,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  MessageSquareText,
  Package,
  Percent,
  Settings,
  Store as StoreIcon,
  Truck,
  Undo2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

import { fetchNotifications } from "../data/service";
import { useRetailerSession } from "../hooks";

interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Back to B2B storefront", to: "/retailer", icon: Home, exact: true },
      { label: "Dashboard", to: "/retailer/dashboard", icon: BarChart3 },
    ],
  },
  {
    title: "Store Management",
    items: [
      { label: "Products", to: "/retailer/products", icon: Package },
      { label: "Categories", to: "/retailer/categories", icon: LayoutGrid },
      { label: "Inventory", to: "/retailer/inventory", icon: Boxes },
      { label: "Offers & Discounts", to: "/retailer/offers", icon: Percent },
    ],
  },
  {
    title: "Orders",
    items: [
      { label: "All Orders", to: "/retailer/orders", icon: ClipboardList },
      { label: "Delivery Tracking", to: "/retailer/delivery", icon: Truck },
      { label: "Returns & Refunds", to: "/retailer/returns", icon: Undo2 },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Sales & Analytics", to: "/retailer/sales", icon: BarChart3 },
      { label: "Customers", to: "/retailer/customers", icon: Users },
      { label: "Reviews", to: "/retailer/reviews", icon: MessageSquareText },
    ],
  },
  {
    title: "Store Settings",
    items: [
      { label: "Store Profile", to: "/retailer/store", icon: StoreIcon },
      { label: "Location & Delivery", to: "/retailer/location", icon: MapPin },
      { label: "Business Hours", to: "/retailer/hours", icon: Clock },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Notifications", to: "/retailer/notifications", icon: Bell },
      { label: "Settings", to: "/retailer/settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to);
}

export function RetailerShell({ children }: { children: ReactNode }) {
  const { store, storeId } = useRetailerSession();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!storeId) return;
    let alive = true;
    fetchNotifications(storeId).then((rows) => {
      if (alive) setUnread(rows.filter((n) => !n.read).length);
    });
    return () => {
      alive = false;
    };
  }, [storeId, pathname]);

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto px-3 py-4">
      {SECTIONS.map((section) => (
        <div key={section.title} className="mb-3">
          {!collapsed ? (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
          ) : null}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  {!collapsed && item.to === "/retailer/notifications" && unread > 0 ? (
                    <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                      {unread}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>

          <Link to="/retailer" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <StoreIcon className="size-5" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold leading-tight text-foreground">
                {store?.name ?? "BOXAIO Retailer"}
              </span>
              <span className="block text-xs text-muted-foreground">Retailer Dashboard</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/retailer/notifications" className="relative">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="size-5" />
              </Button>
              {unread > 0 ? (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              ) : null}
            </Link>
            <Link to="/" className="hidden sm:block">
              <Button variant="outline" size="sm">
                View storefront
              </Button>
            </Link>
            <div className="hidden items-center gap-2 border-l border-border pl-3 md:flex">
              <div className="text-right">
                <p className="text-sm font-semibold leading-tight text-foreground">
                  {user?.profile.businessName ?? user?.profile.name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={logout}>
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 border-r border-border bg-background transition-all lg:block",
            collapsed ? "w-[76px]" : "w-64",
          )}
        >
          {sidebar}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="absolute bottom-4 right-3 flex size-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-background shadow-xl">
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <span className="font-semibold">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="size-5" />
                </Button>
              </div>
              <div className="h-[calc(100%-4rem)]">{sidebar}</div>
            </aside>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
