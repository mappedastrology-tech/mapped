"use client";

/**
 * AlmanacPageContent — daily sky almanac with warm, card-based layout.
 *
 * Sections: Today's Sky, Good For, Hold Off, Tonight, This Moon,
 * Coming Up, and an optional Garden section behind a localStorage toggle.
 *
 * Imported dynamically with ssr:false from page.tsx to avoid
 * hydration mismatches with Date objects.
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getTodaySky,
  getGoodForToday,
  getHoldOffToday,
  getTonightSky,
  getThisMoon,
  getComingUp,
  getGardenTips,
} from "@/lib/almanacData";
import { getMoonPhaseImage } from "@/lib/celestialCalendar";
import Image from "next/image";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const GARDEN_PREF_KEY = "mapped:almanac-prefs";

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function AlmanacPageContent() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);

  // ── Data ──────────────────────────────────────────────────────────────────
  const sky = useMemo(() => getTodaySky(today), [today]);
  const goodFor = useMemo(() => getGoodForToday(today), [today]);
  const holdOff = useMemo(() => getHoldOffToday(today), [today]);
  const tonight = useMemo(() => getTonightSky(today), [today]);
  const thisMoon = useMemo(() => getThisMoon(today), [today]);
  const comingUp = useMemo(() => getComingUp(today), [today]);
  const gardenTips = useMemo(() => getGardenTips(today), [today]);

  // ── Almanac content prefs (localStorage-backed) ──────────────────────────
  const [almanacPrefs, setAlmanacPrefs] = useState<Record<string, boolean>>({});
  const gardenMode = !!almanacPrefs["garden"];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GARDEN_PREF_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "object" && parsed !== null) {
          setAlmanacPrefs(parsed);
        } else if (stored === "true") {
          // Migrate old boolean format
          setAlmanacPrefs({ garden: true });
          localStorage.setItem(GARDEN_PREF_KEY, JSON.stringify({ garden: true }));
        }
      }
    } catch {
      /* no-op */
    }
  }, []);

  // Garden mode is now toggled from Account settings, not inline

  // ── Formatted date string ─────────────────────────────────────────────────
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main
      className="min-h-screen flex-1 flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* ━━━ Sticky header ━━━ */}
      <div
        className="sticky top-0 z-40 backdrop-blur-sm"
        style={{
          background: "color-mix(in srgb, var(--background) 92%, transparent)",
          borderBottom: "1px solid var(--border-card)",
        }}
      >
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: "var(--foreground-muted)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1
              className="text-xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--foreground)",
              }}
            >
              Almanac
            </h1>
            <p
              className="text-[11px]"
              style={{ color: "var(--foreground-faint)" }}
            >
              {dateStr}
            </p>
          </div>
        </div>
      </div>

      {/* ━━━ Content ━━━ */}
      <div className="max-w-lg mx-auto w-full px-5 py-5 pb-28 flex flex-col gap-5">
        {/* ─── Section 1: Today's Sky ─── */}
        <section
          className="rounded-2xl p-5"
          style={{
            background: "var(--background-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.15em] font-bold mb-4"
            style={{ color: "var(--terracotta)" }}
          >
            Today&apos;s Sky
          </p>

          {/* Sun row */}
          <div className="flex items-start gap-3 mb-3.5">
            <span className="text-[22px] leading-none mt-0.5">&#x2600;&#xFE0F;</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {sky.sunrise} &mdash; {sky.sunset}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {sky.dayLengthHours}h {sky.dayLengthMinutes}m
                </span>
              </div>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "var(--foreground-faint)" }}
              >
                {sky.dayLengthDirection === "longer" ? "Days are getting longer" : sky.dayLengthDirection === "shorter" ? "Days are getting shorter" : "Near the equinox"}
              </p>
            </div>
          </div>

          {/* Moon row */}
          <div className="flex items-start gap-3 mb-3.5">
            <div className="w-6 h-6 relative shrink-0 mt-0.5">
              <Image src={getMoonPhaseImage(sky.moonPhase.phase)} alt={sky.moonPhase.label} fill className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {sky.moonPhase.label}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {sky.moonPhase.illumination}% illumination
                </span>
              </div>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "var(--foreground-faint)" }}
              >
                Moon in {sky.moonSign}
              </p>
            </div>
          </div>

          {/* Season row */}
          <div className="flex items-start gap-3">
            <span className="text-[22px] leading-none mt-0.5">&#x2728;</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {sky.sunSign} season &middot; Day {sky.dayOfSeason}
                </span>
              </div>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "var(--foreground-faint)" }}
              >
                {sky.planetaryRuler.planet} rules today
              </p>
            </div>
          </div>

          {/* Void of course banner */}
          {sky.voidOfCourseMoon && (
            <div
              className="mt-4 rounded-xl px-4 py-3"
              style={{
                background: "color-mix(in srgb, var(--amber) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--amber) 25%, transparent)",
              }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-[0.12em] mb-0.5"
                style={{ color: "var(--amber)" }}
              >
                Void-of-Course Moon
              </p>
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                {sky.voidOfCourseMoon.start} &mdash; {sky.voidOfCourseMoon.end}
                &ensp;&middot;&ensp;{sky.voidOfCourseMoon.note}
              </p>
            </div>
          )}
        </section>

        {/* ─── Section 2: Today is good for ─── */}
        <section
          className="rounded-2xl p-5"
          style={{
            background: "var(--background-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
            style={{ color: "var(--sage)" }}
          >
            Today Is Good For
          </p>
          <ul className="flex flex-col gap-2 mb-4">
            {goodFor.activities.map((item, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--sage)" }}
                >
                  &#x2713;
                </span>
                <span className="text-[13px]" style={{ color: "var(--foreground)" }}>
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.activity}
                </span>
              </li>
            ))}
          </ul>
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "color-mix(in srgb, var(--sage) 6%, transparent)",
              border: "1px solid color-mix(in srgb, var(--sage) 12%, transparent)",
            }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1"
              style={{ color: "var(--sage)" }}
            >
              Why?
            </p>
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              {goodFor.why}
            </p>
          </div>
        </section>

        {/* ─── Section 3: Today, hold off on ─── */}
        {holdOff && (
          <section
            className="rounded-2xl p-5"
            style={{
              background: "var(--background-card)",
              border: "1px solid var(--border-card)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
              style={{ color: "var(--terracotta)" }}
            >
              Today, Hold Off On
            </p>
            <ul className="flex flex-col gap-2 mb-4">
              {holdOff.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--terracotta)" }}
                  >
                    &#x2717;
                  </span>
                  <span className="text-[13px]" style={{ color: "var(--foreground)" }}>
                    {item.icon && <span className="mr-1.5">{item.icon}</span>}
                    {item.activity}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: "color-mix(in srgb, var(--terracotta) 6%, transparent)",
                border: "1px solid color-mix(in srgb, var(--terracotta) 12%, transparent)",
              }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1"
                style={{ color: "var(--terracotta)" }}
              >
                Why?
              </p>
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                {holdOff.reason}
              </p>
            </div>

            {holdOff.duration && (
              <p
                className="text-[11px] mt-3 text-center"
                style={{ color: "var(--foreground-faint)" }}
              >
                Duration: {holdOff.duration}
              </p>
            )}
          </section>
        )}

        {/* ─── Section 4: Tonight in the sky ─── */}
        <section
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "var(--background-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {/* Decorative star/moon element */}
          <div
            className="absolute top-3 right-4 text-[28px] opacity-[0.12] pointer-events-none select-none"
            aria-hidden="true"
          >
            &#x2729;
          </div>

          <p
            className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Tonight in the Sky
          </p>
          <p
            className="text-[14px] leading-relaxed italic"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--foreground)",
            }}
          >
            {tonight.observation}
          </p>
        </section>

        {/* ─── Section 5: This Moon ─── */}
        {thisMoon && (
          <section
            className="rounded-2xl p-5"
            style={{
              background: "var(--background-card)",
              border: "1px solid var(--border-card)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.15em] font-bold mb-2"
              style={{ color: "var(--foreground-secondary)" }}
            >
              This Moon
            </p>

            <h2
              className="text-[22px] leading-tight mb-1"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--foreground)",
              }}
            >
              {thisMoon.name}
            </h2>

            <p
              className="text-[12px] mb-1"
              style={{ color: "var(--foreground-muted)" }}
            >
              {thisMoon.phaseLabel} · Moon in {thisMoon.moonSign}
            </p>
            <p
              className="text-[11px] mb-3"
              style={{ color: "var(--foreground-faint)" }}
            >
              Full moon: {thisMoon.fullDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </p>

            <p
              className="text-[13px] leading-relaxed mb-3"
              style={{ color: "var(--foreground)" }}
            >
              {thisMoon.dailyInsight}
            </p>

            <p
              className="text-[12px] mb-2 italic"
              style={{ color: "var(--foreground-faint)" }}
            >
              {thisMoon.origin}
            </p>

            {thisMoon.otherNames && thisMoon.otherNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {thisMoon.otherNames.map((name, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            <p
              className="text-[12px] font-semibold text-center pt-2"
              style={{
                color: "var(--terracotta)",
                borderTop: "1px solid var(--border-card)",
              }}
            >
              {thisMoon.daysUntilFull > 0
                ? `${thisMoon.daysUntilFull} day${thisMoon.daysUntilFull === 1 ? "" : "s"} until full`
                : thisMoon.daysUntilFull === 0
                  ? "Full moon tonight"
                  : `${Math.abs(thisMoon.daysUntilFull)} day${Math.abs(thisMoon.daysUntilFull) === 1 ? "" : "s"} since full`}
            </p>
          </section>
        )}

        {/* ─── Section 6: Coming up in the sky ─── */}
        <section
          className="rounded-2xl p-5"
          style={{
            background: "var(--background-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Coming Up in the Sky
          </p>

          <ul className="flex flex-col gap-0">
            {comingUp.map((event, i) => (
              <li
                key={i}
                className="flex items-center gap-3 py-2.5"
                style={{
                  borderBottom:
                    i < comingUp.length - 1
                      ? "1px solid color-mix(in srgb, var(--foreground) 6%, transparent)"
                      : "none",
                }}
              >
                <span
                  className="text-[12px] font-semibold shrink-0 w-16 text-right tabular-nums"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {event.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span
                  className="text-[13px]"
                  style={{ color: "var(--foreground)" }}
                >
                  {event.label}
                </span>
              </li>
            ))}
          </ul>

          <button
            className="w-full text-center mt-3 text-[12px] font-semibold transition-opacity hover:opacity-80"
            style={{ color: "var(--terracotta)" }}
            onClick={() => {
              /* no-op for now */
            }}
          >
            See full year &rarr;
          </button>
        </section>

        {/* ─── Section 7: In Your Garden (shown when enabled in settings) ─── */}
        {gardenMode && (
          <section
            className="rounded-2xl p-5"
            style={{
              background: "var(--background-card)",
              border: "1px solid var(--border-card)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
              style={{ color: "var(--sage)" }}
            >
              🌱 In Your Garden
            </p>
            <p
              className="text-[13px] leading-relaxed mb-4"
              style={{ color: "var(--foreground)" }}
            >
              {gardenTips.localNote}
            </p>
            <ul className="flex flex-col gap-2">
              {gardenTips.bestDays.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 py-1"
                >
                  <span
                    className="text-[13px] mt-0.5"
                    style={{ color: "var(--sage)" }}
                  >
                    &#x1F331;
                  </span>
                  <div>
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {tip.activity}
                    </span>
                    <span
                      className="text-[11px] ml-2"
                      style={{ color: "var(--foreground-faint)" }}
                    >
                      {tip.dates}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
