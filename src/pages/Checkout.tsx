import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CheckoutFlow } from "@/features/checkout/components/CheckoutFlow";
export function Checkout() {
  const { cart, consumeOrder } = useCart();
  const { user } = useAuth();
  return (
    <CheckoutFlow
      key={user?.email || "guest"}
      mode="consumer"
      account={user && user.role !== "guest" ? user.email : "guest"}
      consume={consumeOrder}
      lines={cart.map((i) => ({
        key: i.id,
        productId: i.productId,
        name: i.name,
        image: i.image,
        unit: i.unit,
        quantity: i.quantity,
        unitPrice: i.price,
        listPrice: i.price,
        category: i.category,
        sellerId: "boxaio-fresh",
        seller: "Boxaio Fresh Mart",
        variant: i.type,
        stockUnits: i.quantity,
        gstRate: 5,
        freeDelivery: false,
      }))}
    />
  );
}
