import { createFileRoute } from "@tanstack/react-router";

import { Offers } from "@/pages/Offers";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Deals | BOXAIO" },
      { name: "description", content: "Save more with today's grocery offers and combo deals on BOXAIO." },
      { property: "og:title", content: "Offers & Deals | BOXAIO" },
      { property: "og:description", content: "Save more with today's grocery offers and combo deals on BOXAIO." },
    ],
  }),
  component: Offers,
});
