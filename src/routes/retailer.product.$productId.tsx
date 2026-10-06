import { useState } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart, ShoppingCart, Store, Tag, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BulkQuantitySelector } from "@/components/retailer/BulkQuantitySelector";
import { StockPill } from "@/components/retailer/RetailerProductCard";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { useB2BWishlist } from "@/retailer/b2b/wishlist";
import { getB2BProduct } from "@/retailer/b2b/service";

export const Route = createFileRoute("/retailer/product/$productId")({
  loader: ({ params }) => {
    const product = getB2BProduct(params.productId);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Product"} | BOXAIO Wholesale` },
      {
        name: "description",
        content: loaderData?.description ?? "Wholesale product details on BOXAIO.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProductOverview,
  notFoundComponent: ProductNotFound,
});

function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="text-xl font-bold text-foreground">Product not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This product is no longer available in the wholesale catalogue.
      </p>
      <Link to="/retailer/shop" className="mt-6">
        <Button>Back to shop</Button>
      </Link>
    </div>
  );
}

function ProductOverview() {
  const product = Route.useLoaderData();
  const { addBulkToCart } = useB2BCart();
  const { has, toggle } = useB2BWishlist();
  const [qty, setQty] = useState(product.moq);
  const discount = Math.max(
    0,
    Math.round(((product.mrp - product.b2bPrice) / product.mrp) * 100),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <Link
        to="/retailer/shop"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to shop
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row">
          {/* Image panel */}
          <div className="relative h-64 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-[45%]">
            <img
              src={product.image}
              alt={product.name}
              className="size-full object-cover"
            />
            <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">
              {product.unit}
            </span>
          </div>

          {/* Info panel */}
          <div className="relative flex min-w-0 flex-1 flex-col gap-2 p-5 sm:p-6">
            <button
              type="button"
              aria-label="Save to business wishlist"
              onClick={() => toggle(product.id)}
              className="absolute right-4 top-4 rounded-full p-1"
            >
              <Heart
                className={
                  has(product.id)
                    ? "size-6 fill-primary text-primary"
                    : "size-6 text-muted-foreground"
                }
              />
            </button>

            <p className="pr-10 text-sm font-semibold text-primary">
              {product.brand} · {product.category}
            </p>
            <h1 className="pr-10 text-2xl font-bold leading-tight text-foreground">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {product.unit} · SKU {product.sku}
            </p>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="text-3xl font-extrabold text-primary">
                ₹{product.b2bPrice}
              </span>
              <span className="text-sm text-muted-foreground">/ unit</span>
              {product.mrp > product.b2bPrice ? (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.mrp}
                  </span>
                  {discount > 0 ? (
                    <span className="text-sm font-semibold text-primary">
                      {discount}% off
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>

            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Store className="size-4 shrink-0" />
              <span className="truncate">{product.distributor}</span>
              <span className="shrink-0 font-normal text-muted-foreground">
                | MOQ: {product.moq} units
              </span>
            </p>

            <StockPill stock={product.stock} />

            {product.offer ? (
              <p className="flex w-fit items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-sm font-medium text-amber-600">
                <Tag className="size-3.5 shrink-0" /> {product.offer}
              </p>
            ) : null}

            {product.packSizes.length > 1 ? (
              <div className="mt-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Available pack sizes
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {product.packSizes.map((size) => (
                    <span
                      key={size}
                      className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Distributor offers */}
            {product.offers.length > 1 ? (
              <div className="mt-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Distributor offers
                </p>
                <ul className="mt-1 space-y-1.5">
                  {product.offers.map((offer) => (
                    <li
                      key={offer.distributorId}
                      className="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span className="font-semibold text-foreground">
                        {offer.distributorName}
                      </span>
                      <span className="font-bold text-primary">₹{offer.price}</span>
                      <span className="text-xs text-muted-foreground">
                        {offer.marginPct}% margin
                      </span>
                      {offer.freeDelivery ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <Truck className="size-3" /> Free delivery
                        </span>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        {offer.deliveryEstimate}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom: bulk quantity + add to cart */}
        <div className="space-y-2 border-t border-border p-5 sm:p-6">
          <p className="text-sm font-semibold text-foreground">Bulk quantity</p>
          <BulkQuantitySelector product={product} value={qty} onChange={setQty} variant="bar" />
          <Button
            className="w-full"
            disabled={product.stock <= 0}
            onClick={() => {
              addBulkToCart(product, qty);
              toast.success(`${qty} units of ${product.name} added to bulk cart`);
            }}
          >
            <ShoppingCart className="mr-2 size-4" />
            {product.stock <= 0 ? "Out of stock" : "Add Bulk to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
