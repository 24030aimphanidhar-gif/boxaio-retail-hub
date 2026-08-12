import { createFileRoute } from "@tanstack/react-router";

import { Cart } from "@/pages/Cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | BOXAIO" },
      { name: "description", content: "Review the groceries in your BOXAIO cart before checkout." },
      { property: "og:title", content: "Your Cart | BOXAIO" },
      { property: "og:description", content: "Review the groceries in your BOXAIO cart before checkout." },
    ],
  }),
  component: Cart,
});
