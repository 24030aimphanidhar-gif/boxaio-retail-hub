import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BulkQuantitySelector } from "@/components/retailer/BulkQuantitySelector";
import { getB2BProduct } from "@/retailer/b2b/service";
import { useB2BCart } from "@/retailer/b2b/CartContext";

export const Route = createFileRoute("/retailer/cart")({
  head: () => ({
    meta: [
      { title: "Bulk Cart | BOXAIO Business" },
      { name: "description", content: "Review your wholesale bulk order before B2B checkout." },
      { property: "og:title", content: "Bulk Cart | BOXAIO Business" },
      { property: "og:description", content: "Your BOXAIO wholesale bulk cart." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RetailerCart,
});

function RetailerCart() {
  const { items, setQuantity, removeItem, subtotal, clearCart } = useB2BCart();
  const discount = subtotal > 20000 ? Math.round(subtotal * 0.05) : 0;
  const delivery = subtotal > 5000 || subtotal === 0 ? 0 : 199;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShoppingCart className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Your bulk cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add products from the wholesale shop or reorder from My Product Catalogue.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/retailer/shop">
            <Button>Shop wholesale</Button>
          </Link>
          <Link to="/retailer/catalogue">
            <Button variant="outline">My Product Catalogue</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Bulk Cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">{items.length} products in this order</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => {
            const product = getB2BProduct(item.productId);
            // Distributor lines keep their supplier price; plain lines follow live B2B pricing.
            const livePrice = item.distributorId
              ? product?.offers.find((o) => o.distributorId === item.distributorId)?.price ??
                item.price
              : product?.b2bPrice ?? item.price;
            return (
              <Card key={item.key} className="flex gap-4 p-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.unit} · MOQ {item.moq} units
                  </p>
                  {item.distributorName ? (
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                      Supplied by {item.distributorName}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm font-semibold">₹{livePrice} / unit</p>
                  {product ? (
                    <BulkQuantitySelector
                      className="mt-2"
                      product={product}
                      value={item.quantity}
                      onChange={(q) => setQuantity(item.key, q)}
                    />
                  ) : null}
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.key)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <span className="font-bold">
                    ₹{(livePrice * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              </Card>
            );
          })}

          <Button variant="ghost" onClick={clearCart}>
            Clear cart
          </Button>
        </div>

        <Card className="h-fit p-5">
          <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>₹{subtotal.toLocaleString("en-IN")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Bulk discount</dt>
              <dd className="text-emerald-600">−₹{discount.toLocaleString("en-IN")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{delivery === 0 ? "Free" : `₹${delivery}`}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd>₹{(subtotal - discount + delivery).toLocaleString("en-IN")}</dd>
            </div>
          </dl>
          <Link to="/retailer/checkout" className="mt-5 block">
            <Button className="w-full">Proceed to B2B checkout</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
