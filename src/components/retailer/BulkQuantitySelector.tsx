import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clampBulkQty, type B2BProduct } from "@/retailer/b2b/types";
import { cn } from "@/lib/utils";

/**
 * Bulk quantity stepper for B2B products.
 * Never goes below MOQ, never above available stock, and always moves in the
 * product's quantity increment.
 *
 * Variants:
 * - "boxed" (default): bordered stepper with the unit/step hint beside it.
 * - "bar": filled bar with square buttons and a centred "qty unit · step N"
 *   label, matching the horizontal product-card layout.
 */
export function BulkQuantitySelector({
  product,
  value,
  onChange,
  className,
  variant = "boxed",
}: {
  product: B2BProduct;
  value: number;
  onChange: (qty: number) => void;
  className?: string;
  variant?: "boxed" | "bar";
}) {
  const atMin = value <= product.moq;
  const atMax = value >= Math.max(product.moq, product.stock);

  if (variant === "bar") {
    return (
      <div
        className={cn("flex items-center gap-2 rounded-xl bg-muted px-2 py-1.5", className)}
      >
        <Button
          type="button"
          size="icon"
          className="size-8 shrink-0 rounded-lg"
          disabled={atMin || product.stock <= 0}
          aria-label="Decrease bulk quantity"
          onClick={() => onChange(clampBulkQty(product, value - product.increment))}
        >
          <Minus className="size-4" />
        </Button>
        <span className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-foreground">
          {value} {product.unit} · step {product.increment}
        </span>
        <Button
          type="button"
          size="icon"
          className="size-8 shrink-0 rounded-lg"
          disabled={atMax || product.stock <= 0}
          aria-label="Increase bulk quantity"
          onClick={() => onChange(clampBulkQty(product, value + product.increment))}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center rounded-lg border border-border bg-background">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-9 rounded-r-none"
          disabled={atMin || product.stock <= 0}
          aria-label="Decrease bulk quantity"
          onClick={() => onChange(clampBulkQty(product, value - product.increment))}
        >
          <Minus className="size-4" />
        </Button>
        <input
          type="number"
          value={value}
          aria-label="Bulk quantity"
          className="w-16 border-x border-border bg-transparent py-1.5 text-center text-sm font-semibold outline-none"
          onChange={(e) => onChange(Number(e.target.value) || product.moq)}
          onBlur={(e) => onChange(clampBulkQty(product, Number(e.target.value) || product.moq))}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-9 rounded-l-none"
          disabled={atMax || product.stock <= 0}
          aria-label="Increase bulk quantity"
          onClick={() => onChange(clampBulkQty(product, value + product.increment))}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <span className="text-xs text-muted-foreground">
        {product.unit} · step {product.increment}
      </span>
    </div>
  );
}
