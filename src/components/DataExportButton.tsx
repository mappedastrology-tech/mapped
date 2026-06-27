"use client";

import { useState } from "react";
import { exportUserData } from "@/lib/exportUserData";

/** Small "download my data" control for the Account screen. */
export default function DataExportButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={async () => {
          setError("");
          setBusy(true);
          try {
            await exportUserData();
          } catch {
            setError("Couldn't export your data right now. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
        disabled={busy}
        aria-label="Download a copy of all your Mapped data"
        className="text-muted/70 hover:text-foreground text-[11px] transition-colors disabled:opacity-50"
      >
        {busy ? "Preparing your data…" : "Download my data"}
      </button>
      {error && <span className="text-terracotta text-[10px]" role="status">{error}</span>}
    </div>
  );
}
