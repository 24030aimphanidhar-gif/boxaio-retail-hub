import { createFileRoute } from "@tanstack/react-router";

import { Wishlist } from "@/pages/Wishlist";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist | BOXAIO" },
      { name: "description", content: "Groceries you saved for later on BOXAIO." },
      { property: "og:title", content: "Wishlist | BOXAIO" },
      { property: "og:description", content: "Groceries you saved for later on BOXAIO." },
    ],
  }),
  component: Wishlist,
});
