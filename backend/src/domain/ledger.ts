import type { Ledger, Balance } from "./types";
let current: Ledger = { attempts: {}, orders: [], balances: {} };
let reader = () => current,
  writer = (value: Ledger) => {
    current = value;
  };
export function configureLedger(
  read: () => Ledger,
  write: (value: Ledger) => void,
) {
  reader = read;
  writer = write;
}
export function readLedger() {
  return reader();
}
export function writeLedger(value: Ledger) {
  writer(value);
}
export function balanceFor(account: string, ledger = readLedger()): Balance {
  return (
    ledger.balances[account] || { points: 500, wallet: 1000, credit: 50000 }
  );
}
