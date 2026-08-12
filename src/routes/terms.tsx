import { createFileRoute } from "@tanstack/react-router";

import { TermsOfService } from "@/pages/TermsOfService";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | BOXAIO" },
      { name: "description", content: "The terms that govern your use of the BOXAIO grocery platform." },
      { property: "og:title", content: "Terms of Service | BOXAIO" },
      { property: "og:description", content: "The terms that govern your use of the BOXAIO grocery platform." },
    ],
  }),
  component: TermsOfService,
});
