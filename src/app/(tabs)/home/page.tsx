"use client";

/**
 * Home Tab — the daily hub.
 *
 * Layout is borrowed from the plant/wellness app reference:
 * - Greeting header
 * - Hero "folder" card — today's sky (moon phase + zodiac season), tappable
 * - Compact metric row (planetary day · nakshatra · element), each tappable
 * - Next full moon / new moon cards, tappable to open lore
 * - Widget grid below
 *
 * All celestial elements open an InfoSheet with detailed meaning.
 */

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ─── Almanac tip category preferences ──────────────────────────────────────
const ALMANAC_PREFS_KEY = "mapped:almanac-prefs";

const ALL_TIP_CATEGORIES = [
  { id: "Baby & Kids", icon: "👶", label: "Baby & Kids" },
  { id: "Hair & Beauty", icon: "💇", label: "Hair & Beauty" },
  { id: "Health", icon: "🩺", label: "Health" },
  { id: "Home", icon: "🏠", label: "Home" },
  { id: "Money", icon: "💰", label: "Money" },
  { id: "Relationships", icon: "💕", label: "Relationships" },
  { id: "Cooking & Preserving", icon: "🫙", label: "Cooking" },
  { id: "Fishing & Outdoors", icon: "🎣", label: "Outdoors" },
] as const;

const RITUAL_MODALITY_PREFS_KEY = "mapped:ritual-modalities";

function loadRitualModPrefs(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(RITUAL_MODALITY_PREFS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function loadAlmanacPrefs(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(ALMANAC_PREFS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  // Default: everything on
  const defaults: Record<string, boolean> = {};
  ALL_TIP_CATEGORIES.forEach((c) => (defaults[c.id] = true));
  return defaults;
}

function saveAlmanacPrefs(prefs: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ALMANAC_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}
import {
  getMoonPhase,
  getCurrentZodiacSeason,
  getCurrentNakshatra,
  getNextMoonEvents,
  PLANETARY_DAYS,
  PLANETARY_DAY_CONTEXT,
  MOON_LORE,
  NEW_MOON_LORE,
  type MoonPhaseInfo,
  type ZodiacSeason,
  type NakshatraInfo,
  type PlanetaryDay,
  type NextMoonEvent,
} from "@/lib/celestialCalendar";
import { getDailyRituals, type ModalityPrefs } from "@/lib/rituals";
import { generateShareCard } from "@/lib/shareCard";
import { getDailyQuote } from "@/lib/dailyQuote";
import { ALL_CARDS, getCardImagePath, CARD_BACK_IMAGE } from "@/lib/tarot";
import Image from "next/image";
import { STITCHED_ANIMAL_ORACLE } from "@/lib/stitchedAnimalOracle";
import { getDailyEnergy } from "@/lib/celestialCalendar";
import FolderCard from "@/components/FolderCard";
import InfoSheet from "@/components/InfoSheet";
import MoonPhaseIcon from "@/components/MoonPhaseIcon";

interface DailyHoroscope {
  headline: string;
  horoscope: string;
  vibes: string[];
  avoid: string[];
  generatedAt: string;
}

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
};

type HorizonEvent = {
  name: string;
  daysUntil: number;
  tradition: string;
  category: string;
  date: Date;
  description: string;
  ritualHint: string;
  element?: string;
};

type SheetKind =
  | { kind: "moon-phase" }
  | { kind: "season" }
  | { kind: "planetary-day" }
  | { kind: "element" }
  | { kind: "nakshatra" }
  | { kind: "next-full-moon" }
  | { kind: "next-new-moon" }
  | { kind: "horizon-event"; event: HorizonEvent };

export default function HomeTab() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [hasChart, setHasChart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [horoscopeStatus, setHoroscopeStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [horoscopeError, setHoroscopeError] = useState<string>("");
  const [journalPrompt, setJournalPrompt] = useState<string | null>(null);
  const [journalPromptContext, setJournalPromptContext] = useState<string>("");
  const [journalPromptLoading, setJournalPromptLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState<"tarot" | "oracle" | null>(null);
  const [copiedShare, setCopiedShare] = useState<"tarot" | "oracle" | null>(null);
  const [tarotFlipping, setTarotFlipping] = useState(false);
  const [oracleFlipping, setOracleFlipping] = useState(false);

  // Card pull state — remember reveals for today (use local date, not UTC)
  const [tarotRevealed, setTarotRevealed] = useState(() => {
    try {
      const d = new Date();
      const key = `mapped:tarot-revealed-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      return localStorage.getItem(key) === "1";
    } catch { return false; }
  });
  const [oracleRevealed, setOracleRevealed] = useState(() => {
    try {
      const d = new Date();
      const key = `mapped:oracle-revealed-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      return localStorage.getItem(key) === "1";
    } catch { return false; }
  });

  // Today's celestial snapshot (memoized per render — cheap)
  const today = useMemo(() => new Date(), []);
  // Local date string for cache keys — avoids UTC rollover mid-evening
  const todayLocal = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);
  const moon = useMemo(() => getMoonPhase(today), [today]);
  const season = useMemo(() => getCurrentZodiacSeason(today), [today]);
  const nakshatra = useMemo(() => getCurrentNakshatra(today), [today]);
  const planetaryDay = useMemo(() => {
    const idx = today.getDay(); // 0 = Sunday
    return PLANETARY_DAYS[idx];
  }, [today]);
  const nextMoons = useMemo(() => getNextMoonEvents(today), [today]);

  // Deterministic daily seed — same value all day, changes at midnight
  const dailySeed = useMemo(() => {
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    return ((y * 367 + m * 31 + d * 13) * 2654435761) >>> 0;
  }, [today]);

  // Daily quote (cached in localStorage)
  const dailyQuote = useMemo(() => {
    const cacheKey = `mapped:quote-${todayLocal}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached) as { text: string; author: string; source?: string; reason: string };
      // Clean old cache
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith("mapped:quote-") && k !== cacheKey) localStorage.removeItem(k);
      }
    } catch { /* proceed */ }
    const result = getDailyQuote(today);
    const val = { text: result.quote.text, author: result.quote.author, source: result.quote.source, reason: result.reason };
    try { localStorage.setItem(cacheKey, JSON.stringify(val)); } catch { /* full */ }
    return val;
  }, [today]);

  // Daily tarot card (deterministic per day)
  const dailyTarot = useMemo(() => {
    const idx = dailySeed % ALL_CARDS.length;
    return ALL_CARDS[idx];
  }, [dailySeed]);

  // Daily oracle card (deterministic per day, different offset)
  const dailyOracle = useMemo(() => {
    const oracleCards = STITCHED_ANIMAL_ORACLE.cards;
    const idx = (dailySeed * 7 + 13) % oracleCards.length;
    return oracleCards[idx];
  }, [dailySeed]);

  // Upcoming celestial events (next 30 days, skip raw moon events since we show those separately)
  const upcomingEvents = useMemo(() => {
    const energy = getDailyEnergy(today);
    return energy.upcomingEvents
      .filter(e => e.category !== "moon")
      .slice(0, 6)
      .map((event) => {
        const eventDate = new Date(event.date);
        const diffTime = eventDate.getTime() - today.getTime();
        const daysUntil = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        return {
          name: event.name,
          daysUntil,
          tradition: event.tradition,
          category: event.category,
          date: eventDate,
          description: event.description,
          ritualHint: event.ritualHint,
          element: event.element,
        };
      });
  }, [today]);

  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  useEffect(() => {
    async function loadUser() {
      const stored = sessionStorage.getItem("chartResult");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setUserName(data.name);
          setHasChart(true);
        } catch { /* corrupted session data — ignore */ }
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Prefer the account name (set during sign-up) over the chart subject name
          const accountName = session.user.user_metadata?.name || null;

          const { data: profile, error: profileErr } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .single();
          if (!profileErr && profile && profile.onboarding_completed === false) {
            router.replace("/onboarding");
            return;
          }

          const { data } = await supabase
            .from("charts")
            .select("name")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (data) {
            setUserName(accountName || data.name);
            setHasChart(true);
          } else if (accountName) {
            setUserName(accountName);
          }
        }
      } catch {
        // Supabase unreachable — show the page with universal content
        console.warn("Could not reach Supabase — showing default home view");
      }
      setIsLoading(false);
    }

    loadUser();
  }, [router]);

  // Fetch daily horoscope — simple state machine: idle → loading → done/error
  useEffect(() => {
    if (!hasChart || horoscopeStatus !== "idle") return;

    // Check localStorage cache — horoscope persists for the whole day
    const todayKey = `horoscope-v3-${todayLocal}`;
    try {
      const cached = localStorage.getItem(todayKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.horoscope) {
          setHoroscope(parsed);
          setHoroscopeStatus("done");
          return;
        }
      }
      // Clean up old days
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("horoscope-v3-") && k !== todayKey) {
          localStorage.removeItem(k);
        }
      }
    } catch { /* stale cache — refetch */ }

    // Mark as loading immediately so this effect won't re-fire
    setHoroscopeStatus("loading");

    async function doFetch() {
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (!authSession?.user) {
          setHoroscopeError("No auth session");
          setHoroscopeStatus("error");
          return;
        }

        // Use select("*") like every other page does — avoids column mismatch issues
        const { data: chartData, error: chartErr } = await supabase
          .from("charts")
          .select("*")
          .eq("user_id", authSession.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (chartErr || !chartData?.big_three) {
          setHoroscopeError("Chart query: " + (chartErr?.message || "no big_three found"));
          setHoroscopeStatus("error");
          return;
        }

        // Build celestial context
        const celestial = {
          moonPhase: moon.label,
          moonIllumination: moon.illumination,
          zodiacSeason: season.sign,
          seasonElement: season.element,
          planetaryDay: planetaryDay.day,
          planetaryDayPlanet: planetaryDay.planet,
          nakshatra: nakshatra.name,
          nakshatraQuality: nakshatra.quality,
        };

        // Try to get transits (optional)
        let transits = undefined;
        try {
          if (chartData.planets?.length) {
            const transitRes = await fetch("/api/transits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                natalPlanets: chartData.planets,
                transitDate: todayLocal,
              }),
            });
            if (transitRes.ok) transits = await transitRes.json();
          }
        } catch { /* transits are a bonus */ }

        const res = await fetch("/api/horoscope", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chart: {
              bigThree: chartData.big_three,
              planets: chartData.planets || [],
              houses: chartData.houses || [],
              aspects: chartData.aspects || [],
              specialPoints: chartData.special_points || [],
            },
            celestial,
            transits,
            userName: userName || undefined,
            userId: authSession.user.id,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          setHoroscopeError("API " + res.status + ": " + errBody);
          setHoroscopeStatus("error");
          return;
        }

        const data = await res.json();
        setHoroscope(data);
        setHoroscopeStatus("done");
        try { localStorage.setItem(todayKey, JSON.stringify(data)); } catch { /* quota */ }
      } catch (err) {
        setHoroscopeError("Exception: " + String(err));
        setHoroscopeStatus("error");
      }
    }

    doFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChart, horoscopeStatus]);

  // Moon sign label (sidereal, from almanac data or celestial calendar)
  const moonSignLabel = useMemo(() => {
    const MOON_SIGNS = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    ];
    const ref = new Date("2024-04-08T00:00:00Z").getTime();
    const elapsed = (today.getTime() - ref) / (1000 * 60 * 60 * 24);
    const idx = Math.floor(((elapsed % 27.32) / 27.32) * 12) % 12;
    return MOON_SIGNS[idx < 0 ? idx + 12 : idx];
  }, [today]);

  // Venus sign (approximate — moves ~1 sign/month)
  const venusSign = useMemo(() => {
    const SIGNS = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    ];
    const ref = new Date("2024-03-21T00:00:00Z").getTime();
    const elapsed = (today.getTime() - ref) / (1000 * 60 * 60 * 24);
    const idx = Math.floor(elapsed / 30.4) % 12;
    return SIGNS[idx < 0 ? idx + 12 : idx];
  }, [today]);

  // Next major upcoming event for "Next Up" banner
  const nextUpEvent = useMemo(() => {
    if (upcomingEvents.length > 0) return upcomingEvents[0];
    return null;
  }, [upcomingEvents]);

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </main>
    );
  }

  // First name only — greeting feels more personal
  const firstName = userName?.split(" ")[0] ?? null;

  // If no chart exists yet, prompt them to create one
  if (!hasChart) {
    return (
      <main className="w-full max-w-lg mx-auto px-5 py-6 pb-24">
        <header className="mb-6">
          <p className="text-terracotta/80 text-[10px] uppercase tracking-[0.25em] font-semibold mb-2">
            {dateStr}
          </p>
          <h1
            className="text-[32px] text-foreground leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome to mapped
          </h1>
        </header>

        <div className="pt-4">
          <FolderCard tabLabel="Start here" color="terracotta">
            <p
              className="text-[22px] leading-tight mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Calculate your chart
            </p>
            <p className="text-cream/80 text-sm leading-relaxed mb-5">
              Unlock personalized insights, transits, and daily guidance tailored to your birth chart.
            </p>
            <button
              onClick={() => router.push("/chart/new")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                         bg-ink text-paper text-xs font-semibold tracking-wide uppercase
                         hover:bg-ink/90 active:scale-[0.98] transition-all"
            >
              Get started →
            </button>
          </FolderCard>
        </div>

        {/* Daily quote for visitors without a chart */}
        <div className="mt-10 rounded-2xl bg-card/45 border border-foreground/10 px-5 py-5">
          <p className="text-foreground/80 text-[15px] leading-[1.7] italic">
            &ldquo;{dailyQuote.text}&rdquo;
          </p>
          <p className="text-foreground/50 text-[12px] mt-3">
            — {dailyQuote.author}
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`@keyframes cardFlip { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }`}</style>
      <main className="w-full max-w-lg mx-auto px-5 py-6 pb-28">
        {/* ─── Greeting header with moon ─── */}
        <header className="flex items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-3"
              style={{ color: "var(--terracotta)", opacity: 0.8 }}
            >
              {dateStr}
            </p>
            <h1
              className="text-[38px] leading-[1.05] tracking-tight font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
            >
              {greeting}{firstName ? "," : ""}
              {firstName && (
                <>
                  <br />
                  <span style={{ color: "var(--terracotta)" }}>{firstName}</span>
                </>
              )}
            </h1>
          </div>

          {/* Moon phase badge */}
          <button
            type="button"
            onClick={() => setSheet({ kind: "moon-phase" })}
            className="shrink-0 rounded-2xl border p-3 text-center active:scale-95 transition-all"
            style={{
              borderColor: "var(--border-card)",
              backgroundColor: "var(--background-card)",
            }}
          >
            <MoonPhaseIcon phase={moon.label} size={80} className="mb-1" />
            <p
              className="text-[8px] uppercase tracking-[0.2em] font-bold mb-0.5"
              style={{ color: "var(--foreground)", opacity: 0.45 }}
            >
              Today&apos;s moon
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.15em] font-bold"
              style={{ color: "var(--foreground)", opacity: 0.7 }}
            >
              {moon.label}
            </p>
          </button>
        </header>

        {/* ─── Today's Transit card ─── */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            backgroundColor: "var(--background-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="px-6 pt-6 pb-5">
            {/* Tag */}
            <span
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-full mb-4"
              style={{
                backgroundColor: "var(--terracotta)",
                color: "var(--cream, #FFF8F0)",
              }}
            >
              Today&apos;s transit ✦
            </span>

            {/* Headline + sidebar row */}
            <div className="flex items-start gap-5">
              {/* Left: headline + body */}
              <div className="flex-1 min-w-0">
                {horoscope && horoscopeStatus === "done" ? (
                  <h2
                    className="text-[28px] leading-[1.1] tracking-tight mb-4"
                    style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
                  >
                    {horoscope.headline}
                  </h2>
                ) : horoscopeStatus === "loading" ? (
                  <div className="flex items-center gap-2 mb-4 py-3">
                    <div className="w-4 h-4 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
                    <p className="text-foreground/50 text-[12px] uppercase tracking-[0.15em] font-semibold">
                      Reading your chart...
                    </p>
                  </div>
                ) : horoscopeStatus === "error" ? (
                  <p className="text-foreground/50 text-[15px] leading-relaxed mb-4">
                    Horoscope unavailable right now
                  </p>
                ) : (
                  <h2
                    className="text-[28px] leading-[1.1] tracking-tight mb-4"
                    style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
                  >
                    Your day
                  </h2>
                )}

                {horoscope && horoscopeStatus === "done" && (
                  <p
                    className="text-[14px] leading-[1.7]"
                    style={{ color: "var(--foreground)", opacity: 0.75 }}
                  >
                    {horoscope.horoscope}
                  </p>
                )}
              </div>

              {/* Right sidebar: celestial context */}
              <div className="shrink-0 w-[110px] space-y-4 pt-1">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: "var(--terracotta)" }}>
                    Moon in
                  </p>
                  <p className="text-[13px] uppercase tracking-[0.12em] font-bold mt-0.5" style={{ color: "var(--foreground)" }}>
                    {moonSignLabel}
                  </p>
                </div>
                <div
                  className="w-6 border-t-2"
                  style={{ borderColor: "var(--terracotta)" }}
                />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: "var(--terracotta)" }}>
                    Venus in
                  </p>
                  <p className="text-[13px] uppercase tracking-[0.12em] font-bold mt-0.5" style={{ color: "var(--foreground)" }}>
                    {venusSign}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vibes / Avoid */}
          {horoscope && horoscopeStatus === "done" && (
            <>
              <div className="mx-6">
                <div className="border-t" style={{ borderColor: "var(--border-card)" }} />
              </div>
              <div className="px-6 py-5">
                <div className="flex gap-6">
                  {/* Vibes */}
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2.5" style={{ color: "var(--terracotta)" }}>
                      Vibes
                    </p>
                    <div className="space-y-1.5">
                      {horoscope.vibes.map((v, i) => (
                        <p key={i} className="text-[12px] leading-snug" style={{ color: "var(--foreground)", opacity: 0.75 }}>
                          <span style={{ color: "var(--terracotta)", marginRight: 6 }}>+</span> {v}
                        </p>
                      ))}
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="w-px self-stretch" style={{ backgroundColor: "var(--border-card)" }} />
                  {/* Avoid */}
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2.5" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                      Avoid
                    </p>
                    <div className="space-y-1.5">
                      {horoscope.avoid.map((a, i) => (
                        <p key={i} className="text-[12px] leading-snug" style={{ color: "var(--foreground)", opacity: 0.55 }}>
                          <span style={{ opacity: 0.4, marginRight: 6 }}>–</span> {a}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="px-6 pb-6">
                <div className="flex gap-2.5">
                  {/* Journal — outlined */}
                  <button
                    onClick={async () => {
                      if (journalPrompt) {
                        router.push(`/journal?prompt=${encodeURIComponent(journalPrompt)}&context=${encodeURIComponent(journalPromptContext)}`);
                        return;
                      }
                      setJournalPromptLoading(true);
                      try {
                        const res = await fetch("/api/journal/prompt", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            horoscope: horoscope.horoscope,
                            celestial: {
                              moonPhase: moon.label,
                              zodiacSeason: season.sign,
                              planetaryDay: planetaryDay.day,
                              nakshatra: nakshatra.name,
                              nakshatraQuality: nakshatra.quality,
                            },
                            userName: firstName || undefined,
                          }),
                        });
                        const data = await res.json();
                        const p = data.prompt || "What's alive in you right now?";
                        const c = data.context || "";
                        setJournalPrompt(p);
                        setJournalPromptContext(c);
                        router.push(`/journal?prompt=${encodeURIComponent(p)}&context=${encodeURIComponent(c)}`);
                      } catch {
                        router.push("/journal");
                      }
                      setJournalPromptLoading(false);
                    }}
                    className="flex-1 rounded-full py-3 flex items-center justify-center gap-2
                               active:scale-[0.97] transition-all"
                    style={{
                      border: "1.5px solid var(--border-card)",
                      color: "var(--foreground)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                    </svg>
                    <span className="text-[11px] uppercase tracking-[0.15em] font-bold" style={{ opacity: 0.7 }}>
                      {journalPromptLoading ? "..." : "Journal"}
                    </span>
                  </button>

                  {/* Go Deeper — filled terracotta */}
                  <button
                    onClick={() => {
                      const dollyContext = `Here's my horoscope for today: "${horoscope.horoscope}" — Vibes: ${horoscope.vibes.join(", ")}. Help me go deeper into what this means for me today.`;
                      sessionStorage.setItem("dolly-context", dollyContext);
                      router.push("/dolly");
                    }}
                    className="flex-1 rounded-full py-3 flex items-center justify-center gap-2
                               active:scale-[0.97] transition-all"
                    style={{
                      backgroundColor: "var(--terracotta)",
                      color: "var(--cream, #FFF8F0)",
                    }}
                  >
                    <span className="text-[11px]">✦</span>
                    <span className="text-[11px] uppercase tracking-[0.15em] font-bold">
                      Go deeper
                    </span>
                  </button>

                  {/* Share — outlined */}
                  <button
                    disabled={shareLoading}
                    onClick={async () => {
                      setShareLoading(true);
                      try {
                        const blob = await generateShareCard({
                          headline: horoscope.headline,
                          horoscope: horoscope.horoscope,
                          vibes: horoscope.vibes,
                          avoid: horoscope.avoid,
                          moonPhase: moon.label,
                          moonEmoji: moon.emoji,
                          zodiacSeason: season.sign,
                          date: dateStr,
                          userName: firstName || undefined,
                        });
                        const file = new File([blob], "mapped-horoscope.png", { type: "image/png" });
                        if (navigator.share && navigator.canShare?.({ files: [file] })) {
                          await navigator.share({
                            files: [file],
                            title: "My daily horoscope — mapped",
                            text: horoscope.headline,
                          });
                        } else {
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "mapped-horoscope.png";
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                      } catch { /* user cancelled share or error */ }
                      setShareLoading(false);
                    }}
                    className="flex-1 rounded-full py-3 flex items-center justify-center gap-2
                               active:scale-[0.97] transition-all disabled:opacity-50"
                    style={{
                      border: "1.5px solid var(--border-card)",
                      color: "var(--foreground)",
                    }}
                  >
                    {shareLoading ? (
                      <div className="w-3 h-3 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                    )}
                    <span className="text-[11px] uppercase tracking-[0.15em] font-bold" style={{ opacity: 0.7 }}>
                      Share
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── Daily quote ─── */}
        <div className="mb-6 rounded-2xl px-5 py-5" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
          <p className="text-[15px] leading-[1.7] italic" style={{ color: "var(--foreground)", opacity: 0.8, fontFamily: "var(--font-body)" }}>
            &ldquo;{dailyQuote.text}&rdquo;
          </p>
          <div className="flex items-baseline justify-between mt-3">
            <p className="text-[12px]" style={{ color: "var(--foreground)", opacity: 0.5 }}>
              — {dailyQuote.author}{dailyQuote.source ? <span style={{ opacity: 0.7 }}>,{" "}{dailyQuote.source}</span> : ""}
            </p>
            <p className="text-[9px] uppercase tracking-[0.15em] shrink-0 ml-3" style={{ color: "var(--foreground)", opacity: 0.25 }}>
              {dailyQuote.reason}
            </p>
          </div>
        </div>

        {/* ─── Next Up banner ─── */}
        {nextUpEvent && (
          <button
            type="button"
            onClick={() => setSheet({ kind: "horizon-event", event: nextUpEvent })}
            className="w-full rounded-2xl overflow-hidden mb-6 text-left active:scale-[0.99] transition-all"
            style={{
              backgroundColor: "var(--background-card)",
              border: "1px solid var(--border-card)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "var(--terracotta)" }}>
                  Next up
                </p>
                <p
                  className="text-[18px] leading-tight tracking-tight"
                  style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
                >
                  {nextUpEvent.name}
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] font-semibold mt-1" style={{ color: "var(--terracotta)", opacity: 0.7 }}>
                  {nextUpEvent.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {nextUpEvent.daysUntil > 0 && ` · ${nextUpEvent.daysUntil === 1 ? "tomorrow" : `in ${nextUpEvent.daysUntil} days`}`}
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                   className="shrink-0 ml-3" style={{ color: "var(--terracotta)", opacity: 0.5 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        )}

        {/* ─── Card pulls: Tarot · Oracle ─── */}
        <p className="text-foreground/50 text-[10px] uppercase tracking-[0.25em] font-semibold mb-3">
          Today&apos;s pulls
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Tarot card — always stays in its column */}
          <div className={`rounded-xl bg-card/50 border p-2 transition-all ${expandedCard === "tarot" ? "border-terracotta/30" : "border-foreground/12"}`}>
            <p className="text-terracotta/65 text-[9px] uppercase tracking-[0.2em] font-bold mb-2">
              Tarot
            </p>
            {!tarotRevealed && !tarotFlipping ? (
              <button
                onClick={() => {
                  setTarotFlipping(true);
                  setTimeout(() => {
                    setTarotRevealed(true);
                    setTarotFlipping(false);
                    try { localStorage.setItem(`mapped:tarot-revealed-${todayLocal}`, "1"); } catch {}
                  }, 800);
                }}
                className="w-full rounded-xl overflow-hidden relative
                           border border-terracotta/25 hover:border-terracotta/50 transition-all
                           flex flex-col items-center justify-center gap-2 active:scale-[0.97]"
                style={{ aspectRatio: "1/1" }}
              >
                <Image src={CARD_BACK_IMAGE} alt="Card back" fill className="object-cover" draggable={false} />
                <span className="relative z-10 text-white/80 text-[10px] font-medium bg-black/30 px-3 py-1 rounded-full">Tap to pull</span>
              </button>
            ) : tarotFlipping ? (
              <div className="w-full rounded-xl overflow-hidden" style={{ perspective: "600px", aspectRatio: "1/1" }}>
                <div className="w-full h-full transition-transform duration-700"
                  style={{ transformStyle: "preserve-3d", animation: "cardFlip 0.8s ease-in-out forwards" }}>
                  <div className="absolute inset-0 rounded-xl border border-terracotta/25 overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}>
                    <Image src={CARD_BACK_IMAGE} alt="Card back" fill className="object-cover" draggable={false} />
                  </div>
                  <div className="absolute inset-0 rounded-xl border border-terracotta/25 overflow-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    {getCardImagePath(dailyTarot.id) ? (
                      <Image src={getCardImagePath(dailyTarot.id)!} alt={dailyTarot.name} fill className="object-cover" draggable={false} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-terracotta/15 to-amber/10">
                        <p className="text-foreground text-sm font-medium text-center" style={{ fontFamily: "var(--font-display)" }}>{dailyTarot.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setExpandedCard(expandedCard === "tarot" ? null : "tarot")}
                className="w-full active:scale-[0.98] transition-transform"
              >
                <div className="w-full rounded-xl overflow-hidden relative border border-terracotta/25" style={{ aspectRatio: "1/1" }}>
                  {getCardImagePath(dailyTarot.id) ? (
                    <Image src={getCardImagePath(dailyTarot.id)!} alt={dailyTarot.name} fill className="object-cover" draggable={false} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-terracotta/15 to-amber/10">
                      <p className="text-foreground text-sm font-medium text-center" style={{ fontFamily: "var(--font-display)" }}>{dailyTarot.name}</p>
                    </div>
                  )}
                </div>
                <p className="text-foreground text-[12px] font-medium mt-1.5 text-center" style={{ fontFamily: "var(--font-display)" }}>
                  {dailyTarot.name}
                </p>
                <p className="text-foreground/40 text-[9px] text-center">
                  {dailyTarot.uprightKeywords.slice(0, 3).join(" · ")}
                </p>
              </button>
            )}
          </div>

          {/* Oracle card — always stays in its column */}
          <div className={`rounded-xl bg-card/50 border p-2 transition-all ${expandedCard === "oracle" ? "border-terracotta/30" : "border-foreground/12"}`}>
            <p className="text-terracotta/65 text-[9px] uppercase tracking-[0.2em] font-bold mb-2">
              Oracle
            </p>
            {!oracleRevealed && !oracleFlipping ? (
              <button
                onClick={() => {
                  setOracleFlipping(true);
                  setTimeout(() => {
                    setOracleRevealed(true);
                    setOracleFlipping(false);
                    try { localStorage.setItem(`mapped:oracle-revealed-${todayLocal}`, "1"); } catch {}
                  }, 800);
                }}
                className="w-full rounded-xl overflow-hidden relative
                           border border-sage/25 hover:border-sage/50 transition-all
                           flex flex-col items-center justify-center gap-2 active:scale-[0.97]"
                style={{ aspectRatio: "1/1" }}
              >
                <Image src="/oracle/stitched-animal/back of deck.png" alt="Card back" fill className="object-cover" draggable={false} />
                <span className="relative z-10 text-white/80 text-[10px] font-medium bg-black/30 px-3 py-1 rounded-full">Tap to pull</span>
              </button>
            ) : oracleFlipping ? (
              <div className="w-full rounded-xl overflow-hidden" style={{ perspective: "600px", aspectRatio: "1/1" }}>
                <div className="w-full h-full transition-transform duration-700"
                  style={{ transformStyle: "preserve-3d", animation: "cardFlip 0.8s ease-in-out forwards" }}>
                  <div className="absolute inset-0 rounded-xl border border-sage/25 overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}>
                    <Image src="/oracle/stitched-animal/back of deck.png" alt="Card back" fill className="object-cover" draggable={false} />
                  </div>
                  <div className="absolute inset-0 rounded-xl border border-sage/25 overflow-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    <Image src={dailyOracle.image} alt={dailyOracle.animal} fill className="object-cover" draggable={false} />
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setExpandedCard(expandedCard === "oracle" ? null : "oracle")}
                className="w-full active:scale-[0.98] transition-transform"
              >
                <div className="w-full rounded-xl overflow-hidden relative border border-sage/25" style={{ aspectRatio: "1/1" }}>
                  <Image src={dailyOracle.image} alt={dailyOracle.animal} fill className="object-cover" draggable={false} />
                </div>
                <p className="text-foreground text-[12px] font-medium mt-1.5 text-center" style={{ fontFamily: "var(--font-display)" }}>
                  {dailyOracle.animal}
                </p>
                <p className="text-foreground/40 text-[9px] text-center">
                  {dailyOracle.keyword}
                </p>
              </button>
            )}
          </div>
        </div>

        {/* ─── Expanded reading panel — below the grid ─── */}
        {expandedCard === "tarot" && tarotRevealed && (
          <div className="mb-7 rounded-2xl bg-card/50 border border-foreground/12 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-foreground text-[14px] font-medium" style={{ fontFamily: "var(--font-display)" }}>
                {dailyTarot.name}
              </p>
              <button onClick={() => setExpandedCard(null)} className="text-foreground/25 text-[10px]">collapse</button>
            </div>
            {(dailyTarot.element || dailyTarot.zodiac || dailyTarot.planet) && (
              <div className="flex items-center gap-1.5 text-[9px] text-foreground/30">
                {dailyTarot.element && <span>{dailyTarot.element}</span>}
                {dailyTarot.zodiac && <><span>·</span><span>{dailyTarot.zodiac}</span></>}
                {dailyTarot.planet && <><span>·</span><span>{dailyTarot.planet}</span></>}
              </div>
            )}
            <p className="text-foreground/60 text-[12px] leading-relaxed">
              {dailyTarot.uprightMeaning}
            </p>
            <div className="rounded-lg bg-foreground/3 px-3 py-2.5">
              <p className="text-foreground/30 text-[9px] uppercase tracking-widest mb-1">If reversed</p>
              <p className="text-foreground/50 text-[11px] leading-relaxed">{dailyTarot.reversedMeaning}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const cardContext = `Tarot: ${dailyTarot.name} — ${dailyTarot.uprightKeywords.slice(0, 3).join(", ")}. ${dailyTarot.uprightMeaning}`;
                  router.push(`/journal?tab=pull&card=tarot&cardName=${encodeURIComponent(dailyTarot.name)}&cardMeaning=${encodeURIComponent(cardContext)}`);
                }}
                className="flex-1 rounded-lg bg-terracotta/8 border border-terracotta/20 px-3 py-2
                           flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
              >
                <span className="text-[12px]">&#x270D;&#xFE0F;</span>
                <span className="text-terracotta/70 text-[11px] font-semibold">Journal this</span>
              </button>
              <button
                onClick={() => {
                  const dollyContext = `I pulled the ${dailyTarot.name} today (tarot). Keywords: ${dailyTarot.uprightKeywords.join(", ")}. Upright meaning: "${dailyTarot.uprightMeaning}" — Help me understand what this card means for me today and how it connects to what's going on in my life.`;
                  sessionStorage.setItem("dolly-context", dollyContext);
                  router.push("/dolly");
                }}
                className="flex-1 rounded-lg bg-foreground/3 border border-foreground/10 px-3 py-2
                           flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
              >
                <span className="text-[12px]">&#x2728;</span>
                <span className="text-foreground/50 text-[11px] font-semibold">Go deeper</span>
              </button>
            </div>
            <button
              onClick={async () => {
                const shareText = `Today I pulled ${dailyTarot.name} from the tarot.\n\n${dailyTarot.uprightKeywords.slice(0, 3).join(" · ")}\n\n"${dailyTarot.uprightMeaning}"\n\n— Mapped Astrology`;
                if (navigator.share) {
                  try { await navigator.share({ text: shareText }); } catch { /* user cancelled */ }
                } else {
                  await navigator.clipboard.writeText(shareText);
                  setCopiedShare("tarot");
                  setTimeout(() => setCopiedShare(null), 2000);
                }
              }}
              className="w-full rounded-lg bg-foreground/3 border border-foreground/10 px-3 py-2
                         flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/40">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span className="text-foreground/50 text-[11px] font-semibold">
                {copiedShare === "tarot" ? "Copied!" : "Share this pull"}
              </span>
            </button>
          </div>
        )}

        {expandedCard === "oracle" && oracleRevealed && (
          <div className="mb-7 rounded-2xl bg-card/50 border border-foreground/12 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-foreground text-[14px] font-medium" style={{ fontFamily: "var(--font-display)" }}>
                {dailyOracle.animal}
              </p>
              <button onClick={() => setExpandedCard(null)} className="text-foreground/25 text-[10px]">collapse</button>
            </div>
            <p className="text-foreground/60 text-[12px] leading-relaxed">
              {dailyOracle.meaning}
            </p>
            <div className="rounded-lg bg-foreground/3 px-3 py-2.5">
              <p className="text-foreground/30 text-[9px] uppercase tracking-widest mb-1">Reflection</p>
              <p className="text-foreground/50 text-[11px] leading-relaxed">
                What part of your life is asking for {dailyOracle.keyword.toLowerCase()} right now? Sit with the {dailyOracle.animal.toLowerCase()}&apos;s energy and notice what comes up.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const cardContext = `Oracle: ${dailyOracle.animal} — ${dailyOracle.keyword}. ${dailyOracle.meaning}`;
                  router.push(`/journal?tab=pull&card=oracle&cardName=${encodeURIComponent(dailyOracle.animal)}&cardMeaning=${encodeURIComponent(cardContext)}`);
                }}
                className="flex-1 rounded-lg bg-terracotta/8 border border-terracotta/20 px-3 py-2
                           flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
              >
                <span className="text-[12px]">&#x270D;&#xFE0F;</span>
                <span className="text-terracotta/70 text-[11px] font-semibold">Journal this</span>
              </button>
              <button
                onClick={() => {
                  const dollyContext = `I pulled the ${dailyOracle.animal} oracle card today. Keyword: ${dailyOracle.keyword}. Meaning: "${dailyOracle.meaning}" — Help me understand what this animal's message means for me today.`;
                  sessionStorage.setItem("dolly-context", dollyContext);
                  router.push("/dolly");
                }}
                className="flex-1 rounded-lg bg-foreground/3 border border-foreground/10 px-3 py-2
                           flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
              >
                <span className="text-[12px]">&#x2728;</span>
                <span className="text-foreground/50 text-[11px] font-semibold">Go deeper</span>
              </button>
            </div>
            <button
              onClick={async () => {
                const shareText = `Today I pulled the ${dailyOracle.animal} oracle card.\n\n${dailyOracle.keyword}\n\n"${dailyOracle.meaning}"\n\n— Mapped Astrology`;
                if (navigator.share) {
                  try { await navigator.share({ text: shareText }); } catch { /* user cancelled */ }
                } else {
                  await navigator.clipboard.writeText(shareText);
                  setCopiedShare("oracle");
                  setTimeout(() => setCopiedShare(null), 2000);
                }
              }}
              className="w-full rounded-lg bg-foreground/3 border border-foreground/10 px-3 py-2
                         flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/40">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span className="text-foreground/50 text-[11px] font-semibold">
                {copiedShare === "oracle" ? "Copied!" : "Share this pull"}
              </span>
            </button>
          </div>
        )}

        {!expandedCard && <div className="mb-4" />}

        {/* ─── On the horizon — moons + celestial calendar ─── */}
        <p className="text-foreground/50 text-[10px] uppercase tracking-[0.25em] font-semibold mb-3">
          On the horizon
        </p>
        <div className="mb-7 rounded-2xl overflow-hidden border border-foreground/10">
          {/* Moon events row */}
          {(nextMoons.nextFull || nextMoons.nextNew) && (
            <div className="flex">
              {[
                nextMoons.nextFull
                  ? {
                      event: nextMoons.nextFull,
                      emoji:
                        (nextMoons.nextFull.moonName &&
                          MOON_LORE[nextMoons.nextFull.moonName]?.emoji) ??
                        "🌕",
                      sheetKind: "next-full-moon" as const,
                    }
                  : null,
                nextMoons.nextNew
                  ? {
                      event: nextMoons.nextNew,
                      emoji: "🌑",
                      sheetKind: "next-new-moon" as const,
                    }
                  : null,
              ]
                .filter(Boolean)
                .sort((a, b) => a!.event.daysUntil - b!.event.daysUntil)
                .map((item, idx, arr) => (
                  <button
                    key={item!.event.kind}
                    type="button"
                    onClick={() => setSheet({ kind: item!.sheetKind })}
                    className={`flex-1 px-4 py-3.5 text-left active:scale-[0.98] transition-all
                               ${idx === 0 ? "bg-card/60" : "bg-card/40"}
                               ${idx < arr.length - 1 ? "border-r border-foreground/8" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[24px] leading-none shrink-0">{item!.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-foreground text-[13px] leading-tight truncate font-medium"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {item!.event.label}
                        </p>
                        <p className="text-foreground/45 text-[10px] mt-0.5 tabular-nums">
                          {formatMoonDate(item!.event.date)} · {daysPhrase(item!.event.daysUntil)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {/* Upcoming events timeline */}
          {upcomingEvents.length > 0 && (
            <div className={`bg-card/35 px-4 py-3 ${(nextMoons.nextFull || nextMoons.nextNew) ? "border-t border-foreground/8" : ""}`}>
              {upcomingEvents.map((event, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSheet({ kind: "horizon-event", event })}
                  className={`flex items-center gap-3 py-2 w-full text-left active:scale-[0.98] transition-all ${idx < upcomingEvents.length - 1 ? "border-b border-foreground/5" : ""}`}
                >
                  <div className="w-9 text-center shrink-0">
                    <p className="text-foreground/30 text-[8px] uppercase tracking-wider leading-none">
                      {event.date.toLocaleDateString("en-US", { month: "short" })}
                    </p>
                    <p className="text-foreground/70 text-[16px] font-semibold leading-tight tabular-nums">
                      {event.date.getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground/75 text-[12px] font-medium truncate">{event.name}</p>
                    <p className="text-foreground/35 text-[9px] capitalize">{event.tradition}</p>
                  </div>
                  <span className="text-foreground/30 text-[10px] tabular-nums whitespace-nowrap shrink-0 flex items-center gap-1">
                    {event.daysUntil <= 1
                      ? event.daysUntil === 0 ? "today" : "tomorrow"
                      : `${event.daysUntil}d`}
                    <span className="text-foreground/20 text-[10px]">›</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Today's energy (tappable tiles) ─── */}
        <p className="text-foreground/50 text-[10px] uppercase tracking-[0.25em] font-semibold mb-3">
          Today&apos;s energy
        </p>
        <div className="flex flex-col gap-3 mb-6">
          <MetricTile
            label={`${planetaryDay.day} = ${planetaryDay.planet}'s day`}
            value={planetaryDay.energy}
            hint={shortHint(planetaryDay.focus)}
            glyph={PLANET_GLYPH[planetaryDay.planet] ?? "✦"}
            accent="amber"
            onClick={() => setSheet({ kind: "planetary-day" })}
          />
          <MetricTile
            label={`${season.sign} season · ${capitalize(season.element)} element`}
            value={ELEMENT_LORE[season.element].keyword}
            hint={shortHint(ELEMENT_LORE[season.element].practice)}
            glyph={elementGlyph(season.element)}
            accent="sage"
            onClick={() => setSheet({ kind: "element" })}
          />
          <MetricTile
            label={`Lunar mansion · ${nakshatra.quality}`}
            value={nakshatra.name}
            hint={shortHint(nakshatra.brief)}
            glyph="✦"
            accent="cream"
            onClick={() => setSheet({ kind: "nakshatra" })}
          />
        </div>

        <div className="h-8" />
      </main>

      {/* ─── Detail sheets ─── */}
      <DetailSheet
        sheet={sheet}
        onClose={() => setSheet(null)}
        moon={moon}
        season={season}
        nakshatra={nakshatra}
        planetaryDay={planetaryDay}
        nextMoons={nextMoons}
      />
    </>
  );
}

/* ─── Detail sheet router ───────────────────────────────────────────────── */

// ─── Almanac Tips — icon grid, expandable, customizable ─────────────────────

function AlmanacTipsSection({
  tips,
  gardening,
}: {
  tips: { category: string; icon: string; tip: string }[];
  gardening: string;
}) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setPrefs(loadAlmanacPrefs());
  }, []);

  const togglePref = useCallback((id: string) => {
    setPrefs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveAlmanacPrefs(next);
      return next;
    });
  }, []);

  // Filter tips to enabled categories only
  const enabledTips = tips.filter((t) => prefs[t.category] !== false);

  // Include gardening as a virtual tip so it appears in the grid
  const gardenTip = { category: "Garden & Earth", icon: "🌱", tip: gardening };
  const allVisible = [...enabledTips, gardenTip];

  // ─── Edit mode ─────────────────────────────────────────────────────
  if (editMode) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold">
            Customize tips
          </p>
          <button onClick={() => setEditMode(false)} className="text-terracotta text-[12px] font-semibold">
            Done
          </button>
        </div>
        <p className="text-foreground/55 text-[12px] leading-snug mb-3">
          Toggle which life areas show up in your almanac.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {ALL_TIP_CATEGORIES.map((cat) => {
            const on = prefs[cat.id] !== false;
            return (
              <button
                key={cat.id}
                onClick={() => togglePref(cat.id)}
                className={`flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 border transition-all ${
                  on ? "bg-terracotta/12 border-terracotta/30" : "bg-card/30 border-foreground/10 opacity-40"
                }`}
              >
                <span className="text-[20px]">{cat.icon}</span>
                <span className={`text-[9px] font-semibold leading-tight text-center ${on ? "text-terracotta" : "text-foreground/40"}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── "View all" mode — full written layout ────────────────────────
  if (showAll) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold">
            Almanac tips
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAll(false)} className="text-terracotta text-[11px] font-semibold">
              Show less
            </button>
            <button onClick={() => setEditMode(true)} className="text-foreground/40 hover:text-foreground/60 transition-colors" aria-label="Customize">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {allVisible.map((tip, i) => (
            <div key={i} className="rounded-xl bg-card/40 border border-foreground/12 px-3.5 py-2.5">
              <p className="text-foreground/50 text-[10px] uppercase tracking-[0.15em] font-bold mb-1">
                {tip.icon} {tip.category}
              </p>
              <p className="text-foreground/80 text-[13px] leading-snug">{tip.tip}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Default: icon grid — all icons visible, tap to expand one ────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold">
          Almanac tips
        </p>
        <button onClick={() => setEditMode(true)} className="text-foreground/40 hover:text-foreground/60 transition-colors" aria-label="Customize tips">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>

      {/* All icons in a grid — always visible */}
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {allVisible.map((tip) => {
          const isOpen = expandedTip === tip.category;
          return (
            <button
              key={tip.category}
              onClick={() => setExpandedTip(isOpen ? null : tip.category)}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-2 px-1 border transition-all ${
                isOpen
                  ? "bg-terracotta/12 border-terracotta/30"
                  : "bg-card/40 border-foreground/8 hover:bg-card/60"
              }`}
            >
              <span className="text-[20px]">{tip.icon}</span>
              <span className={`text-[8px] font-semibold leading-tight text-center ${isOpen ? "text-terracotta" : "text-foreground/45"}`}>
                {tip.category.split(" & ")[0].split(" ").slice(0, 1).join("")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded tip */}
      {expandedTip && (() => {
        const tip = allVisible.find((t) => t.category === expandedTip);
        if (!tip) return null;
        return (
          <div className="rounded-2xl bg-card/50 border border-foreground/12 p-4 mb-3">
            <p className="text-foreground/50 text-[10px] uppercase tracking-[0.15em] font-bold mb-1.5">
              {tip.icon} {tip.category}
            </p>
            <p className="text-foreground/80 text-[13px] leading-relaxed">{tip.tip}</p>
          </div>
        );
      })()}

      {/* View all button */}
      <button
        onClick={() => setShowAll(true)}
        className="w-full text-center text-terracotta/70 text-[11px] font-semibold hover:text-terracotta transition-colors"
      >
        View all tips
      </button>
    </div>
  );
}

// ─── Detail Sheet ───────────────────────────────────────────────────────────

interface DetailSheetProps {
  sheet: SheetKind | null;
  onClose: () => void;
  moon: MoonPhaseInfo;
  season: ZodiacSeason;
  nakshatra: NakshatraInfo;
  planetaryDay: PlanetaryDay;
  nextMoons: { nextFull: NextMoonEvent | null; nextNew: NextMoonEvent | null };
}

function DetailSheet({
  sheet,
  onClose,
  moon,
  season,
  nakshatra,
  planetaryDay,
  nextMoons,
}: DetailSheetProps) {
  // Load modality prefs for the moon ritual
  const [modPrefs, setModPrefs] = useState<Record<string, boolean>>({});
  useEffect(() => { setModPrefs(loadRitualModPrefs()); }, []);

  // Generate the modality-aware moon ritual
  const moonRitual = useMemo(() => {
    const daily = getDailyRituals(new Date(), undefined, modPrefs);
    return daily.moonRitual;
  }, [modPrefs]);

  if (!sheet) {
    return <InfoSheet isOpen={false} onClose={onClose} title="">{null}</InfoSheet>;
  }

  if (sheet.kind === "moon-phase") {
    const a = moon.almanac;
    return (
      <InfoSheet
        isOpen
        onClose={onClose}
        eyebrow={`${moon.illumination}% illuminated · ${planetaryDay.planet}'s day`}
        title={moon.label}
        glyph={moon.emoji}
      >
        {/* Phase meaning — smaller subtitle under the phase name */}
        <p className="text-foreground/45 text-[12px] leading-relaxed italic -mt-1">{moon.energy}</p>

        {/* Moon ritual — modality-aware */}
        <div>
          <p className="text-terracotta text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
            Your ritual
          </p>
          <div className="rounded-2xl bg-terracotta/10 border border-terracotta/25 p-4">
            <p className="text-terracotta text-[14px] font-semibold mb-1.5">{moonRitual.title}</p>
            <p className="text-foreground/70 text-[13px] leading-relaxed mb-3">{moonRitual.description}</p>
            <div className="space-y-3">
              {moonRitual.steps.map((step, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-terracotta/40 text-[11px] font-mono mt-0.5 w-4 text-right shrink-0">{i + 1}</span>
                  <p className="text-foreground/75 text-[13px] leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-foreground/35 text-[10px] mt-2 text-center">
            Customize your tools in the Ritual tab to change this ritual
          </p>
        </div>

        {/* Folk wisdom */}
        <div className="rounded-2xl bg-card/40 border border-foreground/12 p-4">
          <p className="text-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
            Folk wisdom
          </p>
          <p className="text-foreground/75 text-[13px] leading-relaxed mb-2">
            {a.folkWisdom}
          </p>
          <p className="text-foreground/60 text-[12px] leading-relaxed italic">
            {a.weatherLore}
          </p>
        </div>

        {/* Best for / Avoid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-sage/12 border border-sage/25 p-3">
            <p className="text-sage text-[9px] uppercase tracking-[0.2em] font-bold mb-1.5">
              Good for
            </p>
            {a.bestFor.map((item, i) => (
              <p key={i} className="text-foreground/80 text-[13px] leading-snug">+ {item}</p>
            ))}
          </div>
          <div className="rounded-xl bg-card/40 border border-foreground/12 p-3">
            <p className="text-foreground/50 text-[9px] uppercase tracking-[0.2em] font-bold mb-1.5">
              Avoid
            </p>
            {a.avoid.map((item, i) => (
              <p key={i} className="text-foreground/60 text-[13px] leading-snug">- {item}</p>
            ))}
          </div>
        </div>

        {/* Almanac tips — icon grid with expand + customize */}
        <AlmanacTipsSection tips={a.lifeTips} gardening={a.gardening} />
      </InfoSheet>
    );
  }

  if (sheet.kind === "season") {
    return (
      <InfoSheet
        isOpen
        onClose={onClose}
        eyebrow="Zodiac season"
        title={`${season.sign} season`}
        glyph="♒"
      >
        <p>{season.theme}</p>
        <div className="grid grid-cols-2 gap-3">
          <MiniFact label="Element" value={season.element} />
          <MiniFact label="Modality" value={season.modality} />
          <MiniFact label="Ruler" value={season.rulingPlanet} />
          <MiniFact
            label="Span"
            value={`${monthName(season.startMonth)} ${season.startDay}–${monthName(season.endMonth)} ${season.endDay}`}
          />
        </div>
      </InfoSheet>
    );
  }

  if (sheet.kind === "planetary-day") {
    const ctx = PLANETARY_DAY_CONTEXT[planetaryDay.day];
    return (
      <InfoSheet
        isOpen
        onClose={onClose}
        eyebrow={planetaryDay.day}
        title={`${planetaryDay.planet}'s day`}
        glyph={PLANET_GLYPH[planetaryDay.planet] ?? "✦"}
      >
        {/* Vedic name */}
        <p className="text-foreground/45 text-[12px] italic -mt-1">{ctx.vedicName}</p>

        {/* What this planet means */}
        <p className="text-foreground/80 text-[13px] leading-relaxed">{ctx.planetMeaning}</p>

        {/* Focus */}
        <div className="rounded-2xl bg-card/40 border border-foreground/12 p-4">
          <p className="text-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5">
            Today&apos;s focus
          </p>
          <p className="text-foreground/80 text-[13px] leading-relaxed">{planetaryDay.focus}</p>
          <p className="text-foreground/45 text-[11px] mt-2">Body area: {ctx.bodyPart}</p>
        </div>

        {/* Color explanation */}
        <div className="rounded-2xl bg-amber/20 border border-amber/35 p-4">
          <p className="text-[color:var(--rust)] text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5">
            Today&apos;s color · {planetaryDay.color}
          </p>
          <p className="text-foreground/80 text-[13px] leading-relaxed mb-2">{ctx.colorMeaning}</p>
          <p className="text-foreground/65 text-[12px] leading-relaxed italic">{ctx.howToUseColor}</p>
        </div>

        {/* Do / Avoid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-sage/12 border border-sage/25 p-3">
            <p className="text-sage text-[9px] uppercase tracking-[0.2em] font-bold mb-1.5">
              Good for today
            </p>
            {ctx.doToday.map((item, i) => (
              <p key={i} className="text-foreground/75 text-[12px] leading-snug mb-0.5">+ {item}</p>
            ))}
          </div>
          <div className="rounded-xl bg-card/40 border border-foreground/12 p-3">
            <p className="text-foreground/50 text-[9px] uppercase tracking-[0.2em] font-bold mb-1.5">
              Doesn&apos;t flow today
            </p>
            {ctx.avoidToday.map((item, i) => (
              <p key={i} className="text-foreground/55 text-[12px] leading-snug mb-0.5">- {item}</p>
            ))}
          </div>
        </div>

        <p className="text-foreground/40 text-[11px] leading-relaxed italic">
          Each day of the week is governed by one of the seven classical planets — a system
          shared across Vedic (Jyotish), Hellenistic, and medieval European astrology.
          The planet shapes the day&apos;s energy, color, and what flows most naturally.
        </p>
      </InfoSheet>
    );
  }

  if (sheet.kind === "element") {
    const el = season.element;
    const lore = ELEMENT_LORE[el];
    const elementSigns: Record<string, string> = {
      fire: "Aries, Leo, Sagittarius",
      water: "Cancer, Scorpio, Pisces",
      earth: "Taurus, Virgo, Capricorn",
      air: "Gemini, Libra, Aquarius",
    };
    return (
      <InfoSheet
        isOpen
        onClose={onClose}
        eyebrow={`${season.sign} season`}
        title={capitalize(el)}
        glyph={elementGlyph(el)}
      >
        <p className="text-foreground/45 text-[12px] italic -mt-1">
          {elementSigns[el]} · {season.modality} modality
        </p>
        <p className="text-foreground/80 text-[13px] leading-relaxed">{lore.story}</p>

        <div className="rounded-2xl bg-sage/12 border border-sage/25 p-4">
          <p className="text-sage text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5">
            How to work with {el} energy today
          </p>
          <p className="text-foreground/80 text-[14px] leading-relaxed">{lore.practice}</p>
        </div>

        <div className="rounded-2xl bg-card/40 border border-foreground/12 p-4">
          <p className="text-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
            What does the element mean?
          </p>
          <p className="text-foreground/70 text-[13px] leading-relaxed mb-2">
            In astrology, elements aren&apos;t just categories — they describe how energy moves.
            The current zodiac season bathes everyone in its element&apos;s quality, regardless of
            your personal chart. You don&apos;t have to be a {el} sign to feel this.
          </p>
          <p className="text-foreground/70 text-[13px] leading-relaxed">
            If you have {el} signs in your chart, this season amplifies your natural rhythm.
            If you don&apos;t, it&apos;s an invitation to develop that side of yourself —{" "}
            {el === "fire" ? "courage, initiative, and boldness" :
             el === "water" ? "sensitivity, intuition, and emotional depth" :
             el === "earth" ? "patience, groundedness, and practical follow-through" :
             "curiosity, communication, and mental flexibility"}.
          </p>
        </div>
      </InfoSheet>
    );
  }

  if (sheet.kind === "nakshatra") {
    return (
      <InfoSheet
        isOpen
        onClose={onClose}
        eyebrow="Lunar mansion · Vedic astrology"
        title={nakshatra.name}
        glyph="✦"
      >
        {/* Quality as subtitle */}
        <p className="text-foreground/45 text-[12px] italic -mt-1">
          {nakshatra.quality} energy · {capitalize(nakshatra.element)} element
        </p>

        {/* Main description */}
        <p className="text-foreground/80 text-[13px] leading-relaxed">{nakshatra.brief}</p>

        {/* Facts grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-card/50 border border-foreground/12 px-3 py-2.5">
            <p className="text-foreground/55 text-[9px] uppercase tracking-[0.18em] font-bold mb-0.5">
              Ruling deity
            </p>
            <p className="text-foreground text-[13px] font-semibold">{nakshatra.deity}</p>
          </div>
          <div className="rounded-xl bg-card/50 border border-foreground/12 px-3 py-2.5">
            <p className="text-foreground/55 text-[9px] uppercase tracking-[0.18em] font-bold mb-0.5">
              Quality
            </p>
            <p className="text-foreground text-[13px] font-semibold capitalize">{nakshatra.quality}</p>
          </div>
        </div>

        {/* What is a nakshatra — explainer */}
        <div className="rounded-2xl bg-card/40 border border-foreground/12 p-4">
          <p className="text-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
            What is a nakshatra?
          </p>
          <p className="text-foreground/70 text-[13px] leading-relaxed mb-2">
            Nakshatras are the 27 lunar mansions of Vedic astrology — slices of sky the Moon
            passes through, spending roughly one day in each. They&apos;re older than the 12 zodiac
            signs and more specific: while your zodiac sign describes a ~30-day season, the
            nakshatra describes today&apos;s precise mood.
          </p>
          <p className="text-foreground/70 text-[13px] leading-relaxed">
            Each nakshatra has a ruling deity that colors its energy. <strong>{nakshatra.deity}</strong> shapes
            how today feels — the quality of attention, what flows easily, and what meets resistance.
            Think of it as the weather forecast for your inner world.
          </p>
        </div>

        <p className="text-foreground/40 text-[11px] leading-relaxed italic">
          In the traditional Vedic Panchang (five-limbed calendar), the nakshatra is one of five
          daily factors astrologers track. It&apos;s considered especially important for timing:
          starting projects, rituals, and important decisions.
        </p>
      </InfoSheet>
    );
  }

  if (sheet.kind === "next-full-moon" && nextMoons.nextFull) {
    const ev = nextMoons.nextFull;
    const lore = ev.moonName ? MOON_LORE[ev.moonName] : undefined;
    return (
      <InfoSheet
        isOpen
        onClose={onClose}
        eyebrow={`${formatMoonDate(ev.date)} · ${daysPhrase(ev.daysUntil)}`}
        title={lore?.name ?? "Full Moon"}
        glyph={lore?.emoji ?? "🌕"}
      >
        {lore ? (
          <>
            <p className="text-foreground/70 text-[12px] uppercase tracking-[0.2em] font-bold">
              {lore.origin}
            </p>
            <p>{lore.story}</p>
            {lore.altNames.length > 0 && (
              <p className="text-foreground/60 text-[13px] italic">
                Also known as: {lore.altNames.join(", ")}.
              </p>
            )}
            <div className="rounded-2xl bg-terracotta/10 border border-terracotta/25 p-4">
              <p className="text-terracotta text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5">
                Energy
              </p>
              <p className="text-foreground/85 text-[14px] leading-relaxed">{lore.energy}</p>
            </div>
          </>
        ) : (
          <p>
            The next full moon arrives on {formatMoonDate(ev.date)}. The Moon is opposite
            the Sun, fully lit from our view — a time of culmination, visibility, and release.
          </p>
        )}
      </InfoSheet>
    );
  }

  if (sheet.kind === "next-new-moon" && nextMoons.nextNew) {
    const ev = nextMoons.nextNew;
    return (
      <InfoSheet
        isOpen
        onClose={onClose}
        eyebrow={`${formatMoonDate(ev.date)} · ${daysPhrase(ev.daysUntil)}`}
        title={NEW_MOON_LORE.name}
        glyph={NEW_MOON_LORE.emoji}
      >
        <p className="text-foreground/70 text-[12px] uppercase tracking-[0.2em] font-bold">
          {NEW_MOON_LORE.origin}
        </p>
        <p>{NEW_MOON_LORE.story}</p>
        <p className="text-foreground/60 text-[13px] italic">
          Also known as: {NEW_MOON_LORE.altNames.join(", ")}.
        </p>
        <div className="rounded-2xl bg-terracotta/10 border border-terracotta/25 p-4">
          <p className="text-terracotta text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5">
            Energy
          </p>
          <p className="text-foreground/85 text-[14px] leading-relaxed">{NEW_MOON_LORE.energy}</p>
        </div>
      </InfoSheet>
    );
  }

  if (sheet.kind === "horizon-event") {
    const ev = sheet.event;
    const ELEMENT_EMOJI: Record<string, string> = {
      fire: "🔥", earth: "🌿", air: "💨", water: "🌊", spirit: "✨",
    };
    const elemEmoji = ev.element ? (ELEMENT_EMOJI[ev.element] ?? "✦") : "✦";

    const TRADITION_LABELS: Record<string, string> = {
      astronomical: "Astronomical Event",
      celtic: "Celtic Tradition",
      vedic: "Vedic / Hindu Tradition",
      chinese: "Chinese / East Asian Tradition",
      islamic: "Islamic Tradition",
      indigenous: "Indigenous Tradition",
      pagan: "Pagan / Wiccan Tradition",
      persian: "Persian Tradition",
      tibetan: "Tibetan Buddhist Tradition",
      thai: "Thai Buddhist Tradition",
      japanese: "Japanese Tradition",
      egyptian: "Ancient Egyptian Tradition",
    };

    return (
      <InfoSheet
        isOpen
        onClose={onClose}
        eyebrow={`${ev.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · ${ev.daysUntil === 0 ? "today" : ev.daysUntil === 1 ? "tomorrow" : `in ${ev.daysUntil} days`}`}
        title={ev.name}
        glyph={elemEmoji}
      >
        <div className="flex items-center gap-2">
          <span className="text-foreground/60 text-[12px] uppercase tracking-[0.2em] font-bold capitalize">
            {TRADITION_LABELS[ev.tradition] || ev.tradition}
          </span>
        </div>

        <p className="text-foreground/85 text-[14px] leading-relaxed">{ev.description}</p>

        {ev.ritualHint && (
          <div className="rounded-2xl bg-sage/10 border border-sage/25 p-5">
            <p className="text-sage text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
              How to observe this
            </p>
            <p className="text-foreground/85 text-[14px] leading-relaxed mb-3">{ev.ritualHint}</p>
            <div className="pt-3 border-t border-sage/15 space-y-2">
              <p className="text-foreground/40 text-[10px] uppercase tracking-widest font-semibold">Setting the space</p>
              <p className="text-foreground/65 text-[13px] leading-relaxed">
                {ev.element === "fire" ? "Light a candle or sit near warmth. Fire rituals work best at dusk or dawn when the light is changing." :
                 ev.element === "water" ? "Work near water if possible — a bowl, a bath, or natural water. Water rituals are strongest at night under moonlight." :
                 ev.element === "earth" ? "Go outside if you can. Touch soil, stone, or wood. Earth rituals ground best when you're physically connected to the ground." :
                 ev.element === "air" ? "Open a window or step outside. Breathe deeply and intentionally. Air rituals work best in the morning when the mind is clear." :
                 "Create a quiet, sacred space. Dim the lights. Silence your phone. This is time between worlds — honor the threshold."}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-foreground/40 text-[11px]">
          <span>{elemEmoji}</span>
          <span className="capitalize">{ev.element ? `${ev.element} element` : ""}{ev.element && ev.category ? " · " : ""}{ev.category}</span>
        </div>

        <p className="text-foreground/25 text-[10px] leading-relaxed italic">
          Ritual suggestions are inspired by each tradition&apos;s practices. We encourage learning more from practitioners and cultural sources.
        </p>
      </InfoSheet>
    );
  }

  return <InfoSheet isOpen={false} onClose={onClose} title="">{null}</InfoSheet>;
}

/* ─── Helpers ─── */

interface MetricTileProps {
  label: string;
  value: string;
  hint?: string;
  glyph: string;
  accent: "amber" | "sage" | "cream" | "terracotta";
  onClick?: () => void;
}

function MetricTile({ label, value, hint, glyph, accent, onClick }: MetricTileProps) {
  const bg =
    accent === "amber"
      ? "bg-amber/25 border-amber/40"
      : accent === "sage"
      ? "bg-sage/15 border-sage/30"
      : accent === "terracotta"
      ? "bg-terracotta/12 border-terracotta/30"
      : "bg-card/60 border-foreground/15";

  const labelColor =
    accent === "amber"
      ? "text-[color:var(--rust)]/80"
      : accent === "sage"
      ? "text-sage/90"
      : accent === "terracotta"
      ? "text-terracotta/80"
      : "text-foreground/55";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border ${bg} px-4 py-3.5
                  flex items-start gap-3 text-left
                  active:scale-[0.98] hover:brightness-[1.02] transition-all`}
    >
      <span className="text-xl leading-none mt-0.5 shrink-0" aria-hidden="true">
        {glyph}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-[9px] uppercase tracking-[0.18em] font-bold mb-0.5 ${labelColor}`}>
          {label}
        </p>
        <p className="text-foreground text-[14px] font-semibold leading-tight capitalize">
          {value}
        </p>
        {hint && (
          <p className="text-foreground/55 text-[12px] leading-snug mt-1">
            {hint}
          </p>
        )}
      </div>
      <span className="text-foreground/25 text-[11px] mt-1 shrink-0">▸</span>
    </button>
  );
}


function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card/50 border border-foreground/12 px-3 py-2.5">
      <p className="text-foreground/55 text-[9px] uppercase tracking-[0.18em] font-bold mb-0.5">
        {label}
      </p>
      <p className="text-foreground text-[13px] font-semibold capitalize">{value}</p>
    </div>
  );
}

/** Grab the first sentence (or first ~80 chars) from a longer string */
function shortHint(text: string): string {
  const firstSentence = text.split(/\.\s/)[0];
  if (firstSentence.length <= 80) return firstSentence + (firstSentence.endsWith(".") ? "" : ".");
  return firstSentence.slice(0, 77).replace(/\s+\S*$/, "") + "…";
}

function elementGlyph(element: string): string {
  const e = element.toLowerCase();
  if (e.includes("fire")) return "🔥";
  if (e.includes("water")) return "💧";
  if (e.includes("earth")) return "🌿";
  if (e.includes("air")) return "🌬";
  return "✦";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function monthName(m: number): string {
  return [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ][m - 1] ?? "";
}

function formatMoonDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function daysPhrase(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

const ELEMENT_LORE: Record<
  "fire" | "water" | "earth" | "air",
  { keyword: string; story: string; practice: string }
> = {
  fire: {
    keyword: "Spark · courage · will",
    story:
      "Fire is the element of initiation — the spark that turns an idea into an action. Aries, Leo, and Sagittarius carry it. Fire energy is bright, direct, and hungry to move.",
    practice:
      "Do the thing you've been putting off. Move your body. Speak up. Light a candle with intention and let it mark the beginning of something.",
  },
  water: {
    keyword: "Feeling · intuition · depth",
    story:
      "Water is the element of emotion and memory — everything that flows underneath. Cancer, Scorpio, and Pisces carry it. Water energy is soft, perceptive, and knows without being told.",
    practice:
      "Let yourself feel what you've been avoiding. Take a bath. Cry if you need to. Journal. Trust the dream you remembered this morning.",
  },
  earth: {
    keyword: "Grounding · patience · body",
    story:
      "Earth is the element of the tangible — the slow, steady work of making things real. Taurus, Virgo, and Capricorn carry it. Earth energy is practical, sensual, and respects time.",
    practice:
      "Tend to one small physical thing — a plant, a meal, a drawer. Walk outside and touch the ground. Build something you can see by the end of the day.",
  },
  air: {
    keyword: "Thought · voice · connection",
    story:
      "Air is the element of the mind and the word — ideas, language, and the space between people. Gemini, Libra, and Aquarius carry it. Air energy is curious, social, and plays with possibility.",
    practice:
      "Write something down. Have the conversation. Read a page that has nothing to do with your day. Open a window and let the breeze move through.",
  },
};
