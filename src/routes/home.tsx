import { createFileRoute } from "@tanstack/react-router";

import { Home } from "@/pages/Home";

// The customer storefront home stays available at /home (see also "/" -> /retailer).
export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "BOXAIO — Fresh Groceries Delivered From Stores Near You" },
      {
        name: "description",
        content:
          "Order fruits, vegetables, staples and daily essentials from BOXAIO partner stores with fast local delivery.",
      },
      { property: "og:title", content: "BOXAIO — Fresh Groceries Delivered" },
      {
        property: "og:description",
        content: "Order groceries and daily essentials from BOXAIO stores near you.",
      },
    ],
  }),
  component: Home,
});
