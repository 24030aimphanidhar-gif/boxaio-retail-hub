import { createFileRoute } from "@tanstack/react-router";

import { OrderTracking } from "@/pages/OrderTracking";

export const Route = createFileRoute("/orders/$id/tracking")({
  head: () => ({
    meta: [
      { title: "Order Tracking | BOXAIO" },
      { name: "description", content: "Live tracking for your BOXAIO grocery delivery." },
      { property: "og:title", content: "Order Tracking | BOXAIO" },
      { property: "og:description", content: "Live tracking for your BOXAIO grocery delivery." },
    ],
  }),
  component: OrderTracking,
});
