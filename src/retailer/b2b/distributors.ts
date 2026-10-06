import {appStorage} from '@/api/storage';
/**
 * Centralised distributor registry + geo helpers for the B2B storefront.
 *
 * Distributors are DATA, never per-distributor frontend code — adding 10 or
 * 1,000 suppliers here requires no UI changes. Re-exported from
 * `@/retailer/b2b/service` so existing imports keep working.
 */
import type { Distributor, LatLng } from "./types";

/** Vijayawada city centre — the demo retailer neighbourhood. */
export const DEFAULT_RETAILER_LOCATION: LatLng = { lat: 16.5062, lng: 80.648 };

export {DISTRIBUTORS} from '../../../../backend/src/domain/catalogue';
import {DISTRIBUTORS} from '../../../../backend/src/domain/catalogue';
export function getDistributor(id: string): Distributor | null {
  return DISTRIBUTORS.find((x) => x.id === id) ?? null;
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Default discovery radius (km). Configurable per call in the future. */
export const NEARBY_RADIUS_KM = 5;

export interface DistributorWithDistance extends Distributor {
  distanceKm: number;
}

export function distributorsWithDistance(from: LatLng): DistributorWithDistance[] {
  return DISTRIBUTORS.map((x) => ({
    ...x,
    distanceKm: distanceKm(from, { lat: x.latitude, lng: x.longitude }),
  })).sort((a, b) => a.distanceKm - b.distanceKm);
}

export function nearbyDistributors(from: LatLng, radiusKm = NEARBY_RADIUS_KM) {
  return distributorsWithDistance(from).filter(
    (x) => x.status === "active" && x.distanceKm <= radiusKm
  );
}

/** Distributors whose catalogue this retailer may open right now. */
export function canViewCatalogue(dist: Distributor) {
  return dist.status === "active" && dist.catalogueVisibility !== "restricted";
}

/* ------------------------------------------------- retailer store location */

const LOCATION_KEY = "boxaio_retailer_location_v1";

export function readRetailerLocation(email: string): LatLng | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = appStorage.getItem(`${LOCATION_KEY}_${email}`);
    return raw ? (JSON.parse(raw) as LatLng) : null;
  } catch {
    return null;
  }
}

export function saveRetailerLocation(email: string, loc: LatLng) {
  if (typeof window === "undefined") return;
  appStorage.setItem(`${LOCATION_KEY}_${email}`, JSON.stringify(loc));
}
