import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, LoadingRows, PageHeader, Pill } from "@/retailer/components/ui-bits";
import { fetchProducts, updateProduct } from "@/retailer/data/service";
import { formatCurrency, useAsync, useRetailerSession } from "@/retailer/hooks";
import { stockStatus } from "@/retailer/types";

export const Route = createFileRoute("/retailer/products/")({
  component: RetailerProducts,
});

function RetailerProducts() {
  const { storeId } = useRetailerSession();
  const { data, loading, reload } = useAsync(() => fetchProducts(storeId), [storeId]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const categories = useMemo(
    () => [...new Set((data ?? []).map((p) => p.category))].sort(),
    [data],
  );

  const rows = useMemo(() => {
    return (data ?? []).filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (status === "active" && p.status !== "active") return false;
      if (status === "inactive" && p.status !== "inactive") return false;
      if (status === "low" && stockStatus(p) !== "low_stock") return false;
      if (status === "out" && stockStatus(p) !== "out_of_stock") return false;
      const q = query.trim().toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [data, query, category, status]);

  const toggleStatus = async (id: string, next: "active" | "inactive") => {
    await updateProduct(storeId, id, { status: next });
    toast.success(next === "active" ? "Product is now live" : "Product hidden from the storefront");
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="Everything your store lists on BOXAIO."
        actions={
          <Link to="/retailer/products/new">
            <Button>Add product</Button>
          </Link>
        }
      />

      <Card className="mb-4 flex flex-col gap-3 p-4 lg:flex-row">
        <Input
          placeholder="Search by name or SKU"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="lg:max-w-xs"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="lg:w-64"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="lg:w-56"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="low">Low stock</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {loading ? (
        <LoadingRows rows={8} />
      ) : rows.length === 0 ? (
        <EmptyState title="No products match" description="Adjust your filters or add a new product." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt={p.name} className="size-10 rounded-lg object-cover" loading="lazy" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{formatCurrency(p.sellingPrice)}</span>{" "}
                    <span className="text-xs text-muted-foreground line-through">{formatCurrency(p.mrp)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {stockStatus(p) === "out_of_stock" ? (
                      <Pill tone="danger">Out of stock</Pill>
                    ) : stockStatus(p) === "low_stock" ? (
                      <Pill tone="warning">{p.stock} left</Pill>
                    ) : (
                      <Pill tone="success">{p.stock} in stock</Pill>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={p.status === "active" ? "success" : "muted"}>{p.status}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to="/retailer/products/$productId" params={{ productId: p.id }}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStatus(p.id, p.status === "active" ? "inactive" : "active")}
                      >
                        {p.status === "active" ? "Hide" : "Publish"}
                      </Button>
                    </div>
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
