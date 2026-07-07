"use client";

/**
 * Ritual page — daily ritual suggestions + browseable catalog by life area.
 *
 * Sections:
 * 1. Rituals/Tarot tab switcher
 * 2. Date context line (weekday · date · moon phase in sign)
 * 3. Today's Ritual — hero card with personalized suggestion
 * 4. Two side-by-side cards: Tonight's Moon (compact) + Ritual Calendar (date + streak)
 * 5. Today's Almanac — preview with good-for items
 * 6. Browse All Rituals — catalog with search + pagination
 * 7. Interactive Event Calendar — expands from Ritual Calendar card
 *
 * All colors use CSS custom properties for light/dark theme support.
 */

import { useState, useMemo, useEffect } from "react";
import {
  getDailyEnergy,
  getCelestialEvents,
  getMoonPhaseImage,
  type CelestialEvent,
} from "@/lib/celestialCalendar";
import Image from "next/image";
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
import MoonEventScreen from "@/components/MoonEventScreen";
// feedback utils available if needed later
import { getGoodForToday, getTodaySky } from "@/lib/almanacData";
import { getCachedLocation, fetchUserLocation, type UserLocation } from "@/lib/userLocation";
// Theme handled via CSS variables — no useTheme needed here

// ─── Constants ──────────────────────────────────────────────────────────────

const RITUAL_PREFS_KEY = "mapped:ritual-modalities";

/** Decorative stars behind the Today hero moon — [x%, y%, size, opacity]. */
const RITUAL_HERO_STARS: [number, number, number, number][] = [
  [12, 14, 1.6, 0.5], [30, 8, 1.3, 0.4], [52, 18, 1.5, 0.45], [70, 10, 1.7, 0.32],
  [86, 22, 1.3, 0.4], [20, 30, 1.2, 0.35], [62, 32, 1.5, 0.3], [42, 40, 1.2, 0.4],
  [80, 40, 1.4, 0.36], [16, 46, 1.3, 0.3], [92, 12, 1.2, 0.42], [50, 6, 1.4, 0.3],
];

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

/** Maps element/category keys → image filenames in /public/ritual icons/ */
const RITUAL_ICON_MAP: Record<string, string> = {
  // elements
  fire: "fire.png", water: "water.png", earth: "earth.png", air: "air.png", spirit: "spirit.png",
  // categories
  love: "heart.png", career: "career.png", health: "health.png", wealth: "wealth.png",
  creativity: "creativity.png", protection: "protection.png", growth: "growth.png",
  peace: "peace.png", clarity: "clarity.png", release: "release.png",
  manifestation: "manifestation.png", foundation: "rock.png",
};

/** Reusable icon component that renders watercolor PNGs from /ritual icons/ */
function RitualIcon({ name, size = 24, className = "" }: { name: string; size?: number; className?: string }) {
  const file = RITUAL_ICON_MAP[name];
  if (!file) return <span style={{ fontSize: size }}>{"✨"}</span>; // fallback sparkle
  return (
    <Image
      src={`/ritual%20icons/${file}`}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

const MOOD_LABELS: Record<string, string> = {
  calm: "Calming", energized: "Energizing", reflective: "Reflective",
  joyful: "Uplifting", grounded: "Grounding", releasing: "Releasing",
};

// ─── Tradition display names ───────────────────────────────────────────────
const TRADITION_LABELS: Record<string, string> = {
  vedic: "Vedic / Hindu", chinese: "Chinese", celtic: "Celtic / Gaelic",
  islamic: "Islamic", western: "Western Astrology", indigenous: "Indigenous",
  astronomical: "Astronomical", pagan: "Pagan / Wiccan", egyptian: "Egyptian",
  persian: "Persian", tibetan: "Tibetan Buddhist", thai: "Thai",
  japanese: "Japanese / Shinto",
};

// ─── Ritual Tools (same data as account settings, shared localStorage key) ──
const TOOL_OPTIONS = [
  { id: "candles", icon: "🕯️", label: "Candles", desc: "Any color candle" },
  { id: "salt", icon: "🧂", label: "Salt", desc: "Sea salt or Epsom" },
  { id: "herbs", icon: "🌿", label: "Kitchen Herbs", desc: "Cinnamon, rosemary, bay, lavender" },
  { id: "bath", icon: "🛁", label: "Bathtub", desc: "For ritual baths and soaks" },
  { id: "mirror", icon: "🪞", label: "Mirror", desc: "Any mirror you can sit in front of" },
  { id: "rose-quartz", icon: "💗", label: "Rose Quartz", desc: "Love and self-love" },
  { id: "clear-quartz", icon: "🤍", label: "Clear Quartz", desc: "Clarity and amplification" },
  { id: "amethyst", icon: "💜", label: "Amethyst", desc: "Peace and intuition" },
  { id: "incense", icon: "🪔", label: "Incense", desc: "Frankincense, sandalwood, palo santo" },
  { id: "crystals-other", icon: "💎", label: "Other Crystals", desc: "Citrine, black tourmaline, selenite, etc." },
  { id: "oils", icon: "💧", label: "Essential Oils", desc: "For anointing and scent" },
  { id: "tarot", icon: "🃏", label: "Tarot / Oracle Deck", desc: "For card-based rituals" },
];
const MY_TOOLS_KEY = "mapped:my-tools";

function RitualToolsPopup({ onClose }: { onClose: () => void }) {
  const [myTools, setMyTools] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MY_TOOLS_KEY);
      if (saved) setMyTools(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleTool = (id: string) => {
    setMyTools((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(MY_TOOLS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const enabledCount = Object.values(myTools).filter(Boolean).length;

  return (
    <>
      {/* Backdrop — covers entire screen */}
      <div
        className="fixed inset-0 z-[60]"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      {/* Bottom sheet — pinned to bottom of viewport, centered */}
      <div
        className="fixed bottom-0 left-1/2 z-[61] rounded-t-3xl"
        style={{
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "28rem",
          backgroundColor: "var(--background-card)",
          border: "1px solid var(--border-card)",
          maxHeight: "80dvh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Customize ritual tools"
      >
        {/* Fixed header */}
        <div style={{ flexShrink: 0, padding: "20px 20px 12px" }}>
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--border)" }} />
          </div>
          <p className="text-[11px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: "var(--terracotta)" }}>
            Your Ritual Tools
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
            {enabledCount > 0
              ? `${enabledCount} selected — rituals are filtered to match what you have`
              : "Tell us what you have at home so we can suggest rituals that work for you"}
          </p>
        </div>

        {/* Scrollable grid */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            padding: "0 20px 12px",
            minHeight: 0,
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            {TOOL_OPTIONS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => toggleTool(tool.id)}
                className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: myTools[tool.id] ? "var(--tag-green-bg)" : "var(--background-elevated)",
                  border: myTools[tool.id] ? "1px solid var(--sage)" : "1px solid var(--border-card)",
                }}
              >
                <span className="text-[16px] shrink-0">{tool.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium" style={{ color: myTools[tool.id] ? "var(--foreground)" : "var(--foreground-muted)" }}>
                    {tool.label}
                  </p>
                  <p className="text-[10px] leading-tight mt-0.5" style={{ color: "var(--foreground-faint)" }}>
                    {tool.desc}
                  </p>
                </div>
                <div
                  className="ml-auto w-7 h-4 rounded-full flex items-center px-0.5 shrink-0 transition-all"
                  style={{
                    backgroundColor: myTools[tool.id] ? "var(--sage)" : "var(--border)",
                    justifyContent: myTools[tool.id] ? "flex-end" : "flex-start",
                  }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "white" }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Fixed footer — always visible */}
        <div style={{ flexShrink: 0, padding: "12px 20px 32px", borderTop: "1px solid var(--border-card)" }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-[14px] font-semibold transition-all"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  moon: "var(--brass)",
  solar: "var(--terracotta)",
  festival: "var(--sage)",
  season: "var(--sage)",
  planetary: "var(--oxblood-light)",
};

const CATEGORY_SYMBOLS: Record<string, { icon: string; meaning: string }> = {
  moon: { icon: "🌙", meaning: "Lunar events mark the rhythm of release and renewal. Cultures across the world have tracked the moon to time planting, ceremony, and emotional cycles." },
  solar: { icon: "☀️", meaning: "Solar events mark the turning of the year — equinoxes and solstices divide the year into its four great quarters, each with its own energy." },
  festival: { icon: "🎭", meaning: "Festivals honor the intersection of celestial timing and cultural memory. They're moments when a community pauses to mark what matters." },
  season: { icon: "🍃", meaning: "Seasonal markers connect your practice to the actual rhythms of the earth — the tilt of the planet, the length of light." },
  planetary: { icon: "🪐", meaning: "Planetary events — retrogrades, conjunctions, returns — are moments when specific archetypal energies shift. The sky mirrors the inner landscape." },
};

// ─── Interactive Event Calendar ─────────────────────────────────────────────

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function EventCalendar({
  events,
  todayDate,
  onSelectEvent,
  selectedEvent,
  cardShadow,
}: {
  events: CelestialEvent[];
  todayDate: Date;
  onSelectEvent: (event: CelestialEvent | null) => void;
  selectedEvent: CelestialEvent | null;
  cardShadow: string;
}) {
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const todayDay = todayDate.getDate();
  const todayMonth = todayDate.getMonth();
  const todayYear = todayDate.getFullYear();
  const isCurrentMonth = viewMonth === todayMonth && viewYear === todayYear;

  // Build event lookup: day number → events[]
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CelestialEvent[]>();
    events.forEach((e) => {
      const d = e.date instanceof Date ? e.date : new Date(e.date + "T12:00:00");
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(e);
      }
    });
    return map;
  }, [events, viewMonth, viewYear]);

  // Grid layout
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
    setSelectedDay(null);
    onSelectEvent(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
    setSelectedDay(null);
    onSelectEvent(null);
  };

  const goToToday = () => {
    setViewMonth(todayMonth);
    setViewYear(todayYear);
    setSelectedDay(null);
    onSelectEvent(null);
  };

  const handleDayTap = (day: number) => {
    const dayEvents = eventsByDay.get(day);
    if (selectedDay === day) {
      setSelectedDay(null);
      onSelectEvent(null);
    } else {
      setSelectedDay(day);
      onSelectEvent(dayEvents?.[0] ?? null);
    }
  };

  // Events for selected day
  const selectedDayEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : [];

  return (
    <div className="rounded-2xl mb-5 overflow-hidden" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: cardShadow }}>
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={prevMonth} aria-label="Previous month" className="p-2 -ml-2 rounded-lg transition-colors" style={{ color: "var(--foreground-muted)" }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button onClick={goToToday} className="text-center">
          <p className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{monthLabel}</p>
          {!isCurrentMonth && (
            <p className="text-[10px] font-medium" style={{ color: "var(--terracotta)" }}>Back to today</p>
          )}
        </button>
        <button onClick={nextMonth} aria-label="Next month" className="p-2 -mr-2 rounded-lg transition-colors" style={{ color: "var(--foreground-muted)" }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-3">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="text-center py-1">
            <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--foreground-faint)" }}>{d}</span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 px-3 pb-3">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = isCurrentMonth && day === todayDay;
          const dayEvents = eventsByDay.get(day);
          const hasEvents = !!dayEvents && dayEvents.length > 0;
          const isSelected = selectedDay === day;

          // Get up to 3 category colors for dot indicators
          const dotColors = hasEvents
            ? [...new Set(dayEvents.map(e => CATEGORY_COLORS[e.category] || "var(--foreground-faint)"))].slice(0, 3)
            : [];

          return (
            <button
              key={day}
              onClick={() => handleDayTap(day)}
              className="aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative"
              style={{
                backgroundColor: isSelected
                  ? "var(--terracotta)"
                  : isToday
                    ? "var(--terracotta-bg)"
                    : "transparent",
              }}
            >
              <span
                className="text-[13px] font-medium"
                style={{
                  color: isSelected
                    ? "var(--btn-primary-text)"
                    : isToday
                      ? "var(--terracotta)"
                      : hasEvents
                        ? "var(--foreground)"
                        : "var(--foreground-muted)",
                  fontWeight: isToday || hasEvents ? 600 : 400,
                }}
              >
                {day}
              </span>
              {/* Event dots */}
              {hasEvents && (
                <div className="flex gap-[2px] mt-[1px]">
                  {dotColors.map((color, di) => (
                    <span
                      key={di}
                      className="w-[4px] h-[4px] rounded-full"
                      style={{ backgroundColor: isSelected ? "var(--btn-primary-text)" : color, opacity: isSelected ? 0.8 : 1 }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay !== null && selectedDayEvents.length > 0 && (
        <div className="px-4 pb-4 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-[10px] uppercase tracking-wider font-semibold pt-3" style={{ color: "var(--foreground-faint)" }}>
            {new Date(viewYear, viewMonth, selectedDay).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          {selectedDayEvents.map((evt) => {
            const isActive = selectedEvent?.id === evt.id;
            const sym = CATEGORY_SYMBOLS[evt.category] || CATEGORY_SYMBOLS.moon;
            return (
              <div key={evt.id}>
                <button
                  onClick={() => onSelectEvent(isActive ? null : evt)}
                  className="w-full text-left p-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: isActive ? "var(--terracotta-bg)" : "var(--background-elevated)",
                    border: isActive ? "1px solid var(--border-accent)" : "1px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px]">{sym.icon}</span>
                    <span className="text-[13px] font-semibold flex-1" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "var(--foreground)" }}>{evt.name}</span>
                    <svg aria-hidden="true" className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-90" : ""}`} style={{ color: "var(--foreground-faint)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase" style={{ backgroundColor: "var(--tag-bg)", color: "var(--tag-text)" }}>
                      {TRADITION_LABELS[evt.tradition] || evt.tradition}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--foreground-faint)" }}>{evt.ritualHint.slice(0, 50)}{evt.ritualHint.length > 50 ? "..." : ""}</span>
                  </div>
                </button>

                {/* Expanded event detail */}
                {isActive && (
                  <div className="px-3 pb-1 pt-2 space-y-3">
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{evt.description}</p>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--background-elevated)" }}>
                      <p className="text-[9px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: "var(--foreground-faint)" }}>What it symbolizes</p>
                      <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{sym.meaning}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: "var(--foreground-faint)" }}>Practice suggestion</p>
                      <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>{evt.ritualHint}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected day with no events */}
      {selectedDay !== null && selectedDayEvents.length === 0 && (
        <div className="px-4 pb-4 pt-3 text-center" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-[12px]" style={{ color: "var(--foreground-faint)" }}>
            No celestial events on {new Date(viewYear, viewMonth, selectedDay).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
        </div>
      )}
    </div>
  );
}

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
              <RitualIcon name={ritual.element} size={20} />
              <h3 className="text-[14px] font-medium" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "var(--foreground)" }}>{ritual.title}</h3>
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
          <svg aria-hidden="true" className={`w-4 h-4 transition-transform shrink-0 mt-1 ${isExpanded ? "rotate-90" : ""}`}
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

            {/* Honest framing — only when the ritual leans on crystals, oils, or chakras */}
            {(() => {
              const r = ritual as CatalogRitual;
              const hay = `${r.description} ${(r.toolsNeeded || []).join(" ")} ${r.steps.join(" ")}`.toLowerCase();
              const usesCorrespondence = /crystal|quartz|amethyst|citrine|obsidian|selenite|tourmaline|fluorite|labradorite|carnelian|moonstone|rose quartz|essential oil|\boils?\b|chakra/.test(hay);
              if (!usesCorrespondence) return null;
              return (
                <div className="mt-3 p-2.5 rounded-xl" style={{ backgroundColor: "var(--background-elevated)" }}>
                  <p className="text-[10px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                    Crystals, oils, and chakras are traditional, symbolic practices — not scientifically proven to have physical or medical effects. Use them as focusing tools alongside, never instead of, professional care.
                  </p>
                </div>
              );
            })()}

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
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);
  const energy = useMemo(() => getDailyEnergy(today), [today]);
  const events = useMemo(() => getCelestialEvents(today.getFullYear()), [today]);

  // ── User location (profile → birth chart fallback) for real sun times ──
  // Same pattern as AlmanacPageContent. Hook stays at the top — never
  // conditional, never after an early return (Rules of Hooks).
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
        // signed out / offline — getTodaySky falls back to its defaults
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Almanac preview data
  const almanacGoodFor = useMemo(() => getGoodForToday(today), [today]);
  const almanacSky = useMemo(
    () => getTodaySky(today, userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null),
    [today, userLocation]
  );
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
  const [expandedRitual, setExpandedRitual] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RitualCategory | null>(null);
  const [expandedCatalogRitual, setExpandedCatalogRitual] = useState<string | null>(null);
  const [catalogPage, setCatalogPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 8;

  // Calendar (interactive month view at top)
  const [selectedEvent, setSelectedEvent] = useState<CelestialEvent | null>(null);

  // Completion check-in state
  const [showCheckin, setShowCheckin] = useState<{ ritualId: string; ritualTitle: string } | null>(null);

  // Refresh mode state
  const [showRefresh, setShowRefresh] = useState(false);

  // Moon event overlay (full/new moon detail screen)
  const [showMoonEvent, setShowMoonEvent] = useState(false);

  // Customize tools popup
  const [showCustomize, setShowCustomize] = useState(false);

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

  // Local day-of-year (avoids UTC rollover mid-evening)
  const localDayOfYear = useMemo(() => {
    const start = new Date(today.getFullYear(), 0, 0);
    return Math.floor((today.getTime() - start.getTime()) / 86400000);
  }, [today]);

  // Active ritual tracking — persists across page visits
  const [activeRitual, setActiveRitual] = useState<{ id: string; startedAt: string; dayNumber: number } | null>(() => {
    try {
      const saved = localStorage.getItem("mapped:active-ritual");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Calculate which day they're on
      const startDate = new Date(parsed.startedAt);
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / 86400000);
      return { ...parsed, dayNumber: daysDiff + 1 };
    } catch { return null; }
  });

  const startActiveRitual = (ritualId: string) => {
    const data = { id: ritualId, startedAt: todayStr, dayNumber: 1 };
    setActiveRitual(data);
    try { localStorage.setItem("mapped:active-ritual", JSON.stringify(data)); } catch {}
  };

  const clearActiveRitual = () => {
    setActiveRitual(null);
    try { localStorage.removeItem("mapped:active-ritual"); } catch {}
  };

  // Daily suggested ritual — cached in localStorage so it stays consistent all day
  const dailySuggestion = useMemo(
    () => {
      const cacheKey = `mapped:daily-ritual-${todayStr}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const found = RITUAL_CATALOG.find(r => r.id === cached);
          if (found) return found;
        }
        // Clean old days
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("mapped:daily-ritual-") && k !== cacheKey) {
            localStorage.removeItem(k);
          }
        }
      } catch {}

      const pool = toolFilteredCatalog.length > 0 ? toolFilteredCatalog : RITUAL_CATALOG;
      const phaseMatches = pool.filter((r) => r.bestPhases.includes(energy.moonPhase.phase));
      if (phaseMatches.length === 0) return pool[0];
      const pick = phaseMatches[localDayOfYear % phaseMatches.length];
      try { localStorage.setItem(cacheKey, pick.id); } catch {}
      return pick;
    },
    [energy.moonPhase.phase, toolFilteredCatalog, todayStr, localDayOfYear]
  );

  // Tonight's Moon ritual
  // On full/new moon days, use the same ritual from getDailyRituals() (matches home screen + practice page)
  // On other phases, pick a phase-appropriate catalog ritual
  const moonRitual = useMemo(() => {
    const phase = energy.moonPhase.phase;

    if (phase === "full" || phase === "new") {
      // Use the central moon ritual from rituals.ts — same one shown on MoonEventScreen
      const daily = getDailyRituals(new Date());
      // Wrap as a CatalogRitual-like shape for RitualDetailCard compatibility
      const r = daily.moonRitual;
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        steps: r.steps,
        category: "moon" as RitualCategory,
        duration: r.duration || "15 min",
        mood: r.mood,
        element: r.element,
        tier: 0,
        bestPhases: [phase],
        contentTags: ["moon", phase],
      } as CatalogRitual;
    }

    const pool = toolFilteredCatalog.filter(
      (r) =>
        r.bestPhases.includes(phase) &&
        r.id !== "time-new-moon-intention" &&
        r.id !== "time-full-moon-release" &&
        r.id !== dailySuggestion.id
    );
    if (pool.length === 0) return null;
    const dayOfYear = localDayOfYear;
    return pool[(dayOfYear + 7) % pool.length];
  }, [energy.moonPhase.phase, toolFilteredCatalog, dailySuggestion.id]);

  // Filtered catalog rituals (category + tools + search)
  // Filtered + paginated rituals for Browse section
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

  const totalPages = Math.ceil(filteredRituals.length / ITEMS_PER_PAGE);
  const paginatedRituals = useMemo(
    () => filteredRituals.slice(catalogPage * ITEMS_PER_PAGE, (catalogPage + 1) * ITEMS_PER_PAGE),
    [filteredRituals, catalogPage]
  );

  useEffect(() => { setCatalogPage(0); }, [selectedCategory, searchQuery]);

  // Practice streak (consecutive days with completions)
  const practiceStreak = useMemo(() => {
    try {
      const all = JSON.parse(localStorage.getItem("mapped:completions") || "[]") as { date?: string }[];
      if (all.length === 0) return 0;
      const dates = new Set(all.map(c => c.date || "").filter(Boolean));
      let streak = 0;
      const d = new Date(today);
      // Check today or yesterday as starting point
      const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!dates.has(todayKey)) {
        d.setDate(d.getDate() - 1);
      }
      while (true) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (dates.has(key)) { streak++; d.setDate(d.getDate() - 1); }
        else break;
      }
      return streak;
    } catch { return 0; }
  }, [today]);

  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const cardShadow = "var(--card-shadow)";

  // Context line: "TUESDAY · WAXING LIBRA MOON"
  const contextLine = useMemo(() => {
    const weekday = today.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    // Compact moon label: "WAXING LIBRA MOON"
    const phaseWord = energy.moonPhase.label.split(" ")[0].toUpperCase(); // "Waxing" from "Waxing Gibbous"
    const moonSign = almanacMoonSign.toUpperCase();
    return `${weekday} · ${phaseWord} ${moonSign} MOON`;
  }, [today, energy.moonPhase.label, almanacMoonSign]);

  const ritualGreeting = useMemo(() => {
    const h = today.getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }, [today]);

  // Calendar expanded state
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-6 px-5">

      {/* ═══ GREETING HEADER ═══ */}
      <div className="relative pt-5 pb-4">
        <button
          onClick={() => setShowCustomize(true)}
          className="absolute right-0 text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors"
          style={{ top: 20, color: "var(--foreground-faint)", border: "0.5px solid var(--border-card)", background: "var(--background-card)" }}
        >
          Customize
        </button>
        <p style={{ fontFamily: "var(--font-script)", fontSize: 30, lineHeight: 1, color: "var(--brass)", margin: "0 0 2px" }}>
          {ritualGreeting},
        </p>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 40, fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1, margin: "0 0 9px", color: "var(--foreground)" }}>
          Seeker <span style={{ fontFamily: "var(--font-script)", fontSize: 24, color: "var(--brass)" }}>☾</span>
        </h1>
        <p className="text-[13.5px] leading-[1.5]" style={{ color: "var(--foreground-muted)" }}>
          Small rituals for whatever you&rsquo;re calling in — matched to tonight&rsquo;s moon.
        </p>
      </div>

      {/* ═══ ACTIVE RITUAL (pinned multi-day practice — shown above today's ritual when active) ═══ */}
      {activeRitual && (() => {
        const ritual = RITUAL_CATALOG.find(r => r.id === activeRitual.id);
        if (!ritual) return null;
        return (
          <>
            <div className="rounded-2xl p-5 mb-4" style={{
              backgroundColor: "var(--background-card)",
              border: "2px solid var(--terracotta)",
              boxShadow: cardShadow,
            }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--icon-thumb-love)" }}>
                  <RitualIcon name={ritual.element} size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: "var(--terracotta)" }}>
                    Your Active Practice — Day {activeRitual.dayNumber}
                  </p>
                  <h2 className="text-[18px] font-bold" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "var(--foreground)" }}>
                    {ritual.title}
                  </h2>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setExpandedRitual(expandedRitual === ritual.id ? null : ritual.id)}
                  className="flex-1 py-3 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98]"
                  style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
                >
                  Continue today
                </button>
                <button
                  onClick={clearActiveRitual}
                  className="px-4 py-3 rounded-xl text-[13px] font-medium transition-colors"
                  style={{ color: "var(--foreground-muted)", border: "1px solid var(--border-card)" }}
                >
                  Done
                </button>
              </div>
            </div>
            {expandedRitual === activeRitual.id && (
              <div className="mb-4 -mt-1 rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
                <RitualDetailCard
                  ritual={ritual}
                  isExpanded={true}
                  onToggle={() => setExpandedRitual(null)}
                  onComplete={handleRitualComplete}
                  variant="featured"
                />
              </div>
            )}
          </>
        );
      })()}

      {/* ═══ TODAY HERO CARD (moon + tonight's ritual) ═══ */}
      <div
        className="relative overflow-hidden mb-3"
        style={{ height: 344, borderRadius: 26, background: "linear-gradient(178deg,#43213c 0%,#2a1530 62%,#1d0f24 100%)", border: "0.5px solid rgba(201,169,97,0.18)", boxShadow: "0 16px 38px rgba(0,0,0,0.4)" }}
      >
        {/* starfield + glow */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {RITUAL_HERO_STARS.map(([x, y, s, o], i) => (
            <span key={i} className="absolute rounded-full" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, background: "#e8dfc4", opacity: o }} />
          ))}
        </div>
        <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: 22, left: "50%", transform: "translateX(-50%)", width: 172, height: 172, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,223,196,0.22), transparent 66%)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getMoonPhaseImage(energy.moonPhase.phase)} alt={energy.moonPhase.label} style={{ position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)", width: 92, height: 92, objectFit: "contain", filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.5))" }} />

        <div className="absolute left-0 right-0 bottom-0" style={{ padding: "22px 24px 24px", background: "linear-gradient(180deg,transparent 0%,rgba(20,10,26,0.5) 32%,rgba(20,10,26,0.92) 100%)" }}>
          <p className="text-[9.5px] uppercase font-bold mb-2" style={{ letterSpacing: "0.2em", color: "#e0c488" }}>{contextLine}</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 30, fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.01em", margin: "0 0 6px", color: "#f6efdc" }}>
            {dailySuggestion.title}
          </h2>
          <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: 14.5, lineHeight: 1.45, color: "#cbbf9e", margin: "0 0 16px" }}>
            {dailySuggestion.description.split(".")[0]}.
          </p>
          <button
            onClick={() => setExpandedRitual(expandedRitual === dailySuggestion.id ? null : dailySuggestion.id)}
            className="w-full active:scale-[0.98] transition-transform"
            style={{ padding: 15, borderRadius: 99, border: "none", cursor: "pointer", background: "#e0c488", color: "#1a1420", fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            Begin tonight&rsquo;s ritual
          </button>
        </div>
      </div>
      {/* Something else */}
      <button
        onClick={() => setShowRefresh(true)}
        className="w-full py-3 mb-4 text-[14px] font-medium transition-colors"
        style={{ color: "var(--foreground-faint)" }}
      >
        Something else
      </button>

      {/* Expanded today's ritual detail */}
      {expandedRitual === dailySuggestion.id && (
        <div className="mb-4 -mt-3 rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
          <RitualDetailCard
            ritual={dailySuggestion}
            isExpanded={true}
            onToggle={() => setExpandedRitual(null)}
            onComplete={handleRitualComplete}
            variant="featured"
          />
        </div>
      )}

      {/* ═══ DAY ROW ═══ */}
      <div className="flex items-center justify-between mb-5 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="text-[14px] font-medium" style={{ color: "var(--foreground-muted)" }}>
          {practiceStreak > 0 ? `Day ${practiceStreak}` : "Start your streak"}
        </span>
      </div>

      {/* ═══ TWO SIDE-BY-SIDE CARDS: Moon + Calendar ═══ */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Tonight's Moon (compact) */}
        <button
          onClick={() => {
            const phase = energy.moonPhase.phase;
            if (phase === "full" || phase === "new") {
              setShowMoonEvent(true);
            } else if (moonRitual) {
              setExpandedRitual(expandedRitual === moonRitual.id ? null : moonRitual.id);
            }
          }}
          className="rounded-2xl p-4 text-left relative overflow-hidden active:scale-[0.97] transition-all"
          style={{ backgroundColor: "var(--moon-card-bg)", border: "1px solid var(--border-card)", boxShadow: cardShadow }}
        >
          <div className="absolute top-3 right-3">
            <Image src={getMoonPhaseImage(energy.moonPhase.phase)} alt={energy.moonPhase.label} width={40} height={40} className="object-contain opacity-80" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.12em] font-bold mb-1.5 pr-10" style={{ color: "var(--foreground-secondary)" }}>
            Tonight&apos;s Moon
          </p>
          <h2 className="text-[17px] font-bold leading-tight mb-1" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "var(--foreground)" }}>
            {energy.moonPhase.label}
          </h2>
          <p className="text-[11px] leading-snug" style={{ color: "var(--foreground-muted)" }}>
            {energy.moonPhase.energy.split(".")[0]}.
          </p>
        </button>

        {/* Ritual Calendar card */}
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="rounded-2xl p-4 text-left active:scale-[0.97] transition-all"
          style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)", boxShadow: cardShadow }}
        >
          <p className="text-[10px] uppercase tracking-[0.12em] font-bold mb-2" style={{ color: "var(--terracotta)" }}>
            Ritual Calendar
          </p>
          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-[32px] font-bold leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              {today.getDate()}
            </span>
            <span className="text-[15px] font-medium" style={{ color: "var(--foreground-muted)" }}>
              {today.toLocaleDateString("en-US", { month: "short" })}
            </span>
          </div>
          {practiceStreak > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: "var(--terracotta)" }} />
              <span className="text-[11px] font-medium" style={{ color: "var(--foreground-muted)" }}>
                {practiceStreak} day streak
              </span>
            </div>
          ) : (
            <p className="text-[11px]" style={{ color: "var(--foreground-faint)" }}>
              Start your streak
            </p>
          )}
        </button>
      </div>

      {/* Expanded moon ritual */}
      {moonRitual && expandedRitual === moonRitual.id && (
        <div className="mb-4 -mt-2 rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
          <RitualDetailCard
            ritual={moonRitual}
            isExpanded={true}
            onToggle={() => setExpandedRitual(null)}
            onComplete={handleRitualComplete}
            variant="default"
          />
        </div>
      )}

      {/* Event calendar (expands from Browse all) */}
      {showCalendar && (
        <EventCalendar
          events={events}
          todayDate={today}
          onSelectEvent={setSelectedEvent}
          selectedEvent={selectedEvent}
          cardShadow={cardShadow}
        />
      )}

      {/* ═══ TODAY'S ALMANAC ═══ */}
      <Link href="/almanac" className="block rounded-2xl p-4 mb-4 overflow-hidden active:scale-[0.98] transition-all" style={{ backgroundColor: "var(--sage-bg)", border: "1px solid var(--border-card)", boxShadow: cardShadow }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] uppercase tracking-[0.12em] font-bold" style={{ color: "var(--tag-green-text)" }}>
            🌾 Today&apos;s Almanac
          </p>
          <span className="text-[11px] font-semibold" style={{ color: "var(--sage)" }}>
            View full →
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {almanacGoodFor.activities.slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[12px] font-semibold" style={{ color: "var(--sage)" }}>✓</span>
              <span className="text-[12px]" style={{ color: "var(--foreground-secondary)" }}>
                {item.icon} {item.activity}
              </span>
            </div>
          ))}
        </div>
      </Link>
      {/* ═══ BROWSE ALL RITUALS ═══ */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] uppercase tracking-[0.12em] font-bold" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "var(--foreground)" }}>
            Browse All Rituals
          </h2>
          <span className="text-[12px] font-medium" style={{ color: "var(--foreground-muted)" }}>
            {filteredRituals.length}
          </span>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 mb-4 pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className="shrink-0 px-4 py-2.5 rounded-full text-[11px] font-semibold transition-all"
            style={{
              backgroundColor: selectedCategory === null ? "var(--terracotta)" : "var(--background-card)",
              color: selectedCategory === null ? "var(--btn-primary-text)" : "var(--foreground-muted)",
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
                color: selectedCategory === cat.key ? "var(--btn-primary-text)" : "var(--foreground-muted)",
                boxShadow: selectedCategory === cat.key ? "0 2px 8px rgba(196,149,106,0.3)" : cardShadow,
              }}
            >
              <RitualIcon name={cat.key} size={16} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <svg aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--foreground-faint)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rituals..."
              aria-label="Search rituals"
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
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ color: "var(--foreground-muted)" }}
              >
                <svg aria-hidden="true" className="w-5 h-5 rounded-full p-0.5" style={{ backgroundColor: "var(--background-elevated)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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

      {/* Customize ritual tools popup */}
      {showCustomize && (
        <RitualToolsPopup onClose={() => setShowCustomize(false)} />
      )}

      {/* Moon event detail screen (full/new moon days) */}
      {showMoonEvent && (
        <MoonEventScreen
          onClose={() => setShowMoonEvent(false)}
        />
      )}
    </main>
  );
}
