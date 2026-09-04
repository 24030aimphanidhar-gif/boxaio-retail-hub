import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, PackageSearch, Percent, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShopByBrandRail,
  ShopByCategoryRail,
  ShopByDistributorRail,
} from "@/components/retailer/BrowseRails";
import { QuickReorder } from "@/components/retailer/QuickReorder";
import { RetailerCatalogueCard } from "@/components/retailer/RetailerCatalogueCard";
import { RetailerProductCard } from "@/components/retailer/RetailerProductCard";
import {
  B2B_PRODUCTS,
  fetchMyCatalogue,
  fetchMyOrders,
  frequentlyPurchased,
} from "@/retailer/b2b/service";

import { useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/")({
  component: RetailerStorefrontHome,
});

function RetailerStorefrontHome() {
  const { store, user } = useRetailerSession();
  const email = user?.email ?? "";
  const catalogue = useAsync(() => fetchMyCatalogue(email), [email]);
  const orders = useAsync(() => fetchMyOrders(email), [email]);

  const frequent = frequentlyPurchased(catalogue.data ?? []).slice(0, 4);
  const lastDelivered = (orders.data ?? []).filter((o) => o.status === "delivered").slice(0, 2);
  const featured = B2B_PRODUCTS.filter((p) => p.offer).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        to="/retailer/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> My Store
      </Link>
      <section className="rounded-2xl bg-primary/10 p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          BOXAIO Business
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-4xl">
          Wholesale buying for {store?.name ?? "your business"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Bulk prices, minimum order quantities and business offers — plus your own product
          catalogue built automatically from everything you have purchased.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/retailer/shop">
            <Button>Shop wholesale</Button>
          </Link>
          <Link to="/retailer/catalogue">
            <Button variant="outline">My Product Catalogue</Button>
          </Link>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Percent, title: "Bulk discounts", text: "Automatic savings on large orders" },
          { icon: Truck, title: "Free bulk delivery", text: "On orders above ₹5,000" },
          { icon: PackageSearch, title: "Auto catalogue", text: "Purchases saved for fast reorder" },
        ].map((f) => (
          <Card key={f.title} className="flex items-start gap-3 p-4">
            <f.icon className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.text}</p>
            </div>
          </Card>
        ))}
      </div>

      <ShopByCategoryRail />
      <ShopByBrandRail />
      <ShopByDistributorRail />

      <div className="mt-3">
        <Link
          to="/retailer/distributors"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Compare distributor offers side by side <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {frequent.length > 0 ? (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Buy again</h2>
            <Link
              to="/retailer/catalogue"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              My Product Catalogue <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {frequent.map((e) => (
              <RetailerCatalogueCard key={e.productId} entry={e} />
            ))}
          </div>
        </section>
      ) : null}

      {lastDelivered.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Reorder</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lastDelivered.map((o) => (
              <QuickReorder key={o.id} order={o} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Wholesale deals</h2>
          <Link
            to="/retailer/deals"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <RetailerProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
