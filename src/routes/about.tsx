import { createFileRoute } from "@tanstack/react-router";

import { About } from "@/pages/About";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BOXAIO" },
      { name: "description", content: "How BOXAIO connects neighbourhood stores with fast grocery delivery." },
      { property: "og:title", content: "About BOXAIO" },
      { property: "og:description", content: "How BOXAIO connects neighbourhood stores with fast grocery delivery." },
    ],
  }),
  component: About,
});
