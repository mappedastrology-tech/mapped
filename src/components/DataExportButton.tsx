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
          } catch (err) {
            // exportUserData now throws where a file cannot be saved at all
            // (the native shell ignores a blob download), and "please try
            // again" is the wrong advice for that — trying again cannot work.
            setError(
              err instanceof Error && err.message
                ? err.message
                : "Couldn't export your data right now. Please try again.",
            );
          } finally {
            setBusy(false);
          }
        }}
        disabled={busy}
        /* Says what is in the file, and what is not: preferences kept only
           on this device (localStorage) never reach the account, so they
           cannot be in an export built from it. */
        aria-label="Download my data: a JSON file of everything your Mapped account stores — profile, charts, people, journal and reflections, Dolly conversations and memory, readings, Learn progress and certificates, settings including your AI choice, and notification devices. Preferences kept only on this device are not included."
        className="text-muted/70 hover:text-foreground text-[11px] transition-colors disabled:opacity-50"
      >
        {busy ? "Preparing your data…" : "Download my data"}
      </button>
      {error && <span className="text-terracotta text-[10px]" role="status">{error}</span>}
    </div>
  );
}
