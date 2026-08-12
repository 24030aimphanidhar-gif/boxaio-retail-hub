import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import type { RetailerProduct } from "../types";

export type ProductFormValues = Omit<RetailerProduct, "id" | "storeId" | "updatedAt">;

const EMPTY: ProductFormValues = {
  name: "",
  description: "",
  category: "",
  subCategory: "",
  brand: "",
  imageUrl: "",
  sellingPrice: 0,
  mrp: 0,
  discountPercent: 0,
  gstPercent: 5,
  stock: 0,
  minStockLevel: 10,
  maxStockLevel: 200,
  unit: "1 kg",
  weight: "1 kg",
  sku: "",
  status: "active",
};

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<ProductFormValues>;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) return toast.error("Product name is required");
    if (values.sellingPrice <= 0) return toast.error("Selling price must be greater than zero");
    if (values.mrp < values.sellingPrice) return toast.error("MRP cannot be lower than the selling price");
    if (values.stock < 0) return toast.error("Stock cannot be negative");
    setSaving(true);
    try {
      await onSubmit({
        ...values,
        discountPercent: Math.max(0, Math.round(((values.mrp - values.sellingPrice) / values.mrp) * 100)),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Basic details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name">
              <Input value={values.name} onChange={(e) => set("name", e.target.value)} required />
            </Field>
            <Field label="Brand">
              <Input value={values.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field label="Category">
              <Input value={values.category} onChange={(e) => set("category", e.target.value)} />
            </Field>
            <Field label="Sub category">
              <Input value={values.subCategory} onChange={(e) => set("subCategory", e.target.value)} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={4} value={values.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Image URL">
            <Input value={values.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
          </Field>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Selling price (₹)">
              <Input type="number" min={0} value={values.sellingPrice} onChange={(e) => set("sellingPrice", Number(e.target.value))} />
            </Field>
            <Field label="MRP (₹)">
              <Input type="number" min={0} value={values.mrp} onChange={(e) => set("mrp", Number(e.target.value))} />
            </Field>
            <Field label="GST (%)">
              <Input type="number" min={0} max={28} value={values.gstPercent} onChange={(e) => set("gstPercent", Number(e.target.value))} />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Inventory</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Stock quantity">
              <Input type="number" min={0} value={values.stock} onChange={(e) => set("stock", Number(e.target.value))} />
            </Field>
            <Field label="Minimum stock level">
              <Input type="number" min={0} value={values.minStockLevel} onChange={(e) => set("minStockLevel", Number(e.target.value))} />
            </Field>
            <Field label="Maximum stock level">
              <Input type="number" min={0} value={values.maxStockLevel} onChange={(e) => set("maxStockLevel", Number(e.target.value))} />
            </Field>
            <Field label="Unit">
              <Input value={values.unit} onChange={(e) => set("unit", e.target.value)} />
            </Field>
            <Field label="Weight / size">
              <Input value={values.weight} onChange={(e) => set("weight", e.target.value)} />
            </Field>
            <Field label="SKU">
              <Input value={values.sku} onChange={(e) => set("sku", e.target.value)} />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Visibility</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Active on storefront</p>
              <p className="text-xs text-muted-foreground">Inactive products are hidden from customers.</p>
            </div>
            <Switch
              checked={values.status === "active"}
              onCheckedChange={(checked) => set("status", checked ? "active" : "inactive")}
            />
          </div>
        </Card>

        {values.imageUrl ? (
          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Preview</h2>
            <img src={values.imageUrl} alt={values.name} className="h-40 w-full rounded-lg object-cover" />
            <p className="mt-3 text-sm font-semibold">{values.name || "Product name"}</p>
            <p className="text-xs text-muted-foreground">₹{values.sellingPrice} · {values.unit}</p>
          </Card>
        ) : null}

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
