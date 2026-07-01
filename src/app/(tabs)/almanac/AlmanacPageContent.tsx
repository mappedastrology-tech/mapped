"use client";

/**
 * AlmanacPageContent — redesigned daily almanac with new card-based layout.
 *
 * Sections: Header, Moon status bar, Today Is Good For, Skip Today,
 * Why These Picks (collapsible), Your Tracked Categories.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  getTodaySky,
  getGoodForToday,
  getHoldOffToday,
  getActivityDetail,
  getCategoryDefinitions,
  scoreCategoryForDate,
  getWeekData,
  getMonthData,
  type ActivityDetail,
  type ActivityFactor,
  type CategoryDefinition,
  type MonthData,
  type MonthDayCell,
} from "@/lib/almanacData";
import { getCelestialData, DEFAULT_COORDS } from "@/lib/celestialMechanics";
import { supabase } from "@/lib/supabase";
import {
  getCachedLocation,
  fetchUserLocation,
  estimateGardenZone,
  type UserLocation,
} from "@/lib/userLocation";
import { getGardeningData, getPlantingCalendar, USDA_ZONES } from "@/lib/gardeningAlmanac";
import { getZoneFromZip } from "@/lib/zipToZone";
import { getSabianSymbolForDate } from "@/lib/sabianSymbols";
import { getOnThisDay } from "@/lib/onThisDay";
// weatherLore removed — kept in celestialCalendar only
import { getFishingForecast, getUniversalBiteForecast, searchWaterBodies } from "@/lib/fishingForecast";
import { getBodyTiming } from "@/lib/bodyTiming";
import { getDailyEnergy } from "@/lib/celestialCalendar";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const CATEGORIES_KEY = "mapped:almanac-categories";
const CUSTOM_NAMES_KEY = "mapped:almanac-custom-names";
const TRANSITS_KEY = "mapped:transits";
const DEFAULT_CATEGORIES = ["communication", "love", "money", "body", "rest"];

// ─── HELPERS ────────────────────────────────────────────────────────────────

/** Format void-of-course time for the status bar */
function formatVocTime(timeStr: string): string {
  // timeStr is like "2:15 PM" — just return the hour:min portion
  return timeStr.replace(/\s?(AM|PM)/i, (_, p) => p.toLowerCase() === "am" ? "" : "");
}

/** Convert a slug like "filming-tiktok-videos" to "Filming Tiktok Videos" */
function unslugify(slug: string): string {
  return slug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── INLINE SVG ICONS ───────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}


function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// ─── DETAIL VIEW ICONS ─────────────────────────────────────────────────────

function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FactorMoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function FactorPlanetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function FactorRetrogradeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14l-4 4 4 4" />
      <path d="M5 18h14a4 4 0 0 0 0-8H9" />
      <circle cx="9" cy="6" r="3" />
    </svg>
  );
}

function FactorVoidIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function getFactorIcon(icon: ActivityFactor["icon"]) {
  switch (icon) {
    case "moon": return <FactorMoonIcon />;
    case "planet": return <FactorPlanetIcon />;
    case "retrograde": return <FactorRetrogradeIcon />;
    case "void": return <FactorVoidIcon />;
    default: return <FactorPlanetIcon />;
  }
}

// ─── ACTIVITY DETAIL VIEW ──────────────────────────────────────────────────

function ActivityDetailView({
  detail,
  transitData,
  onClose,
}: {
  detail: ActivityDetail;
  transitData: string | null;
  onClose: () => void;
}) {
  const isGood = detail.type === "good";
  const accentColor = isGood ? "var(--sage)" : "var(--terracotta)";

  // Parse transit data
  let personalTransitText: string | null = null;
  if (transitData) {
    try {
      const data = JSON.parse(transitData);
      if (data && typeof data === "object") {
        if (data.summary) personalTransitText = data.summary as string;
        else if (data.transits && Array.isArray(data.transits) && data.transits.length > 0) {
          personalTransitText = (data.transits[0].interpretation as string) || null;
        }
      }
    } catch {
      /* no-op */
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        background: "var(--background)",
        overflowY: "auto",
      }}
    >

      <div className="max-w-lg mx-auto w-full px-5 py-5 pb-10 flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{
              color: "var(--foreground)",
              background: "color-mix(in srgb, var(--foreground) 5%, transparent)",
            }}
            aria-label="Back"
          >
            <BackArrowIcon />
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{
              color: "var(--foreground-muted)",
              background: "color-mix(in srgb, var(--foreground) 5%, transparent)",
            }}
            aria-label="Bookmark"
          >
            <BookmarkIcon />
          </button>
        </header>

        {/* Title */}
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1.5"
            style={{ color: accentColor }}
          >
            {isGood ? "Today Is Good For" : "Skip Today"}
          </p>
          <h2
            className="text-[26px] leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            {detail.activity}
          </h2>
        </div>

        {/* Score */}
        <div
          className="rounded-xl px-5 py-5"
          style={{
            background: "var(--background-card)",
            border: "1px solid var(--border-card)",
          }}
        >
          <div className="flex items-baseline gap-2 mb-3">
            <span
              className="text-[36px] font-bold tabular-nums"
              style={{ fontFamily: "var(--font-display)", color: "var(--foreground-on-card)" }}
            >
              {detail.score.toFixed(1)}
            </span>
            <span
              className="text-[16px]"
              style={{ color: "var(--foreground-on-card-faint)" }}
            >
              / 10
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden mb-3"
            style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(detail.score / 10) * 100}%`,
                background: accentColor,
              }}
            />
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card-muted)" }}>
            {detail.scoreContext}
          </p>
        </div>

        {/* Factors */}
        <section>
          <p
            className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
            style={{ color: "var(--foreground-muted)" }}
          >
            {isGood ? "Why The Sky Agrees" : "Why To Skip"}
          </p>
          <div className="flex flex-col gap-3">
            {detail.factors.map((factor, i) => (
              <div
                key={i}
                className="rounded-xl px-4 py-3.5"
                style={{
                  background: "var(--background-card)",
                  border: "1px solid var(--border-card)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: factor.weight >= 0 ? "var(--sage)" : "var(--terracotta)" }}>
                    {getFactorIcon(factor.icon)}
                  </span>
                  <span className="flex-1 text-[14px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                    {factor.label}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: factor.weight >= 0
                        ? "color-mix(in srgb, var(--sage) 12%, transparent)"
                        : "color-mix(in srgb, var(--terracotta) 12%, transparent)",
                      color: factor.weight >= 0 ? "var(--sage)" : "var(--terracotta)",
                    }}
                  >
                    {factor.weight >= 0 ? "Helps" : "Hinders"} {factor.weight >= 0 ? "+" : "−"}{Math.abs(factor.weight).toFixed(1)}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed mt-2 ml-[30px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                  {factor.description}
                </p>
                {factor.timing && (
                  <p className="text-[11px] mt-1 ml-[30px]" style={{ color: "var(--foreground-on-card-faint)" }}>
                    {factor.timing}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Best Window (good items only) */}
        {detail.bestWindow && (
          <section>
            <p
              className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
              style={{ color: "var(--foreground-muted)" }}
            >
              Best Window
            </p>
            <div
              className="rounded-xl px-5 py-4 flex items-center gap-4"
              style={{
                background: "color-mix(in srgb, var(--sage) 8%, var(--background-card))",
                border: "1px solid color-mix(in srgb, var(--sage) 15%, transparent)",
              }}
            >
              <div className="flex-1">
                <p
                  className="text-[20px] font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--foreground-on-card)" }}
                >
                  {detail.bestWindow.start} – {detail.bestWindow.end}
                </p>
                <p className="text-[12px] mt-1" style={{ color: "var(--foreground-on-card-muted)" }}>
                  {detail.bestWindow.reason}
                </p>
              </div>
              <span style={{ color: "var(--foreground-on-card-faint)" }}>
                <BellIcon />
              </span>
            </div>
          </section>
        )}

        {/* For Your Chart Specifically */}
        <section>
          <p
            className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
            style={{ color: "var(--sage)" }}
          >
            For Your Chart Specifically
          </p>
          <div
            className="rounded-xl px-4 py-4"
            style={{
              background: "color-mix(in srgb, var(--sage) 6%, var(--background-card))",
              border: "1px solid color-mix(in srgb, var(--sage) 12%, transparent)",
            }}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5" style={{ color: "var(--sage)" }}>
                <StarIcon />
              </span>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>
                {personalTransitText || detail.personalTransit || `Moon hits your ${detail.activity.toLowerCase()}-related houses today. This is personally amplified for your chart — not just a general read.`}
              </p>
            </div>
          </div>
        </section>

        {/* From Your History */}
        {detail.historyNote && (
          <section>
            <p
              className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
              style={{ color: "var(--foreground-muted)" }}
            >
              From Your History
            </p>
            <div
              className="rounded-xl px-4 py-3.5 flex items-start gap-3"
              style={{
                background: "var(--background-card)",
                border: "1px solid var(--border-card)",
              }}
            >
              <span className="mt-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>
                <ClockIcon />
              </span>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card-muted)" }}>
                {detail.historyNote}
              </p>
            </div>
          </section>
        )}

        {/* Action Button */}
        <div className="mt-2">
          <button
            className="w-full rounded-xl py-3.5 text-[14px] font-semibold flex items-center justify-center gap-2"
            style={{
              background: "var(--background-card)",
              border: "1px solid var(--border-card)",
              color: "var(--foreground-on-card)",
            }}
          >
            <CalendarIcon />
            Add to calendar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COLLAPSIBLE DRAWER ─────────────────────────────────────────────────────

/** Small (i) icon that reveals an inline explainer on tap */
function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Position the popover when opened
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const popW = 260;
    // Center below the button, clamped to viewport
    let left = r.left + r.width / 2 - popW / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - popW - 12));
    setPos({ top: r.bottom + 6, left });
  }, [open]);

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        popRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    const closeScroll = () => setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close as EventListener);
    window.addEventListener("scroll", closeScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close as EventListener);
      window.removeEventListener("scroll", closeScroll, true);
    };
  }, [open]);

  return (
    <span className="inline-block align-middle ml-1">
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="inline-flex items-center justify-center w-[15px] h-[15px] rounded-full"
        style={{
          background: open
            ? "color-mix(in srgb, var(--brass) 30%, transparent)"
            : "color-mix(in srgb, var(--foreground) 10%, transparent)",
          color: open ? "var(--brass)" : "var(--foreground-muted)",
          fontSize: "8px",
          fontWeight: 700,
          lineHeight: 1,
        }}
        aria-label="More info"
      >
        i
      </button>
      {open && pos && typeof document !== "undefined" && createPortal(
        <div
          ref={popRef}
          className="rounded-lg px-3.5 py-3 shadow-xl"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 260,
            zIndex: 9999,
            background: "var(--background-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          }}
        >
          <p
            className="text-[11px] leading-[1.65]"
            style={{
              color: "var(--foreground-muted)",
              fontWeight: 400,
              textTransform: "none",
              letterSpacing: "0",
              fontFamily: "Georgia, 'Times New Roman', serif",
              margin: 0,
            }}
          >
            {text}
          </p>
        </div>,
        document.body,
      )}
    </span>
  );
}

function AlmanacDrawer({
  title,
  icon,
  preview,
  children,
}: {
  title: string;
  icon?: string;
  preview?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: "var(--background-card)",
        border: open
          ? "1px solid color-mix(in srgb, var(--brass) 25%, transparent)"
          : "1px solid var(--border-card)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        {icon && <span className="text-[16px] shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
            {title}
          </p>
          {!open && preview && (
            <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--foreground-on-card-faint)" }}>
              {preview}
            </p>
          )}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="shrink-0 transition-transform duration-200"
          style={{
            color: "var(--foreground-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="grid transition-all duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid var(--border-card)" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Always-visible section wrapper (no collapse) */
function AlmanacSection({
  title,
  icon,
  color,
  defaultOpen,
  children,
}: {
  title: string;
  icon?: string;
  color?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p
        className="text-[10px] uppercase tracking-[0.15em] font-bold mb-2"
        style={{ color: color || "var(--foreground-muted)" }}
      >
        {icon && <span className="mr-1.5">{icon}</span>}{title}
      </p>
      {children}
    </section>
  );
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function AlmanacPageContent() {
  const today = useMemo(() => new Date(), []);

  // ── User location (profile → birth chart fallback; DEFAULT_COORDS last) ───
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid || cancelled) return;
        const cached = getCachedLocation(uid);
        if (cached && !cancelled) setUserLocation(cached);
        const fresh = await fetchUserLocation(uid);
        if (fresh && !cancelled) setUserLocation(fresh);
      } catch {
        // signed out / offline — fall back to DEFAULT_COORDS
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const coords = useMemo(
    () => (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : DEFAULT_COORDS),
    [userLocation]
  );
  // Below the equator, month-keyed gardening data shifts by six months
  const isSouthernHemisphere = coords.lat < 0;

  // ── Data ──────────────────────────────────────────────────────────────────
  const sky = useMemo(() => getTodaySky(today, coords), [today, coords]);
  const goodFor = useMemo(() => getGoodForToday(today), [today]);
  const holdOff = useMemo(() => getHoldOffToday(today), [today]);
  const celestial = useMemo(() => getCelestialData(today, coords.lat, coords.lng), [today, coords]);
  const [gardenZone, setGardenZone] = useState<string>(() => {
    if (typeof window === "undefined") return "8b";
    return localStorage.getItem("mapped:garden-zone") || "8b";
  });
  const gardening = useMemo(
    () => getGardeningData(today, sky.moonSign, sky.moonPhase.phase, gardenZone, isSouthernHemisphere),
    [today, sky.moonSign, sky.moonPhase.phase, gardenZone, isSouthernHemisphere]
  );

  // No explicit zone saved — estimate from the user's location once it loads
  useEffect(() => {
    if (!userLocation) return;
    try {
      if (!localStorage.getItem("mapped:garden-zone")) {
        setGardenZone(estimateGardenZone(userLocation.lat));
      }
    } catch {
      // localStorage unavailable — keep current zone
    }
  }, [userLocation]);
  const [gardenZip, setGardenZip] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("mapped:garden-zip") || "";
  });
  const [fishingLocation, setFishingLocation] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("mapped:fishing-location") || "";
  });
  const [fishingSearch, setFishingSearch] = useState("");
  const [fishingSearchOpen, setFishingSearchOpen] = useState(false);
  const plantingCal = useMemo(() => {
    const vocEnd = sky.voidOfCourseMoon?.end;
    return getPlantingCalendar(today, sky.moonSign, sky.moonPhase.phase, vocEnd, gardenZone, isSouthernHemisphere);
  }, [today, sky, gardenZone, isSouthernHemisphere]);
  const weekData = useMemo(() => getWeekData(today), [today]);
  const sabianSymbol = useMemo(() => getSabianSymbolForDate(today), [today]);
  const onThisDay = useMemo(() => getOnThisDay(today), [today]);
  // weatherLore drawer removed
  const fishingForecast = useMemo(() => getFishingForecast(today, fishingLocation || undefined), [today, fishingLocation]);
  // Moon-based bite data is pure astronomy — works anywhere, even without a US water body
  const universalBite = useMemo(() => getUniversalBiteForecast(today), [today]);
  const fishingBite = fishingForecast ?? universalBite;
  const dailyEnergy = useMemo(() => getDailyEnergy(today), [today]);
  const [bodyTimingDate, setBodyTimingDate] = useState<Date>(() => new Date());
  const bodyTiming = useMemo(() => getBodyTiming(bodyTimingDate), [bodyTimingDate]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const [monthCategoryFilter, setMonthCategoryFilter] = useState<string | null>(null);
  const [monthFilterOpen, setMonthFilterOpen] = useState(false);
  const [monthSelectedDay, setMonthSelectedDay] = useState<MonthDayCell | null>(null);
  const [expandedStrengthDay, setExpandedStrengthDay] = useState<number | null>(null); // dayNum of expanded row
  const [showTwilightDetail, setShowTwilightDetail] = useState(false);
  const [showMoonDetail, setShowMoonDetail] = useState(false);
  const [showGardeningTasks, setShowGardeningTasks] = useState(false);
  const [showZonePicker, setShowZonePicker] = useState(false);

  // ── Month data ───────────────────────���──────────────────────────────���─────
  const monthData = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return getMonthData(d.getFullYear(), d.getMonth(), monthCategoryFilter || undefined);
  }, [today, monthOffset, monthCategoryFilter]);
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [showCategoryLibrary, setShowCategoryLibrary] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [transitData, setTransitData] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ActivityDetail | null>(null);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set(["Best For"]));

  // Load categories + custom display names from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CATEGORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        }
      }
      const names = localStorage.getItem(CUSTOM_NAMES_KEY);
      if (names) {
        const parsed = JSON.parse(names);
        if (parsed && typeof parsed === "object") {
          setCustomNames(parsed);
        }
      }
    } catch {
      /* no-op */
    }
  }, []);

  // Load transit data from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(TRANSITS_KEY);
      if (stored) {
        setTransitData(stored);
      }
    } catch {
      /* no-op */
    }
  }, []);

  // Save categories
  const saveCategories = useCallback((cats: string[]) => {
    setCategories(cats);
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
    } catch {
      /* no-op */
    }
  }, []);

  const handleAddCategory = useCallback((catId: string) => {
    if (!categories.includes(catId)) {
      saveCategories([...categories, catId]);
    }
  }, [categories, saveCategories]);

  const handleRemoveCategory = useCallback((catId: string) => {
    saveCategories(categories.filter(c => c !== catId));
  }, [categories, saveCategories]);

  const handleAddCustomCategory = useCallback(() => {
    const trimmed = customCategoryInput.trim();
    if (trimmed) {
      const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (id && !categories.includes(id)) {
        saveCategories([...categories, id]);
        // Store the original display name for custom categories
        const updated = { ...customNames, [id]: trimmed };
        setCustomNames(updated);
        try {
          localStorage.setItem(CUSTOM_NAMES_KEY, JSON.stringify(updated));
        } catch { /* no-op */ }
      }
    }
    setCustomCategoryInput("");
  }, [customCategoryInput, categories, saveCategories, customNames]);

  const toggleDomain = useCallback((domain: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }, []);

  const toggleTier = useCallback((tier: string) => {
    setExpandedTiers(prev => {
      const next = new Set(prev);
      if (next.has(tier)) next.delete(tier);
      else next.add(tier);
      return next;
    });
  }, []);

  const handleOpenDetail = useCallback((activity: string, type: "good" | "skip") => {
    const detail = getActivityDetail(activity, type, today, sky.moonSign, sky);
    // Inject transit data if available
    if (transitData) {
      try {
        const data = JSON.parse(transitData);
        if (data && typeof data === "object") {
          if (data.summary) detail.personalTransit = data.summary as string;
          else if (data.transits && Array.isArray(data.transits) && data.transits.length > 0) {
            detail.personalTransit = (data.transits[0].interpretation as string) || null;
          }
        }
      } catch {
        /* no-op */
      }
    }
    setSelectedDetail(detail);
  }, [today, sky, transitData]);

  // ── Formatted values ──────────────────────────────────────────────────────
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const dateLabel = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const moonPhaseLabel = sky.moonPhase.label;
  const moonIllumination = sky.moonPhase.illumination;

  // Generate astrological reason lines for good-for items
  const goodForReasons = useMemo(() => {
    const reasons = [
      `${sky.moonSign} Moon · honesty lands`,
      `2nd house · Venus trine`,
      `${sky.moonSignElement} energy · flow state`,
      `${sky.planetaryRuler.planet} day · momentum`,
      `${sky.moonSign} depth · clarity rises`,
    ];
    return reasons;
  }, [sky]);

  // Generate reasons for skip-today items
  const skipReasons = useMemo(() => {
    const reasons: string[] = [];
    if (sky.voidOfCourseMoon) {
      reasons.push(`Moon void after ${formatVocTime(sky.voidOfCourseMoon.start)}`);
    }
    reasons.push("Venus square Saturn");
    reasons.push(`${sky.moonSign} intensity · wait`);
    return reasons;
  }, [sky]);

  // Personal transit interpretation — always returns meaningful content
  const transitInterpretation = useMemo(() => {
    // Try parsing real transit data first
    if (transitData) {
      try {
        const data = JSON.parse(transitData);
        if (data && typeof data === "object") {
          if (data.summary) return data.summary as string;
          if (data.transits && Array.isArray(data.transits) && data.transits.length > 0) {
            const interp = data.transits[0].interpretation as string;
            if (interp) return interp;
          }
        }
      } catch {
        /* no-op */
      }
    }
    // Generate a meaningful fallback from the sky data we already have
    const element = sky.moonSignElement;
    const ruler = sky.planetaryRuler;
    const phase = sky.moonPhase;
    const isWaxing = phase.phase.startsWith("waxing") || phase.phase === "new" || phase.phase === "first-quarter";
    const elementDescriptions: Record<string, string> = {
      fire: "energy is high and instincts are sharp — trust quick decisions today",
      water: "emotional intelligence is running the show — feelings are data, not noise",
      earth: "practical moves land well today — tangible progress over abstract planning",
      air: "communication channels are open — words carry more weight than usual",
    };
    const phaseNote = isWaxing
      ? "The waxing phase adds momentum to anything you start."
      : "The waning phase supports clearing out what's not working.";
    return `${sky.moonSign} Moon with ${ruler.planet} ruling the day. ${elementDescriptions[element] || "balanced energy today"}. ${phaseNote}`;
  }, [transitData, sky]);

  // Category scores
  const categoryScores = useMemo(() => {
    const allDefs = getCategoryDefinitions();
    return categories.map((catId) => {
      const def = allDefs.find(d => d.id === catId);
      const result = scoreCategoryForDate(catId, today, sky);
      return {
        id: catId,
        name: def?.name || customNames[catId] || unslugify(catId),
        score: result.score,
        topFactor: result.topFactor,
      };
    });
  }, [categories, today, sky, customNames]);

  // Group categories into score tiers (sorted descending within each)
  const scoreTiers = useMemo(() => {
    const sorted = [...categoryScores].sort((a, b) => b.score - a.score);
    const best = sorted.filter(c => c.score >= 7.0);
    const good = sorted.filter(c => c.score >= 5.0 && c.score < 7.0);
    const notIdeal = sorted.filter(c => c.score < 5.0);
    return [
      { label: "Best For", emoji: "✦", items: best },
      { label: "Good For", emoji: "○", items: good },
      { label: "Not Ideal", emoji: "—", items: notIdeal },
    ].filter(t => t.items.length > 0);
  }, [categoryScores]);

  // Category library grouped by domain
  const categoryLibrary = useMemo(() => {
    const allDefs = getCategoryDefinitions();
    const domains = new Map<string, CategoryDefinition[]>();
    for (const def of allDefs) {
      if (def.isBase) continue; // base categories shown separately
      const existing = domains.get(def.domain) || [];
      existing.push(def);
      domains.set(def.domain, existing);
    }
    return domains;
  }, []);

  const baseCategoriesNotTracked = useMemo(() => {
    const allDefs = getCategoryDefinitions();
    return allDefs.filter(d => d.isBase && !categories.includes(d.id));
  }, [categories]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main
      className="flex-1 flex flex-col"
      style={{ color: "var(--foreground)" }}
    >
      <div className="max-w-lg mx-auto w-full px-5 py-5 pb-4 flex flex-col gap-5">
        {/* ━━━ Header ━━━ */}
        <header className="pt-1">
          <p
            className="text-[11px] uppercase tracking-[0.18em] font-bold mb-1"
            style={{ color: "var(--foreground-muted)" }}
          >
            {viewMode === "month" ? "THIS MONTH" : viewMode === "week" ? "THIS WEEK" : dayOfWeek}
          </p>
          <h1
            className="text-[32px] leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            {viewMode === "month" ? monthData.monthLabel : viewMode === "week" ? weekData.rangeLabel : dateLabel}
          </h1>
        </header>

        {/* ━━━ View Mode Tabs ━━━ */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{
            background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
            border: "1px solid var(--border-card)",
          }}
        >
          {(["day", "week", "month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex-1 py-2 text-[13px] font-semibold capitalize transition-colors"
              style={{
                background: viewMode === mode ? "var(--background-card)" : "transparent",
                color: viewMode === mode ? "var(--foreground)" : "var(--foreground-muted)",
                boxShadow: viewMode === mode ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ━━━ WEEK VIEW ━━━ */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {viewMode === "week" && (
          <>
            {/* Headline event card */}
            <div
              className="rounded-xl px-4 py-4 flex items-start gap-3"
              style={{
                background: "color-mix(in srgb, var(--sage) 8%, var(--background-card))",
                border: "1px solid color-mix(in srgb, var(--sage) 18%, transparent)",
              }}
            >
              <span className="text-[16px] mt-0.5" style={{ color: "var(--sage)" }}>◉</span>
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.15em] font-bold mb-1.5"
                  style={{ color: "var(--sage)" }}
                >
                  {weekData.headline.title}
                </p>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "var(--foreground-on-card)" }}
                >
                  {weekData.headline.body}
                </p>
              </div>
            </div>

            {/* Daily Strength section */}
            <section>
              <p
                className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
                style={{ color: "var(--foreground-muted)" }}
              >
                Daily Strength
              </p>

              <div className="flex flex-col">
                {weekData.days.map((day, i) => {
                  const barWidth = Math.max(15, (day.score / 10) * 100);
                  const barColor = day.score >= 7 ? "var(--sage)" : day.score >= 5 ? "var(--sage)" : "var(--terracotta)";
                  const isEvent = day.isEventDay;

                  const isExpanded = expandedStrengthDay === day.dayNum;

                  return (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedStrengthDay(isExpanded ? null : day.dayNum)}
                        className="flex items-center gap-3 py-3.5 text-left w-full"
                        style={{
                          borderBottom: !isExpanded && i < 6 ? "1px solid var(--border-card)" : "none",
                          background: isEvent ? "color-mix(in srgb, var(--amber) 6%, transparent)" : "transparent",
                          borderRadius: isEvent || isExpanded ? "8px 8px 0 0" : "0",
                          paddingLeft: isEvent ? "8px" : "0",
                          paddingRight: isEvent ? "8px" : "0",
                          marginTop: isEvent ? "4px" : "0",
                        }}
                      >
                        {/* Day label + number */}
                        <div className="w-[48px] shrink-0">
                          <p
                            className="text-[11px] font-bold uppercase"
                            style={{ color: isEvent ? "var(--amber)" : "var(--foreground-muted)" }}
                          >
                            {day.dayLabel}
                          </p>
                          <p
                            className="text-[20px] font-bold leading-tight"
                            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
                          >
                            {day.dayNum}
                          </p>
                        </div>

                        {/* Moon icon */}
                        <span className="text-[14px] shrink-0" style={{ opacity: 0.5 }}>
                          {day.moonIcon}
                        </span>

                        {/* Verdict + bar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p
                              className="text-[13px] font-medium truncate flex-1"
                              style={{ color: "var(--foreground)" }}
                            >
                              {day.verdict}
                            </p>
                            {day.eventTag && (
                              <span
                                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                                style={{
                                  background: day.eventTag === "TODAY"
                                    ? "color-mix(in srgb, var(--sage) 15%, transparent)"
                                    : "color-mix(in srgb, var(--amber) 15%, transparent)",
                                  color: day.eventTag === "TODAY" ? "var(--sage)" : "var(--amber)",
                                }}
                              >
                                {day.eventTag}
                              </span>
                            )}
                          </div>
                          {day.eventNote && (
                            <p
                              className="text-[11px] mb-1"
                              style={{ color: "var(--foreground-muted)" }}
                            >
                              {day.eventNote}
                            </p>
                          )}
                          {/* Score bar */}
                          <div
                            className="h-[4px] rounded-full overflow-hidden"
                            style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${barWidth}%`,
                                background: barColor,
                              }}
                            />
                          </div>
                        </div>

                        {/* Score number + chevron */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className="text-[16px] font-bold tabular-nums w-[32px] text-right"
                            style={{
                              fontFamily: "var(--font-display)",
                              color: day.score >= 7 ? "var(--sage)" : day.score >= 5 ? "var(--foreground)" : "var(--terracotta)",
                            }}
                      >
                            {day.score.toFixed(1)}
                          </span>
                          <svg
                            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            className="transition-transform duration-200"
                            style={{
                              color: "var(--foreground-muted)",
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded score factors */}
                      {isExpanded && day.scoreFactors && (
                        <div
                          className="px-3 pb-3 pt-1"
                          style={{
                            background: "color-mix(in srgb, var(--foreground) 3%, transparent)",
                            borderRadius: "0 0 8px 8px",
                            borderBottom: i < 6 ? "1px solid var(--border-card)" : "none",
                            marginBottom: isEvent ? "4px" : "0",
                          }}
                        >
                          <p
                            className="text-[10px] uppercase tracking-[0.12em] font-bold mb-2"
                            style={{ color: "var(--foreground-muted)" }}
                          >
                            Why {day.score.toFixed(1)}?
                          </p>
                          <div className="flex flex-col gap-2">
                            {day.scoreFactors.map((f, fi) => (
                              <div key={fi} className="flex items-start gap-2">
                                <span
                                  className="shrink-0 text-[8px] font-bold uppercase tracking-wider mt-[3px] px-1 py-0.5 rounded"
                                  style={{
                                    background: f.effect === "boost"
                                      ? "color-mix(in srgb, var(--sage) 15%, transparent)"
                                      : f.effect === "drag"
                                      ? "color-mix(in srgb, var(--terracotta) 15%, transparent)"
                                      : "color-mix(in srgb, var(--foreground) 8%, transparent)",
                                    color: f.effect === "boost" ? "var(--sage)"
                                      : f.effect === "drag" ? "var(--terracotta)"
                                      : "var(--foreground-muted)",
                                  }}
                                >
                                  {f.effect === "boost" ? "↑" : f.effect === "drag" ? "↓" : "·"}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-[12px] font-medium" style={{ color: "var(--foreground)" }}>
                                    {f.label}
                                  </p>
                                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                                    {f.detail}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Windows to Catch */}
            {weekData.windows.length > 0 && (
              <section>
                <p
                  className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Windows to Catch
                </p>
                <div className="flex flex-col gap-3">
                  {weekData.windows.map((w, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className="shrink-0 text-[8px] font-bold uppercase tracking-wider mt-[5px] px-1.5 py-0.5 rounded"
                        style={{
                          background: w.color === "green"
                            ? "color-mix(in srgb, var(--sage) 15%, transparent)"
                            : w.color === "amber"
                            ? "color-mix(in srgb, var(--amber) 15%, transparent)"
                            : "color-mix(in srgb, var(--terracotta) 15%, transparent)",
                          color: w.color === "green" ? "var(--sage)"
                            : w.color === "amber" ? "var(--amber)"
                            : "var(--terracotta)",
                        }}
                      >
                        {w.color === "green" ? "Good" : w.color === "amber" ? "Mixed" : "Avoid"}
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
                          {w.label}
                        </p>
                        <p className="text-[12px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                          {w.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Personal Lookahead */}
            <div
              className="rounded-xl px-4 py-4"
              style={{
                background: "color-mix(in srgb, var(--sage) 6%, var(--background-card))",
                border: "1px solid color-mix(in srgb, var(--sage) 12%, transparent)",
              }}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5" style={{ color: "var(--sage)" }}>
                  <StarIcon />
                </span>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.12em] font-bold mb-1.5"
                    style={{ color: "var(--sage)" }}
                  >
                    {weekData.personal.title}
                  </p>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "var(--foreground-on-card)" }}
                  >
                    {weekData.personal.body}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ━━━ MONTH VIEW ━━━ */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {viewMode === "month" && (
          <div className="flex flex-col gap-4">
            {/* ── Month Navigation ── */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMonthOffset(o => o - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}
                aria-label="Previous month"
              >
                <span style={{ color: "var(--foreground)" }}>‹</span>
              </button>
              <h2
                className="text-[18px] font-semibold"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
              >
                {monthData.monthLabel}
              </h2>
              <button
                onClick={() => setMonthOffset(o => o + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}
                aria-label="Next month"
              >
                <span style={{ color: "var(--foreground)" }}>›</span>
              </button>
            </div>

            {/* ── Category Filter Dropdown ── */}
            <div className="relative">
              <button
                onClick={() => setMonthFilterOpen(!monthFilterOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-semibold transition-all"
                style={{
                  background: "var(--background-card)",
                  border: "1px solid var(--border-card)",
                  color: "var(--foreground)",
                }}
              >
                <span style={{ color: "var(--foreground-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Showing
                </span>
                <span style={{ color: "var(--accent-brass)" }}>
                  {monthCategoryFilter
                    ? (() => {
                        const allDefs = getCategoryDefinitions();
                        const def = allDefs.find(d => d.id === monthCategoryFilter);
                        return def?.name || customNames[monthCategoryFilter] || unslugify(monthCategoryFilter);
                      })()
                    : "Overall Energy"}
                </span>
                <span style={{ color: "var(--foreground-muted)", fontSize: 14 }}>
                  {monthFilterOpen ? "▴" : "▾"}
                </span>
              </button>
              {monthFilterOpen && (
                <div
                  className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg overflow-hidden shadow-lg"
                  style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}
                >
                  <button
                    onClick={() => { setMonthCategoryFilter(null); setMonthFilterOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-[12px] font-medium transition-colors"
                    style={{
                      color: !monthCategoryFilter ? "var(--accent-brass)" : "var(--foreground)",
                      background: !monthCategoryFilter ? "rgba(201, 169, 97, 0.08)" : "transparent",
                    }}
                  >
                    Overall Energy
                  </button>
                  {categories.map(catId => {
                    const allDefs = getCategoryDefinitions();
                    const def = allDefs.find(d => d.id === catId);
                    const name = def?.name || customNames[catId] || unslugify(catId);
                    const isActive = monthCategoryFilter === catId;
                    return (
                      <button
                        key={catId}
                        onClick={() => { setMonthCategoryFilter(catId); setMonthFilterOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-[12px] font-medium transition-colors"
                        style={{
                          color: isActive ? "var(--accent-brass)" : "var(--foreground)",
                          background: isActive ? "rgba(201, 169, 97, 0.08)" : "transparent",
                        }}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Heatmap Calendar ── */}
            <div
              className="rounded-xl p-3"
              style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}
            >
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div
                    key={i}
                    className="text-center text-[10px] font-semibold py-1"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              {monthData.weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-[2px]">
                  {week.map((cell, di) => {
                    const HEATMAP_COLORS = [
                      "rgba(90, 31, 26, 0.65)",    // 0: oxblood/low
                      "rgba(74, 37, 64, 0.45)",    // 1: plum muted
                      "rgba(201, 169, 97, 0.22)",  // 2: brass neutral
                      "rgba(45, 64, 41, 0.50)",    // 3: forest
                      "rgba(90, 122, 58, 0.65)",   // 4: sage/high
                    ];
                    return (
                      <button
                        key={di}
                        onClick={() => {
                          if (cell.isCurrentMonth) {
                            setMonthSelectedDay(monthSelectedDay?.dayNum === cell.dayNum ? null : cell);
                          }
                        }}
                        className="relative aspect-square flex items-center justify-center rounded-md transition-all"
                        style={{
                          background: cell.isCurrentMonth ? HEATMAP_COLORS[cell.colorLevel] : "transparent",
                          opacity: cell.isCurrentMonth ? 1 : 0.3,
                          border: monthSelectedDay?.dayNum === cell.dayNum && cell.isCurrentMonth
                            ? "2px solid var(--foreground)"
                            : cell.isToday ? "2px solid var(--accent-brass)" : "1px solid transparent",
                        }}
                        aria-label={`${cell.dayNum}, score ${cell.score}`}
                      >
                        <span
                          className="text-[12px] font-medium"
                          style={{ color: cell.isCurrentMonth ? "var(--foreground)" : "var(--foreground-muted)" }}
                        >
                          {cell.dayNum}
                        </span>
                        {/* Event dot */}
                        {cell.hasEvent && cell.isCurrentMonth && (
                          <span
                            className="absolute bottom-[3px] right-[3px] w-[5px] h-[5px] rounded-full"
                            style={{
                              background: cell.eventDotColor === "red" ? "var(--oxblood-light)" :
                                cell.eventDotColor === "amber" ? "var(--accent-brass)" : "var(--foreground-muted)",
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-center gap-1 mt-3 pt-2" style={{ borderTop: "1px solid var(--border-card)" }}>
                <span className="text-[9px] mr-1" style={{ color: "var(--foreground-muted)" }}>Low</span>
                {[0, 1, 2, 3, 4].map(level => (
                  <span
                    key={level}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      background: [
                        "rgba(90, 31, 26, 0.65)",
                        "rgba(74, 37, 64, 0.45)",
                        "rgba(201, 169, 97, 0.22)",
                        "rgba(45, 64, 41, 0.50)",
                        "rgba(90, 122, 58, 0.65)",
                      ][level],
                    }}
                  />
                ))}
                <span className="text-[9px] ml-1" style={{ color: "var(--foreground-muted)" }}>High</span>
              </div>
            </div>

            {/* ── Selected Day Detail ── */}
            {monthSelectedDay && (
              <div
                className="rounded-xl p-4 transition-all"
                style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
                    {monthSelectedDay.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </h3>
                  <span
                    className="text-[12px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: monthSelectedDay.colorLevel >= 3
                        ? "color-mix(in srgb, var(--sage) 15%, transparent)"
                        : monthSelectedDay.colorLevel <= 1
                        ? "color-mix(in srgb, var(--terracotta) 15%, transparent)"
                        : "color-mix(in srgb, var(--foreground) 8%, transparent)",
                      color: monthSelectedDay.colorLevel >= 3 ? "var(--sage-light)" : monthSelectedDay.colorLevel <= 1 ? "var(--oxblood-light)" : "var(--foreground-muted)",
                    }}
                  >
                    {monthSelectedDay.colorLevel >= 3 ? "Strong" : monthSelectedDay.colorLevel <= 1 ? "Low" : "Neutral"} {monthSelectedDay.score}
                  </span>
                </div>
                <p className="text-[12px] mb-2" style={{ color: "var(--foreground-muted)" }}>
                  {(() => {
                    const sky = getTodaySky(monthSelectedDay.date, coords);
                    return `Moon in ${sky.moonSign} · ${sky.planetaryRuler.planet} day · ${sky.moonPhase.phase.replace("-", " ")}`;
                  })()}
                </p>
                {monthSelectedDay.hasEvent && (
                  <p className="text-[11px] px-2 py-1 rounded-md inline-block" style={{ background: "rgba(90, 31, 26, 0.2)", color: "var(--oxblood-light)" }}>
                    {monthData.events.find(e => e.date.getDate() === monthSelectedDay!.dayNum)?.name || "Celestial event"}
                  </p>
                )}
                <button
                  onClick={() => setMonthSelectedDay(null)}
                  className="mt-2 text-[10px] uppercase tracking-wide"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* ── Peak & Low Cards ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Peak */}
              <button
                onClick={() => {
                  // Find peak day cell and select it
                  for (const week of monthData.weeks) {
                    const found = week.find(c => c.isCurrentMonth && c.score === monthData.peakDay.score);
                    if (found) { setMonthSelectedDay(found); break; }
                  }
                }}
                className="rounded-xl p-3 text-left transition-all active:scale-[0.98]"
                style={{ background: "rgba(45, 64, 41, 0.3)", border: "1px solid rgba(90, 122, 58, 0.35)" }}
              >
                <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: "var(--sage-light)" }}>
                  {monthData.peakDay.label}
                </p>
                <p className="text-[15px] font-semibold" style={{ color: "var(--foreground)" }}>
                  {monthData.peakDay.dateStr}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                  {monthData.peakDay.reason}
                </p>
                <p className="text-[18px] font-bold mt-1" style={{ color: "var(--sage-light)" }}>
                  {monthData.peakDay.score}
                </p>
              </button>
              {/* Low */}
              <button
                onClick={() => {
                  for (const week of monthData.weeks) {
                    const found = week.find(c => c.isCurrentMonth && c.score === monthData.lowDay.score);
                    if (found) { setMonthSelectedDay(found); break; }
                  }
                }}
                className="rounded-xl p-3 text-left transition-all active:scale-[0.98]"
                style={{ background: "rgba(90, 31, 26, 0.2)", border: "1px solid rgba(122, 48, 40, 0.35)" }}
              >
                <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: "var(--oxblood-light)" }}>
                  {monthData.lowDay.label}
                </p>
                <p className="text-[15px] font-semibold" style={{ color: "var(--foreground)" }}>
                  {monthData.lowDay.dateStr}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                  {monthData.lowDay.reason}
                </p>
                <p className="text-[18px] font-bold mt-1" style={{ color: "var(--oxblood-light)" }}>
                  {monthData.lowDay.score}
                </p>
              </button>
            </div>

            {/* ── Mark Your Calendar (Events Timeline) ── */}
            {monthData.events.length > 0 && (
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}
              >
                <h3
                  className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Mark Your Calendar
                </h3>
                <div className="flex flex-col gap-3">
                  {monthData.events.map((evt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        // Find and select the day cell for this event
                        const evtDay = evt.date.getDate();
                        for (const week of monthData.weeks) {
                          const found = week.find(c => c.isCurrentMonth && c.dayNum === evtDay);
                          if (found) { setMonthSelectedDay(found); break; }
                        }
                      }}
                      className="flex items-start gap-3 text-left transition-all active:scale-[0.98]"
                    >
                      {/* Date badge */}
                      <div
                        className="shrink-0 w-10 text-center rounded-md py-1"
                        style={{
                          background: evt.isMajor ? "rgba(90, 31, 26, 0.25)" : "rgba(201, 169, 97, 0.12)",
                          border: `1px solid ${evt.isMajor ? "rgba(122, 48, 40, 0.4)" : "rgba(201, 169, 97, 0.25)"}`,
                        }}
                      >
                        <p className="text-[9px] font-bold" style={{ color: evt.isMajor ? "var(--oxblood-light)" : "var(--accent-brass)" }}>
                          {evt.dateLabel.split(" ")[0]}
                        </p>
                        <p className="text-[14px] font-bold" style={{ color: "var(--foreground)" }}>
                          {evt.dateLabel.split(" ")[1]}
                        </p>
                      </div>
                      {/* Event info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                          {evt.name}
                        </p>
                        <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: "var(--foreground-muted)" }}>
                          {evt.detail}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Personal Callout ── */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02))",
                border: "1px solid rgba(201, 169, 97, 0.2)",
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.15em] font-bold mb-2"
                style={{ color: "var(--accent-brass)" }}
              >
                {monthData.personal.title}
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground)" }}>
                {monthData.personal.body}
              </p>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ━━━ DAY VIEW ━━━ */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {viewMode === "day" && <>

        {/* ════════════════════════════════════════════════════════════════════
            ALWAYS VISIBLE — the day's essential snapshot
           ════════════════════════════════════════════════════════════════════ */}

        {/* ━━━ SABIAN SYMBOL — editorial centerpiece ━━━ */}
        <div
          className="rounded-xl px-5 py-5"
          style={{
            background: "var(--background-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.12em] font-bold mb-3" style={{ color: "var(--brass)" }}>
            {sabianSymbol.degree}&deg; {sabianSymbol.sign}
            <InfoTip text="The Sabian Symbol for today's Sun degree. Each of the 360 degrees of the zodiac has a symbolic image, channeled in 1925. Think of it as a daily meditation image based on where the Sun actually is." />
          </p>
          <p
            className="text-[17px] leading-relaxed mb-3"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              color: "var(--foreground-on-card)",
            }}
          >
            &ldquo;{sabianSymbol.symbol}&rdquo;
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-on-card-muted)" }}>
            {sabianSymbol.keynote}
          </p>
        </div>

        {/* ━━━ SUN & MOON — compact data row ━━━ */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}
        >
          {/* Sun row */}
          <div className="flex items-stretch">
            <div className="flex-1 px-3 py-2.5 text-center" style={{ borderRight: "1px solid var(--border-card)" }}>
              <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>Rise</p>
              <p className="text-[15px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground-on-card)" }}>{celestial.sunrise}</p>
            </div>
            <div className="flex-1 px-3 py-2.5 text-center" style={{ borderRight: "1px solid var(--border-card)" }}>
              <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>Set</p>
              <p className="text-[15px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground-on-card)" }}>{celestial.sunset}</p>
            </div>
            <div className="flex-1 px-3 py-2.5 text-center" style={{ borderRight: "1px solid var(--border-card)" }}>
              <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>Moon</p>
              <p className="text-[13px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground-on-card)" }}>
                {moonPhaseLabel}
              </p>
            </div>
            <div className="flex-1 px-3 py-2.5 text-center">
              <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>Day <InfoTip text="Hours of daylight today, and how much it's changing day-to-day. Positive means days are getting longer." /></p>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground-on-card)" }}>
                {Math.floor(celestial.dayLengthMinutes / 60)}h{Math.round(celestial.dayLengthMinutes % 60)}m
              </p>
              <p className="text-[9px] font-medium" style={{
                color: celestial.dayLengthDelta > 0 ? "var(--sage)" : celestial.dayLengthDelta < 0 ? "var(--oxblood-light)" : "var(--foreground-on-card-faint)",
              }}>
                {celestial.dayLengthDelta > 0 ? "+" : ""}{celestial.dayLengthDelta.toFixed(1)}m {celestial.dayLengthDelta > 0 ? "longer" : celestial.dayLengthDelta < 0 ? "shorter" : ""}
              </p>
            </div>
          </div>
          {/* Void-of-course banner */}
          {sky.voidOfCourseMoon && (
            <div className="px-3 py-2 flex items-center gap-2" style={{ borderTop: "1px solid var(--border-card)" }}>
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: "color-mix(in srgb, var(--amber) 15%, transparent)", color: "var(--amber)" }}
              >
                V/C
              </span>
              <span className="text-[10px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                Void from {formatVocTime(sky.voidOfCourseMoon.start)} · {moonIllumination}% · {sky.moonSign}
                <InfoTip text="Void-of-Course Moon: the Moon has made its last major aspect before changing signs. Traditional astrology says avoid starting anything new during this window — plans may not stick." />
              </span>
            </div>
          )}
          {!sky.voidOfCourseMoon && (
            <div className="px-3 py-1.5 text-center" style={{ borderTop: "1px solid var(--border-card)" }}>
              <span className="text-[10px]" style={{ color: "var(--foreground-on-card-faint)" }}>
                {moonIllumination}% illuminated · Moon in {sky.moonSign}
              </span>
            </div>
          )}
        </div>

        {/* ━━━ GOOD FOR / SKIP ━━━ */}
        <AlmanacSection title="Today Is Good For" color="var(--sage)">
          <p className="text-[10px] leading-relaxed mb-3" style={{ color: "var(--foreground-muted)" }}>
            Based on today&apos;s Moon sign, phase, and planetary day. Traditional almanacs use these rhythms to time activities — tap any item for details.
          </p>
          <div className="flex flex-col gap-2">
            {goodFor.activities.slice(0, 5).map((item, i) => (
              <button
                key={i}
                className="rounded-xl px-4 py-3 flex items-center gap-3 text-left w-full"
                style={{
                  background: "color-mix(in srgb, var(--sage) 8%, var(--background-card))",
                  border: "1px solid color-mix(in srgb, var(--sage) 15%, transparent)",
                }}
                onClick={() => handleOpenDetail(item.activity, "good")}
              >
                <span className="flex items-center gap-1.5 shrink-0">
                  <span style={{ color: "var(--sage)" }}><CheckIcon /></span>
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--sage)" }}>Go</span>
                </span>
                <p className="text-[14px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                  {item.activity}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <p
              className="text-[10px] uppercase tracking-[0.15em] font-bold mb-2"
              style={{ color: "var(--terracotta)" }}
            >
              Skip Today
            </p>
            <div className="flex flex-col gap-2">
              {holdOff.items.slice(0, 3).map((item, i) => (
                <button
                  key={i}
                  className="rounded-xl px-4 py-2.5 flex items-center gap-3 text-left w-full"
                  style={{
                    background: "color-mix(in srgb, var(--terracotta) 5%, var(--background-card))",
                    border: "1px solid color-mix(in srgb, var(--terracotta) 10%, transparent)",
                  }}
                  onClick={() => handleOpenDetail(item.activity, "skip")}
                >
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span style={{ color: "var(--terracotta)" }}><XIcon /></span>
                    <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--terracotta)" }}>Wait</span>
                  </span>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                    {item.activity}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </AlmanacSection>

        {/* ════════════════════════════════════════════════════════════════════
            DRAWERS — tap-to-expand, grouped by theme
           ════════════════════════════════════════════════════════════════════ */}

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px" style={{ background: "var(--border-card)" }} />
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: "var(--foreground-faint)" }}>
            Explore
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--border-card)" }} />
        </div>

        {/* ── PRACTICAL ── */}
        <div className="flex flex-col gap-2.5">

        {/* Planting Calendar */}
        <AlmanacDrawer
          title="In the Garden"
          icon="🌱"
          preview={`${plantingCal.todayVerdict.crop} · Score ${plantingCal.todayVerdict.score}/10`}
        >
          {/* Zone lookup by zip */}
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex-1 relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                placeholder="Enter zip code"
                value={gardenZip}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                  setGardenZip(val);
                  if (val.length === 5) {
                    const zone = getZoneFromZip(val);
                    if (zone) {
                      setGardenZone(zone);
                      localStorage.setItem("mapped:garden-zone", zone);
                      localStorage.setItem("mapped:garden-zip", val);
                    }
                  }
                }}
                className="w-full rounded-lg px-3 py-2 text-[13px] tabular-nums"
                style={{
                  background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                  color: "var(--foreground)",
                  outline: "none",
                  fontFamily: "var(--font-display)",
                }}
                aria-label="Zip code for garden zone"
              />
              {gardenZip.length === 5 && !getZoneFromZip(gardenZip) && (
                <p className="text-[9px] mt-1" style={{ color: "var(--terracotta)" }}>
                  Zip not found — pick a zone manually below
                </p>
              )}
            </div>
            <div
              className="shrink-0 rounded-lg px-3 py-2 text-center"
              style={{
                background: "color-mix(in srgb, var(--sage) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--sage) 20%, transparent)",
                minWidth: "52px",
              }}
            >
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--sage)" }}>Zone</p>
              <p className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                {gardenZone}
              </p>
            </div>
          </div>
          <p className="text-[9px] leading-relaxed mb-2" style={{ color: "var(--foreground-faint)" }}>
            Your USDA Hardiness Zone determines what to plant and when. {!gardenZip && "Type your zip code to auto-detect, or tap a zone below."}
          </p>
          {/* Manual zone fallback — compact scrollable pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
            {USDA_ZONES.map((z) => (
              <button
                key={z.zone}
                onClick={() => {
                  setGardenZone(z.zone);
                  localStorage.setItem("mapped:garden-zone", z.zone);
                }}
                className="shrink-0 px-2 py-1 rounded-full text-[10px] font-medium transition-colors active:scale-[0.96]"
                style={{
                  background: z.zone === gardenZone
                    ? "var(--sage)"
                    : "color-mix(in srgb, var(--foreground) 6%, transparent)",
                  color: z.zone === gardenZone
                    ? "var(--background)"
                    : "var(--foreground-muted)",
                }}
              >
                {z.zone}
              </button>
            ))}
          </div>

          {/* Zone info bar */}
          <div
            className="rounded-xl px-4 py-3 mt-2 flex items-center justify-between"
            style={{
              background: "color-mix(in srgb, var(--sage) 10%, var(--background-card))",
              border: "1px solid color-mix(in srgb, var(--sage) 20%, transparent)",
            }}
          >
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold" style={{ color: "var(--sage)" }}>
                {plantingCal.region}
              </p>
              <p className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                Zone {plantingCal.zone}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px]" style={{ color: "var(--foreground-muted)" }}>
                Last frost: {plantingCal.lastFrost}
              </p>
              <p className="text-[10px]" style={{ color: "var(--foreground-muted)" }}>
                First frost: {plantingCal.firstFrost}
              </p>
            </div>
          </div>

          {/* Today's verdict */}
          <div
            className="rounded-xl px-4 py-4 mt-3"
            style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "color-mix(in srgb, var(--sage) 15%, transparent)" }}
              >
                <span className="text-[18px]">🌿</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold" style={{ color: "var(--foreground-on-card)" }}>
                  {plantingCal.todayVerdict.crop}
                </p>
                <p className="text-[11px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                  {plantingCal.todayVerdict.moonSign} ({plantingCal.todayVerdict.moonElement} sign)
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[22px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--sage)" }}>
                  {plantingCal.todayVerdict.score}
                </p>
                <p className="text-[9px] uppercase" style={{ color: "var(--foreground-muted)" }}>/10 <InfoTip text="Planting score based on Moon sign fertility and phase. 7+ is great for planting, 4-6 is moderate, below 4 is better for weeding and maintenance." /></p>
              </div>
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-card)" }}>
              <p className="text-[9px] uppercase tracking-[0.12em] font-bold mb-1" style={{ color: "var(--sage)" }}>
                Best For
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-on-card-muted)" }}>
                {plantingCal.todayVerdict.bestFor}
              </p>
            </div>
            {plantingCal.todayVerdict.vocNote && (
              <p className="text-[10px] mt-2 italic" style={{ color: "var(--amber)" }}>
                {plantingCal.todayVerdict.vocNote}
              </p>
            )}
          </div>

          {/* The Four Quarters */}
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: "var(--foreground-muted)" }}>
              The Four Quarters
            </p>
            <p className="text-[10px] leading-relaxed mb-3" style={{ color: "var(--foreground-muted)", opacity: 0.7 }}>
              The lunar month divides into four quarters. Each favors different types of planting based on whether energy is rising (above-ground crops) or falling (roots).
            </p>
            <div className="grid grid-cols-2 gap-2">
              {plantingCal.quarters.map((q) => (
                <div
                  key={q.quarter}
                  className="rounded-lg px-3 py-3 relative"
                  style={{
                    background: q.isCurrent
                      ? "color-mix(in srgb, var(--sage) 12%, var(--background-card))"
                      : "var(--background-card)",
                    border: q.isCurrent
                      ? "1px solid color-mix(in srgb, var(--sage) 25%, transparent)"
                      : "1px solid var(--border-card)",
                  }}
                >
                  {q.isCurrent && (
                    <span
                      className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider"
                      style={{ color: "#2d5a27" }}
                    >
                      NOW
                    </span>
                  )}
                  <p className="text-[12px] mb-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>
                    {q.quarter === 1 ? "🌑" : q.quarter === 2 ? "🌓" : q.quarter === 3 ? "🌕" : "🌗"} Q{q.quarter}
                  </p>
                  <p className="text-[12px] font-bold" style={{ color: "var(--foreground-on-card)" }}>
                    {q.cropType}
                  </p>
                  <p className="text-[10px] mt-1 leading-snug" style={{ color: "var(--foreground-on-card-muted)" }}>
                    {q.description}
                  </p>
                  <p className="text-[10px] mt-1 italic" style={{ color: "var(--foreground-on-card-faint)" }}>
                    {q.examples}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Best Days This Week */}
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.15em] font-bold mb-2" style={{ color: "var(--foreground-muted)" }}>
              Best Days This Week
            </p>
            {/* Legend — matches day tile colors exactly */}
            <div className="flex items-center gap-4 mb-3 pl-7">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md" style={{ background: "#4a6e2e" }} />
                <span className="text-[9px]" style={{ color: "var(--foreground-muted)" }}>Plant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md" style={{ background: "#8aab6e" }} />
                <span className="text-[9px]" style={{ color: "var(--foreground-muted)" }}>OK</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md" style={{ background: "#d5d0c5" }} />
                <span className="text-[9px]" style={{ color: "var(--foreground-muted)" }}>Skip</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {plantingCal.cropCategories.map((cat, ci) => (
                <div key={ci}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold w-5 h-5 rounded flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--sage) 12%, transparent)", color: "var(--sage)" }}>
                        {cat.icon}
                      </span>
                      <span className="text-[12px] font-semibold" style={{ color: "var(--foreground)" }}>{cat.name}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: "var(--foreground-muted)" }}>{cat.examples}</span>
                  </div>
                  {cat.seasonalNote ? (
                    <p className="text-[11px] italic pl-7" style={{ color: "var(--terracotta)" }}>
                      {cat.seasonalNote}
                    </p>
                  ) : (
                    <div className="flex gap-1 pl-7">
                      {cat.bestDays.map((day, di) => {
                        // 3 visual tiers: plant (dark green), ok (light green), skip (beige)
                        const isPlant = day.rating === "best" || day.rating === "good";
                        const isSkip = day.rating === "skip" || day.rating === "poor";
                        const bg = isPlant ? (day.rating === "best" ? "#4a6e2e" : "#8aab6e")
                          : isSkip ? "#d5d0c5"
                          : "#c4c0b5"; // ok
                        const fg = isPlant ? "#ffffff"
                          : "#7a756a";
                        return (
                          <span
                            key={di}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold"
                            style={{ background: bg, color: fg }}
                          >
                            {day.dayNum}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Plant Now in Zone 8a */}
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3" style={{ color: "var(--foreground-muted)" }}>
              Plant Now in Zone {plantingCal.zone}
            </p>
            <div
              className="rounded-xl px-4 py-4"
              style={{
                background: "color-mix(in srgb, var(--brass) 6%, var(--background-card))",
                border: "1px solid color-mix(in srgb, var(--brass) 15%, transparent)",
              }}
            >
              <div className="mb-2">
                <span className="text-[11px] font-bold" style={{ color: "var(--foreground-on-card)" }}>Direct sow: </span>
                <span className="text-[11px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                  {plantingCal.plantNow.directSow.join(", ")}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-[11px] font-bold" style={{ color: "var(--foreground-on-card)" }}>Transplant: </span>
                <span className="text-[11px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                  {plantingCal.plantNow.transplant.join(", ")}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold" style={{ color: "var(--foreground-on-card)" }}>Start indoors for fall: </span>
                <span className="text-[11px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                  {plantingCal.plantNow.startIndoors.join(", ")}
                </span>
              </div>
            </div>
          </div>

          {/* Old Wisdom */}
          <div className="mt-4">
            <div
              className="rounded-xl px-4 py-4"
              style={{
                background: "color-mix(in srgb, var(--brass) 5%, var(--background-card))",
                border: "1px solid color-mix(in srgb, var(--brass) 12%, transparent)",
              }}
            >
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-2" style={{ color: "var(--brass)" }}>
                Old Wisdom
              </p>
              <p
                className="text-[14px] leading-relaxed"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  color: "var(--foreground-on-card)",
                }}
              >
                &ldquo;{plantingCal.wisdom.saying}&rdquo;
              </p>
              <p className="text-[10px] mt-2" style={{ color: "var(--sage)" }}>
                — {plantingCal.wisdom.attribution}
              </p>
            </div>
          </div>
        </AlmanacDrawer>

        {/* Fishing Forecast */}
        <AlmanacDrawer
          title="Fishing Forecast"
          icon="🎣"
          preview={fishingForecast ? `${fishingForecast.ratingLabel} · ${fishingForecast.rating.toFixed(1)} · ${fishingForecast.waterBody.name}` : "Set your location"}
        >
          <div className="flex flex-col gap-4">

            <p className="text-[10px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
              Fishing ratings are based on Moon phase, sign, and solunar theory — the idea that fish feed more actively during certain lunar positions. Major/minor feeding periods shift daily.
            </p>

            {/* ── Location picker (always shown so user can set location) ── */}
            <div
              className="rounded-lg px-3 py-2.5"
              style={{
                background: "color-mix(in srgb, var(--sage) 8%, var(--background-card))",
                border: "1px solid color-mix(in srgb, var(--sage) 15%, transparent)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" style={{ color: "var(--sage)" }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search lake, river, bay..."
                    value={fishingSearchOpen ? fishingSearch : (fishingForecast?.waterBody.name || "")}
                    onFocus={() => {
                      setFishingSearchOpen(true);
                      setFishingSearch("");
                    }}
                    onChange={(e) => setFishingSearch(e.target.value)}
                    onBlur={() => {
                      // Delay so tap on result registers before blur closes dropdown
                      setTimeout(() => setFishingSearchOpen(false), 200);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-[13px]"
                    style={{
                      background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                      color: "var(--foreground)",
                      outline: "none",
                      fontFamily: "var(--font-body)",
                    }}
                    aria-label="Search for a fishing location"
                  />
                  {fishingSearchOpen && fishingSearch.length >= 2 && (() => {
                    const results = searchWaterBodies(fishingSearch);
                    if (results.length === 0) return (
                      <div
                        className="absolute left-0 right-0 top-full mt-1 rounded-lg px-3 py-2 z-50"
                        style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}
                      >
                        <p className="text-[11px]" style={{ color: "var(--foreground-muted)" }}>No results</p>
                      </div>
                    );
                    return (
                      <div
                        className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden z-50"
                        style={{ background: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                      >
                        {results.map((wb, i) => (
                          <button
                            key={wb.name + i}
                            className="w-full text-left px-3 py-2 flex items-center justify-between"
                            style={{
                              borderBottom: i < results.length - 1 ? "1px solid var(--border-card)" : "none",
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setFishingLocation(wb.name);
                              setFishingSearch(wb.name);
                              setFishingSearchOpen(false);
                              localStorage.setItem("mapped:fishing-location", wb.name);
                            }}
                          >
                            <div>
                              <p className="text-[12px] font-medium" style={{ color: "var(--foreground-on-card)" }}>{wb.name}</p>
                              <p className="text-[10px]" style={{ color: "var(--foreground-muted)" }}>{wb.county}</p>
                            </div>
                            <span className="text-[9px] uppercase tracking-wider shrink-0 ml-2" style={{ color: "var(--sage)" }}>
                              {wb.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-[10px]" style={{ color: "var(--foreground-muted)" }}>
                  {fishingForecast ? `${fishingForecast.waterBody.county} · ${fishingForecast.waterBody.type}${fishingForecast.waterBody.isSaltwater ? " · saltwater" : ""}` : "Search for a lake, river, or bay near you"}
                </p>
                {fishingLocation && (
                  <button
                    className="text-[9px] uppercase tracking-wider"
                    style={{ color: "var(--foreground-faint)" }}
                    onClick={() => {
                      setFishingLocation("");
                      setFishingSearch("");
                      localStorage.removeItem("mapped:fishing-location");
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {!fishingForecast && (
              <div className="rounded-lg px-4 py-5 text-center" style={{ background: "color-mix(in srgb, var(--sage) 6%, var(--background-card))", border: "1px solid color-mix(in srgb, var(--sage) 12%, transparent)" }}>
                <p className="text-[13px] font-medium mb-1" style={{ color: "var(--foreground-on-card)" }}>No location set</p>
                <p className="text-[11px]" style={{ color: "var(--foreground-muted)" }}>Search for a lake, river, or bay (or US ZIP code) above to see your local fishing forecast. Water-body and species details are US-only for now — the Moon-based bite windows below work anywhere.</p>
              </div>
            )}

            {/* ── Today summary card (US water body set) ── */}
            {fishingForecast && (
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "color-mix(in srgb, var(--sage) 12%, transparent)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--sage)" }}>
                  <path d="M6.5 12c0 0 1-3 5.5-3s5.5 3 5.5 3" />
                  <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
                  <path d="M2 16s3-2 5.5-2 4 2 6.5 2 5.5-2 5.5-2" />
                  <path d="M2 20s3-2 5.5-2 4 2 6.5 2 5.5-2 5.5-2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold" style={{ color: "var(--foreground-on-card)" }}>
                  {fishingForecast.ratingLabel} · {fishingForecast.rating.toFixed(1)}
                </p>
                <p className="text-[11px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                  {fishingForecast.moonPhaseLabel} · {fishingForecast.moonSign} ({fishingForecast.moonElement} sign)
                </p>
              </div>
            </div>
            )}

            {/* ── Bite intensity through the day (universal — works anywhere) ── */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] font-bold mb-2" style={{ color: "var(--foreground-muted)" }}>
                Bite Intensity Through the Day
              </p>
              <div className="flex items-end gap-[3px]" style={{ height: 60 }}>
                {fishingBite.biteIntensity.map((bar, i) => {
                  const heights = [0, 20, 38, 56];
                  const colors = [
                    "transparent",
                    "color-mix(in srgb, var(--sage) 30%, transparent)",
                    "color-mix(in srgb, var(--sage) 55%, transparent)",
                    "var(--sage)",
                  ];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm transition-all"
                        style={{
                          height: heights[bar.intensity],
                          background: colors[bar.intensity],
                          minHeight: bar.intensity > 0 ? 4 : 0,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-[3px] mt-1">
                {fishingBite.biteIntensity.map((bar, i) => (
                  <span key={i} className="flex-1 text-center text-[8px]" style={{ color: "var(--foreground-faint)" }}>
                    {bar.label}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Bite windows ── */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] font-bold mb-2" style={{ color: "var(--foreground-muted)" }}>
                Bite Windows
              </p>
              <div className="flex flex-col gap-2">
                {fishingBite.biteWindows.map((win, i) => (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-3 flex items-center gap-3"
                    style={{
                      background: win.type === "major"
                        ? "color-mix(in srgb, var(--sage) 6%, var(--background-card))"
                        : "var(--background-card)",
                      border: win.type === "major"
                        ? "1px solid color-mix(in srgb, var(--sage) 18%, transparent)"
                        : "1px solid var(--border-card)",
                    }}
                  >
                    {/* Direction icon */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: win.type === "major"
                          ? "color-mix(in srgb, var(--sage) 15%, transparent)"
                          : "color-mix(in srgb, var(--foreground) 6%, transparent)",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ color: win.type === "major" ? "var(--sage)" : "var(--foreground-muted)" }}
                      >
                        {win.direction === "down" && <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>}
                        {win.direction === "up" && <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>}
                        {win.direction === "right" && <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>}
                      </svg>
                    </div>

                    {/* Times + label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold tabular-nums" style={{ color: "var(--foreground-on-card)" }}>
                          {win.start} – {win.end}
                        </span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            background: win.type === "major"
                              ? "color-mix(in srgb, var(--sage) 20%, transparent)"
                              : "color-mix(in srgb, var(--foreground) 8%, transparent)",
                            color: win.type === "major" ? "var(--sage)" : "var(--foreground-muted)",
                          }}
                        >
                          {win.type}
                        </span>
                      </div>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--foreground-on-card-muted)" }}>
                        {win.label} · {win.description}
                      </p>
                    </div>

                    {/* Bell icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      className="shrink-0" style={{ color: "var(--foreground-faint)" }}
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      <line x1="18" y1="3" x2="18" y2="7" />
                      <line x1="16" y1="5" x2="20" y2="5" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* ── US-only details below: conditions, species, week, wisdom ── */}
            {fishingForecast && (<>
            {/* ── Conditions 2x2 grid ── */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] font-bold mb-2" style={{ color: "var(--foreground-muted)" }}>
                Conditions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {/* Water temp */}
                <div className="rounded-lg px-3 py-2.5" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                  <p className="text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1" style={{ color: "var(--foreground-on-card-faint)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>
                    Water Temp
                  </p>
                  <p className="text-[16px] font-bold" style={{ color: "var(--foreground-on-card)" }}>{fishingForecast.conditions.waterTemp.value}</p>
                  <p className="text-[10px]" style={{ color: "var(--sage)" }}>{fishingForecast.conditions.waterTemp.qualifier}</p>
                </div>
                {/* Sky */}
                <div className="rounded-lg px-3 py-2.5" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                  <p className="text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1" style={{ color: "var(--foreground-on-card-faint)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>
                    Sky
                  </p>
                  <p className="text-[16px] font-bold" style={{ color: "var(--foreground-on-card)" }}>{fishingForecast.conditions.sky.value}</p>
                  <p className="text-[10px]" style={{ color: "var(--sage)" }}>{fishingForecast.conditions.sky.qualifier}</p>
                </div>
                {/* Wind */}
                <div className="rounded-lg px-3 py-2.5" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                  <p className="text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1" style={{ color: "var(--foreground-on-card-faint)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" /></svg>
                    Wind
                  </p>
                  <p className="text-[16px] font-bold" style={{ color: "var(--foreground-on-card)" }}>{fishingForecast.conditions.wind.value}</p>
                  <p className="text-[10px]" style={{ color: "var(--sage)" }}>{fishingForecast.conditions.wind.qualifier}</p>
                </div>
                {/* Barometer */}
                <div className="rounded-lg px-3 py-2.5" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                  <p className="text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1" style={{ color: "var(--foreground-on-card-faint)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    Barometer
                  </p>
                  <p className="text-[16px] font-bold" style={{ color: "var(--foreground-on-card)" }}>{fishingForecast.conditions.barometer.value}</p>
                  <p className="text-[10px]" style={{
                    color: fishingForecast.conditions.barometer.trend === "falling" ? "var(--terracotta)" : "var(--sage)",
                  }}>{fishingForecast.conditions.barometer.qualifier}</p>
                </div>
              </div>
            </div>

            {/* ── Ocean data (saltwater only) ── */}
            {fishingForecast.oceanData && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] font-bold mb-2" style={{ color: "var(--foreground-muted)" }}>
                  Ocean Conditions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg px-3 py-2.5" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                    <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>Tides</p>
                    <p className="text-[11px] font-medium" style={{ color: "var(--foreground-on-card)" }}>{fishingForecast.oceanData.tide}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                    <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>Swell</p>
                    <p className="text-[14px] font-bold" style={{ color: "var(--foreground-on-card)" }}>{fishingForecast.oceanData.swellFt} ft {fishingForecast.oceanData.swellDirection}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                    <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>Surf Temp</p>
                    <p className="text-[14px] font-bold" style={{ color: "var(--foreground-on-card)" }}>{fishingForecast.oceanData.surfTemp}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                    <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>Clarity</p>
                    <p className="text-[12px] font-medium" style={{ color: "var(--foreground-on-card)" }}>{fishingForecast.oceanData.waterClarity}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── What's biting ── */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] font-bold mb-2" style={{ color: "var(--foreground-muted)" }}>
                {"What's Biting"}
              </p>
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid var(--border-card)" }}
              >
                {fishingForecast.species.map((sp, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2.5"
                    style={{
                      borderBottom: i < fishingForecast.species.length - 1 ? "1px solid var(--border-card)" : "none",
                      opacity: sp.active ? 1 : 0.5,
                    }}
                  >
                    <span className="text-[13px] font-medium" style={{ color: "var(--foreground-on-card)" }}>
                      {sp.name}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                      {sp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Best days this week ── */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] font-bold mb-2" style={{ color: "var(--foreground-muted)" }}>
                Best Days This Week
              </p>
              <div className="flex gap-1">
                {fishingForecast.weekScores.map((day, i) => {
                  // Color intensity based on score
                  const bg = day.score >= 7 ? "var(--sage)"
                    : day.score >= 5 ? "color-mix(in srgb, var(--sage) 50%, var(--background-card))"
                    : day.score >= 3 ? "color-mix(in srgb, var(--foreground) 8%, var(--background-card))"
                    : "var(--background-card)";
                  const textColor = day.score >= 6 ? "#fff" : "var(--foreground)";
                  const labelColor = day.score >= 6 ? "rgba(255,255,255,0.7)" : "var(--foreground-muted)";

                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-lg py-2 text-center"
                      style={{
                        background: bg,
                        border: day.isToday
                          ? "2px solid var(--brass)"
                          : day.isPeak ? "2px solid var(--sage)" : "1px solid var(--border-card)",
                      }}
                    >
                      <p className="text-[9px] font-bold uppercase" style={{ color: labelColor }}>
                        {day.dayLabel}
                      </p>
                      <p className="text-[15px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", color: textColor }}>
                        {day.dayNum}
                      </p>
                      <p className="text-[9px] font-medium tabular-nums" style={{ color: labelColor }}>
                        {day.score.toFixed(1)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--sage)" }} />
                  <span className="text-[8px]" style={{ color: "var(--foreground-muted)" }}>7+ Great</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "color-mix(in srgb, var(--sage) 50%, var(--background-card))" }} />
                  <span className="text-[8px]" style={{ color: "var(--foreground-muted)" }}>5+ Fair</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "color-mix(in srgb, var(--foreground) 8%, var(--background-card))", border: "1px solid var(--border-card)" }} />
                  <span className="text-[8px]" style={{ color: "var(--foreground-muted)" }}>Slow</span>
                </div>
                {fishingForecast.peakDayNote && <span className="text-[9px] ml-auto" style={{ color: "var(--foreground-muted)" }}>★ = peak</span>}
              </div>
              <p className="text-[11px] leading-relaxed mt-1.5" style={{ color: "var(--foreground-on-card-muted)" }}>
                {fishingForecast.peakDayNote}
              </p>
            </div>


            {/* ── Old wisdom ── */}
            <div
              className="rounded-lg px-4 py-3.5"
              style={{
                background: "color-mix(in srgb, var(--brass) 6%, var(--background-card))",
                border: "1px solid color-mix(in srgb, var(--brass) 15%, transparent)",
              }}
            >
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-2" style={{ color: "var(--brass)" }}>
                Old Wisdom
              </p>
              <p
                className="text-[13px] leading-relaxed"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  color: "var(--foreground-on-card)",
                }}
              >
                &ldquo;{fishingForecast.wisdom.saying}&rdquo;
              </p>
              <p className="text-[10px] mt-2" style={{ color: "var(--sage)" }}>
                {fishingForecast.wisdom.attribution}
              </p>
            </div>

            </>)}
          </div>
        </AlmanacDrawer>

        {/* Body Timing */}
        <AlmanacDrawer
          title="Body Timing"
          icon="⚕️"
          preview={`${bodyTiming.summaryLabel} — Moon in ${bodyTiming.moonSign}`}
        >
          <div className="flex flex-col gap-4">

            {/* Planning For date picker */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-2" style={{ color: "var(--foreground-muted)" }}>
                Planning For
              </p>
              <label
                className="rounded-lg px-3 py-2.5 flex items-center justify-between cursor-pointer"
                style={{
                  background: "color-mix(in srgb, var(--brass) 8%, var(--background-card))",
                  border: "1px solid color-mix(in srgb, var(--brass) 20%, transparent)",
                }}
              >
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--foreground-on-card)", fontFamily: "var(--font-display)" }}>
                    {bodyTiming.dayLabel.charAt(0) + bodyTiming.dayLabel.slice(1).toLowerCase()}, {bodyTiming.dateLabel}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--foreground-on-card-muted)" }}>
                    {bodyTiming.daysAway === 0 ? "Today" : bodyTiming.daysAway === 1 ? "Tomorrow" : bodyTiming.daysAway < 0 ? `${Math.abs(bodyTiming.daysAway)} days ago` : `In ${bodyTiming.daysAway} days`}
                  </p>
                </div>
                <div className="relative shrink-0">
                  <span className="text-[14px]" style={{ color: "var(--brass)" }}>change</span>
                  <input
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Pick a date to check body timing"
                    value={`${bodyTimingDate.getFullYear()}-${String(bodyTimingDate.getMonth() + 1).padStart(2, "0")}-${String(bodyTimingDate.getDate()).padStart(2, "0")}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const [y, m, d] = val.split("-").map(Number);
                        setBodyTimingDate(new Date(y, m - 1, d));
                      }
                    }}
                  />
                </div>
              </label>
            </div>

            {/* Moon summary pill */}
            <div
              className="rounded-full px-3 py-1.5 text-center"
              style={{
                background: "color-mix(in srgb, var(--sage) 10%, var(--background-card))",
                border: "1px solid color-mix(in srgb, var(--sage) 15%, transparent)",
              }}
            >
              <p className="text-[11px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                {bodyTiming.summaryLabel}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: "var(--foreground-on-card-muted)" }}>
                Moon in {bodyTiming.moonSign} · {bodyTiming.moonPhase}
              </p>
            </div>

            {/* Maybe Skip */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-2" style={{ color: "var(--terracotta)" }}>
                Maybe Skip This Day
              </p>
              <div className="flex flex-col gap-1.5">
                {bodyTiming.avoid.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-2 flex items-center gap-2.5"
                    style={{
                      background: item.risk === "high"
                        ? "color-mix(in srgb, var(--terracotta) 8%, var(--background-card))"
                        : "color-mix(in srgb, var(--brass) 6%, var(--background-card))",
                      border: `1px solid color-mix(in srgb, ${item.risk === "high" ? "var(--terracotta)" : "var(--brass)"} 15%, transparent)`,
                    }}
                  >
                    <span className="text-[16px] shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                        {item.label}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                        {item.detail}
                      </p>
                    </div>
                    <span
                      className="text-[8px] uppercase tracking-[0.1em] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{
                        background: item.risk === "high"
                          ? "color-mix(in srgb, var(--terracotta) 20%, transparent)"
                          : "color-mix(in srgb, var(--brass) 15%, transparent)",
                        color: item.risk === "high" ? "var(--terracotta)" : "var(--brass)",
                      }}
                    >
                      {item.risk === "high" ? "Not Ideal" : "Heads Up"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Good To Go */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-2" style={{ color: "var(--sage)" }}>
                Good To Go
              </p>
              <div className="flex flex-col gap-1.5">
                {bodyTiming.safe.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-2 flex items-center gap-2.5"
                    style={{
                      background: "color-mix(in srgb, var(--sage) 8%, var(--background-card))",
                      border: "1px solid color-mix(in srgb, var(--sage) 15%, transparent)",
                    }}
                  >
                    <span className="text-[16px] shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                        {item.label}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                        {item.detail}
                      </p>
                    </div>
                    <span
                      className="text-[8px] uppercase tracking-[0.1em] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{
                        background: "color-mix(in srgb, var(--sage) 20%, transparent)",
                        color: "var(--sage)",
                      }}
                    >
                      All Clear
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Worth Knowing */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-2" style={{ color: "var(--foreground-muted)" }}>
                Worth Knowing
              </p>
              <div className="flex flex-col gap-1.5">
                {bodyTiming.notes.map((note, i) => (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-2 flex items-center gap-2.5"
                    style={{
                      background: "color-mix(in srgb, var(--foreground-muted) 5%, var(--background-card))",
                      border: "1px solid color-mix(in srgb, var(--foreground-muted) 10%, transparent)",
                    }}
                  >
                    <span className="text-[14px] shrink-0">{note.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                        {note.label}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                        {note.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Better Days Nearby */}
            {bodyTiming.betterDays.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: "var(--foreground-muted)" }}>
                  Better Days Nearby
                </p>
                <p className="text-[10px] mb-2" style={{ color: "var(--foreground-on-card-muted)" }}>
                  If you&apos;re flexible on the date —
                </p>
                <div className="flex flex-col gap-1.5">
                  {bodyTiming.betterDays.map((bd, i) => (
                    <div
                      key={i}
                      className="rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer"
                      style={{
                        background: "color-mix(in srgb, var(--sage) 6%, var(--background-card))",
                        border: "1px solid color-mix(in srgb, var(--sage) 12%, transparent)",
                      }}
                      onClick={() => setBodyTimingDate(bd.date)}
                    >
                      <div>
                        <p className="text-[12px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                          {bd.label}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                          Moon in {bd.moonSign} · {bd.reason}
                        </p>
                      </div>
                      <span
                        className="text-[8px] uppercase tracking-[0.1em] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{
                          background: "color-mix(in srgb, var(--sage) 20%, transparent)",
                          color: "var(--sage)",
                        }}
                      >
                        Clear
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[9px] leading-relaxed italic text-center" style={{ color: "var(--foreground-on-card-faint)" }}>
              Based on traditional almanac folklore — not medical advice. Always talk to your doctor for anything important.
            </p>

          </div>
        </AlmanacDrawer>

        {/* Visible Tonight */}
        {(celestial.visiblePlanets.length > 0 || celestial.meteorShower) && (
          <AlmanacDrawer
            title="Visible Tonight"
            icon="✦"
            preview={celestial.visiblePlanets.map(p => p.name).join(", ") || "Meteor shower active"}
          >
            <p className="text-[10px] leading-relaxed mb-3" style={{ color: "var(--foreground-muted)" }}>
              Planets and events visible to the naked eye tonight. Look in the direction listed shortly after sunset or before sunrise.
            </p>
            <div className="flex flex-col gap-2">
              {celestial.visiblePlanets.map((planet, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[15px] w-5 text-center shrink-0">
                    {planet.name === "Venus" ? "♀" : planet.name === "Mars" ? "♂" : planet.name === "Jupiter" ? "♃" : planet.name === "Saturn" ? "♄" : "☿"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>{planet.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                      {planet.direction} · {planet.brightness}{planet.note ? ` · ${planet.note}` : ""}
                    </p>
                  </div>
                </div>
              ))}
              {celestial.meteorShower && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[15px] w-5 text-center shrink-0">☄️</span>
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>{celestial.meteorShower.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--foreground-on-card-muted)" }}>
                      Peak: {celestial.meteorShower.peakDate} · ~{celestial.meteorShower.zhr}/hr
                    </p>
                  </div>
                </div>
              )}
            </div>
          </AlmanacDrawer>
        )}

        </div>{/* end practical drawers */}

        {/* ── STORIES & WISDOM ── */}
        <div className="flex flex-col gap-2.5">

        {/* On This Day */}
        {onThisDay.length > 0 && (
          <AlmanacDrawer
            title="On This Day"
            icon="📜"
            preview={`${onThisDay.length} events — ${onThisDay[0]?.year}`}
          >
            <div>
              <p className="text-[10px] leading-relaxed mb-3" style={{ color: "var(--foreground-muted)" }}>
                What happened on this date throughout history, with the astrological weather at the time.
              </p>
              <div className="flex flex-col gap-0">
                {onThisDay.map((evt, i) => {
                  const catIcon = evt.category === "science" ? "🔬" : evt.category === "culture" ? "🎭" : evt.category === "politics" ? "🏛️" : evt.category === "achievement" ? "🏆" : evt.category === "nature" ? "🌿" : "📌";
                  return (
                    <div
                      key={i}
                      className="flex gap-3 py-2.5"
                      style={{ borderBottom: i < onThisDay.length - 1 ? "1px solid color-mix(in srgb, var(--foreground-muted) 10%, transparent)" : "none" }}
                    >
                      <div className="flex flex-col items-center shrink-0 w-10">
                        <span className="text-[12px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--brass)" }}>
                          {evt.year}
                        </span>
                        <span className="text-[11px] mt-0.5">{catIcon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>
                          {evt.event}
                        </p>
                        <p className="text-[10px] mt-0.5 italic" style={{ color: "var(--foreground-on-card-faint)" }}>
                          {evt.astroNote}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AlmanacDrawer>
        )}

        {/* Coming Up */}
        {dailyEnergy.upcomingEvents.length > 0 && (
          <AlmanacDrawer
            title="Coming Up"
            icon="📅"
            preview={`${dailyEnergy.upcomingEvents[0]?.name} — ${dailyEnergy.upcomingEvents[0]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          >
            <div>
              <p className="text-[10px] leading-relaxed mb-3" style={{ color: "var(--foreground-muted)" }}>
                Key celestial events in the days ahead — retrogrades, eclipses, sign changes, and more. Use these to plan ahead or simply stay curious.
              </p>
              <div className="flex flex-col gap-2.5">
              {dailyEnergy.upcomingEvents.slice(0, 4).map((evt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold tabular-nums shrink-0 w-10" style={{ color: "var(--brass)" }}>
                    {evt.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                      {evt.name}
                    </p>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--foreground-on-card-faint)" }}>
                      {evt.description}
                    </p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </AlmanacDrawer>
        )}

        </div>{/* end stories drawers */}

        {/* ━━━ The Moon's week — a bridge to the week view ━━━ */}
        <button
          onClick={() => setViewMode("week")}
          className="w-full mt-5 rounded-2xl p-4 text-left active:scale-[0.99] transition-transform"
          style={{ background: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: "var(--brass)" }}>The Moon&rsquo;s week</p>
            <span className="text-[11px] font-medium" style={{ color: "var(--brass-light)" }}>The week ahead →</span>
          </div>
          <div className="flex justify-between">
            {weekData.days.map((d, i) => {
              const isToday = d.eventTag === "TODAY";
              return (
                <div key={i} className="flex flex-col items-center gap-1.5" style={{ opacity: isToday ? 1 : 0.68 }}>
                  <span className="text-[9px] font-bold uppercase" style={{ color: isToday ? "var(--brass)" : "var(--foreground-muted)" }}>{d.dayLabel[0]}</span>
                  <span className="text-[17px] leading-none">{d.moonIcon}</span>
                  <span className="text-[12px] font-semibold leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{d.dayNum}</span>
                  <span className="w-1 h-1 rounded-full" style={{ background: isToday ? "var(--brass)" : "transparent" }} />
                </div>
              );
            })}
          </div>
          {weekData.headline?.title && (
            <p className="text-[11px] leading-relaxed mt-3.5" style={{ color: "var(--foreground-muted)" }}>{weekData.headline.title}</p>
          )}
        </button>

        </>}
      </div>

      {/* ━━━ Activity Detail View ━━━ */}
      {selectedDetail && (
        <ActivityDetailView
          detail={selectedDetail}
          transitData={transitData}
          onClose={() => setSelectedDetail(null)}
        />
      )}

      {/* ━━━ Category Library Browser ━━━ */}
      {showCategoryLibrary && (
        <div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{
            background: "var(--background)",
            overflowY: "auto",
          }}
        >
          <div className="max-w-lg mx-auto w-full px-5 py-5 pb-10 flex flex-col gap-6">
            {/* Header */}
            <header className="flex items-center gap-3">
              <button
                onClick={() => setShowCategoryLibrary(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{
                  color: "var(--foreground)",
                  background: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                }}
                aria-label="Back"
              >
                <BackArrowIcon />
              </button>
              <h2
                className="text-[22px]"
                style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
              >
                Add Categories
              </h2>
            </header>

            {/* Currently tracked */}
            <section>
              <p
                className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
                style={{ color: "var(--foreground-muted)" }}
              >
                Currently Tracked
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((catId) => {
                  const allDefs = getCategoryDefinitions();
                  const def = allDefs.find(d => d.id === catId);
                  return (
                    <span
                      key={catId}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
                      style={{
                        background: "var(--background-card)",
                        border: "1px solid var(--border-card)",
                        color: "var(--foreground-on-card)",
                      }}
                    >
                      {def?.name || catId}
                      <button
                        onClick={() => handleRemoveCategory(catId)}
                        className="w-4 h-4 flex items-center justify-center rounded-full"
                        style={{ color: "var(--terracotta)" }}
                        aria-label={`Remove ${def?.name || catId}`}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            </section>

            {/* Base categories */}
            {baseCategoriesNotTracked.length > 0 && (
              <section>
                <p
                  className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Base Categories
                </p>
                <div className="flex flex-col gap-2">
                  {baseCategoriesNotTracked.map((def) => (
                    <div
                      key={def.id}
                      className="rounded-xl px-4 py-3 flex items-center gap-3"
                      style={{
                        background: "var(--background-card)",
                        border: "1px solid var(--border-card)",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                          {def.name}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>
                          {def.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddCategory(def.id)}
                        className="px-3 py-1 rounded-full text-[11px] font-bold shrink-0"
                        style={{ background: "var(--sage)", color: "#fff" }}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Expanded library by domain */}
            {Array.from(categoryLibrary.entries()).map(([domain, defs]) => {
              const isExpanded = expandedDomains.has(domain);
              const untrackedDefs = defs.filter(d => !categories.includes(d.id));
              if (untrackedDefs.length === 0) return null;
              return (
                <section key={domain}>
                  <button
                    className="flex items-center gap-2 w-full text-left mb-2"
                    onClick={() => toggleDomain(domain)}
                    aria-expanded={isExpanded}
                  >
                    <p
                      className="text-[11px] uppercase tracking-[0.15em] font-bold"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {domain}
                    </p>
                    <span className="text-[11px]" style={{ color: "var(--foreground-faint)" }}>
                      ({untrackedDefs.length})
                    </span>
                    <span style={{ color: "var(--foreground-faint)" }}>
                      <ChevronDownIcon open={isExpanded} />
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="flex flex-col gap-2">
                      {untrackedDefs.map((def) => (
                        <div
                          key={def.id}
                          className="rounded-xl px-4 py-3 flex items-center gap-3"
                          style={{
                            background: "var(--background-card)",
                            border: "1px solid var(--border-card)",
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>
                              {def.name}
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: "var(--foreground-on-card-faint)" }}>
                              {def.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddCategory(def.id)}
                            className="px-3 py-1 rounded-full text-[11px] font-bold shrink-0"
                            style={{ background: "var(--sage)", color: "#fff" }}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

            {/* Custom category */}
            <section>
              <p
                className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3"
                style={{ color: "var(--foreground-muted)" }}
              >
                Create Your Own
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCustomCategory();
                  }}
                  placeholder="e.g. Focus, Romance, Fitness"
                  className="flex-1 rounded-lg px-3 py-2.5 text-[14px] outline-none"
                  style={{
                    background: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border-card)",
                  }}
                  aria-label="Custom category name"
                />
                <button
                  onClick={handleAddCustomCategory}
                  className="px-4 py-2 rounded-lg text-[13px] font-bold shrink-0"
                  style={{ background: "var(--sage)", color: "#fff" }}
                >
                  Add
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
