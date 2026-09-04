import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Search, Store } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DistributorProductRow } from "@/components/retailer/DistributorProductRow";
import {
  DEFAULT_RETAILER_LOCATION,
  canViewCatalogue,
  distanceKm,
  getDistributor,
  productsByDistributor,
  readRetailerLocation,
} from "@/retailer/b2b/service";
import { useRetailerSession } from "@/retailer/hooks";

type CatalogueSearch = { from?: "nearby" | "other" | "browse" };

export const Route = createFileRoute("/retailer/distributors/$distributorId/catalogue")({
  validateSearch: (search: Record<string, unknown>): CatalogueSearch =>
    search["from"] === "nearby" || search["from"] === "other" || search["from"] === "browse"
      ? { from: search["from"] }
      : {},
  head: () => ({
    meta: [
      { title: "Distributor Catalogue | BOXAIO Business" },
      {
        name: "description",
        content: "Browse a distributor's wholesale catalogue and add products to your bulk cart.",
      },
      { property: "og:title", content: "Distributor Catalogue | BOXAIO Business" },
      {
        property: "og:description",
        content: "Distributor-wise wholesale products with B2B price, MOQ, stock and offers.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DistributorCatalogue,
});

const BACK_LABEL: Record<string, string> = {
  nearby: "Back to Nearby Distributors",
  other: "Back to Other Catalogues",
  browse: "Back to Distributors",
};

function DistributorCatalogue() {
  const { distributorId } = Route.useParams();
  const { from } = Route.useSearch();
  const { user } = useRetailerSession();
  const distributor = getDistributor(distributorId);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [visible, setVisible] = useState(20);

  const products = useMemo(
    () => (distributor ? productsByDistributor(distributor.id) : []),
    [distributor],
  );

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );
  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (brand === "all" || p.brand === brand) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)),
    );
  }, [products, query, category, brand]);

  const backTo =
    from === "nearby" || from === "other" ? "/retailer/catalogue" : "/retailer/distributors";

  if (!distributor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">This distributor is no longer available.</p>
        <Link to="/retailer/distributors" className="mt-4 inline-block">
          <Button variant="outline">Back to Distributors</Button>
        </Link>
      </div>
    );
  }

  const location = readRetailerLocation(user?.email ?? "") ?? DEFAULT_RETAILER_LOCATION;
  const km = distanceKm(location, {
    lat: distributor.latitude,
    lng: distributor.longitude,
  });

  if (!canViewCatalogue(distributor)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">{distributor.businessName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Catalogue access requires distributor approval.
        </p>
        <Link to={backTo} className="mt-4 inline-block">
          <Button variant="outline">{BACK_LABEL[from ?? "browse"]}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> {BACK_LABEL[from ?? "browse"]}
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{distributor.businessName}</h1>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {distributor.area} · {km.toFixed(1)} KM ·{" "}
            {products.length} products
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="all">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{rows.length} products</p>

      <div className="mt-3 space-y-3">
        {rows.slice(0, visible).map((p) => (
          <DistributorProductRow key={p.id} product={p} preferredDistributorId={distributor.id} />
        ))}
        {rows.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No products match your search in this catalogue.
          </Card>
        ) : null}
      </div>

      {visible < rows.length ? (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + 20)}>
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
