import { createFileRoute } from "@tanstack/react-router";

import { Contact } from "@/pages/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | BOXAIO" },
      { name: "description", content: "Reach the BOXAIO support team for orders, delivery and store partnerships." },
      { property: "og:title", content: "Contact Us | BOXAIO" },
      { property: "og:description", content: "Reach the BOXAIO support team for orders, delivery and store partnerships." },
    ],
  }),
  component: Contact,
});
