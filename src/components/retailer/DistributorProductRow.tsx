import { RetailerProductCard } from "@/features/wholesale/components/RetailerProductCard";
import type { B2BProduct } from "@/retailer/b2b/types";
export function DistributorProductRow({
  product,
  preferredDistributorId,
}: {
  product: B2BProduct;
  preferredDistributorId?: string;
}) {
  return (
    <RetailerProductCard
      key={product.id + "-" + preferredDistributorId}
      product={product}
      preferredDistributorId={preferredDistributorId}
    />
  );
}
