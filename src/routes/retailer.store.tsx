import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/retailer/components/ui-bits";
import { saveStore } from "@/retailer/data/service";
import { useRetailerSession } from "@/retailer/hooks";
import type { Store, StoreStatus } from "@/retailer/types";

export const Route = createFileRoute("/retailer/store")({
  component: StoreProfile,
});

function StoreProfile() {
  const { store, storeId, refreshStore } = useRetailerSession();
  const [form, setForm] = useState<Store | null>(store);

  useEffect(() => setForm(store), [store]);
  if (!form) return null;

  const set = <K extends keyof Store>(key: K, value: Store[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStore(storeId, form);
    refreshStore();
    toast.success("Store profile saved");
  };

  return (
    <div>
      <PageHeader title="Store profile" description="Details customers see on your BOXAIO store page." />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Business details</h2>
          <Field label="Store name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Owner name"><Input value={form.retailerName} onChange={(e) => set("retailerName", e.target.value)} /></Field>
          <Field label="GST number"><Input value={form.gstNumber} onChange={(e) => set("gstNumber", e.target.value)} /></Field>
          <Field label="Store status">
            <Select value={form.status} onValueChange={(v) => set("status", v as StoreStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="TEMPORARILY_UNAVAILABLE">Temporarily unavailable</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Contact</h2>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Logo URL"><Input value={form.logoUrl ?? ""} onChange={(e) => set("logoUrl", e.target.value)} /></Field>
          <Field label="Banner URL"><Input value={form.bannerUrl ?? ""} onChange={(e) => set("bannerUrl", e.target.value)} /></Field>
        </Card>

        <Button type="submit" className="lg:col-span-2 lg:w-48">Save profile</Button>
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
