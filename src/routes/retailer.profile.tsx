import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRetailerSession } from "@/retailer/hooks";

export const Route = createFileRoute("/retailer/profile")({
  head: () => ({
    meta: [
      { title: "Business Profile | BOXAIO Business" },
      { name: "description", content: "Your BOXAIO business account and store details." },
      { property: "og:title", content: "Business Profile | BOXAIO Business" },
      { property: "og:description", content: "Manage your BOXAIO retailer account details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RetailerProfile,
});

function RetailerProfile() {
  const { store, user } = useRetailerSession();
  const { logout } = useAuth();

  const rows: [string, string][] = [
    ["Business name", store?.name ?? "—"],
    ["Contact person", store?.retailerName ?? user?.profile.name ?? "—"],
    ["Email", user?.email ?? "—"],
    ["Phone", store?.phone ?? "—"],
    ["GST number", store?.gstNumber ?? "—"],
    ["Address", store ? `${store.addressLine}, ${store.city}, ${store.state} ${store.pincode}` : "—"],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Business Profile</h1>
      <Card className="mt-6 divide-y divide-border p-0">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center">
            <span className="w-44 shrink-0 text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
          </div>
        ))}
      </Card>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/retailer/store">
          <Button variant="outline">Edit store details</Button>
        </Link>
        <Link to="/retailer/dashboard">
          <Button variant="outline">My Store dashboard</Button>
        </Link>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
