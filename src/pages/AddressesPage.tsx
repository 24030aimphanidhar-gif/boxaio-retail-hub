import { Link } from "wouter";
import { useState } from "react";
import { AddressBook } from "@/features/checkout/components/AddressBook";
import { readAddresses } from "@/features/checkout/addresses";
export function AddressesPage() {
  const [address, setAddress] = useState(() => readAddresses()[0]);
  return (
    <div className="wrap cx-page">
      <Link className="back-link" href="/dashboard">
        ← Account
      </Link>
      <div className="cx-panel">
        <AddressBook selected={address} onSelect={setAddress} />
      </div>
    </div>
  );
}
