import { createFileRoute } from "@tanstack/react-router";

import { ScheduleOrderPage } from "@/pages/ScheduleOrderPage";

export const Route = createFileRoute("/schedule-orders")({
  head: () => ({
    meta: [
      { title: "Scheduled Orders | BOXAIO" },
      { name: "description", content: "Schedule recurring grocery deliveries with BOXAIO." },
      { property: "og:title", content: "Scheduled Orders | BOXAIO" },
      { property: "og:description", content: "Schedule recurring grocery deliveries with BOXAIO." },
    ],
  }),
  component: ScheduleOrderPage,
});
