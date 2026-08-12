import { createFileRoute } from "@tanstack/react-router";

import { ReturnsRefunds } from "@/pages/ReturnsRefunds";

export const Route = createFileRoute("/returns-refunds")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds | BOXAIO" },
      { name: "description", content: "How returns, replacements and refunds work on BOXAIO." },
      { property: "og:title", content: "Returns & Refunds | BOXAIO" },
      { property: "og:description", content: "How returns, replacements and refunds work on BOXAIO." },
    ],
  }),
  component: ReturnsRefunds,
});
