import { api } from "./client";
const OUTBOX = "boxaio_sync_outbox";
function readPending(): [string, string | null][] {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX) || "[]");
  } catch {
    return [];
  }
}
const pending = new Map<string, string | null>(readPending());
let queue: Promise<void> = Promise.resolve();
let lastError = "";
const synced = (key: string) =>
  key.startsWith("boxaio_") &&
  ![
    "boxaio_user",
    "boxaio_checkout_v1",
    "boxaio_demo_workspace",
    "boxaio_checkout_legacy_backup",
    OUTBOX,
  ].includes(key);
function notify() {
  localStorage.setItem(OUTBOX, JSON.stringify([...pending]));
  window.dispatchEvent(
    new CustomEvent("boxaio-sync", { detail: { error: lastError, pending: pending.size } })
  );
}
function enqueue() {
  queue = queue
    .catch(() => {})
    .then(async () => {
      for (const [key, value] of pending) {
        try {
          await api("/state/" + encodeURIComponent(key), {
            method: "PUT",
            body: JSON.stringify({ value }),
          });
          if (pending.get(key) === value) pending.delete(key);
          lastError = "";
          notify();
        } catch (e) {
          lastError = (e as Error).message;
          notify();
          throw e;
        }
      }
    });
  queue.catch(() => {});
}
export const appStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
    if (synced(key)) {
      pending.set(key, value);
      notify();
      enqueue();
    }
  },
  removeItem(key: string) {
    localStorage.removeItem(key);
    if (synced(key)) {
      pending.set(key, null);
      notify();
      enqueue();
    }
  },
};
export async function flushState() {
  enqueue();
  await queue;
}
export async function hydrateState(state: Record<string, string>) {
  for (const [key, value] of Object.entries(state)) localStorage.setItem(key, value);
}
export function syncStatus() {
  return { error: lastError, pending: pending.size };
}
