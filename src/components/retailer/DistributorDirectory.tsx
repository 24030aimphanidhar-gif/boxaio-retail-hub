import {appStorage} from '@/api/storage';
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Store, Lock } from "lucide-react";
import { canViewCatalogue, productsByDistributor } from "@/retailer/b2b/service";
import type { DistributorWithDistance } from "@/retailer/b2b/distributors";
import { useAuth } from "@/context/AuthContext";
export function DistributorCard({
  distributor: d,
  from,
  showDistance = true,
}: {
  distributor: DistributorWithDistance;
  from: "nearby" | "other" | "browse";
  showDistance?: boolean;
}) {
  const { user } = useAuth();
  const key = "boxaio_access_" + user?.email + "_" + d.id;
  const [requested, setRequested] = useState(() => appStorage.getItem(key) === "requested");
  const allowed = canViewCatalogue(d);
  const count = productsByDistributor(d.id).length;
  return (
    <article className="distributor-card">
      <div className="distributor-avatar">
        <Store size={24} />
        <span>{d.status === "active" ? "Active supplier" : "Offline"}</span>
      </div>
      <h3>{d.businessName}</h3>
      <p>
        <MapPin size={13} />
        {d.area}
        {showDistance ? " · " + d.distanceKm.toFixed(1) + " km" : ""}
      </p>
      <div className="distributor-facts">
        <span>
          <strong>{count}</strong> products
        </span>
        <span>
          <strong>{d.serviceRadius} km</strong> service radius
        </span>
      </div>
      <p className="distributor-coverage">
        {d.distanceKm <= d.serviceRadius
          ? "Within local delivery area"
          : "Outside local delivery area · demo shipping available"}
      </p>
      {allowed ? (
        <Link
          className="outline-button"
          to="/retailer/distributors/$distributorId/catalogue"
          params={{ distributorId: d.id }}
          search={{ from }}
        >
          View catalogue <ArrowUpRight size={15} />
        </Link>
      ) : (
        <>
          <p className="restricted-note">
            <Lock size={12} />{" "}
            {d.status === "inactive"
              ? "Supplier is currently offline."
              : "This catalogue requires approval."}
          </p>
          <button
            disabled={requested || d.status === "inactive"}
            className="outline-button"
            onClick={() => {
              appStorage.setItem(key, "requested");
              setRequested(true);
            }}
          >
            {requested ? "Demo access request saved" : "Save demo access request"}
          </button>
        </>
      )}
    </article>
  );
}
export function DistributorGrid({
  distributors,
  from,
  showDistance = true,
  empty,
}: {
  distributors: DistributorWithDistance[];
  from: "nearby" | "other" | "browse";
  showDistance?: boolean;
  empty?: React.ReactNode;
}) {
  return distributors.length ? (
    <div className="distributor-grid">
      {distributors.map((d) => (
        <DistributorCard key={d.id} distributor={d} from={from} showDistance={showDistance} />
      ))}
    </div>
  ) : (
    <>
      {empty || (
        <div className="empty-state">
          <MapPin size={30} />
          <h2>No suppliers match</h2>
          <p>Try another area, a wider radius, or all distributors.</p>
        </div>
      )}
    </>
  );
}
