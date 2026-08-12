import { createFileRoute } from "@tanstack/react-router";

import { SaveListsPage } from "@/pages/SaveListsPage";

export const Route = createFileRoute("/saved-lists")({
  head: () => ({
    meta: [
      { title: "Saved Lists | BOXAIO" },
      { name: "description", content: "Build reusable grocery lists and reorder them in one tap." },
      { property: "og:title", content: "Saved Lists | BOXAIO" },
      { property: "og:description", content: "Build reusable grocery lists and reorder them in one tap." },
    ],
  }),
  component: SaveListsPage,
});
