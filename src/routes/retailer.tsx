import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { RetailerNavbar } from "@/components/retailer/RetailerNavbar";
import { RetailerShell } from "@/retailer/components/RetailerShell";
import { B2BCartProvider } from "@/retailer/b2b/CartContext";
import { useRetailerSession } from "@/retailer/hooks";

/** Paths that render the B2B storefront chrome instead of the store dashboard. */
const STOREFRONT_PATHS = [
  "/retailer/shop",
  "/retailer/business-categories",
  "/retailer/deals",
  "/retailer/catalogue",
  "/retailer/my-orders",
  "/retailer/wishlist",
  "/retailer/cart",
  "/retailer/checkout",
  "/retailer/profile",
];

export const Route = createFileRoute("/retailer")({
  // Session lives in the browser, so the retailer area renders client-side.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Retailer Dashboard | BOXAIO" },
      {
        name: "description",
        content:
          "Manage your BOXAIO store: products, inventory, orders, offers, analytics and store settings in one place.",
      },
      { property: "og:title", content: "Retailer Dashboard | BOXAIO" },
      {
        property: "og:description",
        content: "Run your BOXAIO grocery store — orders, inventory, offers and sales analytics.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RetailerLayout,
});

function RetailerLayout() {
  const { ready, isRetailer, isAdmin, store, user } = useRetailerSession();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading your dashboard…
      </div>
    );
  }

  // Access control: only a signed-in retailer (or admin) may see this area.
  if (!user || (!isRetailer && !isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="max-w-md rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-foreground">Retailer access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with a retailer account to open the dashboard. Demo login:{" "}
            <span className="font-medium text-foreground">retailer@boxaio.com</span>
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/login">
              <Button>Sign in</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to store</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-sm text-muted-foreground">
        No store is linked to this account yet. Contact BOXAIO support to complete onboarding.
      </div>
    );
  }

  return (
    <RetailerShell>
      <Outlet />
    </RetailerShell>
  );
}
