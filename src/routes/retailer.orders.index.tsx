import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, LoadingRows, OrderStatusBadge, PageHeader } from "@/retailer/components/ui-bits";
import { fetchOrders, updateOrderStatus } from "@/retailer/data/service";
import { formatCurrency, formatDate, useAsync, useRetailerSession } from "@/retailer/hooks";
import {
  ORDER_STATUS_LABELS,
  ORDER_TRANSITIONS,
  type OrderStatus,
  type RetailerOrder,
} from "@/retailer/types";

export const Route = createFileRoute("/retailer/orders/")({
  component: RetailerOrders,
});

const TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "placed", label: "New" },
  { value: "accepted", label: "Accepted" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "picked_up", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function RetailerOrders() {
  const { storeId } = useRetailerSession();
  const { data, loading, reload } = useAsync(() => fetchOrders(storeId), [storeId]);
  const [tab, setTab] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("all");

  const orders = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((o) => {
      if (tab !== "all" && o.status !== tab) return false;
      if (payment !== "all" && o.paymentMethod !== payment) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
    });
  }, [data, tab, query, payment]);

  const advance = async (order: RetailerOrder, next: OrderStatus) => {
    try {
      await updateOrderStatus(storeId, order.id, next);
      toast.success(`Order #${order.id} → ${ORDER_STATUS_LABELS[next]}`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the order");
    }
  };

  const counts = (status: OrderStatus | "all") =>
    status === "all" ? (data ?? []).length : (data ?? []).filter((o) => o.status === status).length;

  return (
    <div>
      <PageHeader title="Orders" description="Accept, prepare and track every order placed with your store." />

      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row">
        <Input
          placeholder="Search by order ID or customer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={payment} onValueChange={setPayment}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment methods</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
            <SelectItem value="Wallet">Wallet</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={
              tab === t.value
                ? "shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                : "shrink-0 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {t.label} ({counts(t.value)})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingRows rows={6} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders here" description="Try a different filter or check back soon." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/retailer/orders/$orderId"
                      params={{ orderId: order.id }}
                      className="text-sm font-bold text-foreground hover:underline"
                    >
                      #{order.id}
                    </Link>
                    <OrderStatusBadge status={order.status} />
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.customerName} · {order.items.length} item(s) · {formatDate(order.placedAt)}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-2 text-lg font-bold text-foreground">{formatCurrency(order.total)}</span>
                  {ORDER_TRANSITIONS[order.status].map((next) => (
                    <Button
                      key={next}
                      size="sm"
                      variant={next === "cancelled" ? "outline" : "default"}
                      onClick={() => advance(order, next)}
                    >
                      {next === "cancelled" ? "Cancel" : ORDER_STATUS_LABELS[next]}
                    </Button>
                  ))}
                  <Link to="/retailer/orders/$orderId" params={{ orderId: order.id }}>
                    <Button size="sm" variant="ghost">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
