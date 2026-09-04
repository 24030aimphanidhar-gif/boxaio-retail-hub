import { Link } from "@tanstack/react-router";
import { ChevronRight, Store } from "lucide-react";

import {
  B2B_BRANDS,
  B2B_CATEGORIES,
  DISTRIBUTORS,
  categoryImage,
  countByBrand,
  countByCategory,
  productsByDistributor,
} from "@/retailer/b2b/service";

/**
 * Shared section chrome for the retailer storefront browse rails so Category,
 * Brand and Distributor look like one family (same heading, "View all →",
 * horizontal scroll, spacing and radius).
 */
function Rail({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
          <h2 className="text-lg font-bold text-foreground sm:text-xl">{title}</h2>
        </div>
        <Link
          to="/retailer/shop"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View all <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}

export function ShopByCategoryRail() {
  return (
    <Rail eyebrow="Browse" title="Shop by Category">
      {B2B_CATEGORIES.map((cat) => (
        <Link
          key={cat}
          to="/retailer/shop"
          search={{ category: cat }}
          className="group flex w-24 shrink-0 flex-col items-center gap-2 text-center sm:w-28"
        >
          <div className="size-24 overflow-hidden rounded-2xl bg-muted ring-1 ring-border transition-all group-hover:ring-2 group-hover:ring-primary sm:size-28">
            <img
              src={categoryImage(cat)}
              alt={cat}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div>
            <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-foreground group-hover:text-primary">
              {cat}
            </p>
            <p className="text-[11px] text-muted-foreground">{countByCategory(cat)} items</p>
          </div>
        </Link>
      ))}
    </Rail>
  );
}

export function ShopByBrandRail() {
  return (
    <Rail eyebrow="Trusted names" title="Shop by Brand">
      {B2B_BRANDS.map((brand) => (
        <Link
          key={brand}
          to="/retailer/shop"
          search={{ brand }}
          className="flex w-40 shrink-0 items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-black text-primary">
            {brand.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-foreground">{brand}</p>
            <p className="text-[11px] text-muted-foreground">{countByBrand(brand)} products</p>
          </div>
        </Link>
      ))}
    </Rail>
  );
}

export function ShopByDistributorRail() {
  return (
    <Rail eyebrow="Suppliers" title="Shop by Distributor">
      {DISTRIBUTORS.map((d) => (
        <Link
          key={d.id}
          to="/retailer/distributors/$distributorId/catalogue"
          params={{ distributorId: d.id }}
          search={{ from: "browse" as const }}
          className="flex w-40 shrink-0 items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-foreground">{d.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {productsByDistributor(d.id).length} products
            </p>
          </div>
        </Link>
      ))}
    </Rail>
  );
}
