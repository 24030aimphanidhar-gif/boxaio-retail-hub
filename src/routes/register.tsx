import { createFileRoute } from "@tanstack/react-router";

import { Register } from "@/pages/Register";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account | BOXAIO" },
      { name: "description", content: "Create a BOXAIO customer or retailer account." },
      { property: "og:title", content: "Create Account | BOXAIO" },
      { property: "og:description", content: "Create a BOXAIO customer or retailer account." },
    ],
  }),
  component: Register,
});
