import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clampBulkQty, type B2BProduct } from "@/retailer/b2b/types";
import { cn } from "@/lib/utils";

/**
 * Bulk quantity stepper for B2B products.
 * Never goes below MOQ, never above available stock, and always moves in the
 * product's quantity increment.
 */
export function BulkQuantitySelector({
  product,
  value,
  onChange,
  className,
}: {
  product: B2BProduct;
  value: number;
  onChange: (qty: number) => void;
  className?: string;
}) {
  const atMin = value <= product.moq;
  const atMax = value >= Math.max(product.moq, product.stock);

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
