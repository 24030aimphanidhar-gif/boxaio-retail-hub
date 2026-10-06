import { useState } from "react";
import { MapPin, ShieldCheck, Truck } from "lucide-react";
export function DeliveryCheck({ wholesale = false }: { wholesale?: boolean }) {
  const [pin, setPin] = useState("520010"),
    [checked, setChecked] = useState(""),
    [ok, setOk] = useState(false);
  return (
    <div className="detail-delivery-check">
      <h3>
        <MapPin size={16} />
        Delivery & availability
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const valid = /^[1-9]\d{5}$/.test(pin);
          const supported =
            valid &&
            (wholesale
              ? pin.startsWith("520")
              : ["520", "500", "522", "560", "521"].some((p) => pin.startsWith(p)));
          setOk(supported);
          setChecked(
            !valid
              ? "Enter a valid 6-digit PIN code."
              : supported
                ? "Delivery available in this demo zone. Exact seller coverage, date, slot and charges are confirmed at checkout."
                : "Delivery is unavailable for this PIN in the demo. Store pickup may be available at checkout."
          );
        }}
      >
        <input
          aria-label="Delivery PIN code"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setChecked("");
          }}
        />
        <button>Check</button>
      </form>
      {checked && (
        <p role="status" className={ok ? "available" : "unavailable"}>
          {checked}
        </p>
      )}
      <div>
        <span>
          <Truck size={15} />
          Choose a delivery slot
        </span>
        <span>
          <ShieldCheck size={15} />
          Price checked before payment
        </span>
      </div>
      <small>
        Damaged or incorrect items? Review the returns policy before ordering. Product photos and
        reviews are illustrative.
      </small>
    </div>
  );
}
