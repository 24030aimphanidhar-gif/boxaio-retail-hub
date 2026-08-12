import { createFileRoute } from "@tanstack/react-router";

import { Checkout } from "@/pages/Checkout";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | BOXAIO" },
      { name: "description", content: "Choose delivery slot, address and payment to place your BOXAIO grocery order." },
      { property: "og:title", content: "Checkout | BOXAIO" },
      { property: "og:description", content: "Choose delivery slot, address and payment to place your BOXAIO grocery order." },
    ],
  }),
  component: Checkout,
});
