"use client";

import { useEffect, useState } from "react";

/**
 * Edge state 6 — offline.
 *
 * Learn is the part of the app most likely to be used without a connection
 * (on a train, in bed with the wifi off), and the thing people worry about is
 * whether the lesson they just finished counted. It did: progress writes are
 * queued locally and sync when the connection returns.
 *
 * Mounted on the Learn screens rather than app-wide. The design calls this
 * "global", but adding a banner to every screen in the app is a bigger change
 * than a library redesign should make on its own — moving it into the root
 * layout later is a one-line change.
 *
 * navigator.onLine is read AFTER mount, never during render: it does not exist
 * on the server, and branching on it while rendering would mismatch hydration.
 */
export default function OfflineNotice() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      style={{
        margin: "12px 22px 0", padding: "12px 14px", borderRadius: 14,
        background: "var(--lib-plum-island)",
        boxShadow: "inset 0 0 0 0.5px rgba(201,169,97,0.4)",
      }}
    >
      <p className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "var(--brass)" }}>
        You&rsquo;re offline
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.55, color: "var(--lib-on-plum)", marginTop: 6 }}>
        Your progress is saved — we&rsquo;ll sync the moment you&rsquo;re back.
      </p>
    </div>
  );
}
