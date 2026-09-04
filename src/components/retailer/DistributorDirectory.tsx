import { Link } from "@tanstack/react-router";
import { Lock, MapPin, Store } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { canViewCatalogue, productsByDistributor } from "@/retailer/b2b/service";
import type { DistributorWithDistance } from "@/retailer/b2b/distributors";

/**
 * Shared distributor card used by "Nearby Distributors" and "Other Catalogues".
 * Purely data-driven, so any number of distributors renders without new code.
 */
export function DistributorCard({
  distributor,
  from,
  showDistance = true,
}: {
  distributor: DistributorWithDistance;
  /** Where the retailer came from — powers contextual back navigation. */
  from: "nearby" | "other" | "browse";
  showDistance?: boolean;
}) {
  const count = productsByDistributor(distributor.id).length;
  const allowed = canViewCatalogue(distributor);

  return (
    <Card className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{distributor.businessName}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3" /> {distributor.area}
            {showDistance ? ` · ${distributor.distanceKm.toFixed(1)} KM` : null}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{count} products</p>

      {allowed ? (
        <Link
          to="/retailer/distributors/$distributorId/catalogue"
          params={{ distributorId: distributor.id }}
          search={{ from }}
          className="mt-auto"
        >
          <Button size="sm" className="w-full">
            View Catalogue
          </Button>
        </Link>
      ) : (
        <div className="mt-auto space-y-2">
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Lock className="size-3" /> Catalogue access requires distributor approval.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => toast.success(`Access request sent to ${distributor.businessName}`)}
          >
            Request Access
          </Button>
        </div>
      )}
    </Card>
  );
}

export function DistributorGrid({
  distributors,
  from,
  showDistance = true,
  empty,
}: {
  distributors: DistributorWithDistance[];
  from: "nearby" | "other" | "browse";
  showDistance?: boolean;
  empty?: React.ReactNode;
}) {
  if (distributors.length === 0) return <>{empty}</>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {distributors.map((d) => (
        <DistributorCard key={d.id} distributor={d} from={from} showDistance={showDistance} />
      ))}
    </div>
  );
}
