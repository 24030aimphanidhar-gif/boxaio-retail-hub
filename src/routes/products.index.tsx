import { createFileRoute } from "@tanstack/react-router";

import { Products } from "@/pages/Products";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Shop Groceries Online | BOXAIO" },
      { name: "description", content: "Browse fresh groceries, staples and daily essentials with fast local delivery from BOXAIO." },
      { property: "og:title", content: "Shop Groceries Online | BOXAIO" },
      { property: "og:description", content: "Browse fresh groceries, staples and daily essentials with fast local delivery from BOXAIO." },
    ],
  }),
  component: Products,
});
