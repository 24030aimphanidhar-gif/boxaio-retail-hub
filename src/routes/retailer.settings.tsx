import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/retailer/components/ui-bits";
import { resetRetailerData } from "@/retailer/data/service";
import { useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/settings")({
  component: Settings,
});

function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { store } = useRetailerSession();
  const [name, setName] = useState(user?.profile.name ?? "");
  const [phone, setPhone] = useState(user?.profile.phone ?? "");
  const [alerts, setAlerts] = useState({ orders: true, stock: true, campaigns: false });

  return (
    <div>
      <PageHeader title="Settings" description="Your retailer account preferences." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Account</h2>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input value={user?.email ?? ""} readOnly />
          </div>
          <Button
            onClick={() => {
              updateUser({ profile: { name, phone } });
              toast.success("Account updated");
            }}
          >
            Save account
          </Button>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Alerts</h2>
          {(
            [
              ["orders", "New order alerts"],
              ["stock", "Low stock alerts"],
              ["campaigns", "BOXAIO campaign updates"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch
                checked={alerts[key]}
                onCheckedChange={(v) => setAlerts((prev) => ({ ...prev, [key]: v }))}
              />
            </div>
          ))}
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="text-lg font-semibold">Store</h2>
          <p className="text-sm text-muted-foreground">
            Signed in as retailer for <span className="font-medium text-foreground">{store?.name}</span>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetRetailerData();
                toast.success("Demo store data reset");
                window.location.reload();
              }}
            >
              Reset demo data
            </Button>
            <Button variant="ghost" onClick={logout}>
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
