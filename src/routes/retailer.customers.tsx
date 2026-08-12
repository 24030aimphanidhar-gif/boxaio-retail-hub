import { createFileRoute } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";
import { LoadingRows, PageHeader, Pill } from "@/retailer/components/ui-bits";
import { fetchCustomers } from "@/retailer/data/service";
import { formatCurrency, formatDate, useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/customers")({
  component: Customers,
});

function Customers() {
  const { storeId } = useRetailerSession();
  const { data, loading } = useAsync(() => fetchCustomers(storeId), [storeId]);
  const rows = (data ?? []).slice().sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <div>
      <PageHeader
        title="Customers"
        description="People who ordered from your store. Contact details are masked for privacy."
      />
      {loading ? (
        <LoadingRows rows={6} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total spend</th>
                <th className="px-4 py-3">Last order</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.maskedPhone}</p>
                  </td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(c.totalSpend)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.lastOrderAt)}</td>
                  <td className="px-4 py-3">
                    <Pill tone={c.status === "active" ? "success" : "muted"}>{c.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
