import { History, Repeat } from "lucide-react";

import { RetailerProductCard } from "@/components/retailer/RetailerProductCard";
import type { CatalogueEntry } from "@/retailer/b2b/types";

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Catalogue card = the standard B2B product card plus this retailer's own
 * purchase history for that product. Pricing always comes from the live
 * product, never from the old purchase price.
 */
export function RetailerCatalogueCard({
  entry,
  variant = "standard",
}: {
  entry: CatalogueEntry;
  variant?: "standard" | "horizontal";
}) {
  return (
    <RetailerProductCard
      product={entry.product}
      variant={variant}
      footer={
        variant === "horizontal" ? undefined :
        <div className="rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <History className="size-3.5" />
            Last purchased {fmtDate(entry.lastPurchasedAt)} · {entry.lastPurchasedQty} units @ ₹
            {entry.lastPurchasedPrice}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-wide">
            {entry.product.category} · {entry.product.distributor}
          </p>
          <p className="mt-1 flex items-center gap-1.5">
            <Repeat className="size-3.5" />
            Purchased {entry.purchaseCount}×  · {entry.totalQuantityPurchased} units total
          </p>
        </div>
      }
    />
  );
}
