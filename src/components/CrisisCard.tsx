"use client";

/**
 * What shows when someone writes something that sounds like crisis.
 *
 * Rendered locally, from constants, with no network call and no account
 * check — see lib/crisis.ts for why that is the whole point. It has to appear
 * for a free user, a rate-limited user, a user whose month's budget is spent,
 * and a user with no signal at all.
 *
 * Visually it is deliberately NOT one of Dolly's plum bubbles. It is not her
 * speaking, it is the app stepping in front of her, and dressing it as a chat
 * reply would undercut exactly the thing it is trying to say.
 *
 * It is also not dismissible. A close button on this would be a thing to tap
 * without reading.
 */

import { CRISIS_MESSAGE, CRISIS_RESOURCES } from "@/lib/crisis";

export default function CrisisCard() {
  return (
    <div
      // role="note" rather than "alert": the live region on the thread already
      // announces this, and an alert would interrupt whatever the reader is
      // in the middle of hearing, repeating it.
      role="note"
      aria-label="Support resources"
      className="self-stretch w-full"
      style={{
        background: "var(--background-elevated)",
        border: "1px solid var(--border-card)",
        borderLeft: "3px solid var(--danger-text)",
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.65,
          color: "var(--foreground)", margin: "0 0 14px",
        }}
      >
        {CRISIS_MESSAGE}
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {CRISIS_RESOURCES.map((r) => (
          <li key={r.label}>
            {r.href ? (
              <a
                href={r.href}
                // A phone number is the one link here that must work from
                // inside the native app as well as the browser.
                {...(r.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="block"
                style={{ textDecoration: "none", minHeight: 44, display: "flex", flexDirection: "column", justifyContent: "center" }}
              >
                <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--foreground)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {r.label}
                </span>
                <span style={{ display: "block", fontSize: 12.5, lineHeight: 1.5, color: "var(--foreground-secondary)" }}>
                  {r.detail}
                </span>
              </a>
            ) : (
              <>
                <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{r.label}</span>
                <span style={{ display: "block", fontSize: 12.5, lineHeight: 1.5, color: "var(--foreground-secondary)" }}>{r.detail}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
