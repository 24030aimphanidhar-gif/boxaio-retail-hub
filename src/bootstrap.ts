import { api } from "./api/client";
import { mockData, configureMockData } from "./api/bootstrap-data";
import { configureCatalogue } from "../backend/src/domain/catalogue";
import { hydrateState, flushState } from "./api/storage";
import type { Ledger } from "./features/checkout/types";
export async function bootstrapData() {
  {
    await flushState();
    const data = await api<{
      catalogue: typeof mockData;
      state: Record<string, string>;
      ledger: Ledger;
    }>("/bootstrap");
    configureMockData(data.catalogue);
    configureCatalogue(data.catalogue as Parameters<typeof configureCatalogue>[0]);
    await hydrateState(data.state);
    const prior = localStorage.getItem("boxaio_checkout_v1");
    if (prior && !localStorage.getItem("boxaio_checkout_legacy_backup"))
      localStorage.setItem("boxaio_checkout_legacy_backup", prior);
    localStorage.setItem("boxaio_checkout_v1", JSON.stringify(data.ledger));
  }
}
