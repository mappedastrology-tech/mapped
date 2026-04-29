"use client";

/**
 * Ritual page — daily ritual suggestions + browseable catalog by life area.
 *
 * Sections:
 * 1. Tonight's Moon — moon-phase-matched ritual (never pure intention-setting)
 * 2. Today's Ritual — one personalized suggestion based on horoscope + moon
 * 3. Today's Energy — moon phase, nakshatra, zodiac season
 * 4. Almanac Best Days — tappable icon grid by category
 * 5. Ritual Catalog — browse by life area with search + pagination
 * 6. Celestial Calendar — upcoming events
 *
 * All colors use CSS custom properties for light/dark theme support.
 */

import { useState, useMemo, useEffect } from "react";
import {
  getDailyEnergy,
  getCelestialEvents,
  type CelestialEvent,
} from "@/lib/celestialCalendar";
import { getDailyRituals, type ModalityPrefs } from "@/lib/rituals";
import {
  RITUAL_CATALOG,
  RITUAL_CATEGORIES,
  type CatalogRitual,
  type RitualCategory,
} from "@/lib/ritualCatalog";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import RitualCompletionCheckin from "@/components/RitualCompletionCheckin";
import RefreshModal from "@/components/RefreshModal";
// feedback utils available if needed later
import { getGoodForToday, getTodaySky } from "@/lib/almanacData";
// Theme handled via CSS variables — no useTheme needed here

// ─── Constants ──────────────────────────────────────────────────────────────

const RITUAL_PREFS_KEY = "mapped:ritual-modalities";

const RITUAL_MODALITIES = [
  { id: "crystals", icon: "💎", label: "Crystals" },
  { id: "candle", icon: "🕯", label: "Candles" },
  { id: "oils", icon: "💧", label: "Oils" },
  { id: "rune", icon: "ᚱ", label: "Runes" },
  { id: "chakra", icon: "🧘", label: "Chakras" },
  { id: "flowers", icon: "🌸", label: "Herbs" },
  { id: "tarot", icon: "🃏", label: "Tarot" },
  { id: "colors", icon: "🎨", label: "Colors" },
] as const;

function loadRitualPrefs(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(RITUAL_PREFS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const defaults: Record<string, boolean> = {};
  RITUAL_MODALITIES.forEach((m) => (defaults[m.id] = true));
  return defaults;
}

const ELEMENT_ICONS: Record<string, string> = {
  fire: "🔥", water: "🌊", earth: "🌿", air: "💨", spirit: "✨",
};

const MOOD_LABELS: Record<string, string> = {
  calm: "Calming", energized: "Energizing", reflective: "Reflective",
  joyful: "Uplifting", grounded: "Grounding", releasing: "Releasing",
};

// ─── Celestial Calendar Components ──────────────────────────────────────────

function EventCard({ event, isToday, onTap }: { event: CelestialEvent; isToday: boolean; onTap: () => void }) {
  const d = event.date instanceof Date ? event.date : new Date(event.date + "T12:00:00");
  return (
    <button
      onClick={onTap}
      className="w-full flex gap-3 items-start py-3 last:border-b-0 text-left transition-colors"
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: isToday ? "var(--terracotta-bg)" : "transparent",
        borderRadius: isToday ? "12px" : undefined,
        margin: isToday ? "0 -8px" : undefined,
        padding: isToday ? "12px 8px" : "12px 0",
      }}
    >
      <div className="text-center min-w-[36px]">
        <p className="text-[9px] uppercase" style={{ color: "var(--foreground-faint)" }}>{d.toLocaleDateString("en-US", { month: "short" })}</p>
        <p className="text-[18px] font-bold" style={{ color: isToday ? "var(--terracotta)" : "var(--foreground-muted)" }}>{d.getDate()}</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-medium truncate" style={{ color: "var(--foreground)" }}>{event.name}</p>
          {isToday && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                  style={{ backgroundColor: "var(--terracotta-bg)", color: "var(--terracotta)", border: "1px solid var(--border-accent)" }}>
              Today
            </span>
          )}
        </div>
        <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--foreground-muted)" }}>{event.ritualHint}</p>
      </div>
      <svg className="w-3.5 h-3.5 shrink-0 mt-2" style={{ color: "var(--foreground-ghost)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ─── Tradition display names ───────────────────────────────────────────────
const TRADITION_LABELS: Record<string, string> = {
  vedic: "Vedic / Hindu", chinese: "Chinese", celtic: "Celtic / Gaelic",
  islamic: "Islamic", western: "Western Astrology", indigenous: "Indigenous",
  astronomical: "Astronomical", pagan: "Pagan / Wiccan", egyptian: "Egyptian",
  persian: "Persian", tibetan: "Tibetan Buddhist", thai: "Thai",
  japanese: "Japanese / Shinto",
};

const CATEGORY_SYMBOLS: Record<string, { icon: string; meaning: string }> = {
  moon: { icon: "🌙", meaning: "Lunar events mark the rhythm of release and renewal. Cultures across the world have tracked the moon to time planting, ceremony, and emotional cycles." },
  solar: { icon: "☀️", meaning: "Solar events mark the turning of the year — equinoxes and solstices divide the year into its four great quarters, each with its own energy." },
  festival: { icon: "🎭", meaning: "Festivals honor the intersection of celestial timing and cultural memory. They're moments when a community pauses to mark what matters." },
  season: { icon: "🍃", meaning: "Seasonal markers connect your practice to the actual rhythms of the earth — the tilt of the planet, the length of light." },
  planetary: { icon: "🪐", meaning: "Planetary events — retrogrades, conjunctions, returns — are moments when specific archetypal energies shift. The sky mirrors the inner landscape." },
};

// ─── Ritual Card Component ──────────────────────────────────────────────────

function RitualDetailCard({
  ritual,
  isExpanded,
  onToggle,
  onComplete,
  variant = "default",
}: {
  ritual: CatalogRitual | { id: string; title: string; description: string; steps: string[]; mood: string; element: string; source?: string; isPersonalized?: boolean; duration?: string };
  isExpanded: boolean;
  onToggle: () => void;
  onComplete?: (ritualId: string, ritualTitle: string) => void;
  variant?: "default" | "featured";
}) {
  const isFeatured = variant === "featured";
  return (
    <div
      className="rounded-2xl transition-all"
      style={{
        backgroundColor: isFeatured ? "var(--terracotta-bg)" : "var(--background-card)",
        border: isFeatured ? "1px solid var(--border-accent)" : "1px solid var(--border-card)",
      }}
    >
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[14px]">{ELEMENT_ICONS[ritual.element] || "✨"}</span>
              <h3 className="text-[14px] font-medium" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>{ritual.title}</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] flex-wrap">
              {(() => {
                const r = ritual as CatalogRitual & { source?: string; isPersonalized?: boolean };
                const tierLabel = r.tier === 0 ? "No tools" : r.tier === 1 ? "Household" : r.tier === 2 ? "Crystals" : r.tier === 3 ? "Full Practice" : r.tier === 4 ? "Advanced" : null;
                return (
                  <>
                    <span
                      className="px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isFeatured ? "var(--terracotta-bg)" : "var(--tag-bg)",
                        color: isFeatured ? "var(--terracotta)" : "var(--tag-text)",
                      }}
                    >
                      {MOOD_LABELS[r.mood] || r.mood}
                    </span>
                    {r.duration && <span style={{ color: "var(--foreground-faint)" }}>{r.duration}</span>}
                    {tierLabel && (
                      <span className="px-1.5 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: "var(--tag-green-bg)", color: "var(--tag-green-text)" }}>
                        {tierLabel}
                      </span>
                    )}
                    {r.signSpecific && (
                      <span className="px-1.5 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: "var(--tag-bg)", color: "var(--tag-text)" }}>
                        {r.signSpecific}
                      </span>
                    )}
                    {r.source && <span style={{ color: "var(--foreground-faint)" }}>{r.source}</span>}
                    {r.isPersonalized && (
                      <span className="px-1.5 py-0.5 rounded-full font-bold"
                            style={{ backgroundColor: "var(--tag-bg)", color: "var(--amber)" }}>
                        For You
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          <svg className={`w-4 h-4 transition-transform shrink-0 mt-1 ${isExpanded ? "rotate-90" : ""}`}
               style={{ color: "var(--foreground-faint)" }}
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!isExpanded && (
          <p className="text-[12px] leading-relaxed mt-1.5 line-clamp-2" style={{ color: "var(--foreground-muted)" }}>{ritual.description}</p>
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-[12px] leading-relaxed mb-4" style={{ color: "var(--foreground-secondary)" }}>{ritual.description}</p>

            {/* Tools needed */}
            {(() => {
              const r = ritual as CatalogRitual;
              return r.toolsNeeded && r.toolsNeeded.length > 0 ? (
                <div className="mb-4 p-2.5 rounded-xl" style={{ backgroundColor: "var(--background-elevated)" }}>
                  <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: "var(--foreground-muted)" }}>You&apos;ll need</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{r.toolsNeeded.join(" · ")}</p>
                </div>
              ) : null;
            })()}

            {/* Best timing */}
            {(() => {
              const r = ritual as CatalogRitual;
              return r.bestTiming ? (
                <div className="mb-4 flex items-start gap-2">
                  <span className="text-[11px] mt-0.5">⏰</span>
                  <p className="text-[11px] italic" style={{ color: "var(--foreground-muted)" }}>{r.bestTiming}</p>
                </div>
              ) : null;
            })()}

            {/* Steps */}
            <div className="space-y-3">
              {ritual.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[11px] font-bold mt-0.5 shrink-0" style={{ color: "var(--terracotta)", opacity: 0.6 }}>{i + 1}</span>
                  <p className="text-[12px] leading-[1.7]" style={{ color: "var(--foreground-secondary)" }}>{step}</p>
                </div>
              ))}
            </div>

            {/* Affirmation */}
            {(ritual as CatalogRitual).affirmation && (
              <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: "var(--terracotta-bg)", border: "1px solid var(--border-accent)" }}>
                <p className="text-[9px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--foreground-faint)" }}>Affirmation to carry</p>
                <p className="text-[13px] italic leading-relaxed" style={{ color: "var(--foreground)" }}>&ldquo;{(ritual as CatalogRitual).affirmation}&rdquo;</p>
              </div>
            )}

            {/* After instructions */}
            {(ritual as CatalogRitual).afterInstructions && (
              <div className="mt-3">
                <p className="text-[9px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--foreground-faint)" }}>After</p>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{(ritual as CatalogRitual).afterInstructions}</p>
              </div>
            )}

            {/* I'm Done button */}
            {onComplete && (
              <button
                onClick={() => onComplete(ritual.id, ritual.title)}
                className="mt-5 w-full py-3 rounded-xl text-[13px] font-medium transition-colors"
                style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
              >
                I&apos;m done ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function RitualPageContent() {

  const today = useMemo(() => new Date(), []);
  const todayStr = today.toISOString().slice(0, 10);
  const energy = useMemo(() => getDailyEnergy(today), [today]);
  const events = useMemo(() => getCelestialEvents(today.getFullYear()), [today]);

  // Almanac preview data
  const almanacGoodFor = useMemo(() => getGoodForToday(today), [today]);
  const almanacSky = useMemo(() => getTodaySky(today), [today]);
  const almanacMoonSign = almanacSky.moonSign;

  const [ritualModPrefs] = useState<ModalityPrefs>(loadRitualPrefs);
  const [chartInfo, setChartInfo] = useState<{ sunSign?: string; moonSign?: string; risingSign?: string }>({});

  const rituals = useMemo(
    () => getDailyRituals(today, chartInfo, ritualModPrefs),
    [today, chartInfo, ritualModPrefs]
  );

  // ─── Tool prefs (read-only here — edited in Account settings) ───
  const [myTools, setMyTools] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mapped:my-tools");
      if (saved) setMyTools(JSON.parse(saved));
    } catch {}
  }, []);

  // Catalog state
  const [selectedCategory, setSelectedCategory] = useState<RitualCategory | null>(null);
  const [expandedRitual, setExpandedRitual] = useState<string | null>(null);
  const [expandedCatalogRitual, setExpandedCatalogRitual] = useState<string | null>(null);

  // Pagination + search state
  const [catalogPage, setCatalogPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 8;

  // Calendar
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CelestialEvent | null>(null);

  // Completion check-in state
  const [showCheckin, setShowCheckin] = useState<{ ritualId: string; ritualTitle: string } | null>(null);

  // Refresh mode state
  const [showRefresh, setShowRefresh] = useState(false);

  const handleRitualComplete = (ritualId: string, ritualTitle: string) => {
    setShowCheckin({ ritualId, ritualTitle });
  };

  // Load chart info
  useEffect(() => {
    async function loadChart() {
      try {
        const cached = sessionStorage.getItem("mapped:chart-bigthree");
        if (cached) { setChartInfo(JSON.parse(cached)); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data: chart } = await supabase.from("charts").select("big_three").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (chart?.big_three) {
          const bt = chart.big_three as { sun?: string; moon?: string; rising?: string };
          setChartInfo({ sunSign: bt.sun, moonSign: bt.moon, risingSign: bt.rising });
          try { sessionStorage.setItem("mapped:chart-bigthree", JSON.stringify({ sunSign: bt.sun, moonSign: bt.moon, risingSign: bt.rising })); } catch {}
        }
      } catch {}
    }
    loadChart();
  }, []);

  // Map tool IDs to keywords that appear in ritual toolsNeeded arrays
  const toolKeywords: Record<string, string[]> = useMemo(() => ({
    "candles": ["candle"],
    "salt": ["salt"],
    "herbs": ["herb", "cinnamon", "rosemary", "bay", "lavender", "peppermint"],
    "bath": ["bath", "tub"],
    "mirror": ["mirror"],
    "rose-quartz": ["rose quartz"],
    "clear-quartz": ["clear quartz"],
    "amethyst": ["amethyst"],
    "incense": ["incense", "frankincense", "sandalwood", "palo santo"],
    "crystals-other": ["citrine", "black tourmaline", "selenite", "carnelian", "lapis", "crystal"],
    "oils": ["oil"],
    "tarot": ["tarot", "oracle"],
  }), []);

  // Check if user has the tools needed for a ritual
  const userHasToolsFor = useMemo(() => {
    return (ritual: CatalogRitual): boolean => {
      if (!ritual.toolsNeeded || ritual.toolsNeeded.length === 0) return true;
      const needed = ritual.toolsNeeded.join(" ").toLowerCase();
      for (const [toolId, keywords] of Object.entries(toolKeywords)) {
        if (myTools[toolId]) continue;
        for (const kw of keywords) {
          if (needed.includes(kw)) return false;
        }
      }
      return true;
    };
  }, [myTools, toolKeywords]);

  // Filter catalog by user's tools
  const toolFilteredCatalog = useMemo(
    () => RITUAL_CATALOG.filter(userHasToolsFor),
    [userHasToolsFor]
  );

  // Daily suggested ritual (respects tool filter)
  const dailySuggestion = useMemo(
    () => {
      const pool = toolFilteredCatalog.length > 0 ? toolFilteredCatalog : RITUAL_CATALOG;
      const phaseMatches = pool.filter((r) => r.bestPhases.includes(energy.moonPhase.phase));
      if (phaseMatches.length === 0) return pool[0];
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      return phaseMatches[dayOfYear % phaseMatches.length];
    },
    [energy.moonPhase.phase, toolFilteredCatalog]
  );

  // Tonight's Moon ritual — always present, never the intention-setting overrides
  const moonRitual = useMemo(() => {
    const phase = energy.moonPhase.phase;
    const pool = toolFilteredCatalog.filter(
      (r) =>
        r.bestPhases.includes(phase) &&
        r.id !== "time-new-moon-intention" &&
        r.id !== "time-full-moon-release" &&
        r.id !== dailySuggestion.id
    );
    if (pool.length === 0) return null;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return pool[(dayOfYear + 7) % pool.length];
  }, [energy.moonPhase.phase, toolFilteredCatalog, dailySuggestion.id]);

  // Filtered catalog rituals (category + tools + search)
  const filteredRituals = useMemo(() => {
    let pool = selectedCategory
      ? toolFilteredCatalog.filter((r) => r.category === selectedCategory)
      : toolFilteredCatalog;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      pool = pool.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.mood.toLowerCase().includes(q) ||
          (r.contentTags && r.contentTags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return pool;
  }, [selectedCategory, toolFilteredCatalog, searchQuery]);

  // Paginated rituals
  const totalPages = Math.ceil(filteredRituals.length / ITEMS_PER_PAGE);
  const paginatedRituals = useMemo(
    () => filteredRituals.slice(catalogPage * ITEMS_PER_PAGE, (catalogPage + 1) * ITEMS_PER_PAGE),
    [filteredRituals, catalogPage]
  );

  // Reset page when filters change
  useEffect(() => { setCatalogPage(0); }, [selectedCategory, searchQuery]);

  // Upcoming events (next 30 days)
  const upcomingEvents = useMemo(() => {
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);
    return events.filter((e) => e.date >= today && e.date <= endDate).slice(0, showAllEvents ? 30 : 5);
  }, [events, today, showAllEvents]);

  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const cardShadow = "var(--card-shadow)";

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-28 px-5">

      {/* ═══ HEADER ═══ */}
      <div className="pt-6 pb-4">
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: "var(--foreground-muted)" }}>
          {dateStr}
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-[28px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            Ritual
          </h1>
          <Link
            href="/account#ritual-tools"
            className="text-[11px] font-medium pb-1 transition-colors"
            style={{ color: "var(--foreground-faint)" }}
          >
            Customize
          </Link>
        </div>
      </div>

      {/* ═══ TONIGHT'S MOON ═══ */}
      <div className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{
        background: "var(--moon-card-bg)",
      }}>
        {/* Moon emoji floating top-right */}
        <div className="absolute top-4 right-4 text-[48px]">
          {energy.moonPhase.emoji}
        </div>

        <p className="text-[11px] uppercase tracking-[0.15em] font-bold mb-2" style={{ color: "var(--foreground-secondary)" }}>
          Tonight&apos;s Moon
        </p>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          {energy.moonPhase.label}
        </h2>
        <p className="text-[14px] leading-relaxed pr-14 mb-4" style={{ color: "var(--foreground-secondary)" }}>
          {energy.moonPhase.energy}
        </p>

        {/* Nested moon ritual card */}
        {moonRitual && (
          <button
            onClick={() => setExpandedRitual(expandedRitual === moonRitual.id ? null : moonRitual.id)}
            className="w-full rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-all"
            style={{
              backgroundColor: "var(--moon-card-inner)",
            }}
          >
            <div>
              <p className="text-[15px] font-semibold text-left" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                {moonRitual.title}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                {moonRitual.duration || "5 min"} · {(() => {
                  const r = moonRitual as CatalogRitual;
                  return r.tier === 0 ? "No tools" : r.tier === 1 ? "Household" : r.tier === 2 ? "Crystals" : "Full Practice";
                })()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ml-3" style={{ backgroundColor: "var(--terracotta)" }}>
              <svg className="w-4 h-4 ml-0.5" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Expanded moon ritual detail (shows below card when tapped) */}
      {moonRitual && expandedRitual === moonRitual.id && (
        <div className="mb-5 -mt-2 rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
          <RitualDetailCard
            ritual={moonRitual}
            isExpanded={true}
            onToggle={() => setExpandedRitual(null)}
            onComplete={handleRitualComplete}
            variant="default"
          />
        </div>
      )}

      {/* ═══ TODAY'S RITUAL ═══ */}
      <div className="rounded-2xl p-5 mb-5" style={{
        backgroundColor: "var(--background-card)",
        border: "1px solid var(--border-card)",
        boxShadow: cardShadow,
      }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px]" style={{
            backgroundColor: "var(--icon-thumb-love)",
          }}>
            {ELEMENT_ICONS[dailySuggestion.element] || "✨"}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: "var(--terracotta)" }}>
              Today&apos;s Ritual
            </p>
            <h2 className="text-[18px] font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
              {dailySuggestion.title}
            </h2>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{
            backgroundColor: "var(--tag-bg)",
            color: "var(--tag-text)",
          }}>
            {MOOD_LABELS[dailySuggestion.mood] || dailySuggestion.mood}
          </span>
          {(() => {
            const tierLabel = dailySuggestion.tier === 0 ? "No tools" : dailySuggestion.tier === 1 ? "Household" : dailySuggestion.tier === 2 ? "Crystals" : dailySuggestion.tier === 3 ? "Full Practice" : "Advanced";
            return (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{
                backgroundColor: "var(--tag-green-bg)",
                color: "var(--tag-green-text)",
              }}>
                {tierLabel}
              </span>
            );
          })()}
          {dailySuggestion.duration && (
            <span className="text-[11px]" style={{ color: "var(--foreground-muted)" }}>
              {dailySuggestion.duration}
            </span>
          )}
        </div>

        <p className="text-[14px] leading-relaxed mb-5" style={{ color: "var(--foreground-secondary)" }}>
          {dailySuggestion.description}
        </p>

        {/* Begin ritual button */}
        <button
          onClick={() => setExpandedRitual(expandedRitual === dailySuggestion.id ? null : dailySuggestion.id)}
          className="w-full py-3.5 rounded-xl text-[15px] font-semibold transition-all active:scale-[0.98]"
          style={{ fontFamily: "var(--font-heading)", backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
        >
          Begin ritual
        </button>

        {/* Not feeling this */}
        <button
          onClick={() => setShowRefresh(true)}
          className="w-full py-2.5 mt-2 text-[13px] font-medium transition-colors"
          style={{ color: "var(--foreground-faint)" }}
        >
          Not feeling this?
        </button>
      </div>

      {/* Expanded today's ritual detail */}
      {expandedRitual === dailySuggestion.id && (
        <div className="mb-5 -mt-2 rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
          <RitualDetailCard
            ritual={dailySuggestion}
            isExpanded={true}
            onToggle={() => setExpandedRitual(null)}
            onComplete={handleRitualComplete}
            variant="featured"
          />
        </div>
      )}

      {/* ═══ ALMANAC PREVIEW ═══ */}
      <Link href="/almanac" className="block rounded-2xl p-5 mb-5 overflow-hidden active:scale-[0.98] transition-all" style={{ backgroundColor: "var(--sage-bg)", border: "1px solid var(--border-card)", boxShadow: cardShadow }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-[0.15em] font-bold" style={{ color: "var(--tag-green-text)" }}>
            🌾 Today&apos;s Almanac
          </p>
          <span className="text-[11px] font-semibold" style={{ color: "var(--sage)" }}>
            View full almanac →
          </span>
        </div>

        <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--foreground)" }}>
          Moon in {almanacMoonSign} · {energy.moonPhase.label}
        </p>

        {/* Top 3 good-for items */}
        <div className="flex flex-col gap-1.5 mb-3">
          {almanacGoodFor.activities.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[12px] font-semibold" style={{ color: "var(--sage)" }}>✓</span>
              <span className="text-[12px]" style={{ color: "var(--foreground-secondary)" }}>
                {item.icon} {item.activity}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[10px] leading-relaxed italic" style={{ color: "var(--foreground-faint)" }}>
          &ldquo;{energy.moonPhase.almanac.folkWisdom}&rdquo;
        </p>
      </Link>

      {/* ═══ BROWSE RITUALS ═══ */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] uppercase tracking-[0.15em] font-bold" style={{ color: "var(--foreground-muted)" }}>
            Browse Rituals
          </h2>
          <span className="text-[11px] ml-auto" style={{ color: "var(--foreground-faint)" }}>
            {filteredRituals.length} available
          </span>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 mb-4 pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className="shrink-0 px-4 py-2.5 rounded-full text-[11px] font-semibold transition-all"
            style={{
              backgroundColor: selectedCategory === null ? "var(--terracotta)" : "var(--background-card)",
              color: selectedCategory === null ? "var(--btn-primary-text, #fff)" : "var(--foreground-muted)",
              boxShadow: selectedCategory === null ? "0 2px 8px rgba(196,149,106,0.3)" : cardShadow,
            }}
          >
            All
          </button>
          {RITUAL_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[11px] font-semibold transition-all"
              style={{
                backgroundColor: selectedCategory === cat.key ? "var(--terracotta)" : "var(--background-card)",
                color: selectedCategory === cat.key ? "var(--btn-primary-text, #fff)" : "var(--foreground-muted)",
                boxShadow: selectedCategory === cat.key ? "0 2px 8px rgba(196,149,106,0.3)" : cardShadow,
              }}
            >
              <span className="text-[13px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--foreground-faint)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rituals..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-[13px] focus:outline-none transition-all"
              style={{
                backgroundColor: "var(--background-card)",
                border: "1px solid var(--border-card)",
                color: "var(--foreground)",
                boxShadow: cardShadow,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--background-elevated)", color: "var(--foreground-muted)" }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Ritual list (paginated) */}
        <div className="space-y-2.5">
          {paginatedRituals.map((ritual) => (
            <div key={ritual.id} style={{ boxShadow: cardShadow }} className="rounded-2xl">
              <RitualDetailCard
                ritual={ritual}
                isExpanded={expandedCatalogRitual === ritual.id}
                onToggle={() => setExpandedCatalogRitual(expandedCatalogRitual === ritual.id ? null : ritual.id)}
                onComplete={handleRitualComplete}
              />
            </div>
          ))}

          {filteredRituals.length === 0 && (
            <div className="text-center py-10">
              <div className="text-[32px] mb-3 opacity-40">🔮</div>
              <p className="text-[14px] font-medium mb-1" style={{ color: "var(--foreground-muted)" }}>No rituals found</p>
              <p className="text-[12px]" style={{ color: "var(--foreground-faint)" }}>
                {searchQuery ? `Nothing matches "${searchQuery}"` : "Try a different category"}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="mt-3 px-4 py-2 rounded-full text-[12px] font-medium" style={{ backgroundColor: "var(--terracotta-bg)", color: "var(--terracotta)" }}>
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 px-1">
            <button
              onClick={() => setCatalogPage((p) => Math.max(0, p - 1))}
              disabled={catalogPage === 0}
              className="px-4 py-2.5 rounded-full text-[12px] font-medium transition-all"
              style={{
                color: catalogPage === 0 ? "var(--foreground-ghost)" : "var(--foreground-secondary)",
                backgroundColor: catalogPage === 0 ? "transparent" : "var(--background-card)",
                boxShadow: catalogPage === 0 ? "none" : cardShadow,
                cursor: catalogPage === 0 ? "not-allowed" : "pointer",
              }}
            >
              ← Prev
            </button>
            <span className="text-[11px] font-medium" style={{ color: "var(--foreground-faint)" }}>
              {catalogPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCatalogPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={catalogPage >= totalPages - 1}
              className="px-4 py-2.5 rounded-full text-[12px] font-medium transition-all"
              style={{
                color: catalogPage >= totalPages - 1 ? "var(--foreground-ghost)" : "var(--foreground-secondary)",
                backgroundColor: catalogPage >= totalPages - 1 ? "transparent" : "var(--background-card)",
                boxShadow: catalogPage >= totalPages - 1 ? "none" : cardShadow,
                cursor: catalogPage >= totalPages - 1 ? "not-allowed" : "pointer",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ═══ CELESTIAL CALENDAR ═══ */}
      <div className="mb-5">
        <h2 className="text-[12px] uppercase tracking-[0.15em] font-bold mb-3" style={{ color: "var(--foreground-muted)" }}>
          Celestial Calendar
        </h2>

        <div className="rounded-2xl px-4 py-2 overflow-hidden" style={{ backgroundColor: "var(--background-card)", boxShadow: cardShadow }}>
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} isToday={event.date.toISOString().slice(0, 10) === todayStr} onTap={() => setSelectedEvent(event)} />
          ))}

          {!showAllEvents && upcomingEvents.length >= 5 && (
            <button
              onClick={() => setShowAllEvents(true)}
              className="w-full py-3.5 text-[12px] font-semibold transition-colors"
              style={{ color: "var(--terracotta)" }}
            >
              Show more events ↓
            </button>
          )}
        </div>
      </div>

      {/* ═══ MODALS ═══ */}

      {/* Post-ritual completion check-in */}
      {showCheckin && (
        <RitualCompletionCheckin
          ritualId={showCheckin.ritualId}
          ritualTitle={showCheckin.ritualTitle}
          moonPhase={energy.moonPhase.phase}
          zodiacSeason={energy.zodiacSeason.sign}
          onClose={() => setShowCheckin(null)}
          onComplete={() => setShowCheckin(null)}
        />
      )}

      {/* Celestial event detail pop-up */}
      {selectedEvent && (() => {
        const evDate = selectedEvent.date instanceof Date ? selectedEvent.date : new Date(selectedEvent.date + "T12:00:00");
        const sym = CATEGORY_SYMBOLS[selectedEvent.category] || CATEGORY_SYMBOLS.moon;
        const matchedRitual = RITUAL_CATALOG.find(
          (r) =>
            (selectedEvent.element && r.element === selectedEvent.element) ||
            (selectedEvent.category === "moon" && r.bestPhases.includes(energy.moonPhase.phase) && r.id !== "time-new-moon-intention" && r.id !== "time-full-moon-release")
        );
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm"
               style={{ backgroundColor: "var(--modal-overlay)" }}>
            <div className="rounded-t-3xl sm:rounded-3xl p-5 pb-8 mx-0 sm:mx-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
                 style={{ backgroundColor: "var(--modal-bg)" }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--foreground-faint)" }}>
                  {evDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </span>
                <button onClick={() => setSelectedEvent(null)} className="text-[12px] transition-colors" style={{ color: "var(--foreground-faint)" }}>
                  Close
                </button>
              </div>

              {/* Event name + icon */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[32px]">{sym.icon}</span>
                <div>
                  <h3 className="text-[17px] font-medium" style={{ color: "var(--foreground)" }}>{selectedEvent.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase"
                          style={{ backgroundColor: "var(--tag-bg)", color: "var(--tag-text)" }}>
                      {TRADITION_LABELS[selectedEvent.tradition] || selectedEvent.tradition}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase"
                          style={{ backgroundColor: "var(--tag-bg)", color: "var(--tag-text)" }}>
                      {selectedEvent.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description / History */}
              <div className="mb-4">
                <p className="text-[9px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: "var(--foreground-faint)" }}>About this day</p>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{selectedEvent.description}</p>
              </div>

              {/* Symbolism */}
              <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: "var(--background-elevated)" }}>
                <p className="text-[9px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: "var(--foreground-faint)" }}>What it symbolizes</p>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{sym.meaning}</p>
              </div>

              {/* Ritual hint */}
              <div className="mb-4">
                <p className="text-[9px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: "var(--foreground-faint)" }}>Practice suggestion</p>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{selectedEvent.ritualHint}</p>
              </div>

              {/* Matched ritual */}
              {matchedRitual && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--foreground-faint)" }}>Ritual for this day</p>
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      setExpandedCatalogRitual(matchedRitual.id);
                    }}
                    className="w-full text-left p-3 rounded-xl active:scale-[0.98] transition-all"
                    style={{ backgroundColor: "var(--terracotta-bg)", border: "1px solid var(--border-accent)" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px]">{ELEMENT_ICONS[matchedRitual.element] || "✨"}</span>
                      <span className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>{matchedRitual.title}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--foreground-muted)" }}>{matchedRitual.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                      <span style={{ color: "var(--foreground-faint)" }}>{matchedRitual.duration}</span>
                      <span className="font-medium" style={{ color: "var(--terracotta)" }}>Tap to view →</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Refresh mode — "Not Feeling This?" */}
      {showRefresh && (
        <RefreshModal
          onSelect={(ritual) => {
            setShowRefresh(false);
            setExpandedRitual(ritual.id);
          }}
          onClose={() => setShowRefresh(false)}
        />
      )}
    </main>
  );
}
