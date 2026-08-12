import { createFileRoute } from "@tanstack/react-router";

import { ProductDetails } from "@/pages/ProductDetails";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Product Details | BOXAIO" },
      { name: "description", content: "See prices, offers, nutrition and delivery details for this BOXAIO grocery product." },
      { property: "og:title", content: "Product Details | BOXAIO" },
      { property: "og:description", content: "See prices, offers, nutrition and delivery details for this BOXAIO grocery product." },
    ],
  }),
  component: ProductDetails,
});
