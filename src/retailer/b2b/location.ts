import {appStorage} from '@/api/storage';
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  DEFAULT_RETAILER_LOCATION,
  readRetailerLocation,
  saveRetailerLocation,
  distributorsWithDistance,
} from "./distributors";
import type { LatLng } from "./types";
export const LOCATION_PRESETS = [
  { label: "Vijayawada · Governorpet", lat: 16.5115, lng: 80.6362 },
  { label: "Vijayawada · Benz Circle", lat: 16.4995, lng: 80.6636 },
  { label: "Vijayawada · Poranki", lat: 16.4677, lng: 80.7141 },
  { label: "Hyderabad · Jubilee Hills", lat: 17.4326, lng: 78.4071 },
];
export function validCoordinates(loc: LatLng) {
  return (
    Number.isFinite(loc.lat) &&
    Math.abs(loc.lat) <= 90 &&
    Number.isFinite(loc.lng) &&
    Math.abs(loc.lng) <= 180
  );
}
export function useBusinessLocation() {
  const { user } = useAuth();
  const email = user?.email || "";
  const [location, setLocation] = useState<LatLng>(DEFAULT_RETAILER_LOCATION);
  const [label, setLabel] = useState("Demo location · Vijayawada");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    function read() {
      const loc = readRetailerLocation(email);
      setLocation(loc && validCoordinates(loc) ? loc : DEFAULT_RETAILER_LOCATION);
      setLabel(
        appStorage.getItem("boxaio_location_label_" + email) ||
          (loc ? "Saved coordinates" : "Demo location · Vijayawada")
      );
    }
    read();
    window.addEventListener("boxaio-location", read);
    return () => window.removeEventListener("boxaio-location", read);
  }, [email]);
  function save(loc: LatLng, name: string) {
    if (!validCoordinates(loc)) {
      setError("Latitude must be −90 to 90 and longitude −180 to 180.");
      return false;
    }
    saveRetailerLocation(email, loc);
    appStorage.setItem("boxaio_location_label_" + email, name);
    setLocation(loc);
    setLabel(name);
    setError("");
    window.dispatchEvent(new Event("boxaio-location"));
    return true;
  }
  function locate() {
    if (!navigator.geolocation) {
      setError("Location is unavailable in this browser. Choose a demo area or enter coordinates.");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const nearest = distributorsWithDistance(loc)[0];
        save(
          loc,
          nearest && nearest.distanceKm < 5
            ? "Device location · near " + nearest.area
            : "Device location"
        );
        setLoading(false);
      },
      (failure) => {
        setLoading(false);
        setError(
          failure.code === 1
            ? "Location permission was denied. Allow location in your browser or choose an area below."
            : failure.code === 3
              ? "Location request timed out. Try again or choose an area."
              : "Could not determine your location. Enter coordinates or use a demo area."
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }
  return { location, label, loading, error, save, locate };
}
