import { useState } from "react";
import { ShoppingCart, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BulkQuantitySelector } from "@/components/retailer/BulkQuantitySelector";
import { useB2BCart } from "@/retailer/b2b/CartContext";
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
}: {
  product: B2BProduct;
  footer?: React.ReactNode;
}) {
  const { addBulkToCart } = useB2BCart();
  const [qty, setQty] = useState(product.moq);
  const discount = Math.max(0, Math.round(((product.mrp - product.b2bPrice) / product.mrp) * 100));

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
