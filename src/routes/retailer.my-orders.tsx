import { createFileRoute } from "@tanstack/react-router";
import { PackageCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuickReorder } from "@/components/retailer/QuickReorder";
import { fetchMyOrders, markOrderDelivered } from "@/retailer/b2b/service";
import { B2B_ORDER_STATUS_LABELS } from "@/retailer/b2b/types";
import { useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/my-orders")({
  head: () => ({
    meta: [
      { title: "My Wholesale Orders | BOXAIO Business" },
      {
        name: "description",
        content: "Track your BOXAIO wholesale purchase orders and reorder in one tap.",
      },
      { property: "og:title", content: "My Wholesale Orders | BOXAIO Business" },
      { property: "og:description", content: "Your BOXAIO B2B purchase order history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyB2BOrders,
});

function MyB2BOrders() {
  const { user } = useRetailerSession();
  const email = user?.email ?? "";
  const orders = useAsync(() => fetchMyOrders(email), [email]);
  const rows = orders.data ?? [];

  const confirmDelivery = async (id: string) => {
    await markOrderDelivered(id);
    toast.success("Order marked delivered — products added to My Product Catalogue");
    orders.reload();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Wholesale purchases from BOXAIO. Delivered orders automatically build your product
        catalogue.
      </p>

      {orders.loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Loading your orders…</p>
      ) : rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No wholesale orders yet.</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {rows.map((order) => (
              <Card key={order.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">#{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.placedAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {order.paymentMethod}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {B2B_ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {order.items.map((item) => (
                    <li key={item.productId} className="flex justify-between gap-3">
                      <span className="truncate text-muted-foreground">{item.name}</span>
                      <span className="shrink-0">
                        {item.quantity} units · ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="font-bold">₹{order.total.toLocaleString("en-IN")}</span>
                  {order.status !== "delivered" && order.status !== "cancelled" ? (
                    <Button size="sm" variant="outline" onClick={() => void confirmDelivery(order.id)}>
                      <PackageCheck className="mr-2 size-4" /> Confirm delivery
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Quick Reorder</h2>
            {rows
              .filter((o) => o.status === "delivered")
              .slice(0, 3)
              .map((order) => (
                <QuickReorder key={order.id} order={order} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
