import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, LoadingRows, PageHeader, Pill } from "@/retailer/components/ui-bits";
import { deleteOffer, fetchOffers, saveOffer } from "@/retailer/data/service";
import { useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/offers")({
  component: Offers,
});

function Offers() {
  const { storeId } = useRetailerSession();
  const { data, loading, reload } = useAsync(() => fetchOffers(storeId), [storeId]);
  const [name, setName] = useState("");
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(299);

  const create = async () => {
    if (!name.trim()) return toast.error("Give your offer a name");
    await saveOffer(storeId, { name, type: "percentage", discountValue: value, minOrderValue: minOrder, status: "active" });
    toast.success("Offer created");
    setName("");
    reload();
  };

  const tone = (status: string) =>
    status === "active" ? "success" : status === "scheduled" ? "info" : status === "expired" ? "muted" : "warning";

  return (
    <div>
      <PageHeader title="Offers & discounts" description="Run promotions on your own products." />

      <Card className="mb-6 grid gap-4 p-5 sm:grid-cols-4 sm:items-end">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Offer name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Weekend fresh deal" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Discount %</Label>
          <Input type="number" min={1} max={90} value={value} onChange={(e) => setValue(Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Min order ₹</Label>
          <Input type="number" min={0} value={minOrder} onChange={(e) => setMinOrder(Number(e.target.value))} />
        </div>
        <Button className="sm:col-span-4 sm:w-40" onClick={create}>Create offer</Button>
      </Card>

      {loading ? (
        <LoadingRows rows={4} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No offers yet" description="Create your first promotion above." />
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((offer) => (
            <Card key={offer.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{offer.name}</p>
                  <Pill tone={tone(offer.status) as never}>{offer.status}</Pill>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {offer.type === "percentage" ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`} · min order ₹
                  {offer.minOrderValue} · used {offer.used}/{offer.usageLimit}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await saveOffer(storeId, { id: offer.id, status: offer.status === "active" ? "disabled" : "active" });
                    reload();
                  }}
                >
                  {offer.status === "active" ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await deleteOffer(storeId, offer.id);
                    toast.success("Offer removed");
                    reload();
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
