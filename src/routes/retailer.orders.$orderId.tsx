import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState, LoadingRows, OrderStatusBadge, PageHeader, Pill } from "@/retailer/components/ui-bits";
import { fetchOrder, updateOrderStatus } from "@/retailer/data/service";
import { formatCurrency, formatDate, useAsync, useRetailerSession } from "@/retailer/hooks";
import { ORDER_STATUS_LABELS, ORDER_TRANSITIONS, type OrderStatus } from "@/retailer/types";

export const Route = createFileRoute("/retailer/orders/$orderId")({
  component: RetailerOrderDetail,
});

const TIMELINE: OrderStatus[] = ["placed", "accepted", "preparing", "ready", "picked_up", "delivered"];

function RetailerOrderDetail() {
  const { orderId } = useParams({ from: "/retailer/orders/$orderId" });
  const { storeId } = useRetailerSession();
  const { data: order, loading, reload } = useAsync(() => fetchOrder(storeId, orderId), [storeId, orderId]);

  const advance = async (next: OrderStatus) => {
    try {
      await updateOrderStatus(storeId, orderId, next);
      toast.success(`Order moved to ${ORDER_STATUS_LABELS[next]}`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the order");
    }
  };

  if (loading) return <LoadingRows rows={5} />;

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="This order does not belong to your store."
        action={
          <Link to="/retailer/orders">
            <Button variant="outline">Back to orders</Button>
          </Link>
        }
      />
    );
  }

  const activeIndex = TIMELINE.indexOf(order.status);

  return (
    <div>
      <Link
        to="/retailer/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All orders
      </Link>

      <PageHeader
        title={`Order #${order.id}`}
        description={`Placed ${formatDate(order.placedAt)}`}
        actions={
          <>
            {ORDER_TRANSITIONS[order.status].map((next) => (
              <Button
                key={next}
                variant={next === "cancelled" ? "outline" : "default"}
                onClick={() => advance(next)}
              >
                {next === "cancelled" ? "Cancel order" : `Mark ${ORDER_STATUS_LABELS[next]}`}
              </Button>
            ))}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold">Status</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            {order.status === "cancelled" || order.status === "returned" ? (
              <p className="text-sm text-muted-foreground">
                This order was {order.status}. No further transitions are available.
              </p>
            ) : (
              <ol className="space-y-3">
                {TIMELINE.map((step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span
                      className={
                        i <= activeIndex
                          ? "flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                          : "flex size-6 items-center justify-center rounded-full border border-border text-xs text-muted-foreground"
                      }
                    >
                      {i + 1}
                    </span>
                    <span className={i <= activeIndex ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-lg font-semibold">Items</h2>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.unitPrice)} × {item.quantity} · GST {item.gstPercent}%
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
              <Row label="Discount" value={`− ${formatCurrency(order.discount)}`} />
              <Row label="GST" value={formatCurrency(order.gst)} />
              <Row label="Delivery fee" value={formatCurrency(order.deliveryFee)} />
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold">
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Customer</h2>
            <p className="text-sm font-medium text-foreground">{order.customerName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{order.deliveryAddress}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Contact details are masked. Use BOXAIO support chat to reach the customer.
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Payment</h2>
            <div className="flex flex-wrap gap-2">
              <Pill tone="info">{order.paymentMethod}</Pill>
              <Pill tone={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "refunded" ? "danger" : "warning"}>
                {order.paymentStatus}
              </Pill>
            </div>
          </Card>

          {order.deliveryPartner ? (
            <Card className="p-5">
              <h2 className="mb-3 text-lg font-semibold">Delivery</h2>
              <p className="text-sm text-muted-foreground">Partner: {order.deliveryPartner}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
