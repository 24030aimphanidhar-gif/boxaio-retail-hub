import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RetailerProductCard } from "@/components/retailer/RetailerProductCard";
import { getB2BProduct } from "@/retailer/b2b/service";
import { useB2BWishlist } from "@/retailer/b2b/wishlist";

export const Route = createFileRoute("/retailer/wishlist")({
  head: () => ({
    meta: [
      { title: "Business Wishlist | BOXAIO Business" },
      { name: "description", content: "Wholesale products your business saved for later." },
      { property: "og:title", content: "Business Wishlist | BOXAIO Business" },
      { property: "og:description", content: "Saved wholesale products for your business." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RetailerWishlist,
});

function RetailerWishlist() {
  const { ids } = useB2BWishlist();
  const products = ids.map((id) => getB2BProduct(id)).filter((p) => p !== null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Business Wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">Wholesale products saved for later.</p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
          <Heart className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Nothing saved yet.</p>
          <Link to="/retailer/shop" className="mt-5 inline-block">
            <Button>Browse wholesale shop</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <RetailerProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
