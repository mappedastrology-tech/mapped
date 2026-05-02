"use client";

/**
 * Journal Page — two tabs: Card Pulls and Daily Reflections.
 *
 * Pulls tab: All card pull reflections, with card name/type badges.
 * Reflections tab: Daily horoscope-based journal entries with calendar.
 *
 * Both tabs show saved entries as read-only cards (not text boxes).
 * Tap "Edit" to switch to edit mode.
 */

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getJournalEntry,
  saveJournalEntry,
  getJournalEntries,
  type JournalEntry,
} from "@/lib/journal";
import {
  getMoonPhase,
  getMoonPhaseImage,
  getCurrentZodiacSeason,
  getCurrentNakshatra,
  PLANETARY_DAYS,
} from "@/lib/celestialCalendar";
import Image from "next/image";

const MOOD_OPTIONS = [
  { emoji: "🌿", label: "Calm" },
  { emoji: "⚡", label: "Energized" },
  { emoji: "🌊", label: "Emotional" },
  { emoji: "☀️", label: "Joyful" },
  { emoji: "🌙", label: "Reflective" },
  { emoji: "🔥", label: "Frustrated" },
  { emoji: "💭", label: "Anxious" },
  { emoji: "🪨", label: "Grounded" },
];

type JournalTab = "pulls" | "reflections";

/* ─── Mini calendar ─── */

function MiniCalendar({
  entryDates,
  selectedDate,
  onSelectDate,
}: {
  entryDates: Set<string>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  // Use local date (not UTC) to avoid showing tomorrow in the evening
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };

  // Streak
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date(today);
    if (entryDates.has(d.toISOString().slice(0, 10))) count++; else return 0;
    for (let i = 1; i < 365; i++) { d.setDate(d.getDate() - 1); if (entryDates.has(d.toISOString().slice(0, 10))) count++; else break; }
    return count;
  }, [entryDates, today]);

  return (
    <div className="rounded-2xl bg-card/50 border border-foreground/10 p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-7 h-7 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="text-center">
          <p className="text-foreground/70 text-[13px] font-medium">{monthLabel}</p>
          {streak > 1 && <p className="text-terracotta/70 text-[10px] font-semibold">{streak} day streak</p>}
        </div>
        <button onClick={nextMonth} className="w-7 h-7 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0 mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} className="text-center text-[10px] text-foreground/30 font-medium py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasEntry = entryDates.has(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isFuture = dateStr > todayStr;
          return (
            <button key={day} onClick={() => !isFuture && onSelectDate(dateStr)} disabled={isFuture}
              className={`aspect-square rounded-full flex flex-col items-center justify-center text-[11px] transition-all relative
                ${isSelected ? "bg-terracotta text-cream font-semibold" : isToday ? "bg-terracotta/10 text-terracotta font-semibold" : isFuture ? "text-foreground/15" : "text-foreground/50 hover:bg-foreground/5"}`}>
              {day}
              {hasEntry && !isSelected && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-terracotta/60" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main ─── */

export default function JournalPageWrapper() {
  return (
    <Suspense fallback={<main className="flex-1 flex items-center justify-center min-h-screen"><div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" /></main>}>
      <JournalPage />
    </Suspense>
  );
}

function JournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // URL params
  const urlCard = searchParams.get("card");
  const urlCardName = searchParams.get("cardName");
  const urlCardMeaning = searchParams.get("cardMeaning");
  const urlTab = searchParams.get("tab");

  // Tab
  const [activeTab, setActiveTab] = useState<JournalTab>(urlTab === "pull" || urlCardName ? "pulls" : "reflections");

  // All entries
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);

  // Split entries
  const pullEntries = useMemo(() => allEntries.filter((e) => e.date.includes("-pull")), [allEntries]);
  const reflectionEntries = useMemo(() => allEntries.filter((e) => !e.date.includes("-pull")), [allEntries]);
  const reflectionDates = useMemo(() => new Set(reflectionEntries.map((e) => e.date)), [reflectionEntries]);

  // Today
  const today = useMemo(() => new Date(), []);
  // Use local date string (not UTC) — avoids showing tomorrow's date in the evening
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);

  // Reflection tab state
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [prompt, setPrompt] = useState("");
  const [promptContext, setPromptContext] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSavedConfirm, setShowSavedConfirm] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Pull tab state
  const [pullContent, setPullContent] = useState("");
  const [pullSaving, setPullSaving] = useState(false);
  const [pullSaved, setPullSaved] = useState(false);
  const [viewingPull, setViewingPull] = useState<JournalEntry | null>(null);
  const [editingPull, setEditingPull] = useState(false);
  const [editPullContent, setEditPullContent] = useState("");

  const moon = useMemo(() => getMoonPhase(today), [today]);
  const season = useMemo(() => getCurrentZodiacSeason(today), [today]);
  const nakshatra = useMemo(() => getCurrentNakshatra(today), [today]);
  const planetaryDay = useMemo(() => PLANETARY_DAYS[today.getDay()], [today]);

  const urlPrompt = searchParams.get("prompt");
  const urlContext = searchParams.get("context");

  // ─── Init ───
  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { router.replace("/home"); return; }
        setUserId(session.user.id);
        setUserName(session.user.user_metadata?.name || null);

        // Load all entries
        try {
          const entries = await getJournalEntries(session.user.id, 200);
          setAllEntries(entries);

          // Load today's reflection
          const todayEntry = entries.find((e) => e.date === todayStr);
          if (todayEntry) {
            setContent(todayEntry.content);
            setPrompt(todayEntry.prompt);
            setMood(todayEntry.mood || null);
            setLastSaved(todayEntry.updated_at);
          } else if (urlPrompt) {
            setPrompt(decodeURIComponent(urlPrompt));
            if (urlContext) setPromptContext(decodeURIComponent(urlContext));
          }

          // Check for existing pull entry today
          if (urlCardName) {
            const existingPull = entries.find((e) => e.date === `${todayStr}-pull`);
            if (existingPull) {
              setPullContent(existingPull.content);
              setPullSaved(true);
            }
          }
        } catch { /* table might not exist */ }
      } catch { console.warn("Journal init failed"); }
      setIsLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Fetch prompt (cached per day so it stays the same all day) ───
  useEffect(() => {
    if (prompt || promptLoading || isLoading || !userId || activeTab !== "reflections") return;

    // Check localStorage cache first — same prompt all day
    const cacheKey = `mapped:journal-prompt-${todayStr}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setPrompt(parsed.prompt);
        if (parsed.context) setPromptContext(parsed.context);
        return;
      }
    } catch { /* proceed to fetch */ }

    setPromptLoading(true);
    async function fetchPrompt() {
      try {
        let horoscope = "";
        try { const c = sessionStorage.getItem(`horoscope-v3-${todayStr}`); if (c) horoscope = JSON.parse(c)?.horoscope || ""; } catch {}
        const res = await fetch("/api/journal/prompt", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ horoscope: horoscope || "A day of potential and presence.", celestial: { moonPhase: moon.label, zodiacSeason: season.sign, planetaryDay: planetaryDay.day, nakshatra: nakshatra.name, nakshatraQuality: nakshatra.quality }, userName }),
        });
        if (res.ok) {
          const d = await res.json();
          setPrompt(d.prompt);
          if (d.context) setPromptContext(d.context);
          // Cache for the rest of the day
          try {
            // Clean old prompt caches
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const k = localStorage.key(i);
              if (k?.startsWith("mapped:journal-prompt-") && k !== cacheKey) localStorage.removeItem(k);
            }
            localStorage.setItem(cacheKey, JSON.stringify({ prompt: d.prompt, context: d.context }));
          } catch { /* storage full */ }
        }
        else setPrompt("What's alive in you right now that you haven't given words to yet?");
      } catch { setPrompt("What's asking for your attention today?"); }
      setPromptLoading(false);
    }
    fetchPrompt();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, isLoading, userId, activeTab]);

  // ─── Save reflection ───
  const saveReflection = useCallback(async () => {
    if (!userId || !content.trim()) return;
    setIsSaving(true); setSaveError(null);
    try {
      const result = await saveJournalEntry(userId, todayStr, content, prompt, mood || undefined, {
        moonPhase: moon.label, zodiacSeason: season.sign, planetaryDay: planetaryDay.day, nakshatra: nakshatra.name,
      });
      if (result) {
        setLastSaved(result.updated_at); setSaveError(null); setEditMode(false);
        setAllEntries((prev) => { const f = prev.filter((e) => e.date !== todayStr); return [result, ...f]; });
        setShowSavedConfirm(true); setTimeout(() => setShowSavedConfirm(false), 2000);
      } else { setSaveError("Save failed — open browser console (F12) for details."); }
    } catch (err) { setSaveError(`Error: ${err instanceof Error ? err.message : "Unknown"}`); }
    setIsSaving(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, content, prompt, mood, todayStr]);

  // ─── Save pull ───
  const savePull = useCallback(async () => {
    if (!userId || !pullContent.trim() || !urlCardName) return;
    setPullSaving(true);
    try {
      const cardType = urlCard === "tarot" ? "Tarot" : "Oracle";
      const cardName = decodeURIComponent(urlCardName);
      const cardMeaning = urlCardMeaning ? decodeURIComponent(urlCardMeaning) : "";
      const result = await saveJournalEntry(userId, `${todayStr}-pull`, pullContent, `${cardType}: ${cardName}`, undefined, {
        moonPhase: moon.label, zodiacSeason: season.sign, planetaryDay: planetaryDay.day, nakshatra: nakshatra.name,
        cardType, cardName, cardMeaning,
      } as JournalEntry["celestial_context"]);
      if (result) {
        setPullSaved(true);
        setAllEntries((prev) => { const f = prev.filter((e) => e.date !== `${todayStr}-pull`); return [result, ...f]; });
      }
    } catch { /* */ }
    setPullSaving(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, pullContent, urlCard, urlCardName, urlCardMeaning, todayStr]);

  // ─── Save edit (past entries) ───
  const saveEdit = useCallback(async () => {
    if (!userId || !viewingEntry || !editContent.trim()) return;
    setEditSaving(true);
    try {
      const result = await saveJournalEntry(userId, viewingEntry.date, editContent, viewingEntry.prompt, viewingEntry.mood, viewingEntry.celestial_context);
      if (result) { setAllEntries((prev) => prev.map((e) => e.date === viewingEntry.date ? result : e)); setViewingEntry(result); setEditMode(false); }
    } catch { /* */ }
    setEditSaving(false);
  }, [userId, viewingEntry, editContent]);

  // Save pull edit
  const savePullEdit = useCallback(async () => {
    if (!userId || !viewingPull || !editPullContent.trim()) return;
    setEditSaving(true);
    try {
      const result = await saveJournalEntry(userId, viewingPull.date, editPullContent, viewingPull.prompt, viewingPull.mood, viewingPull.celestial_context);
      if (result) { setAllEntries((prev) => prev.map((e) => e.date === viewingPull.date ? result : e)); setViewingPull(result); setEditingPull(false); }
    } catch { /* */ }
    setEditSaving(false);
  }, [userId, viewingPull, editPullContent]);

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date); setEditMode(false);
    if (date === todayStr) { setViewingEntry(null); }
    else { const entry = reflectionEntries.find((e) => e.date === date) || null; setViewingEntry(entry); if (entry) setEditContent(entry.content); }
  }, [todayStr, reflectionEntries]);

  const moodEmoji = (label: string) => MOOD_OPTIONS.find((m) => m.label === label)?.emoji || "";
  const dateDisplay = (dateStr: string) => { const d = new Date(dateStr.split("-pull")[0] + "T12:00:00"); return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); };

  if (isLoading) {
    return <main className="flex-1 flex items-center justify-center min-h-screen"><div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" /></main>;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
        <div className="max-w-lg mx-auto px-5 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-foreground/60 hover:text-foreground transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            <span className="text-[13px]">Back</span>
          </button>
          <div className="flex items-center gap-2 text-[11px] text-foreground/40">
            {(isSaving || pullSaving) && <div className="flex items-center gap-1.5"><div className="w-2 h-2 border border-terracotta/40 border-t-terracotta rounded-full animate-spin" /><span>Saving</span></div>}
            {!isSaving && !pullSaving && showSavedConfirm && <span className="text-sage font-semibold">Saved &#x2713;</span>}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Title */}
        <div className="mb-5">
          <h1 className="text-[28px] text-foreground leading-tight tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>Journal</h1>
          <div className="flex items-center gap-2 text-[11px] text-foreground/40">
            <span className="inline-flex items-center gap-1"><span className="w-4 h-4 relative inline-block align-middle"><Image src={getMoonPhaseImage(moon.phase)} alt={moon.label} fill className="object-contain" /></span> {moon.label}</span><span>·</span><span>{season.sign} season</span><span>·</span><span>{planetaryDay.planet}&apos;s day</span>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setActiveTab("pulls"); setViewingPull(null); setEditingPull(false); }}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all border ${
              activeTab === "pulls" ? "bg-amber/12 text-amber border-amber/25" : "bg-card/30 text-foreground/35 border-foreground/8"}`}>
            Card Pulls
            {pullEntries.length > 0 && <span className="ml-1.5 text-[10px] opacity-60">({pullEntries.length})</span>}
          </button>
          <button onClick={() => { setActiveTab("reflections"); setViewingEntry(null); setSelectedDate(todayStr); setEditMode(false); }}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all border ${
              activeTab === "reflections" ? "bg-terracotta/12 text-terracotta border-terracotta/25" : "bg-card/30 text-foreground/35 border-foreground/8"}`}>
            Reflections
            {reflectionEntries.length > 0 && <span className="ml-1.5 text-[10px] opacity-60">({reflectionEntries.length})</span>}
          </button>
        </div>

        {/* ═══════════════════════════════════════
            ═══  PULLS TAB  ═══
            ═══════════════════════════════════════ */}
        {activeTab === "pulls" && (
          <>
            {/* New pull (if arriving from home page card pull) */}
            {urlCardName && !pullSaved && (
              <div className="mb-6">
                <div className="rounded-2xl bg-amber/8 border border-amber/20 p-5 mb-3">
                  <p className="text-amber text-[9px] uppercase tracking-[0.2em] font-bold mb-1.5">
                    {urlCard === "tarot" ? "Tarot Pull" : "Oracle Pull"}
                  </p>
                  <h3 className="text-foreground/85 text-lg leading-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
                    {decodeURIComponent(urlCardName)}
                  </h3>
                  {urlCardMeaning && <p className="text-foreground/45 text-[12px] leading-relaxed">{decodeURIComponent(urlCardMeaning)}</p>}
                </div>
                <textarea value={pullContent} onChange={(e) => setPullContent(e.target.value)} placeholder="What does this card mean to you today?"
                  className="w-full min-h-[140px] bg-card/40 border border-foreground/10 rounded-2xl p-4 text-foreground/85 text-[14px] leading-[1.8] placeholder:text-foreground/20 focus:outline-none focus:border-amber/30 focus:bg-card/55 transition-all resize-y" />
                <div className="flex items-center justify-end mt-2">
                  {pullContent.trim() && (
                    <button onClick={savePull} disabled={pullSaving}
                      className="px-6 py-2 rounded-full bg-amber text-cream text-[13px] font-semibold hover:bg-amber/90 active:scale-[0.97] transition-all disabled:opacity-50">
                      {pullSaving ? "Saving..." : "Save reflection"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Saved new pull card */}
            {urlCardName && pullSaved && !viewingPull && (
              <div className="rounded-2xl bg-card/50 border border-foreground/10 p-5 mb-6">
                <div className="rounded-xl bg-amber/8 border border-amber/15 p-3 mb-3">
                  <p className="text-amber text-[9px] uppercase tracking-[0.2em] font-bold mb-1">{urlCard === "tarot" ? "Tarot" : "Oracle"} pull</p>
                  <p className="text-foreground/80 text-[14px] font-medium">{decodeURIComponent(urlCardName)}</p>
                </div>
                <p className="text-foreground/80 text-[14px] leading-[1.8] whitespace-pre-wrap mb-3">{pullContent}</p>
                <div className="flex items-center justify-between pt-3 border-t border-foreground/8">
                  <p className="text-foreground/30 text-[10px]">{pullContent.split(/\s+/).filter(Boolean).length} words</p>
                  <button onClick={() => {
                    const ctx = `I pulled ${decodeURIComponent(urlCardName)} today (${urlCard}). ${urlCardMeaning ? decodeURIComponent(urlCardMeaning) : ""}\n\nMy reflection: "${pullContent}"`;
                    sessionStorage.setItem("dolly-context", ctx + "\n\nHelp me go deeper."); router.push("/dolly");
                  }} className="flex items-center gap-1.5 text-terracotta/70 text-[12px] font-medium hover:text-terracotta transition-colors">
                    <span className="text-[13px]">&#x2728;</span>Go deeper with Dolly
                  </button>
                </div>
              </div>
            )}

            {/* Viewing a specific pull */}
            {viewingPull && (
              <div className="mb-6">
                <button onClick={() => { setViewingPull(null); setEditingPull(false); }} className="text-terracotta text-[11px] font-medium hover:text-terracotta/80 transition-colors mb-3 block">
                  &larr; All pulls
                </button>
                <div className="rounded-2xl bg-card/50 border border-foreground/10 p-5">
                  {/* Card info */}
                  {(() => {
                    const ci = viewingPull.celestial_context as Record<string, string> | undefined;
                    return ci?.cardName ? (
                      <div className="rounded-xl bg-amber/8 border border-amber/15 p-3 mb-4">
                        <p className="text-amber text-[9px] uppercase tracking-[0.2em] font-bold mb-1">{ci.cardType || "Card"} pull</p>
                        <p className="text-foreground/80 text-[14px] font-medium">{ci.cardName}</p>
                        {ci.cardMeaning && <p className="text-foreground/40 text-[11px] leading-relaxed mt-1">{ci.cardMeaning}</p>}
                      </div>
                    ) : null;
                  })()}
                  <p className="text-foreground/40 text-[11px] mb-3">{dateDisplay(viewingPull.date)}</p>

                  {editingPull ? (
                    <>
                      <textarea value={editPullContent} onChange={(e) => setEditPullContent(e.target.value)} autoFocus
                        className="w-full min-h-[150px] bg-card/60 border border-foreground/12 rounded-xl p-4 text-foreground/85 text-[14px] leading-[1.8] focus:outline-none focus:border-amber/25 transition-all resize-y" />
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setEditingPull(false)} className="flex-1 py-2.5 rounded-full border border-foreground/15 text-foreground/50 text-[12px]">Cancel</button>
                        <button onClick={savePullEdit} disabled={editSaving} className="flex-1 py-2.5 rounded-full bg-amber text-cream text-[12px] font-semibold disabled:opacity-50">{editSaving ? "Saving..." : "Save"}</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-foreground/80 text-[14px] leading-[1.8] whitespace-pre-wrap mb-4">{viewingPull.content}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-foreground/8">
                        <button onClick={() => { setEditingPull(true); setEditPullContent(viewingPull.content); }} className="text-foreground/40 text-[12px] hover:text-foreground/60 transition-colors">Edit</button>
                        <button onClick={() => {
                          const ci = viewingPull.celestial_context as Record<string, string> | undefined;
                          const ctx = `I pulled ${ci?.cardName || "a card"} (${ci?.cardType || "card"}). ${ci?.cardMeaning || ""}\n\nMy reflection: "${viewingPull.content}"`;
                          sessionStorage.setItem("dolly-context", ctx + "\n\nHelp me go deeper."); router.push("/dolly");
                        }} className="flex items-center gap-1.5 text-terracotta/70 text-[12px] font-medium hover:text-terracotta transition-colors">
                          <span className="text-[13px]">&#x2728;</span>Dolly
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Pull entries list */}
            {!viewingPull && (
              <>
                {pullEntries.length > 0 && (
                  <div className="space-y-2.5">
                    {pullEntries.map((entry) => {
                      const ci = entry.celestial_context as Record<string, string> | undefined;
                      const displayDate = entry.date.split("-pull")[0];
                      const entryDate = new Date(displayDate + "T12:00:00");
                      return (
                        <button key={entry.id} onClick={() => { setViewingPull(entry); setEditingPull(false); setEditPullContent(entry.content); }}
                          className="w-full text-left rounded-2xl bg-card/35 border border-foreground/8 px-4 py-3.5 hover:bg-card/50 transition-all">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <p className="text-foreground/65 text-[12px] font-medium">{entryDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                              <span className="px-1.5 py-0.5 rounded-md bg-amber/15 text-amber text-[9px] font-bold uppercase">{ci?.cardType || "Pull"}</span>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground/20" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                          </div>
                          {ci?.cardName && <p className="text-amber/80 text-[12px] font-medium mb-0.5">{ci.cardName}</p>}
                          <p className="text-foreground/50 text-[12px] leading-relaxed line-clamp-2">{entry.content}</p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {pullEntries.length === 0 && !urlCardName && (
                  <div className="rounded-2xl bg-card/30 border border-foreground/8 p-6 text-center">
                    <p className="text-foreground/40 text-[14px] mb-2">No card pulls journaled yet</p>
                    <p className="text-foreground/25 text-[12px] mb-4">Pull a tarot or oracle card on the home page, then tap &ldquo;Journal this&rdquo; to reflect on it here.</p>
                    <button onClick={() => router.push("/home")} className="px-5 py-2 rounded-full bg-amber/12 text-amber text-[12px] font-semibold active:scale-[0.97] transition-all">
                      Go pull your cards
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════
            ═══  REFLECTIONS TAB  ═══
            ═══════════════════════════════════════ */}
        {activeTab === "reflections" && (
          <>
            <MiniCalendar entryDates={reflectionDates} selectedDate={selectedDate} onSelectDate={handleSelectDate} />

            {selectedDate === todayStr ? (
              /* ─── Today ─── */
              <>
                {lastSaved && !editMode ? (
                  /* Saved card */
                  <div className="rounded-2xl bg-card/50 border border-foreground/10 p-5 mb-6">
                    {prompt && <p className="text-foreground/40 text-[12px] italic mb-3 leading-relaxed">&ldquo;{prompt}&rdquo;</p>}
                    {mood && <div className="flex items-center gap-1.5 mb-3"><span className="text-[13px]">{moodEmoji(mood)}</span><span className="text-foreground/50 text-[12px]">{mood}</span></div>}
                    <p className="text-foreground/80 text-[14px] leading-[1.8] whitespace-pre-wrap mb-4">{content}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-foreground/8">
                      <button onClick={() => setEditMode(true)} className="text-foreground/40 text-[12px] hover:text-foreground/60 transition-colors">Edit entry</button>
                      {content.trim().length > 20 && (
                        <button onClick={() => { sessionStorage.setItem("dolly-context", `Journal prompt: "${prompt}"\n\nMy entry: "${content}"\n\nHelp me reflect deeper.`); router.push("/dolly"); }}
                          className="flex items-center gap-1.5 text-terracotta/70 text-[12px] font-medium hover:text-terracotta transition-colors">
                          <span className="text-[13px]">&#x2728;</span>Dolly
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Writing mode */
                  <div className="mb-6">
                    <div className="rounded-2xl bg-terracotta/6 border border-terracotta/15 p-4 mb-4">
                      {promptLoading ? (
                        <div className="flex items-center gap-2"><div className="w-3 h-3 border border-terracotta/30 border-t-terracotta rounded-full animate-spin" /><p className="text-terracotta/50 text-[12px] italic">Finding today&apos;s question...</p></div>
                      ) : (
                        <p className="text-foreground/75 text-[14px] leading-relaxed italic">&ldquo;{prompt}&rdquo;</p>
                      )}
                      {promptContext && <p className="text-foreground/30 text-[11px] mt-2">{promptContext}</p>}
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {MOOD_OPTIONS.map((m) => (
                          <button key={m.label} onClick={() => setMood(mood === m.label ? null : m.label)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] border transition-all ${mood === m.label ? "bg-terracotta/12 border-terracotta/30 text-terracotta font-semibold" : "bg-card/40 border-foreground/8 text-foreground/45 hover:bg-card/60"}`}>
                            <span className="text-[12px]">{m.emoji}</span><span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing..." autoFocus={editMode}
                      className="w-full min-h-[220px] bg-card/40 border border-foreground/10 rounded-2xl p-4 text-foreground/85 text-[14px] leading-[1.8] placeholder:text-foreground/20 focus:outline-none focus:border-terracotta/25 focus:bg-card/55 transition-all resize-y" />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-foreground/25 text-[11px] px-1">{content.length > 0 ? `${content.split(/\s+/).filter(Boolean).length} words` : ""}</p>
                      <div className="flex items-center gap-2">
                        {editMode && lastSaved && <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-full border border-foreground/15 text-foreground/50 text-[12px]">Cancel</button>}
                        {content.trim() && <button onClick={saveReflection} disabled={isSaving} className="px-6 py-2 rounded-full bg-terracotta text-cream text-[13px] font-semibold hover:bg-terracotta/90 active:scale-[0.97] transition-all disabled:opacity-50">{isSaving ? "Saving..." : "Save entry"}</button>}
                      </div>
                    </div>
                    {saveError && <p className="text-red-400 text-[12px] mt-2 px-1">{saveError}</p>}
                  </div>
                )}
              </>
            ) : viewingEntry ? (
              /* ─── Past entry ─── */
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-foreground/50 text-[10px] uppercase tracking-[0.25em] font-semibold">{dateDisplay(selectedDate)}</p>
                  <button onClick={() => { setSelectedDate(todayStr); setViewingEntry(null); setEditMode(false); }} className="text-terracotta text-[11px] font-medium">Back to today</button>
                </div>
                <div className="rounded-2xl bg-card/50 border border-foreground/10 p-5">
                  {editMode ? (
                    <>
                      {viewingEntry.prompt && <p className="text-foreground/40 text-[12px] italic mb-3">&ldquo;{viewingEntry.prompt}&rdquo;</p>}
                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} autoFocus
                        className="w-full min-h-[200px] bg-card/60 border border-foreground/12 rounded-xl p-4 text-foreground/85 text-[14px] leading-[1.8] focus:outline-none focus:border-terracotta/25 transition-all resize-y" />
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setEditMode(false)} className="flex-1 py-2.5 rounded-full border border-foreground/15 text-foreground/50 text-[12px]">Cancel</button>
                        <button onClick={saveEdit} disabled={editSaving} className="flex-1 py-2.5 rounded-full bg-terracotta text-cream text-[12px] font-semibold disabled:opacity-50">{editSaving ? "Saving..." : "Save"}</button>
                      </div>
                    </>
                  ) : (
                    <>
                      {viewingEntry.prompt && <p className="text-foreground/40 text-[12px] italic mb-3 leading-relaxed">&ldquo;{viewingEntry.prompt}&rdquo;</p>}
                      {viewingEntry.mood && <div className="flex items-center gap-1.5 mb-3"><span className="text-[13px]">{moodEmoji(viewingEntry.mood)}</span><span className="text-foreground/50 text-[12px]">{viewingEntry.mood}</span></div>}
                      <p className="text-foreground/80 text-[14px] leading-[1.8] whitespace-pre-wrap mb-4">{viewingEntry.content}</p>
                      {viewingEntry.celestial_context && (
                        <div className="flex items-center gap-2 text-[10px] text-foreground/30 pt-3 border-t border-foreground/8 mb-3">
                          {(viewingEntry.celestial_context as Record<string,string>).moonPhase && <span>{(viewingEntry.celestial_context as Record<string,string>).moonPhase}</span>}
                          {(viewingEntry.celestial_context as Record<string,string>).zodiacSeason && <><span>·</span><span>{(viewingEntry.celestial_context as Record<string,string>).zodiacSeason} season</span></>}
                        </div>
                      )}
                      <button onClick={() => { setEditMode(true); setEditContent(viewingEntry.content); }} className="text-foreground/40 text-[12px] hover:text-foreground/60 transition-colors">Edit entry</button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* No entry for selected date */
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-foreground/50 text-[10px] uppercase tracking-[0.25em] font-semibold">{dateDisplay(selectedDate)}</p>
                  <button onClick={() => { setSelectedDate(todayStr); setViewingEntry(null); }} className="text-terracotta text-[11px] font-medium">Back to today</button>
                </div>
                <div className="rounded-2xl bg-card/30 border border-foreground/8 p-6 text-center">
                  <p className="text-foreground/35 text-[13px] mb-1">No entry for this day</p>
                  <p className="text-foreground/20 text-[11px]">That&apos;s okay. Not every day needs words.</p>
                </div>
              </div>
            )}

          </>
        )}

        <div className="h-12" />
      </div>
    </main>
  );
}
