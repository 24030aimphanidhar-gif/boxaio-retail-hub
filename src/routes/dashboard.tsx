import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/pages/Dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Account | BOXAIO" },
      { name: "description", content: "Manage your BOXAIO profile, addresses, orders and saved lists." },
      { property: "og:title", content: "My Account | BOXAIO" },
      { property: "og:description", content: "Manage your BOXAIO profile, addresses, orders and saved lists." },
    ],
  }),
  component: Dashboard,
});
