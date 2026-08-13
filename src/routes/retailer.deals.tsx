import { createFileRoute } from "@tanstack/react-router";

import { RetailerProductCard } from "@/components/retailer/RetailerProductCard";
import { B2B_PRODUCTS } from "@/retailer/b2b/service";

export const Route = createFileRoute("/retailer/deals")({
  head: () => ({
    meta: [
      { title: "Wholesale Deals | BOXAIO Business" },
      {
        name: "description",
        content: "Current bulk offers and wholesale discounts for BOXAIO business customers.",
      },
      { property: "og:title", content: "Wholesale Deals | BOXAIO Business" },
      { property: "og:description", content: "Live bulk discounts and business offers on BOXAIO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WholesaleDeals,
});

function WholesaleDeals() {
  const deals = B2B_PRODUCTS.filter((p) => p.offer).slice(0, 24);
  const bestSavings = [...B2B_PRODUCTS]
    .sort((a, b) => (b.mrp - b.b2bPrice) / b.mrp - (a.mrp - a.b2bPrice) / a.mrp)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Wholesale Deals</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Business offers applied automatically at checkout.
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Running bulk offers</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {deals.map((p) => (
            <RetailerProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Biggest savings vs MRP</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bestSavings.map((p) => (
            <RetailerProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
