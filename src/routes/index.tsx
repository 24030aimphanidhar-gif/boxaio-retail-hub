import { createFileRoute, redirect } from "@tanstack/react-router";

// The retailer (B2B) storefront is the default landing area: "/" opens it first.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BOXAIO | Wholesale Grocery Shopping" },
      { name: "description", content: "Discover the BOXAIO wholesale grocery marketplace." },
      { property: "og:title", content: "BOXAIO | Wholesale Grocery Shopping" },
      { property: "og:description", content: "Discover the BOXAIO wholesale grocery marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/retailer" });
  },
});
