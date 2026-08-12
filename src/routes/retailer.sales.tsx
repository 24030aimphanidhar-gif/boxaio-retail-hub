import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/card";
import { LoadingRows, PageHeader, StatCard } from "@/retailer/components/ui-bits";
import { fetchSales } from "@/retailer/data/service";
import { formatCurrency, useAsync, useRetailerSession } from "@/retailer/hooks";
import type { SalesRange } from "@/retailer/types";

export const Route = createFileRoute("/retailer/sales")({
  component: Sales,
});

const RANGES: { value: SalesRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
];

function Sales() {
  const { storeId } = useRetailerSession();
  const [range, setRange] = useState<SalesRange>("month");
  const { data, loading } = useAsync(() => fetchSales(storeId, range), [storeId, range]);

  return (
    <div>
      <PageHeader title="Sales & analytics" description="Understand how your store is performing." />

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={
              range === r.value
                ? "shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                : "shrink-0 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net sales" value={data ? formatCurrency(data.netSales) : "—"} tone="success" />
        <StatCard label="Gross sales" value={data ? formatCurrency(data.grossSales) : "—"} tone="primary" />
        <StatCard label="Orders" value={data?.orderCount ?? "—"} />
        <StatCard label="Average order value" value={data ? formatCurrency(data.averageOrderValue) : "—"} />
        <StatCard label="Discounts given" value={data ? formatCurrency(data.discounts) : "—"} tone="warning" />
        <StatCard label="GST collected" value={data ? formatCurrency(data.gst) : "—"} />
        <StatCard label="Delivery fees" value={data ? formatCurrency(data.delivery) : "—"} />
      </div>

      {loading ? (
        <div className="mt-6"><LoadingRows rows={4} /></div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-semibold">Revenue trend</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.series ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} width={64} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-semibold">Orders per period</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.series ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} width={40} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
