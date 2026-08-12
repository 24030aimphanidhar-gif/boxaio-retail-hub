import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingRows, OrderStatusBadge, PageHeader } from "@/retailer/components/ui-bits";
import { fetchOrders } from "@/retailer/data/service";
import { formatCurrency, formatDate, useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/delivery")({
  component: Delivery,
});

function Delivery() {
  const { storeId } = useRetailerSession();
  const { data, loading } = useAsync(() => fetchOrders(storeId), [storeId]);
  const rows = (data ?? []).filter((o) => ["ready", "picked_up"].includes(o.status));

  return (
    <div>
      <PageHeader title="Delivery tracking" description="Orders handed to a delivery partner or waiting for pickup." />
      {loading ? (
        <LoadingRows rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState title="Nothing in transit" description="Orders appear here once they are ready for pickup." />
      ) : (
        <div className="space-y-3">
          {rows.map((order) => (
            <Card key={order.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">#{order.id}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.customerName} · {order.deliveryAddress} · {formatDate(order.placedAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Partner: {order.deliveryPartner ?? "Awaiting assignment"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatCurrency(order.total)}</span>
                <Link to="/retailer/orders/$orderId" params={{ orderId: order.id }}>
                  <Button size="sm" variant="outline">Open</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
