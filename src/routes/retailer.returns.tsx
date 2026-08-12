import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingRows, OrderStatusBadge, PageHeader, StatCard } from "@/retailer/components/ui-bits";
import { fetchOrders } from "@/retailer/data/service";
import { formatCurrency, formatDate, useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/returns")({
  component: Returns,
});

function Returns() {
  const { storeId } = useRetailerSession();
  const { data, loading } = useAsync(() => fetchOrders(storeId), [storeId]);
  const rows = (data ?? []).filter((o) => o.status === "returned" || o.status === "cancelled");
  const refunded = rows.filter((o) => o.paymentStatus === "refunded");

  return (
    <div>
      <PageHeader title="Returns & refunds" description="Cancelled and returned orders, with refund status." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Returns & cancellations" value={rows.length} tone="warning" />
        <StatCard label="Refunds issued" value={refunded.length} tone="danger" />
        <StatCard label="Refunded value" value={formatCurrency(refunded.reduce((s, o) => s + o.total, 0))} />
      </div>
      {loading ? (
        <LoadingRows rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState title="No returns" description="Great job — nothing has been returned or cancelled." />
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
                  {order.customerName} · {formatDate(order.placedAt)} · payment {order.paymentStatus}
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
