import { createFileRoute } from "@tanstack/react-router";
import { WholesaleProductDetail } from "@/features/wholesale/pages/WholesaleProductDetail";
export const Route = createFileRoute("/retailer/item/$productId")({
  validateSearch: (
    s: Record<string, unknown>
  ): { supplier?: string; variant?: string; from?: string } => ({
    supplier: typeof s.supplier === "string" ? s.supplier : undefined,
    variant: ["standard", "double", "master"].includes(String(s.variant))
      ? String(s.variant)
      : "standard",
    from:
      typeof s.from === "string" &&
      /^\/retailer\/(shop|catalogue|distributors|deals|wishlist)([/?]|$)/.test(s.from)
        ? s.from
        : "/retailer/shop",
  }),
  component: WholesaleProductDetail,
});
