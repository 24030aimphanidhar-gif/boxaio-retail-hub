import { createFileRoute } from "@tanstack/react-router";

import { Categories } from "@/pages/Categories";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Grocery Categories | BOXAIO" },
      { name: "description", content: "Explore BOXAIO categories from fresh produce to household essentials." },
      { property: "og:title", content: "Grocery Categories | BOXAIO" },
      { property: "og:description", content: "Explore BOXAIO categories from fresh produce to household essentials." },
    ],
  }),
  component: Categories,
});
