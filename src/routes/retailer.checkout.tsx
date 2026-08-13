import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useB2BCart } from "@/retailer/b2b/CartContext";
import { getB2BProduct, placeB2BOrder } from "@/retailer/b2b/service";
import { useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/checkout")({
  head: () => ({
    meta: [
      { title: "B2B Checkout | BOXAIO Business" },
      { name: "description", content: "Confirm and place your BOXAIO wholesale bulk order." },
      { property: "og:title", content: "B2B Checkout | BOXAIO Business" },
      { property: "og:description", content: "Place your wholesale order with business credit terms." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RetailerCheckout,
});

function RetailerCheckout() {
  const { user, store } = useRetailerSession();
  const { items, subtotal, clearCart, toOrderItems } = useB2BCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(
    store ? `${store.addressLine}, ${store.city}, ${store.state} ${store.pincode}` : "",
  );
  const [gst, setGst] = useState(store?.gstNumber ?? "");
  const [placing, setPlacing] = useState(false);

  const discount = subtotal > 20000 ? Math.round(subtotal * 0.05) : 0;
  const delivery = subtotal > 5000 || subtotal === 0 ? 0 : 199;

  const placeOrder = async () => {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      // Re-price against the live catalogue so no stale price is ever charged.
      const orderItems = toOrderItems().map((it) => ({
        ...it,
        unitPrice: getB2BProduct(it.productId)?.b2bPrice ?? it.unitPrice,
      }));
      const order = await placeB2BOrder(user?.email ?? "", orderItems, address);
      clearCart();
      toast.success(`Order ${order.id} placed`);
      void navigate({ to: "/retailer/my-orders" });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">B2B Checkout</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="space-y-4 p-5 lg:col-span-3">
          <div>
            <Label htmlFor="biz">Business name</Label>
            <Input id="biz" value={store?.name ?? ""} readOnly className="mt-1" />
          </div>
          <div>
            <Label htmlFor="gst">GST number</Label>
            <Input id="gst" value={gst} onChange={(e) => setGst(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="addr">Delivery address</Label>
            <Input
              id="addr"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
            Payment terms: <span className="font-semibold text-foreground">Credit (30 days)</span> ·
            invoice issued on delivery.
          </div>
        </Card>

        <Card className="h-fit p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-2">
                <span className="truncate text-muted-foreground">
                  {i.name} × {i.quantity}
                </span>
                <span>
                  ₹{((getB2BProduct(i.productId)?.b2bPrice ?? i.price) * i.quantity).toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-3 text-base font-bold">
            <span>Total</span>
            <span>₹{(subtotal - discount + delivery).toLocaleString("en-IN")}</span>
          </div>
          <Button
            className="mt-5 w-full"
            disabled={items.length === 0 || placing}
            onClick={() => void placeOrder()}
          >
            {placing ? "Placing order…" : "Place bulk order"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
