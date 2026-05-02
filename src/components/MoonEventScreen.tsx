"use client";

/**
 * Moon Event Screen — full-screen starry-night takeover for full/new moon days.
 *
 * Shows: large centered moon, traditional name, zodiac sign, illumination,
 * correspondences, ritual CTA, and "Moons of 2026" year grid.
 *
 * Triggered from home screen moon badge or horizon event cards.
 */

import { useMemo, useEffect } from "react";
import {
  getTodaysMoonEvent,
  getFullMoonsForYear,
  MOON_LORE,
  NEW_MOON_LORE,
  PHASE_CORRESPONDENCES,
  getMoonPhase,
  type TodaysMoonEvent,
  type YearMoonEntry,
} from "@/lib/celestialCalendar";

// ─── Night sky background image ─────────────────────────────────────────────

function NightSkyBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/night-sky.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.85 }}
      />
      {/* Dark overlay so text remains readable as user scrolls */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,15,0.3) 0%, rgba(5,5,15,0.5) 50%, rgba(5,5,15,0.7) 100%)" }} />
    </div>
  );
}

// ─── Moon visual (uses the app's watercolor moon PNGs) ──────────────────────

import MoonPhaseIcon from "@/components/MoonPhaseIcon";

function MoonVisual({ kind }: { kind: "full" | "new" }) {
  return (
    <div className="relative w-[180px] h-[180px] mx-auto flex items-center justify-center">
      {/* Glow behind the moon */}
      <div className="absolute inset-0 rounded-full"
        style={{
          background: kind === "full"
            ? "radial-gradient(circle, rgba(255,250,230,0.18) 0%, rgba(255,250,230,0.05) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(100,80,160,0.12) 0%, rgba(80,60,140,0.04) 50%, transparent 70%)",
        }}
      />
      <MoonPhaseIcon
        phase={kind === "full" ? "Full Moon" : "New Moon"}
        size={140}
        className="relative z-10"
      />
    </div>
  );
}

// ─── Correspondences grid ────────────────────────────────────────────────────

function CorrespondenceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
      <p className="text-[9px] opacity-35 mb-1">{label}</p>
      <p className="text-[12px] opacity-70">{value}</p>
    </div>
  );
}

// ─── Year grid ───────────────────────────────────────────────────────────────

function MoonsOfYear({ moons, currentName }: { moons: YearMoonEntry[]; currentName?: string }) {
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {moons.map((m, i) => {
        const isCurrent = m.name === currentName;
        // For Blue Moon (second May), show "May" with day
        const monthLabel = m.isBlue ? `May ${m.day}` : MONTH_NAMES[m.month];

        return (
          <div
            key={i}
            className="flex items-center gap-2 py-2 px-2.5 rounded-lg"
            style={{
              background: isCurrent ? "rgba(196,106,69,0.2)" : "rgba(255,255,255,0.03)",
              border: isCurrent ? "1px solid rgba(196,106,69,0.3)" : "1px solid transparent",
            }}
          >
            <span className="text-[14px] shrink-0">{m.emoji}</span>
            <div className="min-w-0">
              <p className="text-[11px] truncate" style={{ opacity: isCurrent ? 0.9 : 0.55, color: isCurrent ? "#f5e6c8" : undefined }}>
                {monthLabel}
              </p>
              <p className="text-[9px] truncate" style={{ opacity: isCurrent ? 0.5 : 0.25, color: isCurrent ? "#f5e6c8" : undefined }}>
                {m.name}{isCurrent ? " ←" : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface MoonEventScreenProps {
  onClose: () => void;
  onStartRitual?: () => void;
}

export default function MoonEventScreen({ onClose, onStartRitual }: MoonEventScreenProps) {
  const today = useMemo(() => new Date(), []);
  const moonEvent = useMemo(() => getTodaysMoonEvent(today), [today]);
  const moonPhase = useMemo(() => getMoonPhase(today), [today]);
  const yearMoons = useMemo(() => getFullMoonsForYear(today.getFullYear()), [today]);

  // Set status bar / theme-color to dark while this screen is open
  useEffect(() => {
    // Change meta theme-color to match dark background
    const meta = document.querySelector('meta[name="theme-color"]');
    const prevColor = meta?.getAttribute("content") || "#F3E8D6";
    if (meta) meta.setAttribute("content", "#05050f");

    // Change status bar style for iOS PWA
    const statusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    const prevStatus = statusMeta?.getAttribute("content") || "default";
    if (statusMeta) statusMeta.setAttribute("content", "black-translucent");

    // Prevent body scroll behind the overlay
    document.body.style.overflow = "hidden";

    return () => {
      if (meta) meta.setAttribute("content", prevColor);
      if (statusMeta) statusMeta.setAttribute("content", prevStatus);
      document.body.style.overflow = "";
    };
  }, []);

  // If no moon event today, show general moon info
  const isFull = moonEvent?.kind === "full" || moonPhase.phase === "full";
  const isNew = moonEvent?.kind === "new" || moonPhase.phase === "new";
  const kind: "full" | "new" = isFull ? "full" : "new";

  // Get data
  const moonName = moonEvent?.moonName || (isFull ? "Full Moon" : "New Moon");
  const lore = moonEvent?.lore || (isFull ? MOON_LORE["Flower Moon"] : NEW_MOON_LORE);
  const sign = moonEvent?.zodiacSign || moonPhase.label;
  const correspondences = PHASE_CORRESPONDENCES[kind === "full" ? "full" : "new"];
  const illumination = moonPhase.illumination; // real computed value

  // Best-for tags
  const bestFor = kind === "full"
    ? ["Release", "Celebration", "Gratitude", "Charging"]
    : ["Intentions", "Planting seeds", "Vision work", "Divination"];

  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto"
      style={{
        background: "#05050f",
        color: "#fff",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <NightSkyBackground />

      <div className="relative z-10 max-w-lg mx-auto px-5 pb-10">
        {/* Back button */}
        <button
          onClick={onClose}
          className="pt-4 pb-2 flex items-center gap-1.5 text-[12px]"
          style={{ opacity: 0.55, color: "#fff" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {/* Moon visual */}
        <div className="pt-4 pb-2">
          <MoonVisual kind={kind} />
        </div>

        {/* Moon name + date */}
        <div className="text-center pb-2">
          <p className="text-[9px] tracking-[0.25em] uppercase mb-1.5" style={{ opacity: 0.4 }}>
            ✦ {kind === "full" ? "Full Moon" : "New Moon"} ✦
          </p>
          <h1 className="text-[28px] font-bold mb-1" style={{ fontFamily: "Georgia, serif" }}>
            {moonName === "Full Moon" || moonName === "New Moon" ? moonName : `The ${moonName}`}
          </h1>
          <p className="text-[13px]" style={{ opacity: 0.5 }}>
            {dateStr}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex justify-center gap-7 py-5 text-center">
          <div>
            <p className="text-[20px] font-semibold" style={{ color: "#f5e6c8" }}>
              {illumination}%
            </p>
            <p className="text-[9px] uppercase tracking-[0.15em] mt-1" style={{ opacity: 0.35 }}>
              Illuminated
            </p>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div>
            <p className="text-[20px] font-semibold" style={{ color: "#f5e6c8" }}>
              {sign}
            </p>
            <p className="text-[9px] uppercase tracking-[0.15em] mt-1" style={{ opacity: 0.35 }}>
              Sign
            </p>
          </div>
          {moonEvent?.isBlue && (
            <>
              <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
              <div>
                <p className="text-[20px]">🔵</p>
                <p className="text-[9px] uppercase tracking-[0.15em] mt-1" style={{ opacity: 0.35 }}>
                  Blue Moon
                </p>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="px-10 py-2">
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
        </div>

        {/* About this moon */}
        {lore && (
          <div className="py-4">
            <p className="text-[9px] tracking-[0.2em] uppercase mb-2" style={{ opacity: 0.3 }}>
              About {moonName === "Full Moon" || moonName === "New Moon" ? "this moon" : `the ${moonName}`}
            </p>
            <p className="text-[13px] leading-[1.6]" style={{ opacity: 0.65 }}>
              {lore.story}
            </p>
            {lore.energy && (
              <p className="text-[12px] leading-[1.5] italic mt-3" style={{ opacity: 0.45 }}>
                {lore.energy}
              </p>
            )}
          </div>
        )}

        {/* Best for */}
        <div className="pb-4">
          <p className="text-[9px] tracking-[0.2em] uppercase mb-2.5" style={{ opacity: 0.3 }}>Best for</p>
          <div className="flex flex-wrap gap-1.5">
            {bestFor.map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-[11px]"
                style={{ background: "rgba(255,255,255,0.08)", opacity: 0.65 }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Correspondences */}
        {correspondences && (
          <div className="pb-4">
            <p className="text-[9px] tracking-[0.2em] uppercase mb-2.5" style={{ opacity: 0.3 }}>
              Correspondences
            </p>
            <div className="grid grid-cols-2 gap-2">
              <CorrespondenceCard label="Candle" value={`🕯 ${correspondences.candleColor?.color || "White"}`} />
              <CorrespondenceCard label="Crystal" value={`💎 ${correspondences.crystals?.[0]?.name || "Moonstone"}`} />
              <CorrespondenceCard label="Oil" value={`💧 ${correspondences.essentialOils?.[0]?.name || "Jasmine"}`} />
              <CorrespondenceCard label="Chakra" value={`✦ ${correspondences.chakra?.name || "Crown"}`} />
            </div>
          </div>
        )}

        {/* Ritual CTA */}
        {onStartRitual && (
          <div className="py-4">
            <button
              onClick={onStartRitual}
              className="w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.97]"
              style={{
                background: kind === "full"
                  ? "linear-gradient(135deg, #c46a45, #a85a38)"
                  : "linear-gradient(135deg, #5a4a8a, #4a3a7a)",
                color: "#FFF8F0",
              }}
            >
              {kind === "full" ? "Start Full Moon Ritual" : "Set Your Intentions"}
            </button>
          </div>
        )}

        {/* Moons of 2026 */}
        {yearMoons.length > 0 && (
          <div className="pt-4 pb-8">
            <p className="text-[9px] tracking-[0.2em] uppercase mb-3" style={{ opacity: 0.3 }}>
              Moons of {today.getFullYear()}
            </p>
            <MoonsOfYear moons={yearMoons} currentName={moonName} />
          </div>
        )}
      </div>
    </div>
  );
}
