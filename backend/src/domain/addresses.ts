import type { Address } from "./types";
export function validateAddress(a: Address) {
  const errors: string[] = [];
  if (a.name.trim().length < 2) errors.push("Enter the recipient name.");
  if (!/^[6-9]\d{9}$/.test(a.phone))
    errors.push("Enter a valid 10-digit mobile number.");
  if (a.street.trim().length < 5)
    errors.push("Enter the complete address line.");
  if (!a.city.trim() || !a.state.trim())
    errors.push("City and state are required.");
  if (!/^[1-9]\d{5}$/.test(a.pincode))
    errors.push("Enter a valid six-digit PIN code.");
  if (
    (a.lat !== undefined || a.lng !== undefined) &&
    (!Number.isFinite(a.lat) ||
      !Number.isFinite(a.lng) ||
      Math.abs(a.lat!) > 90 ||
      Math.abs(a.lng!) > 180)
  )
    errors.push("Enter valid latitude and longitude, or leave both empty.");
  return errors;
}
