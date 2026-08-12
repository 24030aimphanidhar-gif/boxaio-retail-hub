import { createFileRoute } from "@tanstack/react-router";

import { PrivacyPolicy } from "@/pages/PrivacyPolicy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | BOXAIO" },
      { name: "description", content: "How BOXAIO collects, uses and protects your personal data." },
      { property: "og:title", content: "Privacy Policy | BOXAIO" },
      { property: "og:description", content: "How BOXAIO collects, uses and protects your personal data." },
    ],
  }),
  component: PrivacyPolicy,
});
