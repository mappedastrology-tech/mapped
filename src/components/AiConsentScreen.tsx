"use client";

/**
 * Asked once, before the first thing Dolly is told.
 *
 * Guideline 5.1.2(i): explicit permission before personal data goes to a
 * third party, including third-party AI. So this says plainly that an outside
 * AI service is involved, names the company on the screen itself (in the small
 * print, so the screen is about Dolly rather than her vendor), lists what
 * actually leaves — in the words a reader would use, not ours — and will not
 * accept a tap anywhere else as agreement.
 *
 * "Not now" is a real answer. It is recorded, the screen stops appearing, and
 * every part of Mapped that is not AI keeps working: chart, almanac, tarot,
 * journal, maps, the library. Nothing here is a dark pattern — the decline is
 * the same size as the accept and says what it does.
 */

import { useState } from "react";
import Link from "next/link";
import { AI_PROVIDER_NAME, AI_SHARED_ITEMS, grantAiConsent, declineAiConsent } from "@/lib/aiConsent";

export default function AiConsentScreen({
  onGranted,
  onDeclined,
}: {
  onGranted: () => void;
  onDeclined: () => void;
}) {
  const [busy, setBusy] = useState<"grant" | "decline" | null>(null);
  const [error, setError] = useState("");

  async function choose(agree: boolean) {
    setBusy(agree ? "grant" : "decline");
    setError("");
    const ok = agree ? await grantAiConsent() : await declineAiConsent();
    setBusy(null);
    if (!ok) {
      setError("That didn't save — check your connection and try again.");
      return;
    }
    if (agree) onGranted();
    else onDeclined();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-consent-title"
      className="flex-1 flex flex-col overflow-y-auto px-6 py-8"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md mx-auto">
        <p
          className="text-[11px] uppercase mb-2"
          style={{ fontFamily: "var(--font-ui)", letterSpacing: "0.16em", fontWeight: 600, color: "var(--brass)" }}
        >
          Before you start
        </p>

        <h1
          id="ai-consent-title"
          className="mb-3"
          style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1.2, color: "var(--foreground)" }}
        >
          Before Dolly reads your chart
        </h1>

        <p className="text-[14.5px] leading-[1.65] mb-5" style={{ color: "var(--foreground-secondary)" }}>
          Dolly knows your chart, remembers what you&rsquo;ve talked about, and reads your sky the way
          an astrologer would. To answer you, Mapped uses an outside AI service, so your question and
          the parts of your chart she needs are sent to it. We need your permission first.
        </p>

        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}
        >
          <p
            className="text-[11px] uppercase mb-3"
            style={{ fontFamily: "var(--font-ui)", letterSpacing: "0.12em", fontWeight: 600, color: "var(--foreground-muted)" }}
          >
            What gets sent
          </p>
          <ul className="flex flex-col gap-2.5 m-0 p-0" style={{ listStyle: "none" }}>
            {AI_SHARED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span aria-hidden="true" className="mt-[7px] shrink-0" style={{ width: 4, height: 4, borderRadius: 999, background: "var(--brass)" }} />
                <span className="text-[13.5px] leading-[1.55]" style={{ color: "var(--foreground-secondary)" }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[13px] leading-[1.6] mb-6" style={{ color: "var(--foreground-muted)" }}>
          It is sent only when you ask for something — never in the background.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => choose(true)}
            disabled={busy !== null}
            className="w-full rounded-full text-[15px] font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
            style={{ minHeight: 50, background: "var(--brass)", color: "var(--btn-primary-text)" }}
          >
            {busy === "grant" ? "Saving…" : "Allow Dolly"}
          </button>
          <button
            onClick={() => choose(false)}
            disabled={busy !== null}
            className="w-full rounded-full text-[15px] font-medium active:scale-[0.98] transition-all disabled:opacity-50"
            style={{
              minHeight: 50,
              background: "transparent",
              border: "1px solid var(--border-card)",
              color: "var(--foreground-secondary)",
            }}
          >
            {busy === "decline" ? "Saving…" : "Not now — keep Dolly switched off"}
          </button>
        </div>

        {error && (
          <p role="alert" className="text-[13px] mt-3 text-center" style={{ color: "var(--danger-text)" }}>
            {error}
          </p>
        )}

        <p className="text-[12px] leading-[1.6] mt-5 text-center" style={{ color: "var(--foreground-muted)" }}>
          Our AI provider is {AI_PROVIDER_NAME}. We don&rsquo;t sell your data, and it isn&rsquo;t used to
          advertise to you. The{" "}
          <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link> has the
          detail.
        </p>

        <p className="text-[12px] leading-[1.6] mt-2 text-center" style={{ color: "var(--foreground-muted)" }}>
          Everything else in Mapped — your chart, the almanac, tarot, journal, maps and the
          library — works either way. You can change your mind in Settings.
        </p>
      </div>
    </div>
  );
}
