import { createFileRoute } from "@tanstack/react-router";

import { AddressesPage } from "@/pages/AddressesPage";

export const Route = createFileRoute("/addresses")({
  head: () => ({
    meta: [
      { title: "My Addresses | BOXAIO" },
      { name: "description", content: "Manage saved delivery addresses for faster BOXAIO checkout." },
      { property: "og:title", content: "My Addresses | BOXAIO" },
      { property: "og:description", content: "Manage saved delivery addresses for faster BOXAIO checkout." },
    ],
  }),
  component: AddressesPage,
});
