import { useState } from "react";
import { Heart, ShoppingCart, Store, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BulkQuantitySelector } from "@/components/retailer/BulkQuantitySelector";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { useB2BWishlist } from "@/retailer/b2b/wishlist";
import type { B2BProduct } from "@/retailer/b2b/types";

export function StockPill({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
        <span className="size-1.5 shrink-0 rounded-full bg-destructive" />
        Currently Out of Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
      <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
      In Stock · {stock} {stock === 1 ? "unit" : "units"}
    </span>
  );
}

/**
 * B2B wholesale product card used across the retailer storefront.
 * Horizontal layout (reference Card 06): image left (~42%), info right,
 * full-width bulk quantity + add-to-cart bar along the bottom.
 */
export function RetailerProductCard({
  product,
  footer,
}: {
  product: B2BProduct;
  footer?: React.ReactNode;
}) {
  const { addBulkToCart } = useB2BCart();
  const { has, toggle } = useB2BWishlist();
  const [qty, setQty] = useState(product.moq);
  const discount = Math.max(0, Math.round(((product.mrp - product.b2bPrice) / product.mrp) * 100));

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card transition-shadow hover:shadow-lg">
      {/* Top: horizontal image + info */}
      <div className="flex">
        <div className="relative w-[42%] shrink-0 overflow-hidden sm:w-[45%]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
            {product.unit}
          </span>
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col gap-1 p-3">
          <button
            type="button"
            aria-label="Save to business wishlist"
            onClick={() => toggle(product.id)}
            className="absolute right-2 top-2 rounded-full p-1"
          >
            <Heart
              className={
                has(product.id)
                  ? "size-5 fill-primary text-primary"
                  : "size-5 text-muted-foreground"
              }
            />
          </button>

          <p className="pr-8 text-xs font-semibold text-primary">{product.brand}</p>
          <h3 className="line-clamp-2 pr-8 text-base font-bold leading-tight text-foreground">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground">{product.unit}</p>

          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-xl font-extrabold text-primary">₹{product.b2bPrice}</span>
            <span className="text-xs text-muted-foreground">/ unit</span>
            {product.mrp > product.b2bPrice ? (
              <>
                <span className="text-xs text-muted-foreground line-through">₹{product.mrp}</span>
                {discount > 0 ? (
                  <span className="text-[11px] font-semibold text-primary">{discount}% off</span>
                ) : null}
              </>
            ) : null}
          </div>

          <p className="flex items-center gap-1 text-xs font-semibold text-foreground">
            <Store className="size-3.5 shrink-0" />
            <span className="truncate">{product.distributor}</span>
            <span className="shrink-0 font-normal text-muted-foreground">
              | MOQ: {product.moq} units
            </span>
          </p>

          <StockPill stock={product.stock} />

          {product.offer ? (
            <p className="mt-0.5 flex w-fit items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">
              <Tag className="size-3 shrink-0" /> {product.offer}
            </p>
          ) : null}

          {footer}
        </div>
      </div>

      {/* Bottom: full-width bulk quantity + add to cart */}
      <div className="mt-auto space-y-2 border-t border-border p-3">
        <p className="text-xs font-semibold text-foreground">Bulk quantity</p>
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
    </Card>
  );
}
