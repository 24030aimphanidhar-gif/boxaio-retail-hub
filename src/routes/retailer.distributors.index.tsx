import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Store } from "lucide-react";
import { BusinessLocation } from "@/components/retailer/BusinessLocation";
import { DistributorGrid } from "@/components/retailer/DistributorDirectory";
import { distributorsWithDistance } from "@/retailer/b2b/distributors";
import { useBusinessLocation } from "@/retailer/b2b/location";
export const Route = createFileRoute("/retailer/distributors/")({ component: Distributors });
function Distributors() {
  const { location } = useBusinessLocation();
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState("all");
  const [sort, setSort] = useState("distance");
  const [access, setAccess] = useState("all");
  const rows = distributorsWithDistance(location)
    .filter(
      (d) =>
        d.status === "active" &&
        (radius === "all" || d.distanceKm <= Number(radius)) &&
        (access === "all" || d.catalogueVisibility !== "restricted") &&
        `${d.name} ${d.area}`.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : a.distanceKm - b.distanceKm));
  return (
    <div className="wrap business-page">
      <div className="business-page-heading">
        <div>
          <span className="eyebrow">YOUR LOCAL SUPPLY NETWORK</span>
          <h1>Find your next great supplier.</h1>
          <p>Explore distributor catalogues, compare prices, and build a smarter bulk order.</p>
        </div>
        <Link className="outline-button" to="/retailer/catalogue" search={{ tab: "mine" }}>
          My catalogue
        </Link>
      </div>
      <BusinessLocation />
      <div className="business-toolbar">
        <label className="business-search">
          <Search size={16} />
          <input
            aria-label="Search distributors"
            placeholder="Search distributor or area"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Distributor radius"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        >
          <option value="all">All distances</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="25">Within 25 km</option>
        </select>
        <select
          aria-label="Catalogue access"
          value={access}
          onChange={(e) => setAccess(e.target.value)}
        >
          <option value="all">All access levels</option>
          <option value="open">Available catalogues</option>
        </select>
        <select
          aria-label="Sort distributors"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="distance">Nearest first</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
      <p className="business-count">
        {rows.length} distributors · Prices and availability are sample data
      </p>
      <DistributorGrid distributors={rows} from="browse" />
    </div>
  );
}
