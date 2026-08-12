import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState, LoadingRows, PageHeader, Pill } from "@/retailer/components/ui-bits";
import { fetchReviews, replyToReview } from "@/retailer/data/service";
import { formatDate, useAsync, useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/reviews")({
  component: Reviews,
});

function Reviews() {
  const { storeId } = useRetailerSession();
  const { data, loading, reload } = useAsync(() => fetchReviews(storeId), [storeId]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const rows = data ?? [];
  const average = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : "—";

  return (
    <div>
      <PageHeader title="Reviews & ratings" description={`Average rating ${average} across ${rows.length} reviews.`} />
      {loading ? (
        <LoadingRows rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState title="No reviews yet" />
      ) : (
        <div className="space-y-3">
          {rows.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                  {review.rating} <Star className="size-3.5 fill-current" />
                </span>
                <p className="font-medium text-foreground">{review.productName}</p>
                <Pill tone={review.status === "published" ? "success" : "warning"}>{review.status}</Pill>
                <span className="text-xs text-muted-foreground">
                  {review.customerName} · {formatDate(review.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              {review.reply ? (
                <p className="mt-3 rounded-lg bg-muted p-3 text-sm">
                  <span className="font-semibold">Your reply: </span>
                  {review.reply}
                </p>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Write a reply…"
                    value={drafts[review.id] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [review.id]: e.target.value }))}
                  />
                  <Button
                    onClick={async () => {
                      const text = (drafts[review.id] ?? "").trim();
                      if (!text) return toast.error("Reply cannot be empty");
                      await replyToReview(storeId, review.id, text);
                      toast.success("Reply posted");
                      reload();
                    }}
                  >
                    Reply
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
