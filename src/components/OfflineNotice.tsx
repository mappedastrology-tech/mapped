"use client";

import { useEffect, useState } from "react";

/**
 * Offline notice — app-wide.
 *
 * The thing people worry about when the connection drops is whether what they
 * just did counted. It did: writes are cached locally and sync when the
 * connection returns, which is what this says.
 *
 * Mounted in the root layout, above everything, so it reaches every screen —
 * a journal entry or a saved chart deserves the same reassurance as a lesson.
 * It renders nothing at all while online, so the cost to every other screen is
 * one boolean.
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
        padding: "10px 16px",
        background: "var(--plum)",
        borderBottom: "1px solid rgba(201,169,97,0.4)",
        textAlign: "center",
      }}
    >
      <p className="uppercase" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "var(--brass)" }}>
        You&rsquo;re offline
      </p>
      <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--lib-on-plum)", marginTop: 4 }}>
        Your progress is saved — we&rsquo;ll sync the moment you&rsquo;re back.
      </p>
    </div>
  );
}
