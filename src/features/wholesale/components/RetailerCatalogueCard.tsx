import { RetailerProductCard } from "@/features/wholesale/components/RetailerProductCard";
import type { CatalogueEntry } from "@/retailer/b2b/types";
import { getDistributor } from "@/retailer/b2b/distributors";
import { money } from "@/lib/demo-orders";
export function RetailerCatalogueCard({ entry: e }: { entry: CatalogueEntry }) {
  return (
    <RetailerProductCard
      product={e.product}
      preferredDistributorId={e.lastDistributorId}
      initialVariantId={e.lastVariantId || "standard"}
      footer={
        <>
          <strong>Purchased {e.purchaseCount} times</strong>
          <p>
            Last: {new Date(e.lastPurchasedAt).toLocaleDateString("en-IN")} · {e.lastPurchasedQty} ×{" "}
            {e.lastUnit || e.product.unit}
          </p>
          <p>
            {money(e.lastPurchasedPrice)} / pack{" "}
            {e.lastDistributorId ? "· " + getDistributor(e.lastDistributorId)?.name : ""}
          </p>
        </>
      }
    />
  );
}
