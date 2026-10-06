import { useEffect, useState } from "react";
import { LocateFixed, MapPin, ChevronDown } from "lucide-react";
import { useBusinessLocation, LOCATION_PRESETS } from "@/retailer/b2b/location";
export function BusinessLocation() {
  const { location, label, loading, error, save, locate } = useBusinessLocation();
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState(String(location.lat));
  const [lng, setLng] = useState(String(location.lng));
  useEffect(() => {
    setLat(String(location.lat));
    setLng(String(location.lng));
  }, [location]);
  return (
    <section className="business-location">
      <div className="location-line">
        <MapPin size={19} />
        <div>
          <strong>{label}</strong>
          <small>
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)} · Used to find nearby suppliers
          </small>
        </div>
        <button onClick={() => setOpen(!open)} aria-expanded={open}>
          Change location <ChevronDown size={14} />
        </button>
        <button disabled={loading} className="outline-button" onClick={locate}>
          <LocateFixed size={15} />
          {loading ? "Fetching location…" : "Use my location"}
        </button>
      </div>
      {error && (
        <p className="location-error" role="alert">
          {error}
        </p>
      )}
      {open && (
        <div className="location-editor">
          <label>
            Choose a demo area
            <select
              aria-label="Demo area"
              defaultValue=""
              onChange={(e) => {
                const p = LOCATION_PRESETS[Number(e.target.value)];
                if (p) save(p, "Demo · " + p.label);
              }}
            >
              <option value="" disabled>
                Select area
              </option>
              {LOCATION_PRESETS.map((p, i) => (
                <option key={p.label} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (save({ lat: Number(lat), lng: Number(lng) }, "Custom coordinates"))
                setOpen(false);
            }}
          >
            <label>
              Latitude
              <input
                required
                type="number"
                min="-90"
                max="90"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </label>
            <label>
              Longitude
              <input
                required
                type="number"
                min="-180"
                max="180"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </label>
            <button className="solid-button">Save coordinates</button>
          </form>
          <p>
            Device location requires browser permission. Demo areas work without location access.
          </p>
        </div>
      )}
    </section>
  );
}
