import { useState } from "react";
import { Heart, Minus, Plus, ShoppingCart, Store, Tag } from "lucide-react";
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
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
        🔴 Currently Out of Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
      🟢 In Stock · {stock} {stock === 1 ? "unit" : "units"}
    </span>
  );
}

/** B2B wholesale product card used across the retailer storefront. */
export function RetailerProductCard({
  product,
  footer,
  variant = "standard",
}: {
  product: B2BProduct;
  footer?: React.ReactNode;
  variant?: "standard" | "horizontal";
}) {
  const { addBulkToCart } = useB2BCart();
  const { has, toggle } = useB2BWishlist();
  const [qty, setQty] = useState(product.moq);
  const discount = Math.max(0, Math.round(((product.mrp - product.b2bPrice) / product.mrp) * 100));

  if (variant === "horizontal") {
    const packLabel = `${product.moq} kg`;
    const lowStock = product.stock > 0 && product.stock <= 10;

    return (
      <Card className="flex h-[360px] w-full max-w-[325px] flex-col overflow-hidden rounded-[14px] border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
        <div className="grid min-h-0 flex-1 grid-cols-[45%_55%] overflow-hidden rounded-lg border border-border">
          <div className="relative min-h-0 overflow-hidden rounded-l-lg bg-muted">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover"
            />
            <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-1 text-[11px] font-bold text-foreground shadow-sm">
              {packLabel}
            </span>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Save to business wishlist"
              onClick={() => toggle(product.id)}
              className="absolute right-2 top-2 size-8 rounded-full bg-background/90 shadow-sm"
            >
              <Heart className={has(product.id) ? "size-4 fill-primary text-primary" : "size-4 text-muted-foreground"} />
            </Button>
          </div>

          <div className="flex min-w-0 flex-col p-3">
            <span className="w-fit rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              {product.brand}
            </span>
            <h3 className="mt-2 line-clamp-2 text-base font-bold text-foreground">{product.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{packLabel}</p>
            <p className="mt-2 text-sm font-bold text-foreground">₹{product.b2bPrice} / {packLabel}</p>
            <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">{product.distributor}</p>
            {lowStock ? (
              <p className="mt-2 text-xs font-semibold text-amber-600">Only {product.stock} kg left</p>
            ) : product.stock === 0 ? (
              <p className="mt-2 text-xs font-semibold text-destructive">Out of Stock</p>
            ) : null}
            <p className="mt-auto text-xs font-medium text-emerald-700">🎉 Festive wholesale deal</p>
          </div>
        </div>

        <div className="pt-3">
          <p className="mb-1.5 text-xs font-semibold text-foreground">Bulk Quantity</p>
          <div className="grid h-10 grid-cols-[44px_1fr_44px] overflow-hidden rounded-lg border border-border bg-background">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-full rounded-none border-r border-border"
              disabled={qty <= product.moq || product.stock <= 0}
              aria-label="Decrease bulk quantity"
              onClick={() => setQty(Math.max(product.moq, qty - product.increment))}
            >
              <Minus className="size-4" />
            </Button>
            <div className="flex items-center justify-center text-sm font-bold text-foreground">{qty} kg</div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-full rounded-none border-l border-border"
              disabled={qty >= product.stock || product.stock <= 0}
              aria-label="Increase bulk quantity"
              onClick={() => setQty(Math.min(product.stock, qty + product.increment))}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <Button
            className="mt-2 h-11 w-full bg-emerald-600 text-primary-foreground hover:bg-emerald-700"
            disabled={product.stock <= 0}
            onClick={() => {
              addBulkToCart(product, qty);
              toast.success(`${qty} kg of ${product.name} added to bulk cart`);
            }}
          >
            <ShoppingCart className="mr-2 size-4" />
            {product.stock <= 0 ? "Out of Stock" : "Add Bulk to Cart"}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {discount > 0 ? (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
            {discount}% OFF
          </span>
        ) : null}
        <button
          type="button"
          aria-label="Save to business wishlist"
          onClick={() => toggle(product.id)}
          className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow-sm"
        >
          <Heart className={has(product.id) ? "size-4 fill-primary text-primary" : "size-4 text-muted-foreground"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.unit}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">₹{product.b2bPrice}</span>
          <span className="text-xs text-muted-foreground">/ unit</span>
          {product.mrp > product.b2bPrice ? (
            <span className="text-xs text-muted-foreground line-through">MRP ₹{product.mrp}</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            <Store className="size-3" /> {product.distributor}
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            MOQ: {product.moq} units
          </span>
          <StockPill stock={product.stock} />
        </div>

        {product.offer ? (
          <p className="flex items-center gap-1 text-xs font-medium text-amber-600">
            <Tag className="size-3.5" /> {product.offer}
          </p>
        ) : null}

        {footer}

        <div className="mt-auto space-y-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground">Bulk quantity</p>
          <BulkQuantitySelector product={product} value={qty} onChange={setQty} />
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
    </Card>
  );
}
