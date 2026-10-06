import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { getB2BProduct } from "@/retailer/b2b/service";
import { type B2BOrder } from "@/retailer/b2b/types";
import { availableOffers, quoteProduct, packVariants } from "@/retailer/b2b/pricing";

/**
 * Quick Reorder — re-adds a previous order to the bulk cart, re-validating
 * availability, current B2B price and MOQ instead of reusing old values.
 */
export function QuickReorder({ order, compact = false }: { order: B2BOrder; compact?: boolean }) {
  const { addBulkToCart } = useB2BCart();
  const [addedToBasket, setAddedToBasket] = useState(false);

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
      const offer = item.distributorId
        ? availableOffers(product).find((o) => o.distributorId === item.distributorId)
        : availableOffers(product)[0];
      if (!offer) {
        skipped.push(item.name);
        return;
      }
      const variant = packVariants(product).find((v) => v.id === (item.variantId || "standard"))!;
      const qty = Math.max(variant.moq, item.quantity);
      if (quoteProduct(product, offer, variant.id, qty).error) {
        skipped.push(item.name);
        return;
      }
      if (qty !== item.quantity) adjusted.push(item.name);
      if (addBulkToCart(product, qty, offer, item.variantId)) added += 1;
      else skipped.push(item.name);
    });

    if (added === 0) {
      toast.error("None of these products are available right now.");
      return;
    }
    setAddedToBasket(true);
    toast.success(
      `${added} product${added > 1 ? "s" : ""} added at current B2B prices` +
        (adjusted.length ? ` · quantity adjusted for ${adjusted.length}` : "") +
        (skipped.length ? ` · ${skipped.length} unavailable` : "")
    );
  };

  if (compact)
    return (
      <div className="purchase-reorder">
        <h3>Restock these products</h3>
        <p>Current prices and availability apply.</p>
        <button className="outline-button" disabled={addedToBasket} onClick={reorderAll}>
          <RefreshCw size={14} />
          {addedToBasket ? "Added to basket" : "Reorder products"}
        </button>
        {addedToBasket && (
          <Link to="/retailer/cart" className="solid-button">
            Review basket
          </Link>
        )}
      </div>
    );
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
          <li
            key={[item.productId, item.distributorId, item.variantId].join("::")}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="truncate text-foreground">{item.name}</span>
            <span className="shrink-0 text-muted-foreground">
              {item.quantity} × {item.unit}
            </span>
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
