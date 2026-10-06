import type { CheckoutInput, Attempt, CheckoutRecord, Ledger } from "../features/checkout/types";
import { api, post } from "./client";
import { flushState } from "./storage";
interface Result<T> {
  value: T;
  ledger: Ledger;
}
function accept<T>(result: Result<T>) {
  localStorage.setItem("boxaio_checkout_v1", JSON.stringify(result.ledger));
  window.dispatchEvent(new Event("boxaio-checkout"));
  return result.value;
}
export async function beginAttempt(input: CheckoutInput, id: string, expectedTotal: number) {
  await flushState();
  return accept(
    await post<Result<Attempt>>(
      "/checkout/attempts",
      { input, expectedTotal },
      { "Idempotency-Key": id }
    )
  );
}
export async function settleAttempt(id: string, outcome: "success" | "failure" | "pending") {
  return accept(
    await post<Result<CheckoutRecord | Attempt>>(
      "/checkout/attempts/" + encodeURIComponent(id) + "/result",
      { outcome }
    )
  );
}
export async function cancelAttempt(id: string) {
  return accept(
    await post<Result<null>>("/checkout/attempts/" + encodeURIComponent(id) + "/cancel", {})
  );
}
export async function cancelConfirmedOrder(id: string) {
  return accept(await post<Result<null>>("/orders/" + encodeURIComponent(id) + "/cancel", {}));
}
export async function refreshCheckout() {
  const ledger = await api<Ledger>("/checkout");
  localStorage.setItem("boxaio_checkout_v1", JSON.stringify(ledger));
  return ledger;
}
