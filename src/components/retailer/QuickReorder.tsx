import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { getB2BProduct } from "@/retailer/b2b/service";
import { clampBulkQty, type B2BOrder } from "@/retailer/b2b/types";

/**
 * Quick Reorder — re-adds a previous order to the bulk cart, re-validating
 * availability, current B2B price and MOQ instead of reusing old values.
 */
export function QuickReorder({ order }: { order: B2BOrder }) {
  const { addBulkToCart } = useB2BCart();

  const reorderAll = () => {
    let added = 0;
    const skipped: string[] = [];
    const adjusted: string[] = [];

    order.items.forEach((item) => {
      const product = getB2BProduct(item.productId);
      if (!product || product.stock <= 0) {
        skipped.push(item.name);
        return;
      }
      const qty = clampBulkQty(product, item.quantity);
      if (qty !== item.quantity) adjusted.push(item.name);
      addBulkToCart(product, qty);
      added += 1;
    });

    if (added === 0) {
      toast.error("None of these products are available right now.");
      return;
    }
    toast.success(
      `${added} product${added > 1 ? "s" : ""} added at current B2B prices` +
        (adjusted.length ? ` · quantity adjusted for ${adjusted.length}` : "") +
        (skipped.length ? ` · ${skipped.length} unavailable` : ""),
    );
  };

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Previous Order #{order.id}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.placedAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="text-sm font-semibold">₹{order.total.toLocaleString("en-IN")}</span>
      </div>
      <ul className="mb-4 space-y-1.5">
        {order.items.slice(0, 4).map((item) => (
          <li key={item.productId} className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-foreground">{item.name}</span>
            <span className="shrink-0 text-muted-foreground">{item.quantity} units</span>
          </li>
        ))}
        {order.items.length > 4 ? (
          <li className="text-xs text-muted-foreground">+{order.items.length - 4} more</li>
        ) : null}
      </ul>
      <Button variant="outline" className="mt-auto w-full" onClick={reorderAll}>
        <RefreshCw className="mr-2 size-4" /> Reorder All
      </Button>
    </Card>
  );
}
