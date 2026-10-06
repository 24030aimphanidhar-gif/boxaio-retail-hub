import { createFileRoute } from "@tanstack/react-router";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { useRetailerSession } from "@/retailer/hooks";
import { CheckoutFlow } from "@/features/checkout/components/CheckoutFlow";
export const Route = createFileRoute("/retailer/checkout")({ component: Checkout });
function Checkout() {
  const { items, consumeOrder } = useB2BCart();
  const { user } = useRetailerSession();
  return (
    <CheckoutFlow
      key={user?.email || "guest"}
      mode="wholesale"
      account={user?.email || "guest"}
      consume={consumeOrder}
      lines={items.map((i) => ({
        key: i.key,
        productId: i.productId,
        name: i.name,
        image: i.image,
        unit: i.unit,
        quantity: i.quantity,
        unitPrice: i.price,
        listPrice: i.price,
        category: "",
        sellerId: i.distributorId,
        seller: i.distributorName,
        variant: i.variantId,
        stockUnits: i.quantity,
        gstRate: 5,
        freeDelivery: i.freeDelivery,
      }))}
    />
  );
}
