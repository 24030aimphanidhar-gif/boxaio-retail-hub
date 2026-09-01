import { useState } from "react";
import { Plus, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import type { B2BProduct, DistributorOffer } from "@/retailer/b2b/types";

/**
 * Wholesale distributor-offer row used by the "Shop by Distributor" experience.
 * Reusable and completely separate from `RetailerProductCard`, which stays as-is.
 */
export function DistributorProductRow({
  product,
  /** When set, this distributor's offer is preselected (distributor storefront). */
  preferredDistributorId,
}: {
  product: B2BProduct;
  preferredDistributorId?: string;
}) {
  const { addBulkToCart } = useB2BCart();
  const offers = product.offers;
  const initial =
    offers.findIndex((o) => o.distributorId === preferredDistributorId) >= 0
      ? offers.findIndex((o) => o.distributorId === preferredDistributorId)
      : 0;
  const [selected, setSelected] = useState(initial);
  const [pack, setPack] = useState(product.packSizes[0] ?? product.unit);
  const offer = offers[selected] ?? offers[0];

  if (!offer) return null;

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
            {product.name} — {product.unit}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {product.brand} · Case: {product.moq} pc · SKU {product.sku}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.packSizes.map((size, i) => (
              <button
                key={`${size}-${i}`}
                type="button"
                onClick={() => setPack(size)}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                  pack === size
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
      </div>

      {/* Distributor offers — selected one highlighted */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {offers.map((o, i) => (
          <button
            key={o.distributorId}
            type="button"
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
            className={cn(
              "min-w-[9.5rem] shrink-0 rounded-lg border p-2 text-left transition-colors",
              i === selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border opacity-70 hover:opacity-100",
            )}
          >
            <p className="text-sm font-bold text-foreground">
              ₹{o.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {o.distributorName}
            </p>
            {o.freeDelivery ? (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <Truck className="size-3" /> Free Delivery
              </p>
            ) : (
              <p className="mt-0.5 text-[11px] text-muted-foreground">Delivery charges apply</p>
            )}
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-emerald-600">{offer.marginPct}% Margin</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Truck className="size-3" /> Delivery by {offer.deliveryEstimate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground line-through">
            MRP ₹{product.mrp.toLocaleString("en-IN")}
          </p>
          <p className="text-base font-bold text-foreground">
            ₹{offer.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
            <span className="text-[11px] font-normal text-muted-foreground">/Pc</span>
          </p>
          <Button
            size="sm"
            className="mt-1.5"
            disabled={offer.stock <= 0}
            onClick={() => {
              addBulkToCart(product, product.moq, offer);
              toast.success(`${product.moq} pc of ${product.name} added from ${offer.distributorName}`);
            }}
          >
            <Plus className="mr-1 size-4" />
            {offer.stock <= 0 ? "Out of stock" : "Add"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
