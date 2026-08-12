import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  ShoppingBag,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge, PageHeader, StatCard, LoadingRows } from "@/retailer/components/ui-bits";
import { fetchDashboardSummary, fetchOrders, fetchProducts, fetchSales } from "@/retailer/data/service";
import { formatCurrency, formatDate, useAsync, useRetailerSession } from "@/retailer/hooks";
import { stockStatus } from "@/retailer/types";

export const Route = createFileRoute("/retailer/")({
  component: RetailerDashboard,
});

function RetailerDashboard() {
  const { storeId, store } = useRetailerSession();

  const summary = useAsync(() => fetchDashboardSummary(storeId), [storeId]);
  const sales = useAsync(() => fetchSales(storeId, "week"), [storeId]);
  const orders = useAsync(() => fetchOrders(storeId), [storeId]);
  const products = useAsync(() => fetchProducts(storeId), [storeId]);

  const recentOrders = (orders.data ?? []).slice(0, 6);
  const lowStock = (products.data ?? []).filter((p) => stockStatus(p) !== "in_stock").slice(0, 6);
  const topProducts = (() => {
    const totals = new Map<string, { name: string; qty: number }>();
    (orders.data ?? []).forEach((o) =>
      o.items.forEach((it) => {
        const entry = totals.get(it.productId) ?? { name: it.name, qty: 0 };
        entry.qty += it.quantity;
        totals.set(it.productId, entry);
      }),
    );
    return [...totals.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);
  })();

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${store?.retailerName ?? "Retailer"}`}
        description={`${store?.name} · ${store?.city}, ${store?.state}`}
        actions={
          <>
            <Link to="/retailer/products/new">
              <Button>Add product</Button>
            </Link>
            <Link to="/retailer/orders">
              <Button variant="outline">Manage orders</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total products"
          value={summary.data?.totalProducts ?? "—"}
          hint="Listed in your store"
          tone="primary"
          icon={<Package className="size-5" />}
        />
        <StatCard
          label="Today's orders"
          value={summary.data?.todaysOrders ?? "—"}
          hint="Placed since midnight"
          tone="primary"
          icon={<ShoppingBag className="size-5" />}
        />
        <StatCard
          label="Today's sales"
          value={summary.data ? formatCurrency(summary.data.todaysSales) : "—"}
          hint="Excluding cancelled orders"
          tone="success"
          icon={<IndianRupee className="size-5" />}
        />
        <StatCard
          label="Low stock products"
          value={summary.data?.lowStockProducts ?? "—"}
          hint="At or below minimum level"
          tone="warning"
          icon={<AlertTriangle className="size-5" />}
        />
        <StatCard
          label="Pending orders"
          value={summary.data?.pendingOrders ?? "—"}
          hint="Awaiting action"
          tone="warning"
          icon={<Clock3 className="size-5" />}
        />
        <StatCard
          label="Completed orders"
          value={summary.data?.completedOrders ?? "—"}
          hint="Delivered all-time"
          tone="success"
          icon={<CheckCircle2 className="size-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sales overview</h2>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
            <Link to="/retailer/sales" className="text-sm font-medium text-primary hover:underline">
              Full analytics
            </Link>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales.data?.series ?? []}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={60} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-background)",
                  }}
                  formatter={(value: number, key) =>
                    key === "sales" ? [formatCurrency(value), "Sales"] : [value, "Orders"]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#salesFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-foreground">Top selling products</h2>
          <p className="mb-4 text-sm text-muted-foreground">By units sold</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-background)",
                  }}
                />
                <Bar dataKey="qty" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent orders</h2>
            <Link to="/retailer/orders" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {orders.loading ? (
            <LoadingRows />
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to="/retailer/orders/$orderId"
                  params={{ orderId: order.id }}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">#{order.id}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.customerName} · {formatDate(order.placedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Stock alerts</h2>
            <Link to="/retailer/inventory" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Manage inventory <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {products.loading ? (
            <LoadingRows />
          ) : lowStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Every product is well stocked.</p>
          ) : (
            <div className="divide-y divide-border">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <span
                    className={
                      p.stock <= 0
                        ? "rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive"
                        : "rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600"
                    }
                  >
                    {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
