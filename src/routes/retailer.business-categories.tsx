import { createFileRoute, Link } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";
import { B2B_CATEGORIES, B2B_PRODUCTS } from "@/retailer/b2b/service";

export const Route = createFileRoute("/retailer/business-categories")({
  head: () => ({
    meta: [
      { title: "Business Categories | BOXAIO Business" },
      {
        name: "description",
        content: "Shop BOXAIO wholesale categories built for retailers and bulk buyers.",
      },
      { property: "og:title", content: "Business Categories | BOXAIO Business" },
      { property: "og:description", content: "Wholesale grocery categories for business buying." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BusinessCategories,
});

function BusinessCategories() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Business Categories</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Wholesale ranges curated for retail businesses.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {B2B_CATEGORIES.map((category) => {
          const items = B2B_PRODUCTS.filter((p) => p.category === category);
          const cover = items[0]?.image;
          return (
            <Link key={category} to="/retailer/shop">
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-[16/9] w-full bg-muted">
                  {cover ? (
                    <img
                      src={cover}
                      alt={category}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h2 className="text-sm font-semibold text-foreground">{category}</h2>
                  <p className="text-xs text-muted-foreground">{items.length} wholesale products</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
