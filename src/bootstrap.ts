import { api } from "./api/client";
import { mockData, configureMockData } from "./api/bootstrap-data";
import { configureCatalogue } from "../../backend/src/domain/catalogue";
import { hydrateState, flushState } from "./api/storage";
import type { Ledger } from "./features/checkout/types";
async function start() {
  const root = document.getElementById("root")!;
  try {
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
    await import("./main");
  } catch (e) {
    root.replaceChildren();
    const panel = document.createElement("div");
    panel.style.cssText =
      "max-width:560px;margin:12vh auto;padding:24px;font-family:system-ui;color:#16502b";
    const heading = document.createElement("h1");
    heading.textContent = "Connect to Boxaio";
    const text = document.createElement("p");
    text.textContent =
      (import.meta.env.VITE_DATA_MODE === 'api'
        ? "The mock backend is unavailable. Run npm run dev:api from the project root, then retry. "
        : "The demo data could not be loaded. Check that the mock-data folder was uploaded and browser storage is available. ") +
      (e as Error).message;
    const button = document.createElement("button");
    button.textContent = "Retry connection";
    button.onclick = () => location.reload();
    panel.append(heading, text, button);
    root.append(panel);
  }
}
void start();
