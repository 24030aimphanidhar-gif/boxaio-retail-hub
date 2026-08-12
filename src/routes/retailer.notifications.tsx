import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingRows, PageHeader, Pill } from "@/retailer/components/ui-bits";
import { fetchNotifications, markNotificationsRead } from "@/retailer/data/service";
import { formatDate, useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/notifications")({
  component: Notifications,
});

function Notifications() {
  const { storeId } = useRetailerSession();
  const { data, loading, reload } = useAsync(() => fetchNotifications(storeId), [storeId]);
  const rows = data ?? [];

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Order, stock and campaign alerts for your store."
        actions={
          <Button
            variant="outline"
            onClick={async () => {
              await markNotificationsRead(storeId);
              reload();
            }}
          >
            Mark all as read
          </Button>
        }
      />
      {loading ? (
        <LoadingRows rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState title="You are all caught up" />
      ) : (
        <div className="space-y-3">
          {rows.map((n) => (
            <Card key={n.id} className={n.read ? "p-4" : "border-primary/40 bg-primary/5 p-4"}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{n.title}</p>
                <Pill tone={n.type.includes("stock") ? "warning" : n.type === "new_order" ? "info" : "muted"}>
                  {n.type.replace(/_/g, " ")}
                </Pill>
                {!n.read ? <Pill tone="danger">new</Pill> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
