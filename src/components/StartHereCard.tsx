"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DISMISS_KEY = "mapped:start-here-dismissed";

/**
 * One-time orientation card for brand-new users. The app is broad — this answers
 * "where do I start?" with four concrete first taps. It shows only to someone
 * with no prior activity, and never returns once dismissed.
 */
const STEPS = [
  { href: "/you", glyph: "☉", title: "Meet your chart", desc: "Your Sun, Moon, Rising and the whole wheel" },
  { href: "/dolly", glyph: "✦", title: "Ask Dolly anything", desc: "Your AI guide — love, career, or your patterns" },
  { href: "/maps", glyph: "✧", title: "Map your people", desc: "See the people in your orbit as a constellation" },
  { href: "/library/reference", glyph: "✷", title: "Look something up", desc: "Signs, crystals, herbs, tarot — the whole Library" },
] as const;

export default function StartHereCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
      // Hide for anyone who has already used the app (any daily pull recorded).
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("mapped:tarot-revealed-") || k.startsWith("mapped:oracle-revealed-"))) {
          return;
        }
      }
      setShow(true);
    } catch {
      /* localStorage unavailable — just don't show */
    }
  }, []);

  function dismiss() {
    setShow(false);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  }

  if (!show) return null;

  return (
    <div
      className="rounded-2xl px-5 py-5 mb-8"
      style={{ backgroundColor: "var(--plum)", border: "1px solid rgba(201,169,97,0.25)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[9px] tracking-[0.25em] uppercase font-medium" style={{ color: "#c9a961" }}>
            New here?
          </p>
          <p className="text-[18px] mt-1" style={{ fontFamily: "var(--font-heading)", color: "#f0e6d2" }}>
            Start with these
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition-transform shrink-0"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f0e6d2" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {STEPS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl active:scale-[0.99] transition-transform"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,169,97,0.14)" }}
          >
            <span
              className="text-[15px] w-8 h-8 flex items-center justify-center rounded-full shrink-0"
              style={{ background: "rgba(201,169,97,0.16)", color: "#c9a961" }}
              aria-hidden="true"
            >
              {s.glyph}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold" style={{ color: "#f0e6d2" }}>{s.title}</span>
              <span className="block text-[11px]" style={{ color: "rgba(240,230,210,0.6)" }}>{s.desc}</span>
            </span>
            <span className="text-[13px]" style={{ color: "#c9a961" }} aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="text-[11px] mt-3.5 w-full text-center"
        style={{ color: "rgba(240,230,210,0.5)" }}
      >
        I&apos;ll explore on my own
      </button>
    </div>
  );
}
