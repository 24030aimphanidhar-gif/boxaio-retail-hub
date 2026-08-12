import { createFileRoute } from "@tanstack/react-router";

import { Orders } from "@/pages/Orders";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My Orders | BOXAIO" },
      { name: "description", content: "Track and reorder your past BOXAIO grocery orders." },
      { property: "og:title", content: "My Orders | BOXAIO" },
      { property: "og:description", content: "Track and reorder your past BOXAIO grocery orders." },
    ],
  }),
  component: Orders,
});
