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

function d(
  id: string,
  name: string,
  area: string,
  lat: number,
  lng: number,
  catalogueVisibility: Distributor["catalogueVisibility"] = "retailer_only",
  status: Distributor["status"] = "active",
): Distributor {
  return {
    id,
    name,
    businessName: name,
    logo: "",
    area,
    address: `${area}, Vijayawada`,
    latitude: lat,
    longitude: lng,
    serviceRadius: 5,
    categories: [],
    status,
    catalogueVisibility,
  };
}

/** Single source of truth for every distributor on BOXAIO. */
export const DISTRIBUTORS: Distributor[] = [
  d("sai-trade", "SAI TRADE", "Governorpet", 16.5115, 80.6362, "public"),
  d("sgbl", "SGBL", "Benz Circle", 16.4995, 80.6636),
  d("ra-agro", "RA AGRO", "Patamata", 16.4884, 80.6721),
  d("suresh-sbl", "SURESH SBL", "Labbipet", 16.5041, 80.6528, "public"),
  d("kavya-groceries", "KAVYA GROCERIES", "Gandhi Nagar", 16.5152, 80.6218),
  d("pm-store", "PM STORE", "Bhavanipuram", 16.5232, 80.5895),
  d("naidus-store", "NAIDU'S STORE", "Auto Nagar", 16.4869, 80.6906),
  d("sri-lakshmi-traders", "SRI LAKSHMI TRADERS", "Kanuru", 16.4826, 80.6968),
  d("venkata-wholesale", "VENKATA WHOLESALE", "Poranki", 16.4677, 80.7141, "restricted"),
  d("annapurna-agencies", "ANNAPURNA AGENCIES", "Ramavarappadu", 16.5343, 80.7042),
  d("balaji-distributors", "BALAJI DISTRIBUTORS", "Moghalrajpuram", 16.5063, 80.6461, "public"),
  d("krishna-supplies", "KRISHNA SUPPLIES", "Vidyadharapuram", 16.4917, 80.6135),
  d("mahalaxmi-mart", "MAHALAXMI MART", "Payakapuram", 16.4964, 80.6002),
  d("gowtham-agencies", "GOWTHAM AGENCIES", "Machavaram", 16.5218, 80.6414),
  d("sri-sai-bulk", "SRI SAI BULK", "Ajit Singh Nagar", 16.5299, 80.6597, "restricted"),
  d("nandini-foods", "NANDINI FOODS", "Nunna", 16.5721, 80.7133),
  d("varsha-enterprises", "VARSHA ENTERPRISES", "Gunadala", 16.5171, 80.6604),
  d("skv-traders", "SKV TRADERS", "Kedareswarapet", 16.5011, 80.6291),
  d("teja-wholesale", "TEJA WHOLESALE", "Singh Nagar", 16.4859, 80.6259, "public"),
  d("srinivasa-agro", "SRINIVASA AGRO", "Enikepadu", 16.5406, 80.7311, "public", "inactive"),
];

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

/**
 * Active distributors near a location, nearest first. Guarantees at least
 * `minCount` results — when fewer than that fall inside the radius, the list
 * is padded with the closest active distributors beyond the radius so a
 * location never shows an empty catalogue.
 */
export function nearbyDistributors(from: LatLng, radiusKm = NEARBY_RADIUS_KM, minCount = 2) {
  const active = distributorsWithDistance(from).filter((x) => x.status === "active");
  const within = active.filter((x) => x.distanceKm <= radiusKm);
  return within.length >= minCount ? within : active.slice(0, minCount);
}

/** Selectable store locations — one per distributor area, derived from data. */
export function locationOptions(): { area: string; location: LatLng }[] {
  const seen = new Set<string>();
  const out: { area: string; location: LatLng }[] = [];
  for (const d of DISTRIBUTORS) {
    if (d.status !== "active" || seen.has(d.area)) continue;
    seen.add(d.area);
    out.push({ area: d.area, location: { lat: d.latitude, lng: d.longitude } });
  }
  out.push({ area: "Vijayawada City Centre", location: DEFAULT_RETAILER_LOCATION });
  return out.sort((a, b) => a.area.localeCompare(b.area));
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
    const raw = localStorage.getItem(`${LOCATION_KEY}_${email}`);
    return raw ? (JSON.parse(raw) as LatLng) : null;
  } catch {
    return null;
  }
}

export function saveRetailerLocation(email: string, loc: LatLng) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${LOCATION_KEY}_${email}`, JSON.stringify(loc));
}
