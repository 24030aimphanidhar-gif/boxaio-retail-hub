import { createFileRoute } from "@tanstack/react-router";

import { ReorderPage } from "@/pages/ReorderPage";

export const Route = createFileRoute("/reorder")({
  head: () => ({
    meta: [
      { title: "Reorder | BOXAIO" },
      { name: "description", content: "Reorder your frequently bought groceries in seconds." },
      { property: "og:title", content: "Reorder | BOXAIO" },
      { property: "og:description", content: "Reorder your frequently bought groceries in seconds." },
    ],
  }),
  component: ReorderPage,
});
