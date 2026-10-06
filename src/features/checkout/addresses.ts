import {appStorage} from '@/api/storage';
import type {Address} from './types';
import {mockData} from '@/api/bootstrap-data';
export {validateAddress} from '../../../backend/src/domain/addresses';
export const DEMO_ADDRESS=mockData.addresses[0] as Address;
export function readAddresses(): Address[] {
  try {
    const values = JSON.parse(appStorage.getItem("boxaio_addresses") || "null");
    if (Array.isArray(values) && values.length)
      return values.map((a, index) => ({
        ...DEMO_ADDRESS,
        ...a,
        id: a.id || "address-" + index,
        type: a.type === "Office" ? "Work" : a.type || "Home",
        name: a.name || "Demo customer",
        phone: String(a.phone || "")
          .replace(/\D/g, "")
          .slice(-10),
        line2: a.line2 || "",
        instructions: a.instructions || "",
        lat: typeof a.lat === "number" ? a.lat : undefined,
        lng: typeof a.lng === "number" ? a.lng : undefined,
      }));
  } catch {}
  return [DEMO_ADDRESS];
}
export function saveAddresses(addresses: Address[]) {
  appStorage.setItem("boxaio_addresses", JSON.stringify(addresses));
  window.dispatchEvent(new Event("boxaio-addresses"));
}
