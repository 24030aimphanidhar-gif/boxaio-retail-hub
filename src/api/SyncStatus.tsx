import { useEffect, useState } from "react";
import { flushState, syncStatus } from "./storage";
export function SyncStatus() {
  const [state, setState] = useState(syncStatus);
  useEffect(() => {
    const update = () => setState(syncStatus());
    window.addEventListener("boxaio-sync", update);
    return () => window.removeEventListener("boxaio-sync", update);
  }, []);
  if (!state.error) return null;
  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: 12,
        background: "#fff0db",
        color: "#76340d",
        fontSize: 13,
      }}
    >
      Backend save failed. Your changes remain in this browser.{" "}
      <button
        onClick={() => void flushState().catch(() => {})}
        style={{ textDecoration: "underline" }}
      >
        Retry save
      </button>
    </div>
  );
}
