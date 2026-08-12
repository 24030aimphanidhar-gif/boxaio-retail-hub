import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/retailer/components/ui-bits";
import { saveStore } from "@/retailer/data/service";
import { useRetailerSession } from "@/retailer/hooks";
import type { StoreHoursDay } from "@/retailer/types";

export const Route = createFileRoute("/retailer/hours")({
  component: BusinessHours,
});

function BusinessHours() {
  const { store, storeId, refreshStore } = useRetailerSession();
  const [hours, setHours] = useState<StoreHoursDay[]>(store?.hours ?? []);
  useEffect(() => setHours(store?.hours ?? []), [store]);

  const update = (day: string, patch: Partial<StoreHoursDay>) =>
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, ...patch } : h)));

  return (
    <div>
      <PageHeader
        title="Business hours"
        description="Customers can only place orders while your store is open."
        actions={
          <Button
            onClick={async () => {
              await saveStore(storeId, { hours });
              refreshStore();
              toast.success("Business hours saved");
            }}
          >
            Save hours
          </Button>
        }
      />
      <Card className="divide-y divide-border">
        {hours.map((h) => (
          <div key={h.day} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="w-32 font-medium text-foreground">{h.day}</p>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={!h.closed} onCheckedChange={(v) => update(h.day, { closed: !v })} />
                {h.closed ? "Closed" : "Open"}
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={h.open24h} disabled={h.closed} onCheckedChange={(v) => update(h.day, { open24h: v })} />
                24 hours
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  className="w-32"
                  value={h.opensAt}
                  disabled={h.closed || h.open24h}
                  onChange={(e) => update(h.day, { opensAt: e.target.value })}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="time"
                  className="w-32"
                  value={h.closesAt}
                  disabled={h.closed || h.open24h}
                  onChange={(e) => update(h.day, { closesAt: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
