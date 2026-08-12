import { createFileRoute } from "@tanstack/react-router";

import { ShippingPolicy } from "@/pages/ShippingPolicy";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy | BOXAIO" },
      { name: "description", content: "Delivery charges, slots and coverage for BOXAIO grocery orders." },
      { property: "og:title", content: "Shipping Policy | BOXAIO" },
      { property: "og:description", content: "Delivery charges, slots and coverage for BOXAIO grocery orders." },
    ],
  }),
  component: ShippingPolicy,
});
