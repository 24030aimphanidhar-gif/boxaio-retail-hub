import { useState } from "react";
import { MapPin, Plus, Pencil, LocateFixed } from "lucide-react";
import { readAddresses, saveAddresses, validateAddress, DEMO_ADDRESS } from "../addresses";
import type { Address } from "../types";
export function AddressEditor({
  value,
  onSave,
  onCancel,
}: {
  value: Address;
  onSave: (a: Address) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value),
    [error, setError] = useState(""),
    [locating, setLocating] = useState(false);
  function locate() {
    if (!navigator.geolocation) {
      setError("Location is unavailable. Enter your address manually.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setDraft((a) => ({ ...a, lat: p.coords.latitude, lng: p.coords.longitude }));
        setLocating(false);
        setError("");
      },
      () => {
        setError("Location could not be fetched. You can continue with a city and PIN.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }
  return (
    <form
      className="cx-address-form"
      onSubmit={(e) => {
        e.preventDefault();
        const errors = validateAddress(draft);
        if (errors.length) {
          setError(errors.join(" "));
          return;
        }
        onSave(draft);
      }}
    >
      <h3>{value.id ? "Edit address" : "Add an address"}</h3>
      <div className="cx-form-grid">
        {(
          [
            ["name", "Customer name"],
            ["phone", "Mobile number"],
            ["street", "Address line 1"],
            ["line2", "Address line 2"],
            ["landmark", "Landmark"],
            ["city", "City"],
            ["state", "State"],
            ["pincode", "PIN code"],
          ] as const
        ).map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              required={!["line2", "landmark"].includes(key)}
              value={draft[key]}
              inputMode={key === "phone" || key === "pincode" ? "numeric" : undefined}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [key]: e.target.value,
                  ...(["street", "city", "state", "pincode"].includes(key)
                    ? { lat: undefined, lng: undefined }
                    : {}),
                })
              }
            />
          </label>
        ))}
        <label>
          Address label
          <select
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value as Address["type"] })}
          >
            {["Home", "Work", "Shop", "Other"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Delivery instructions
          <textarea
            value={draft.instructions}
            onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
          />
        </label>
        <label>
          Latitude (optional)
          <input
            type="number"
            step="any"
            value={draft.lat ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                lat: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
          />
        </label>
        <label>
          Longitude (optional)
          <input
            type="number"
            step="any"
            value={draft.lng ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                lng: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
          />
        </label>
      </div>
      <button type="button" className="outline-button" onClick={locate} disabled={locating}>
        <LocateFixed size={15} />
        {locating ? "Fetching location…" : "Use current GPS location"}
      </button>
      <p className="cx-muted">
        GPS is optional. City and PIN are checked again before placing the order.
      </p>
      {error && (
        <p className="cx-error" role="alert">
          {error}
        </p>
      )}
      <div className="cx-actions">
        <button className="solid-button">Save address</button>
        <button type="button" className="outline-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
export function AddressBook({
  selected,
  onSelect,
}: {
  selected: Address;
  onSelect: (a: Address) => void;
}) {
  const [rows, setRows] = useState(readAddresses),
    [editing, setEditing] = useState<Address | null>(null),
    [error, setError] = useState("");
  function save(a: Address) {
    try {
      const value = { ...a, id: a.id || crypto.randomUUID() };
      const next = rows.some((r) => r.id === value.id)
        ? rows.map((r) => (r.id === value.id ? value : r))
        : [...rows, value];
      saveAddresses(next);
      setRows(next);
      onSelect(value);
      setEditing(null);
    } catch {
      setError("Could not save the address. Check browser storage.");
    }
  }
  if (editing)
    return <AddressEditor value={editing} onSave={save} onCancel={() => setEditing(null)} />;
  return (
    <>
      <div className="cx-panel-title">
        <h2>
          <MapPin size={20} />
          Delivery address
        </h2>
        <button
          className="outline-button"
          onClick={() =>
            setEditing({
              ...DEMO_ADDRESS,
              id: "",
              name: "",
              phone: "",
              street: "",
              line2: "",
              landmark: "",
              instructions: "",
              lat: undefined,
              lng: undefined,
              isDefault: false,
            })
          }
        >
          <Plus size={14} />
          Add new
        </button>
      </div>
      <div className="cx-addresses">
        {rows.map((a) => (
          <article key={a.id} className={selected.id === a.id ? "selected" : ""}>
            <label>
              <input
                type="radio"
                name="address"
                checked={selected.id === a.id}
                onChange={() => onSelect(a)}
              />
              <span>
                <b>
                  {a.name} <em>{a.type}</em>
                </b>
                <span>
                  {a.street}
                  {a.line2 ? ", " + a.line2 : ""}
                </span>
                <span>
                  {a.city}, {a.state} {a.pincode}
                </span>
                <small>
                  {a.phone}
                  {a.isDefault ? " · Default" : ""}
                  {a.lat !== undefined ? " · GPS saved" : ""}
                </small>
              </span>
            </label>
            <div className="cx-inline-actions">
              <button onClick={() => setEditing(a)}>
                <Pencil size={13} />
                Edit
              </button>
              <button
                onClick={() => {
                  const next = rows.map((r) => ({ ...r, isDefault: r.id === a.id }));
                  saveAddresses(next);
                  setRows(next);
                }}
              >
                Set default
              </button>
              {rows.length > 1 && (
                <button
                  onClick={() => {
                    const next = rows.filter((r) => r.id !== a.id);
                    saveAddresses(next);
                    setRows(next);
                    if (selected.id === a.id) onSelect(next[0]);
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
