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
 * All celestial elements expand inline with detailed meaning.
 */

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildFallbackHoroscope } from "@/lib/fallbackHoroscope";
import { authedFetch } from "@/lib/authedFetch";
import { usePaywall } from "@/hooks/usePaywall";
import { useTier } from "@/components/TierProvider";
import { BirthTimeRepromptBanner } from "@/components/BirthTimeCue";
import { getPullUsageToday, incrementPullUsage } from "@/lib/tier";
import { getLocalEntries } from "@/lib/journal";
import { getTarotHistoryKey } from "@/lib/completionSync";

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
import { ORACLE_DECKS, getDailyOracleCard, ORACLE_DECK_KEY, DEFAULT_ORACLE_DECK } from "@/lib/oracleDecks";
import { getDailyEnergy } from "@/lib/celestialCalendar";
import FolderCard from "@/components/FolderCard";
import StartHereCard from "@/components/StartHereCard";
import MoonPhaseIcon from "@/components/MoonPhaseIcon";
import MoonEventScreen from "@/components/MoonEventScreen";
import SolarEventScreen from "@/components/SolarEventScreen";
import { getTodaysMoonEvent, getTodaysSolarEvent } from "@/lib/celestialCalendar";
import { getCurrentMoonSign, getCurrentPlanetSign } from "@/lib/astro/currentSky";

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


export default function HomeTab() {
  const router = useRouter();
  const { gate, PaywallModal } = usePaywall();
  const { tier } = useTier();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [hasChart, setHasChart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const toggleFolder = (id: string) => setOpenFolder(prev => prev === id ? null : id);
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [horoscopeStatus, setHoroscopeStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [horoscopeUpgrading, setHoroscopeUpgrading] = useState<boolean>(false);
  const [horoscopeError, setHoroscopeError] = useState<string>("");
  const [journalPrompt, setJournalPrompt] = useState<string | null>(null);
  const [journalPromptContext, setJournalPromptContext] = useState<string>("");
  // journalPromptLoading removed — prompt now generates on journal page
  const [shareLoading, setShareLoading] = useState(false);
  const [showMoonBanner, setShowMoonBanner] = useState<boolean | null>(null);
  const [showMoonEvent, setShowMoonEvent] = useState(false);
  const [showSolarBanner, setShowSolarBanner] = useState<boolean | null>(null);
  const [showSolarEvent, setShowSolarEvent] = useState(false);
  const [expandedCard, setExpandedCard] = useState<"tarot" | "oracle" | null>(null);
  const [copiedShare, setCopiedShare] = useState<"tarot" | "oracle" | null>(null);
  const [tarotFlipping, setTarotFlipping] = useState(false);
  const [oracleFlipping, setOracleFlipping] = useState(false);
  const [oracleDeckId, setOracleDeckId] = useState(DEFAULT_ORACLE_DECK);
  const [showDeckPicker, setShowDeckPicker] = useState(false);

  // Save pull state
  const [savingPull, setSavingPull] = useState<"tarot" | "oracle" | null>(null);
  const [pullNotes, setPullNotes] = useState("");
  const [pullSaved, setPullSaved] = useState<"tarot" | "oracle" | null>(null);
  const [generatingNotes, setGeneratingNotes] = useState(false);

  // Journal today check
  const [todayHasEntry, setTodayHasEntry] = useState(false);

  // Store chart + transits for Dolly note generation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transitsRef = useRef<any>(null);


  // Card pull state — remember reveals for today (use local date, not UTC)
  // Initialise as false (matching SSR) then hydrate from localStorage in useEffect
  // to avoid Next.js hydration mismatch that causes blank renders.
  const [tarotRevealed, setTarotRevealed] = useState(false);
  const [oracleRevealed, setOracleRevealed] = useState(false);
  const [cardStateHydrated, setCardStateHydrated] = useState(false);

  useEffect(() => {
    try {
      const d = new Date();
      const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (localStorage.getItem(`mapped:tarot-revealed-${dateKey}`) === "1") {
        setTarotRevealed(true);
      }
      if (localStorage.getItem(`mapped:oracle-revealed-${dateKey}`) === "1") {
        setOracleRevealed(true);
      }
      // Load preferred oracle deck
      const savedDeck = localStorage.getItem(ORACLE_DECK_KEY);
      if (savedDeck && ORACLE_DECKS.some(d2 => d2.id === savedDeck)) {
        setOracleDeckId(savedDeck);
      }
    } catch { /* SSR or localStorage unavailable */ }
    setCardStateHydrated(true);
  }, []);

  // Save a daily pull with optional notes
  const saveDailyPull = useCallback((type: "tarot" | "oracle", notes: string) => {
    try {
      const d = new Date();
      const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const histKey = getTarotHistoryKey(currentUserId);
      const existing = JSON.parse(localStorage.getItem(histKey) || "[]");
      // Don't duplicate if already saved today for this type
      const spreadName = type === "tarot" ? "Daily Pull" : "Daily Oracle Pull";
      const alreadySaved = existing.some((r: { date?: string; spreadName?: string }) =>
        r.spreadName === spreadName && r.date?.startsWith(dateKey)
      );
      if (alreadySaved) return;

      const reading: Record<string, unknown> = {
        id: `daily-${type}-${dateKey}`,
        date: d.toISOString(),
        deck: type === "tarot" ? "rider-waite" : "stitched-animal-oracle",
        spreadName,
        notes: notes.trim() || undefined,
      };
      // We need card data — access it from the DOM-level vars (dailyTarot / dailyOracle are in scope at call site)
      // So we pass cards in from the call site instead
      const updated = [reading, ...existing].slice(0, 50);
      localStorage.setItem(histKey, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [currentUserId]);

  // Generate notes from Dolly via API
  const generateDollyNotes = useCallback(async (cardName: string, keywords: string, meaning: string) => {
    setGeneratingNotes(true);
    try {
      const res = await authedFetch("/api/dolly/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName,
          keywords,
          meaning,
          chart: chartRef.current || undefined,
          transits: transitsRef.current || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const text = await res.text();
      // The API streams — parse the full text
      const lines = text.split("\n").filter(l => l.startsWith("data: "));
      let full = "";
      for (const line of lines) {
        const payload = line.slice(6);
        if (payload === "[DONE]") break;
        try {
          const parsed = JSON.parse(payload);
          full += parsed.choices?.[0]?.delta?.content || parsed.content || parsed.text || "";
        } catch {
          full += payload;
        }
      }
      setPullNotes(full.trim() || "Dolly couldn't generate notes right now. Try writing your own!");
    } catch {
      setPullNotes("Dolly couldn't generate notes right now. Try writing your own!");
    }
    setGeneratingNotes(false);
  }, []);

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
  const todaysMoonEvent = useMemo(() => getTodaysMoonEvent(today), [today]);

  // Auto-show moon event banner on new/full moon days (once per day)
  useEffect(() => {
    if (!todaysMoonEvent) { setShowMoonBanner(false); return; }
    const dismissKey = `mapped:moon-banner-dismissed-${todayLocal}`;
    let dismissed = false;
    try { dismissed = localStorage.getItem(dismissKey) === "1"; } catch {}
    setShowMoonBanner(!dismissed);
  }, [todaysMoonEvent, todayLocal]);

  // When user closes moon banner, mark it dismissed for today
  const handleCloseMoonBanner = useCallback(() => {
    setShowMoonBanner(false);
    try { localStorage.setItem(`mapped:moon-banner-dismissed-${todayLocal}`, "1"); } catch {}
  }, [todayLocal]);

  // Solstice / equinox — the solar wheel of the year, surfaced like moon events.
  const todaysSolarEvent = useMemo(() => getTodaysSolarEvent(today), [today]);

  useEffect(() => {
    if (!todaysSolarEvent) { setShowSolarBanner(false); return; }
    const dismissKey = `mapped:solar-banner-dismissed-${todayLocal}`;
    let dismissed = false;
    try { dismissed = localStorage.getItem(dismissKey) === "1"; } catch {}
    setShowSolarBanner(!dismissed);
  }, [todaysSolarEvent, todayLocal]);

  const handleCloseSolarBanner = useCallback(() => {
    setShowSolarBanner(false);
    try { localStorage.setItem(`mapped:solar-banner-dismissed-${todayLocal}`, "1"); } catch {}
  }, [todayLocal]);

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
      if (cached) return JSON.parse(cached) as { text: string; reason: string };
      // Clean old cache
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith("mapped:quote-") && k !== cacheKey) localStorage.removeItem(k);
      }
    } catch { /* proceed */ }
    const result = getDailyQuote(today);
    const val = { text: result.quote.text, reason: result.reason };
    try { localStorage.setItem(cacheKey, JSON.stringify(val)); } catch { /* full */ }
    return val;
  }, [today]);

  // Daily tarot card (deterministic per day)
  const dailyTarot = useMemo(() => {
    const idx = dailySeed % ALL_CARDS.length;
    return ALL_CARDS[idx];
  }, [dailySeed]);

  // Daily oracle card (deterministic per day, uses selected deck)
  const dailyOracle = useMemo(() => {
    const card = getDailyOracleCard(oracleDeckId, dailySeed);
    if (card) return card;
    // Fallback to first deck
    return getDailyOracleCard(DEFAULT_ORACLE_DECK, dailySeed)!;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailySeed, oracleDeckId]);

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
          setCurrentUserId(session.user.id);
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

    // Check if today's journal entry exists
    try {
      const todayStr = new Date().toLocaleDateString("en-CA");
      const localEntries = getLocalEntries();
      const hasToday = localEntries.some((e) => {
        const d = e.created_at || e.date;
        return d && new Date(d).toLocaleDateString("en-CA") === todayStr;
      });
      setTodayHasEntry(hasToday);
    } catch {}
  }, [router]);

  // Fetch daily horoscope — simple state machine: idle → loading → done/error
  useEffect(() => {
    if (!hasChart || horoscopeStatus !== "idle") return;

    // Check localStorage cache — horoscope persists for the whole day
    const todayKey = currentUserId ? `horoscope-v4-${currentUserId}-${todayLocal}` : `horoscope-v4-${todayLocal}`;
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
        if (k && k.startsWith("horoscope-v4-") && k !== todayKey && (!currentUserId || k.includes(currentUserId))) {
          localStorage.removeItem(k);
        }
      }
    } catch { /* stale cache — refetch */ }

    // Celestial context comes from real sky data already on this page.
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

    // Populate INSTANTLY with a real reading from today's sky, then upgrade to
    // the personalized AI version in the background (generation can take ~10s).
    // This avoids a long spinner on the first open of the day. Status is "done"
    // so the section renders immediately; the upgrading flag drives a subtle hint.
    setHoroscope(buildFallbackHoroscope(celestial));
    setHoroscopeStatus("done");
    setHoroscopeUpgrading(true);

    // On any AI failure we simply keep the instant fallback already on screen.
    const showFallback = () => {
      console.warn("[horoscope] AI unavailable — keeping local fallback reading");
      setHoroscopeUpgrading(false);
    };

    async function doFetch() {
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (!authSession?.user) {
          showFallback();
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
          showFallback();
          return;
        }

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

        // Store for Dolly note generation
        chartRef.current = {
          bigThree: chartData.big_three,
          planets: chartData.planets || [],
          houses: chartData.houses || [],
          specialPoints: chartData.special_points || [],
        };
        transitsRef.current = transits || null;

        // Persist chart + transits so journal prompts can use them
        try {
          sessionStorage.setItem("mapped:chartData", JSON.stringify({
            bigThree: chartData.big_three,
            planets: chartData.planets || [],
            lordOfYear: chartData.lord_of_year || undefined,
          }));
          if (transits?.transitAspects) {
            sessionStorage.setItem("mapped:transits", JSON.stringify(transits.transitAspects));
          }
        } catch { /* storage full or unavailable */ }

        const res = await authedFetch("/api/horoscope", {
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
            localDate: todayLocal,
          }),
        });

        if (!res.ok) {
          showFallback();
          return;
        }

        const data = await res.json();
        setHoroscope(data);
        setHoroscopeStatus("done");
        setHoroscopeUpgrading(false);
        try { localStorage.setItem(todayKey, JSON.stringify(data)); } catch { /* quota */ }

      } catch {
        showFallback();
      }
    }

    doFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChart, horoscopeStatus]);


  // Moon sign label (sidereal, from almanac data or celestial calendar)
  const moonSignLabel = useMemo(() => {
    return getCurrentMoonSign(today).full;
  }, [today]);

  // Venus sign (accurate, via astronomy-engine)
  const venusSign = useMemo(() => {
    return getCurrentPlanetSign("Venus", today).full;
  }, [today]);

  // Next major upcoming event for "Next Up" banner
  const nextUpEvent = useMemo(() => {
    if (upcomingEvents.length > 0) return upcomingEvents[0];
    return null;
  }, [upcomingEvents]);

  const currentMoonSign = useMemo(() => getCurrentMoonSign(today), [today]);

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  // First name only — greeting feels more personal
  const firstName = userName?.split(" ")[0] ?? null;

  // If no chart exists yet, redirect to onboarding — never show a half-state home page
  if (!hasChart) {
    if (!isLoading) {
      router.replace("/onboarding");
    }
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-brass/30 border-t-brass rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  return (
    <>
      <style>{`@keyframes cardFlip { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }`}</style>
      <main className="w-full max-w-lg mx-auto px-5 pt-2 pb-32">

        {/* ─── Birth time re-prompt banner ─── */}
        <BirthTimeRepromptBanner />

        {/* ─── Moon + Greeting hero block ─── */}
        <div className="flex flex-col items-center mb-8">
          {/* Moon */}
          <button
            type="button"
            onClick={() => todaysMoonEvent ? setShowMoonEvent(true) : toggleFolder("moon-phase")}

            className="active:scale-95 transition-transform -mb-4"
          >
            <MoonPhaseIcon phase={moon.label} size={280} />
          </button>

          {/* Greeting — overlaps moon slightly for cohesion */}
          <h2
            className="text-[32px] leading-[1.1] tracking-[0.14em] uppercase"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)", fontWeight: 400 }}
          >
            {greeting}.
          </h2>
          {firstName && (
            <p
              className="text-[54px] leading-[1.0] -mt-1"
              style={{ fontFamily: "var(--font-script)", color: "var(--foreground)", fontWeight: 400 }}
            >
              {firstName}
            </p>
          )}
          <p
            className="text-[12px] tracking-[0.08em] mt-2"
            style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)", opacity: 0.55 }}
          >
            {moon.label.toLowerCase()} · moon in {currentMoonSign.full.toLowerCase()}
          </p>
        </div>

        {/* ─── First-session orientation (new users only, dismissible) ─── */}
        <StartHereCard />

        {/* ─── Moon phase inline expansion ─── */}
        {openFolder === "moon-phase" && (() => {
          const a = moon.almanac;
          return (
            <div className="rounded-2xl px-5 py-5 mb-6 space-y-4" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: "var(--foreground-on-card-muted)" }}>
                    {moon.illumination}% illuminated · {planetaryDay.planet}&apos;s day
                  </p>
                  <p className="text-[20px] font-medium mt-1" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground-on-card)" }}>
                    {moon.emoji} {moon.label}
                  </p>
                </div>
                <button type="button" onClick={() => toggleFolder("moon-phase")} className="w-8 h-8 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} aria-label="Close">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-on-card)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <div className="h-px" style={{ backgroundColor: "var(--border-card)" }} />

              <p className="text-[13px] italic leading-relaxed" style={{ color: "var(--foreground-on-card-muted)" }}>{moon.energy}</p>

              {/* Best for / Avoid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(106,140,106,0.12)", border: "1px solid rgba(106,140,106,0.25)" }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-1.5" style={{ color: "var(--sage)" }}>Good for</p>
                  {a.bestFor.map((item: string, i: number) => (
                    <p key={i} className="text-[13px] leading-snug" style={{ color: "var(--foreground-on-card)" }}>+ {item}</p>
                  ))}
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid var(--border-card)" }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-1.5" style={{ color: "var(--foreground-on-card-muted)" }}>Avoid</p>
                  {a.avoid.map((item: string, i: number) => (
                    <p key={i} className="text-[13px] leading-snug" style={{ color: "var(--foreground-on-card)" }}>- {item}</p>
                  ))}
                </div>
              </div>

              {/* Folk wisdom */}
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid var(--border-card)" }}>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: "var(--foreground-on-card-muted)" }}>Folk wisdom</p>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>{a.folkWisdom}</p>
                <p className="text-[12px] leading-relaxed italic mt-2" style={{ color: "var(--foreground-on-card-muted)" }}>{a.weatherLore}</p>
              </div>
            </div>
          );
        })()}

        {/* ─── New/Full Moon banner ─── */}
        {showMoonBanner && todaysMoonEvent && (() => {
          const lore = todaysMoonEvent.lore;
          const isNew = todaysMoonEvent.kind === "new";
          const title = isNew
            ? `New Moon in ${todaysMoonEvent.zodiacSign}`
            : (todaysMoonEvent.moonName || `Full Moon in ${todaysMoonEvent.zodiacSign}`);
          return (
            <div
              className="relative rounded-2xl px-5 py-5 mb-8 overflow-hidden"
              style={{
                background: isNew
                  ? "linear-gradient(135deg, #1a1528 0%, #0e0a14 100%)"
                  : "linear-gradient(135deg, #2a1f0e 0%, #1a1528 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={handleCloseMoonBanner}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition-transform"
                style={{ background: "rgba(255,255,255,0.08)" }}
                aria-label="Dismiss moon banner"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Emoji + title */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[28px]">{lore?.emoji || (isNew ? "🌑" : "🌕")}</span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] mb-0.5"
                     style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>
                    Tonight
                  </p>
                  <p className="text-[18px] font-medium" style={{ color: "#f0e6d2", fontFamily: "var(--font-heading)" }}>
                    {title}
                  </p>
                </div>
              </div>

              {/* Energy / meaning */}
              {lore?.energy && (
                <p className="text-[13px] leading-[1.6] mb-4"
                   style={{ color: "rgba(240,230,210,0.75)", fontFamily: "var(--font-body)" }}>
                  {lore.energy}
                </p>
              )}

              {/* Learn more button */}
              <button
                type="button"
                onClick={() => setShowMoonEvent(true)}
                className="text-[12px] tracking-[0.06em] px-4 py-2 rounded-full active:scale-95 transition-transform"
                style={{
                  background: "rgba(196,106,69,0.2)",
                  color: "#c46a45",
                  border: "1px solid rgba(196,106,69,0.25)",
                  fontFamily: "var(--font-display)",
                }}
                aria-label="View full moon event details"
              >
                Explore this moon →
              </button>
            </div>
          );
        })()}

        {/* ─── Solstice / Equinox banner ─── */}
        {showSolarBanner && todaysSolarEvent && (() => {
          const warm = todaysSolarEvent.kind === "winter-solstice"
            ? "linear-gradient(135deg, #161334 0%, #0a0a18 100%)"
            : "linear-gradient(135deg, #3a2410 0%, #1f1408 100%)";
          const accent = todaysSolarEvent.kind === "winter-solstice" ? "#cbb6ff" : "#e0a458";
          return (
            <div className="relative rounded-2xl px-5 py-5 mb-8 overflow-hidden"
              style={{ background: warm, border: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                type="button"
                onClick={handleCloseSolarBanner}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition-transform"
                style={{ background: "rgba(255,255,255,0.08)" }}
                aria-label="Dismiss solstice banner"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-[28px]">☀️</span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] mb-0.5"
                     style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>
                    Today · {todaysSolarEvent.dayType}
                  </p>
                  <p className="text-[18px] font-medium" style={{ color: "#f0e6d2", fontFamily: "var(--font-heading)" }}>
                    {todaysSolarEvent.name}
                  </p>
                </div>
              </div>

              <p className="text-[13px] leading-[1.6] mb-4"
                 style={{ color: "rgba(240,230,210,0.75)", fontFamily: "var(--font-body)" }}>
                {todaysSolarEvent.ritualHint}
              </p>

              <button
                type="button"
                onClick={() => setShowSolarEvent(true)}
                className="text-[12px] tracking-[0.06em] px-4 py-2 rounded-full active:scale-95 transition-transform"
                style={{ background: `${accent}33`, color: accent, border: `1px solid ${accent}44`, fontFamily: "var(--font-display)" }}
                aria-label="View full solstice event details"
              >
                Explore this turning point →
              </button>
            </div>
          );
        })()}

        {/* ─── Reading card ─── */}
        <div
          className="rounded-2xl px-6 py-7 mb-8"
          style={{ backgroundColor: "var(--plum)" }}
        >
          <p
            className="text-[9px] tracking-[0.25em] uppercase font-medium mb-4"
            style={{ color: "#c9a961" }}
          >
            Today&apos;s transits
          </p>

          {horoscope && horoscopeStatus === "done" ? (
            <>
              <h3
                className="text-[20px] leading-[1.3] tracking-[0.04em] mb-4"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "#f0e6d2" }}
              >
                {horoscope.headline}
              </h3>
              <p
                className="text-[14px] leading-[1.7] mb-5"
                style={{ fontFamily: "var(--font-body)", color: "#f0e6d2", opacity: 0.85, textTransform: "none", letterSpacing: "normal", fontWeight: 400 }}
              >
                {horoscope.horoscope}
              </p>
              <div className="w-12 mx-auto mb-5" style={{ height: 1, backgroundColor: "#c9a961", opacity: 0.4 }} />
              {horoscopeUpgrading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: "#f0e6d2", borderTopColor: "#c9a961", opacity: 0.6 }} role="status" aria-label="Personalizing" />
                  <p className="text-[11px] italic text-center" style={{ fontFamily: "var(--font-body)", color: "#f0e6d2", opacity: 0.6 }}>
                    Personalizing your reading&hellip;
                  </p>
                </div>
              ) : (
                <p
                  className="text-[11px] italic text-center"
                  style={{ fontFamily: "var(--font-body)", color: "#f0e6d2", opacity: 0.6 }}
                >
                  {season.sign} season · {capitalize(season.element)} element
                </p>
              )}
            </>
          ) : horoscopeStatus === "loading" ? (
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "#f0e6d2", borderTopColor: "#c9a961", opacity: 0.6 }} role="status" aria-label="Loading" />
              <p className="text-[12px] uppercase tracking-[0.15em]" style={{ color: "#f0e6d2", opacity: 0.6 }}>
                Reading your chart...
              </p>
            </div>
          ) : horoscopeStatus === "error" ? (
            <p className="text-[14px] leading-relaxed" style={{ color: "#f0e6d2", opacity: 0.7 }}>
              Horoscope unavailable right now.
            </p>
          ) : (
            <p className="text-[14px] leading-relaxed" style={{ color: "#f0e6d2", opacity: 0.7 }}>
              Your reading is on its way.
            </p>
          )}
        </div>

        {/* ─── Do / Don't blocks ─── */}
        {horoscope && horoscopeStatus === "done" && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* Lean in */}
            <div className="rounded-2xl px-4 py-5" style={{ backgroundColor: "#2d4029" }}>
              <p
                className="text-[9px] tracking-[0.25em] uppercase font-medium mb-3"
                style={{ color: "#c9a961" }}
              >
                Lean in
              </p>
              <div className="space-y-2">
                {horoscope.vibes.map((v, i) => (
                  <p key={i} className="text-[12px] leading-snug" style={{ color: "#f0e6d2" }}>
                    <span style={{ color: "#c9a961", marginRight: 6 }}>+</span>{v}
                  </p>
                ))}
              </div>
            </div>
            {/* Avoid */}
            <div className="rounded-2xl px-4 py-5" style={{ backgroundColor: "#5a1f1a" }}>
              <p
                className="text-[9px] tracking-[0.25em] uppercase font-medium mb-3"
                style={{ color: "#c9a961" }}
              >
                Avoid
              </p>
              <div className="space-y-2">
                {horoscope.avoid.map((a, i) => (
                  <p key={i} className="text-[12px] leading-snug" style={{ color: "#f0e6d2" }}>
                    <span style={{ color: "#c9a961", marginRight: 6 }}>&ndash;</span>{a}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Primary CTA ─── */}
        <button
          onClick={() => {
            if (todayHasEntry) {
              router.push("/journal");
              return;
            }
            // Navigate immediately — never block on an API call
            if (journalPrompt) {
              router.push(`/journal?prompt=${encodeURIComponent(journalPrompt)}&context=${encodeURIComponent(journalPromptContext)}`);
            } else if (horoscope?.horoscope) {
              // Pass celestial context so journal page can generate prompt in background
              const ctx = encodeURIComponent(JSON.stringify({
                horoscope: horoscope.horoscope,
                celestial: { moonPhase: moon.label, zodiacSeason: season.sign, planetaryDay: planetaryDay.day, nakshatra: nakshatra.name, nakshatraQuality: nakshatra.quality },
                userName: firstName || undefined,
              }));
              router.push(`/journal?generatePrompt=${ctx}`);
            } else {
              router.push("/journal");
            }
          }}
          className="w-full rounded-full py-3.5 mb-4 flex items-center justify-center gap-2
                     active:scale-[0.97] transition-all"
          style={{ backgroundColor: todayHasEntry ? "#2d4a3e" : "#c9a961", color: todayHasEntry ? "#a8c4b0" : "#1a1815" }}
        >
          {todayHasEntry ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span className="text-[11px] tracking-[0.18em] uppercase font-medium">
                Today&apos;s check-in complete
              </span>
            </>
          ) : (
            <>
              <span className="text-[14px]" style={{ fontFamily: "var(--font-script)" }}>
                Begin
              </span>
              <span className="text-[11px] tracking-[0.18em] uppercase font-medium">
                today&apos;s check-in
              </span>
              <span className="text-[14px] ml-1">&rarr;</span>
            </>
          )}
        </button>

        {/* ─── Secondary action ─── */}
        <div className="mb-12">
          <button
            onClick={() => {
              if (horoscope) {
                const dollyContext = `Here's my horoscope for today: "${horoscope.horoscope}" — Vibes: ${horoscope.vibes.join(", ")}. Help me go deeper into what this means for me today.`;
                sessionStorage.setItem("dolly-context", dollyContext);
              }
              router.push("/dolly");
            }}
            className="w-full rounded-full py-2.5 text-center active:scale-[0.97] transition-all"
            style={{ border: "0.5px solid var(--foreground)", color: "var(--foreground)", opacity: 0.6 }}
          >
            <span className="text-[11px] tracking-[0.15em] uppercase font-medium">Go deeper</span>
          </button>
        </div>

        {/* ─── Daily quote ─── */}
        <div className="mb-12 px-1">
          <p
            className="text-[15px] leading-[1.7] italic text-foreground/80 text-center"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            &ldquo;{dailyQuote.text}&rdquo;
          </p>
          <p
            className="text-[9px] uppercase tracking-[0.15em] mt-2.5 text-center"
            style={{ color: "var(--terracotta)", opacity: 0.45 }}
          >
            ✦ {dailyQuote.reason}
          </p>
        </div>

        {/* ─── Today's Pulls ─── */}
        <p
          className="text-[9px] tracking-[0.25em] uppercase font-medium mb-4"
          style={{ color: "var(--brass)" }}
        >
          Today&apos;s pulls
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Tarot */}
          <div className={`rounded-2xl p-3 transition-all ${expandedCard === "tarot" ? "ring-1 ring-[#c9a961]/30" : ""}`} style={{ backgroundColor: "var(--plum)", opacity: 0.95 }}>
            <p className="text-[9px] tracking-[0.25em] uppercase font-medium mb-2" style={{ color: "#c9a961" }}>
              Tarot
            </p>
            {(() => {
              const tarotImgSrc = tarotRevealed
                ? (getCardImagePath(dailyTarot.id) || CARD_BACK_IMAGE)
                : CARD_BACK_IMAGE;
              return (
                <button
                  onClick={() => {
                    if (!tarotRevealed && !tarotFlipping) {
                      if (tier === "free" && getPullUsageToday() >= 1) {
                        if (gate("unlimited_pulls")) return;
                      }
                      incrementPullUsage();
                      setTarotFlipping(true);
                      setTimeout(() => {
                        setTarotRevealed(true);
                        setTarotFlipping(false);
                        try { localStorage.setItem(`mapped:tarot-revealed-${todayLocal}`, "1"); } catch {}
                      }, 800);
                    } else if (tarotRevealed) {
                      setExpandedCard(expandedCard === "tarot" ? null : "tarot");
                    }
                  }}
                  className="w-full"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "941/1672", borderRadius: 10, overflow: "hidden" }}>
                    <Image
                      src={tarotImgSrc}
                      alt={tarotRevealed ? dailyTarot.name : "Card back"}
                      fill
                      className="object-cover"
                      draggable={false}
                    />
                  </div>
                  <p className="text-center mt-2" style={{
                    color: "#f0e6d2",
                    fontSize: tarotRevealed ? 12 : 10,
                    fontFamily: tarotRevealed ? "var(--font-heading)" : "var(--font-heading)",
                    fontWeight: tarotRevealed ? 500 : 400,
                    opacity: tarotRevealed ? 1 : 0.6,
                  }}>
                    {tarotRevealed ? dailyTarot.name : "Tap to pull"}
                  </p>
                  {tarotRevealed && (
                    <p className="text-center mt-0.5" style={{ color: "#f0e6d2", opacity: 0.5, fontSize: 9 }}>
                      {dailyTarot.uprightKeywords.slice(0, 3).join(" · ")}
                    </p>
                  )}
                </button>
              );
            })()}
          </div>

          {/* Oracle */}
          <div className={`rounded-2xl p-3 transition-all ${expandedCard === "oracle" ? "ring-1 ring-[#c9a961]/30" : ""}`} style={{ backgroundColor: "var(--plum)", opacity: 0.95 }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] tracking-[0.25em] uppercase font-medium" style={{ color: "#c9a961" }}>
                Oracle
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeckPicker(!showDeckPicker); }}
                className="text-[9px] px-2 py-0.5 rounded-full transition-all"
                style={{ color: "var(--foreground-muted)", border: "1px solid rgba(240,230,210,0.2)" }}
              >
                {ORACLE_DECKS.find(d => d.id === oracleDeckId)?.name || "Switch Deck"}
              </button>
            </div>
            {showDeckPicker && (
              <div className="mb-2 rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(240,230,210,0.15)" }}>
                {ORACLE_DECKS.map(deck => (
                  <button
                    key={deck.id}
                    onClick={() => {
                      setOracleDeckId(deck.id);
                      setShowDeckPicker(false);
                      setOracleRevealed(false);
                      try { localStorage.setItem(ORACLE_DECK_KEY, deck.id); } catch {}
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] transition-colors"
                    style={{
                      color: oracleDeckId === deck.id ? "#c9a961" : "rgba(240,230,210,0.7)",
                      background: oracleDeckId === deck.id ? "rgba(201,169,97,0.08)" : "transparent",
                    }}
                  >
                    {deck.name} <span style={{ opacity: 0.5 }}>({deck.cardCount} cards)</span>
                  </button>
                ))}
              </div>
            )}
            {(() => {
              const currentDeck = ORACLE_DECKS.find(d => d.id === oracleDeckId);
              const ORACLE_BACK = currentDeck?.backImage || "/oracle/stitched-animal/back of deck.png";
              const oracleImgSrc = oracleRevealed ? dailyOracle.image : ORACLE_BACK;
              return (
                <button
                  onClick={() => {
                    if (!oracleRevealed && !oracleFlipping) {
                      if (tier === "free" && getPullUsageToday() >= 1) {
                        if (gate("unlimited_pulls")) return;
                      }
                      incrementPullUsage();
                      setOracleFlipping(true);
                      setTimeout(() => {
                        setOracleRevealed(true);
                        setOracleFlipping(false);
                        try { localStorage.setItem(`mapped:oracle-revealed-${todayLocal}`, "1"); } catch {}
                      }, 800);
                    } else if (oracleRevealed) {
                      setExpandedCard(expandedCard === "oracle" ? null : "oracle");
                    }
                  }}
                  className="w-full"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "941/1672", borderRadius: 10, overflow: "hidden" }}>
                    <Image
                      src={oracleImgSrc}
                      alt={oracleRevealed ? dailyOracle.animal : "Card back"}
                      fill
                      className="object-cover"
                      draggable={false}
                    />
                  </div>
                  <p className="text-center mt-2" style={{
                    color: "#f0e6d2",
                    fontSize: oracleRevealed ? 12 : 10,
                    fontFamily: "var(--font-heading)",
                    fontWeight: oracleRevealed ? 500 : 400,
                    opacity: oracleRevealed ? 1 : 0.6,
                  }}>
                    {oracleRevealed ? dailyOracle.animal : "Tap to pull"}
                  </p>
                  {oracleRevealed && (
                    <p className="text-center mt-0.5" style={{ color: "#f0e6d2", opacity: 0.5, fontSize: 9 }}>
                      {dailyOracle.keyword}
                    </p>
                  )}
                </button>
              );
            })()}
          </div>
        </div>

        {/* Expanded tarot reading */}
        {expandedCard === "tarot" && tarotRevealed && (
          <div className="rounded-2xl p-5 mb-6 space-y-3" style={{ backgroundColor: "var(--plum)", color: "#f0e6d2" }}>
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                {dailyTarot.name}
              </p>
              <button onClick={() => setExpandedCard(null)} className="text-[10px]" style={{ color: "#c9a961" }}>collapse</button>
            </div>
            {(dailyTarot.element || dailyTarot.zodiac || dailyTarot.planet) && (
              <div className="flex items-center gap-1.5 text-[9px] opacity-50">
                {dailyTarot.element && <span>{dailyTarot.element}</span>}
                {dailyTarot.zodiac && <><span>·</span><span>{dailyTarot.zodiac}</span></>}
                {dailyTarot.planet && <><span>·</span><span>{dailyTarot.planet}</span></>}
              </div>
            )}
            <p className="text-[13px] leading-[1.65] opacity-85">{dailyTarot.uprightMeaning}</p>
            <div className="rounded-xl px-3.5 py-3" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
              <p className="text-[9px] uppercase tracking-widest mb-1 opacity-50">If reversed</p>
              <p className="text-[11px] leading-relaxed opacity-70">{dailyTarot.reversedMeaning}</p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  const cardContext = `Tarot: ${dailyTarot.name} — ${dailyTarot.uprightKeywords.slice(0, 3).join(", ")}. ${dailyTarot.uprightMeaning}`;
                  router.push(`/journal?tab=pull&card=tarot&cardName=${encodeURIComponent(dailyTarot.name)}&cardMeaning=${encodeURIComponent(cardContext)}`);
                }}
                className="flex-1 rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
                style={{ backgroundColor: "#c9a961", color: "#1a1815" }}
              >
                <span className="text-[11px] font-medium">Journal this</span>
              </button>
              <button
                onClick={() => {
                  const dollyContext = `I pulled the ${dailyTarot.name} today (tarot). Keywords: ${dailyTarot.uprightKeywords.join(", ")}. Upright meaning: "${dailyTarot.uprightMeaning}" — Help me understand what this card means for me today.`;
                  sessionStorage.setItem("dolly-context", dollyContext);
                  router.push("/dolly");
                }}
                className="flex-1 rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
                style={{ border: "0.5px solid #f0e6d2", opacity: 0.6 }}
              >
                <span className="text-[11px] font-medium" style={{ color: "#f0e6d2" }}>Go deeper</span>
              </button>
            </div>

            {/* Save pull */}
            {pullSaved === "tarot" ? (
              <div className="flex items-center justify-center gap-2 py-2 rounded-full" style={{ backgroundColor: "rgba(90,122,58,0.2)", border: "0.5px solid rgba(90,122,58,0.4)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a7a3a" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                <span className="text-[11px] font-medium" style={{ color: "#5a7a3a" }}>Saved</span>
              </div>
            ) : savingPull === "tarot" ? (
              <div className="rounded-xl p-3 space-y-2.5" style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
                <p className="text-[10px] uppercase tracking-widest opacity-50">Add notes (optional)</p>
                <textarea
                  value={pullNotes}
                  onChange={(e) => setPullNotes(e.target.value)}
                  placeholder="What does this card mean to you today?"
                  className="w-full rounded-lg p-2.5 text-[12px] leading-relaxed resize-none focus:outline-none"
                  style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "#f0e6d2", border: "0.5px solid rgba(240,230,210,0.15)", minHeight: 60 }}
                  rows={3}
                  aria-label="Pull notes"
                />
                <button
                  onClick={() => {
                    if (!generatingNotes) {
                      generateDollyNotes(dailyTarot.name, dailyTarot.uprightKeywords.slice(0, 3).join(", "), dailyTarot.uprightMeaning);
                    }
                  }}
                  disabled={generatingNotes}
                  className="w-full rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
                  style={{ border: "0.5px solid rgba(240,230,210,0.2)" }}
                >
                  {generatingNotes ? (
                    <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /></svg>
                  )}
                  <span className="text-[11px] font-medium" style={{ color: "#f0e6d2", opacity: 0.6 }}>
                    {generatingNotes ? "Generating..." : "Generate notes with Dolly"}
                  </span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSavingPull(null); setPullNotes(""); }}
                    className="flex-1 rounded-full py-2 text-[11px] font-medium active:scale-[0.97] transition-all"
                    style={{ border: "0.5px solid rgba(240,230,210,0.2)", color: "#f0e6d2", opacity: 0.5 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      try {
                        const histKey = getTarotHistoryKey(currentUserId);
                        const existing = JSON.parse(localStorage.getItem(histKey) || "[]");
                        const reading = {
                          id: `daily-tarot-${todayLocal}`,
                          date: new Date().toISOString(),
                          deck: "rider-waite",
                          spreadName: "Daily Pull",
                          cards: [{ name: dailyTarot.name, keywords: dailyTarot.uprightKeywords, reversed: false }],
                          notes: pullNotes.trim() || undefined,
                        };
                        const updated = [reading, ...existing].slice(0, 50);
                        localStorage.setItem(histKey, JSON.stringify(updated));
                      } catch {}
                      setPullSaved("tarot");
                      setSavingPull(null);
                      setPullNotes("");
                    }}
                    className="flex-1 rounded-full py-2 text-[11px] font-medium active:scale-[0.97] transition-all"
                    style={{ backgroundColor: "#c9a961", color: "#1a1815" }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setSavingPull("tarot"); setPullNotes(""); }}
                className="w-full rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
                style={{ border: "0.5px solid #c9a961", opacity: 0.7 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a961" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                </svg>
                <span className="text-[11px] font-medium" style={{ color: "#c9a961" }}>Save this pull</span>
              </button>
            )}

            <button
              onClick={async () => {
                const shareText = `Today I pulled ${dailyTarot.name} from the tarot.\n\n${dailyTarot.uprightKeywords.slice(0, 3).join(" · ")}\n\n— Mapped Astrology`;
                const { shareReadingAsImage } = await import("@/lib/shareCard");
                setCopiedShare("tarot");
                await shareReadingAsImage(
                  { spreadName: "Daily Pull", date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }), cards: [{ name: dailyTarot.name, keywords: dailyTarot.uprightKeywords.slice(0, 4) }] },
                  shareText
                );
                setTimeout(() => setCopiedShare(null), 2000);
              }}
              className="w-full rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
              style={{ border: "0.5px solid #f0e6d2", opacity: 0.4 }}
            >
              <span className="text-[11px] font-medium" style={{ color: "#f0e6d2" }}>
                {copiedShare === "tarot" ? "Shared!" : "Share this pull"}
              </span>
            </button>
          </div>
        )}

        {/* Expanded oracle reading */}
        {expandedCard === "oracle" && oracleRevealed && (
          <div className="rounded-2xl p-5 mb-6 space-y-3" style={{ backgroundColor: "var(--plum)", color: "#f0e6d2" }}>
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                {dailyOracle.animal}
              </p>
              <button onClick={() => setExpandedCard(null)} className="text-[10px]" style={{ color: "#c9a961" }}>collapse</button>
            </div>
            <p className="text-[13px] leading-[1.65] opacity-85">{dailyOracle.meaning}</p>
            <div className="rounded-xl px-3.5 py-3" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
              <p className="text-[9px] uppercase tracking-widest mb-1 opacity-50">Reflection</p>
              <p className="text-[11px] leading-relaxed opacity-70">
                What part of your life is asking for {dailyOracle.keyword.toLowerCase()} right now? Sit with the {dailyOracle.animal.toLowerCase()}&apos;s energy.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  const cardContext = `Oracle: ${dailyOracle.animal} — ${dailyOracle.keyword}. ${dailyOracle.meaning}`;
                  router.push(`/journal?tab=pull&card=oracle&cardName=${encodeURIComponent(dailyOracle.animal)}&cardMeaning=${encodeURIComponent(cardContext)}`);
                }}
                className="flex-1 rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
                style={{ backgroundColor: "#c9a961", color: "#1a1815" }}
              >
                <span className="text-[11px] font-medium">Journal this</span>
              </button>
              <button
                onClick={() => {
                  const dollyContext = `I pulled the ${dailyOracle.animal} oracle card today. Keyword: ${dailyOracle.keyword}. Meaning: "${dailyOracle.meaning}" — Help me understand what this animal's message means for me today.`;
                  sessionStorage.setItem("dolly-context", dollyContext);
                  router.push("/dolly");
                }}
                className="flex-1 rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
                style={{ border: "0.5px solid #f0e6d2", opacity: 0.6 }}
              >
                <span className="text-[11px] font-medium" style={{ color: "#f0e6d2" }}>Go deeper</span>
              </button>
            </div>
            {/* Save pull */}
            {pullSaved === "oracle" ? (
              <div className="flex items-center justify-center gap-2 py-2 rounded-full" style={{ backgroundColor: "rgba(90,122,58,0.2)", border: "0.5px solid rgba(90,122,58,0.4)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a7a3a" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                <span className="text-[11px] font-medium" style={{ color: "#5a7a3a" }}>Saved</span>
              </div>
            ) : savingPull === "oracle" ? (
              <div className="rounded-xl p-3 space-y-2.5" style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
                <p className="text-[10px] uppercase tracking-widest opacity-50">Add notes (optional)</p>
                <textarea
                  value={pullNotes}
                  onChange={(e) => setPullNotes(e.target.value)}
                  placeholder="What does this animal's energy mean to you today?"
                  className="w-full rounded-lg p-2.5 text-[12px] leading-relaxed resize-none focus:outline-none"
                  style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "#f0e6d2", border: "0.5px solid rgba(240,230,210,0.15)", minHeight: 60 }}
                  rows={3}
                  aria-label="Pull notes"
                />
                <button
                  onClick={() => {
                    if (!generatingNotes) {
                      generateDollyNotes(dailyOracle.animal, dailyOracle.keyword, dailyOracle.meaning);
                    }
                  }}
                  disabled={generatingNotes}
                  className="w-full rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
                  style={{ border: "0.5px solid rgba(240,230,210,0.2)" }}
                >
                  {generatingNotes ? (
                    <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /></svg>
                  )}
                  <span className="text-[11px] font-medium" style={{ color: "#f0e6d2", opacity: 0.6 }}>
                    {generatingNotes ? "Generating..." : "Generate notes with Dolly"}
                  </span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSavingPull(null); setPullNotes(""); }}
                    className="flex-1 rounded-full py-2 text-[11px] font-medium active:scale-[0.97] transition-all"
                    style={{ border: "0.5px solid rgba(240,230,210,0.2)", color: "#f0e6d2", opacity: 0.5 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      try {
                        const histKey = getTarotHistoryKey(currentUserId);
                        const existing = JSON.parse(localStorage.getItem(histKey) || "[]");
                        const reading = {
                          id: `daily-oracle-${todayLocal}`,
                          date: new Date().toISOString(),
                          deck: "animal-oracle",
                          spreadName: "Daily Oracle Pull",
                          cards: [{ name: dailyOracle.animal, keywords: [dailyOracle.keyword], reversed: false }],
                          notes: pullNotes.trim() || undefined,
                        };
                        const updated = [reading, ...existing].slice(0, 50);
                        localStorage.setItem(histKey, JSON.stringify(updated));
                      } catch {}
                      setPullSaved("oracle");
                      setSavingPull(null);
                      setPullNotes("");
                    }}
                    className="flex-1 rounded-full py-2 text-[11px] font-medium active:scale-[0.97] transition-all"
                    style={{ backgroundColor: "#c9a961", color: "#1a1815" }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setSavingPull("oracle"); setPullNotes(""); }}
                className="w-full rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
                style={{ border: "0.5px solid #c9a961", opacity: 0.7 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a961" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                </svg>
                <span className="text-[11px] font-medium" style={{ color: "#c9a961" }}>Save this pull</span>
              </button>
            )}

            <button
              onClick={async () => {
                const shareText = `Today I pulled the ${dailyOracle.animal} oracle card.\n\n${dailyOracle.keyword}\n\n— Mapped Astrology`;
                const { shareReadingAsImage } = await import("@/lib/shareCard");
                setCopiedShare("oracle");
                await shareReadingAsImage(
                  { spreadName: "Daily Oracle Pull", date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }), cards: [{ name: dailyOracle.animal, keywords: [dailyOracle.keyword] }] },
                  shareText
                );
                setTimeout(() => setCopiedShare(null), 2000);
              }}
              className="w-full rounded-full py-2 flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
              style={{ border: "0.5px solid #f0e6d2", opacity: 0.4 }}
            >
              <span className="text-[11px] font-medium" style={{ color: "#f0e6d2" }}>
                {copiedShare === "oracle" ? "Shared!" : "Share this pull"}
              </span>
            </button>
          </div>
        )}

        {!expandedCard && <div className="mb-8" />}

        {/* ─── Today's Energy ─── */}
        <p
          className="text-[9px] tracking-[0.25em] uppercase font-medium mb-4"
          style={{ color: "var(--brass)" }}
        >
          Today&apos;s energy
        </p>
        <div className="flex flex-col gap-3 mb-12">
          {/* Planetary Day */}
          <div className="rounded-2xl overflow-hidden transition-all" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
            <button
              type="button"
              onClick={() => toggleFolder("planetary-day")}
              className="w-full px-4 py-4 flex items-center gap-3.5 text-left active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#c9a961" }}>
                <span className="text-[16px]">{PLANET_GLYPH[planetaryDay.planet] ?? "✦"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] tracking-[0.2em] uppercase font-medium" style={{ color: "var(--foreground-on-card-muted)" }}>Planetary Day</p>
                <p className="text-[16px] font-medium" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground-on-card)" }}>{planetaryDay.planet}&apos;s Day</p>
                <p className="text-[12px] italic mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--foreground-on-card-muted)", opacity: 0.8 }}>{planetaryDay.energy}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-on-card)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-30 transition-transform" style={{ transform: openFolder === "planetary-day" ? "rotate(90deg)" : "none" }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            {openFolder === "planetary-day" && (() => {
              const ctx = PLANETARY_DAY_CONTEXT[planetaryDay.day];
              return (
                <div className="px-4 pb-4 space-y-3">
                  <div className="h-px" style={{ backgroundColor: "var(--border-card)" }} />
                  <p className="text-[12px] italic" style={{ color: "var(--foreground-on-card-muted)" }}>{ctx.vedicName}</p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>{ctx.planetMeaning}</p>
                  <div className="rounded-xl p-3" style={{ backgroundColor: "var(--background-card-hover)" }}>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "var(--foreground-on-card-muted)" }}>Today&apos;s focus</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>{planetaryDay.focus}</p>
                    <p className="text-[11px] mt-2" style={{ color: "var(--foreground-on-card-muted)" }}>Body area: {ctx.bodyPart}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(201, 169, 97, 0.1)", border: "0.5px solid rgba(201, 169, 97, 0.2)" }}>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "var(--brass)" }}>Today&apos;s color · {planetaryDay.color}</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>{ctx.colorMeaning}</p>
                    <p className="text-[12px] italic mt-1" style={{ color: "var(--foreground-on-card-muted)" }}>{ctx.howToUseColor}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: "rgba(45, 64, 41, 0.15)" }}>
                      <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: "var(--sage)" }}>Good for</p>
                      {ctx.doToday.map((item, i) => (
                        <p key={i} className="text-[12px] leading-snug" style={{ color: "var(--foreground-on-card)" }}>+ {item}</p>
                      ))}
                    </div>
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: "var(--background-card-hover)" }}>
                      <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: "var(--foreground-on-card-muted)" }}>Avoid</p>
                      {ctx.avoidToday.map((item, i) => (
                        <p key={i} className="text-[12px] leading-snug" style={{ color: "var(--foreground-on-card-muted)" }}>- {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Moon Sign */}
          <div className="rounded-2xl overflow-hidden transition-all" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
            <button
              type="button"
              onClick={() => toggleFolder("moon-sign")}
              className="w-full px-4 py-4 flex items-center gap-3.5 text-left active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--plum)" }}>
                <span className="text-[16px]">☽</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] tracking-[0.2em] uppercase font-medium" style={{ color: "var(--foreground-on-card-muted)" }}>Moon Sign</p>
                <p className="text-[16px] font-medium" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground-on-card)" }}>{currentMoonSign.full}</p>
                <p className="text-[12px] italic mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--foreground-on-card-muted)", opacity: 0.8 }}>{moon.illumination}% illuminated · {currentMoonSign.degree}&deg;</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-on-card)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-30 transition-transform" style={{ transform: openFolder === "moon-sign" ? "rotate(90deg)" : "none" }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            {openFolder === "moon-sign" && (() => {
              const a = moon.almanac;
              return (
                <div className="px-4 pb-4 space-y-3">
                  <div className="h-px" style={{ backgroundColor: "var(--border-card)" }} />
                  <p className="text-[12px] italic" style={{ color: "var(--foreground-on-card-muted)" }}>{moon.energy}</p>
                  <div className="rounded-xl p-3" style={{ backgroundColor: "var(--background-card-hover)" }}>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "var(--foreground-on-card-muted)" }}>Folk wisdom</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>{a.folkWisdom}</p>
                    <p className="text-[12px] italic mt-1" style={{ color: "var(--foreground-on-card-muted)" }}>{a.weatherLore}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: "rgba(45, 64, 41, 0.15)" }}>
                      <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: "var(--sage)" }}>Good for</p>
                      {a.bestFor.map((item, i) => (
                        <p key={i} className="text-[12px] leading-snug" style={{ color: "var(--foreground-on-card)" }}>+ {item}</p>
                      ))}
                    </div>
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: "var(--background-card-hover)" }}>
                      <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: "var(--foreground-on-card-muted)" }}>Avoid</p>
                      {a.avoid.map((item, i) => (
                        <p key={i} className="text-[12px] leading-snug" style={{ color: "var(--foreground-on-card-muted)" }}>- {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Nakshatra */}
          <div className="rounded-2xl overflow-hidden transition-all" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
            <button
              type="button"
              onClick={() => toggleFolder("nakshatra")}
              className="w-full px-4 py-4 flex items-center gap-3.5 text-left active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#2d4029" }}>
                <span className="text-[16px]" style={{ color: "#f0e6d2" }}>✦</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] tracking-[0.2em] uppercase font-medium" style={{ color: "var(--foreground-on-card-muted)" }}>Nakshatra</p>
                <p className="text-[16px] font-medium" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground-on-card)" }}>{nakshatra.name}</p>
                <p className="text-[12px] italic mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--foreground-on-card-muted)", opacity: 0.8 }}>{nakshatra.quality}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-on-card)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-30 transition-transform" style={{ transform: openFolder === "nakshatra" ? "rotate(90deg)" : "none" }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            {openFolder === "nakshatra" && (
              <div className="px-4 pb-4 space-y-3">
                <div className="h-px" style={{ backgroundColor: "var(--border-card)" }} />
                <p className="text-[12px] italic" style={{ color: "var(--foreground-on-card-muted)" }}>{nakshatra.quality} energy · {capitalize(nakshatra.element)} element</p>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>{nakshatra.brief}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-2.5" style={{ backgroundColor: "var(--background-card-hover)" }}>
                    <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-0.5" style={{ color: "var(--foreground-on-card-muted)" }}>Ruling deity</p>
                    <p className="text-[13px] font-semibold" style={{ color: "var(--foreground-on-card)" }}>{nakshatra.deity}</p>
                  </div>
                  <div className="rounded-xl p-2.5" style={{ backgroundColor: "var(--background-card-hover)" }}>
                    <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-0.5" style={{ color: "var(--foreground-on-card-muted)" }}>Quality</p>
                    <p className="text-[13px] font-semibold capitalize" style={{ color: "var(--foreground-on-card)" }}>{nakshatra.quality}</p>
                  </div>
                </div>
                <p className="text-[11px] italic leading-relaxed" style={{ color: "var(--foreground-on-card-faint)" }}>
                  Nakshatras are the 27 lunar mansions of Vedic astrology — slices of sky the Moon passes through. Each has a ruling deity that colors the day&apos;s energy.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── On the Horizon ─── */}
        <p
          className="text-[9px] tracking-[0.25em] uppercase font-medium mb-4"
          style={{ color: "var(--brass)" }}
        >
          On the horizon
        </p>
        <div className="flex flex-col gap-2.5 mb-12">
          {/* Moon events */}
          {[
            nextMoons.nextFull ? { event: nextMoons.nextFull, sheetKind: "next-full-moon" as const, color: "var(--plum)" } : null,
            nextMoons.nextNew ? { event: nextMoons.nextNew, sheetKind: "next-new-moon" as const, color: "#2d4029" } : null,
          ].filter(Boolean).sort((a, b) => a!.event.daysUntil - b!.event.daysUntil).map((item) => {
            const cardId = `moon-${item!.event.kind}`;
            const isToday = item!.event.daysUntil === 0;
            return (
              <div key={item!.event.kind} className="rounded-2xl overflow-hidden transition-all" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                <button
                  type="button"
                  onClick={() => isToday ? setShowMoonEvent(true) : toggleFolder(cardId)}
                  className="w-full px-4 py-3.5 flex items-center gap-3.5 text-left active:scale-[0.98] transition-all"
                >
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item!.color }}>
                    <MoonPhaseIcon phase={item!.event.kind === "full" ? "Full Moon" : "New Moon"} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground-on-card)" }}>{item!.event.label}</p>
                    <p className="text-[11px] italic mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--foreground-on-card-muted)", opacity: 0.7 }}>{formatMoonDate(item!.event.date)} · {daysPhrase(item!.event.daysUntil)}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-on-card)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-25 transition-transform" style={{ transform: openFolder === cardId ? "rotate(90deg)" : "none" }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {openFolder === cardId && (() => {
                  const ev = item!.event;
                  if (ev.kind === "full") {
                    const lore = ev.moonName ? MOON_LORE[ev.moonName] : undefined;
                    return (
                      <div className="px-4 pb-4 space-y-3">
                        <div className="h-px" style={{ backgroundColor: "var(--border-card)" }} />
                        {lore ? (
                          <>
                            <p className="text-[12px] uppercase tracking-[0.2em] font-bold" style={{ color: "var(--foreground-on-card-muted)" }}>{lore.origin}</p>
                            <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>{lore.story}</p>
                            {lore.altNames.length > 0 && (
                              <p className="text-[12px] italic" style={{ color: "var(--foreground-on-card-muted)" }}>Also known as: {lore.altNames.join(", ")}.</p>
                            )}
                            <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(201, 169, 97, 0.1)", border: "0.5px solid rgba(201, 169, 97, 0.2)" }}>
                              <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "var(--brass)" }}>Energy</p>
                              <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>{lore.energy}</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>The next full moon — a time of culmination, visibility, and release.</p>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="h-px" style={{ backgroundColor: "var(--border-card)" }} />
                      <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>
                        New moons mark the beginning of a new lunar cycle — a time for setting intentions, planting seeds, and beginning fresh.
                        {ev.label.includes("in ") && ` This one falls in ${ev.label.split("in ")[1]}, coloring the cycle with that sign's energy.`}
                      </p>
                    </div>
                  );
                })()}
              </div>
            );
          })}

          {/* Cultural events */}
          {upcomingEvents.map((event, idx) => {
            const cardId = `event-${idx}`;
            return (
              <div key={idx} className="rounded-2xl overflow-hidden transition-all" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
                <button
                  type="button"
                  onClick={() => toggleFolder(cardId)}
                  className="w-full px-4 py-3.5 flex items-center gap-3.5 text-left active:scale-[0.98] transition-all"
                >
                  <div className="w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: "#5a1f1a" }}>
                    <p className="text-[8px] uppercase tracking-wider leading-none" style={{ color: "#f0e6d2", opacity: 0.7 }}>{event.date.toLocaleDateString("en-US", { month: "short" })}</p>
                    <p className="text-[15px] font-semibold leading-tight" style={{ color: "#f0e6d2" }}>{event.date.getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground-on-card)" }}>{event.name}</p>
                    <p className="text-[11px] italic mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--foreground-on-card-muted)", opacity: 0.7 }}>{event.daysUntil === 0 ? "today" : event.daysUntil === 1 ? "tomorrow" : `in ${event.daysUntil} days`}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-on-card)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-25 transition-transform" style={{ transform: openFolder === cardId ? "rotate(90deg)" : "none" }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {openFolder === cardId && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="h-px" style={{ backgroundColor: "var(--border-card)" }} />
                    {event.description && <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>{event.description}</p>}
                    {event.ritualHint && (
                      <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(201, 169, 97, 0.1)", border: "0.5px solid rgba(201, 169, 97, 0.2)" }}>
                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "var(--brass)" }}>Ritual</p>
                        <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-on-card)" }}>{event.ritualHint}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="h-8" />
      </main>

      {/* Detail sheets removed — all content now expands inline */}

      {/* ─── Moon event takeover ─── */}
      {showMoonEvent && (
        <MoonEventScreen
          onClose={() => setShowMoonEvent(false)}
        />
      )}
      {/* ─── Solstice / Equinox takeover ─── */}
      {showSolarEvent && todaysSolarEvent && (
        <SolarEventScreen
          event={todaysSolarEvent}
          onClose={() => setShowSolarEvent(false)}
        />
      )}
      {PaywallModal}
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
          <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">
            Customize tips
          </p>
          <button onClick={() => setEditMode(false)} className="text-terracotta text-[12px] font-semibold">
            Done
          </button>
        </div>
        <p className="text-secondary text-[12px] leading-snug mb-3">
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
                <span className={`text-[9px] font-semibold leading-tight text-center ${on ? "text-terracotta" : "text-muted"}`}>
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
          <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">
            Almanac tips
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAll(false)} className="text-terracotta text-[11px] font-semibold">
              Show less
            </button>
            <button onClick={() => setEditMode(true)} className="text-muted hover:text-foreground transition-colors" aria-label="Customize">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {allVisible.map((tip, i) => (
            <div key={i} className="rounded-xl bg-card/40 border border-foreground/12 px-3.5 py-2.5">
              <p className="text-muted text-[10px] uppercase tracking-[0.15em] font-bold mb-1">
                {tip.icon} {tip.category}
              </p>
              <p className="text-foreground text-[13px] leading-snug">{tip.tip}</p>
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
        <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">
          Almanac tips
        </p>
        <button onClick={() => setEditMode(true)} className="text-muted hover:text-foreground transition-colors" aria-label="Customize tips">
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
              <span className={`text-[8px] font-semibold leading-tight text-center ${isOpen ? "text-terracotta" : "text-muted"}`}>
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
            <p className="text-muted text-[10px] uppercase tracking-[0.15em] font-bold mb-1.5">
              {tip.icon} {tip.category}
            </p>
            <p className="text-foreground text-[13px] leading-relaxed">{tip.tip}</p>
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
  const accentColor =
    accent === "amber" ? "var(--rust)"
    : accent === "sage" ? "var(--sage)"
    : accent === "terracotta" ? "var(--terracotta)"
    : "var(--foreground-muted)";

  return (
    <button
      type="button"
      onClick={onClick}
      className="scrapbook-card relative px-4 py-3.5
                  flex items-start gap-3 text-left
                  active:scale-[0.98] hover:brightness-[1.02] transition-all"
    >
      <div
        className="wax-seal shrink-0 mt-0.5"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${accentColor}, var(--rust))`,
        }}
      >
        <span className="text-sm leading-none" aria-hidden="true">{glyph}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[9px] uppercase tracking-[0.18em] font-bold mb-0.5"
          style={{ color: accentColor }}
        >
          {label}
        </p>
        <p className="text-foreground text-[14px] font-semibold leading-tight capitalize" style={{ fontFamily: "var(--font-display)" }}>
          {value}
        </p>
        {hint && (
          <p className="text-secondary text-[12px] leading-snug mt-1">
            {hint}
          </p>
        )}
      </div>
      <span className="text-muted text-[11px] mt-1 shrink-0">▸</span>
    </button>
  );
}


function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card/50 border border-foreground/12 px-3 py-2.5">
      <p className="text-secondary text-[9px] uppercase tracking-[0.18em] font-bold mb-0.5">
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
