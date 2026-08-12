import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PageHeader } from "@/retailer/components/ui-bits";
import { saveStore } from "@/retailer/data/service";
import { useRetailerSession } from "@/retailer/hooks";
import type { Store } from "@/retailer/types";

export const Route = createFileRoute("/retailer/location")({
  component: LocationSettings,
});

function LocationSettings() {
  const { store, storeId, refreshStore } = useRetailerSession();
  const [form, setForm] = useState<Store | null>(store);
  useEffect(() => setForm(store), [store]);
  if (!form) return null;

  const set = <K extends keyof Store>(key: K, value: Store[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  return (
    <div>
      <PageHeader
        title="Location & delivery"
        description="Your address decides which customers can order from this store."
      />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await saveStore(storeId, form);
          refreshStore();
          toast.success("Location updated");
        }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Address</h2>
          <Field label="Address line"><Input value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="State"><Input value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
            <Field label="Pincode"><Input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} /></Field>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Delivery area</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitude">
              <Input type="number" step="0.0001" value={form.latitude} onChange={(e) => set("latitude", Number(e.target.value))} />
            </Field>
            <Field label="Longitude">
              <Input type="number" step="0.0001" value={form.longitude} onChange={(e) => set("longitude", Number(e.target.value))} />
            </Field>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Delivery radius — {form.deliveryRadiusKm} km</Label>
            <Slider
              value={[form.deliveryRadiusKm]}
              min={1}
              max={30}
              step={1}
              onValueChange={([v]) => set("deliveryRadiusKm", v ?? 1)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Customers who pick {form.city} in the storefront location selector will see this store's products.
          </p>
        </Card>

        <Button type="submit" className="lg:col-span-2 lg:w-48">Save location</Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
