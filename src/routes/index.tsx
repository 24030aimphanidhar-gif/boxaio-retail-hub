import { createFileRoute, redirect } from "@tanstack/react-router";

// The retailer (B2B) storefront is the default landing area: "/" opens it first.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/retailer" });
  },
});
