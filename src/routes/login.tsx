import { createFileRoute } from "@tanstack/react-router";

import { Login } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In | BOXAIO" },
      { name: "description", content: "Sign in to BOXAIO as a customer or retailer." },
      { property: "og:title", content: "Sign In | BOXAIO" },
      { property: "og:description", content: "Sign in to BOXAIO as a customer or retailer." },
    ],
  }),
  component: Login,
});
