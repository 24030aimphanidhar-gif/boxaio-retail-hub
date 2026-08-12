import { createFileRoute } from "@tanstack/react-router";

import { EditProfilePage } from "@/pages/EditProfilePage";

export const Route = createFileRoute("/edit-profile")({
  head: () => ({
    meta: [
      { title: "Edit Profile | BOXAIO" },
      { name: "description", content: "Update your BOXAIO account details and preferences." },
      { property: "og:title", content: "Edit Profile | BOXAIO" },
      { property: "og:description", content: "Update your BOXAIO account details and preferences." },
    ],
  }),
  component: EditProfilePage,
});
