"use client";

/**
 * Journal Page — chart-shaped journaling with prompts, patterns, and privacy.
 *
 * Views:
 *  - Home: today's prompt + recent entries + patterns card
 *  - Compose: entry writing/voice with prompt
 *  - Entry: past entry detail with sky context
 *  - Patterns: metadata pattern surfacing (mid+)
 *  - Welcome: first-time onboarding
 */

import { Suspense, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTier } from "@/components/TierProvider";
import { usePaywall } from "@/hooks/usePaywall";
import {
  type JournalEntry,
  type JournalPattern,
  type FilterKey,
  getLocalEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  canWriteEntry,
  getRemainingEntries,
  filterEntries,
  surfaceMetadataPatterns,
  dismissPattern,
  autoTag,
  detectCrisisContent,
  JOURNAL_PRIVACY_COPY,
  CRISIS_RESPONSE,
  getJournalEntries,
} from "@/lib/journal";
import {
  selectPrompt,
  getNextPrompt,
  type PromptContext,
  type JournalPrompt,
} from "@/lib/journal-prompts";
import {
  getMoonPhase,
  PLANETARY_DAYS,
} from "@/lib/celestialCalendar";

type View = "welcome" | "home" | "compose" | "entry" | "patterns";

const WELCOME_KEY = "mapped:journal_welcomed";

export default function JournalPageWrapper() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" /></div>}>
      <JournalPage />
    </Suspense>
  );
}

function JournalPage() {
  const router = useRouter();
  const { tier } = useTier();
  const { gate, PaywallModal } = usePaywall();

  // ─── State ─────────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>("home");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Compose state
  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt | null>(null);
  const [composeText, setComposeText] = useState("");
  const [isBurn, setIsBurn] = useState(false);
  const [isVoice, setIsVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [promptCycleCount, setPromptCycleCount] = useState(0);
  const [cycledIds, setCycledIds] = useState<string[]>([]);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showFirstSaveMsg, setShowFirstSaveMsg] = useState(false);

  // Entry detail
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState(false);
  const [editText, setEditText] = useState("");

  // Patterns
  const [patterns, setPatterns] = useState<JournalPattern[]>([]);

  // Filter
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // ─── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Load entries
      const local = getLocalEntries();
      if (user) {
        const remote = await getJournalEntries(user.id, 100, 0);
        // Merge
        const merged = [...remote];
        for (const le of local) {
          if (!merged.some((e) => e.id === le.id || e.date === le.date)) merged.push(le);
        }
        merged.sort((a, b) => (b.created_at || b.date || "").localeCompare(a.created_at || a.date || ""));
        setEntries(merged);
      } else {
        setEntries(local);
      }

      // Check first-time
      if (!localStorage.getItem(WELCOME_KEY)) {
        setView("welcome");
      }

      // Generate patterns
      const allEntries = getLocalEntries();
      if (allEntries.length >= 5 && tier !== "free") {
        setPatterns(surfaceMetadataPatterns(allEntries));
      }

      setLoading(false);
    })();
  }, [tier]);

  // ─── Prompt Context ────────────────────────────────────────────────────────
  const promptContext: PromptContext = useMemo(() => {
    const now = new Date();
    const moonPhase = getMoonPhase(now);
    const dayOfWeek = now.getDay();
    // Lord of year from localStorage if available
    let lordOfYear: string | undefined;
    try {
      const chart = JSON.parse(sessionStorage.getItem("mapped:chartData") || "{}");
      if (chart.lordOfYear) lordOfYear = chart.lordOfYear;
    } catch { /* ignore */ }

    return {
      moonPhase: moonPhase?.phase || "waxing-crescent",
      dayOfWeek,
      lordOfYear,
      activeTransits: [], // Would come from transit API in production
    };
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function startCompose() {
    if (!canWriteEntry(tier as "free" | "mid" | "top")) {
      gate("unlimited_dolly"); // triggers paywall
      return;
    }
    const prompt = selectPrompt(promptContext);
    setCurrentPrompt(prompt);
    setComposeText("");
    setIsBurn(false);
    setIsVoice(false);
    setPromptCycleCount(0);
    setCycledIds(prompt ? [prompt.id] : []);
    setView("compose");
  }

  function cyclePrompt() {
    if (promptCycleCount >= 2) return; // Max 3 total
    const next = getNextPrompt(promptContext, cycledIds);
    if (next) {
      setCurrentPrompt(next);
      setCycledIds((prev) => [...prev, next.id]);
      setPromptCycleCount((c) => c + 1);
    }
  }

  function goFreeWrite() {
    setCurrentPrompt(null);
  }

  async function saveEntry() {
    if (!composeText.trim()) return;

    // Crisis detection
    if (detectCrisisContent(composeText)) {
      setShowCrisisModal(true);
      // Still save — just show the modal after
    }

    const now = new Date();
    const moonPhase = getMoonPhase(now);

    const entry: JournalEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: userId || "local",
      date: now.toISOString().slice(0, 10),
      text: composeText,
      content: composeText,
      prompt_id: currentPrompt?.id || null,
      prompt_text: currentPrompt?.text || null,
      prompt: currentPrompt?.text || "(free write)",
      is_burn: isBurn,
      is_voice: isVoice,
      tags: autoTag(composeText, now, moonPhase?.phase || "unknown", null, []),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    if (!isBurn) {
      addEntry(entry);
      setEntries((prev) => [entry, ...prev]);
    }

    // Show first-time message
    const isFirst = entries.length === 0;
    if (isFirst && !isBurn) {
      setShowFirstSaveMsg(true);
      setTimeout(() => setShowFirstSaveMsg(false), 4000);
    }

    if (isBurn) {
      // Show burn confirmation briefly then return
      setView("home");
    } else {
      setView("home");
    }
  }

  function openEntry(entry: JournalEntry) {
    setSelectedEntry(entry);
    setEditingEntry(false);
    setEditText(entry.text || entry.content || "");
    setView("entry");
  }

  function handleDeleteEntry() {
    if (!selectedEntry) return;
    deleteEntry(selectedEntry.id);
    setEntries((prev) => prev.filter((e) => e.id !== selectedEntry.id));
    setView("home");
  }

  function handleSaveEdit() {
    if (!selectedEntry) return;
    updateEntry(selectedEntry.id, editText);
    setEntries((prev) => prev.map((e) => e.id === selectedEntry.id ? { ...e, text: editText, content: editText } : e));
    setSelectedEntry({ ...selectedEntry, text: editText, content: editText });
    setEditingEntry(false);
  }

  // ─── Filtered entries ──────────────────────────────────────────────────────
  const filteredEntries = useMemo(() => filterEntries(entries, activeFilter), [entries, activeFilter]);
  const remaining = getRemainingEntries(tier as "free" | "mid" | "top");

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" /></div>;
  }

  // ─── Welcome View ──────────────────────────────────────────────────────────
  if (view === "welcome") {
    return (
      <main className="min-h-screen bg-background px-6 py-12 flex flex-col justify-center max-w-md mx-auto animate-in fade-in duration-500">
        <h1 className="text-2xl font-bold text-foreground mb-5">Your Journal</h1>
        <p className="text-sm text-foreground/60 leading-relaxed whitespace-pre-line mb-8">
          {JOURNAL_PRIVACY_COPY.welcome}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { localStorage.setItem(WELCOME_KEY, "true"); setView("home"); startCompose(); }}
            className="px-6 py-3 rounded-full bg-terracotta text-cream text-sm font-medium"
          >
            Yes, start
          </button>
          <button
            onClick={() => { localStorage.setItem(WELCOME_KEY, "true"); setView("home"); }}
            className="px-6 py-3 rounded-full border border-foreground/18 text-foreground/60 text-sm"
          >
            Tell me about privacy first
          </button>
        </div>
      </main>
    );
  }

  // ─── Compose View ──────────────────────────────────────────────────────────
  if (view === "compose") {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={() => setView("home")} className="text-foreground/50 text-sm">Cancel</button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBurn(!isBurn)}
              className={`text-sm px-2 py-1 rounded-lg transition-colors ${isBurn ? "bg-red-500/10 text-red-500" : "text-foreground/30"}`}
            >
              🔥 {isBurn ? "Burn mode" : "Burn"}
            </button>
          </div>
        </div>

        <div className="flex-1 px-5 pb-6 flex flex-col overflow-y-auto">
          {/* Prompt card */}
          {currentPrompt && (
            <div className="rounded-2xl border border-foreground/10 bg-foreground/3 p-5 mb-4 animate-in fade-in duration-300">
              <p className="text-sm text-foreground/80 leading-relaxed italic mb-3">{currentPrompt.text}</p>
              <div className="flex gap-3">
                {promptCycleCount < 2 && (
                  <button onClick={cyclePrompt} className="text-[11px] text-terracotta/70 hover:text-terracotta transition-colors">
                    Different prompt
                  </button>
                )}
                <button onClick={goFreeWrite} className="text-[11px] text-foreground/35 hover:text-foreground/50 transition-colors">
                  Write something else
                </button>
              </div>
              {promptCycleCount >= 2 && (
                <p className="text-[10px] text-foreground/25 mt-2">Run out of prompts? Just write something.</p>
              )}
            </div>
          )}

          {!currentPrompt && (
            <div className="mb-4">
              <p className="text-xs text-foreground/35 italic">Free write — no prompt.</p>
            </div>
          )}

          {/* Text input */}
          <textarea
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            placeholder="Start writing..."
            className="flex-1 min-h-[200px] bg-transparent text-foreground text-sm leading-relaxed resize-none focus:outline-none placeholder:text-foreground/20"
            autoFocus
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-4 border-t border-foreground/8 mt-4">
            <div className="flex items-center gap-3">
              {/* Voice button */}
              <button
                onClick={() => setIsVoice(!isVoice)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                  isVoice ? "border-terracotta bg-terracotta/10" : "border-foreground/15"
                }`}
              >
                <span className="text-base">{isRecording ? "⏹" : "🎤"}</span>
              </button>
              {composeText && (
                <span className="text-[10px] text-foreground/30">
                  {composeText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>
            <button
              onClick={saveEntry}
              disabled={!composeText.trim()}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                composeText.trim()
                  ? "bg-terracotta text-cream"
                  : "bg-foreground/10 text-foreground/30"
              }`}
            >
              {isBurn ? "Write & burn" : "Save entry"}
            </button>
          </div>
        </div>

        {/* Crisis modal */}
        {showCrisisModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
            <div className="bg-background rounded-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
              <p className="text-sm text-foreground/70 leading-relaxed mb-5">{CRISIS_RESPONSE.text}</p>
              <div className="flex flex-col gap-2">
                {CRISIS_RESPONSE.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setShowCrisisModal(false)}
                    className="py-2.5 rounded-xl border border-foreground/15 text-foreground/60 text-sm hover:border-foreground/30 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {PaywallModal}
      </main>
    );
  }

  // ─── Entry Detail View ─────────────────────────────────────────────────────
  if (view === "entry" && selectedEntry) {
    const entryText = selectedEntry.text || selectedEntry.content || "";
    const tags = selectedEntry.tags;

    return (
      <main className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={() => setView("home")} className="text-foreground/50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          <div className="flex items-center gap-3">
            {!editingEntry && (
              <>
                <button onClick={() => { setEditText(entryText); setEditingEntry(true); }} className="text-xs text-foreground/50">Edit</button>
                <button onClick={handleDeleteEntry} className="text-xs text-red-400/70">Delete</button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 px-5 pb-8 overflow-y-auto">
          {/* Date & sky context */}
          <p className="text-xs text-foreground/40 mb-1">
            {new Date(selectedEntry.created_at || selectedEntry.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>

          {/* Sky context chips */}
          {tags && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.moonPhase && <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-[10px] text-foreground/45">{tags.moonPhase.replace("_", " ")} moon</span>}
              {tags.planetaryDay && <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-[10px] text-foreground/45">{tags.planetaryDay} day</span>}
              {tags.lordOfYear && <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-[10px] text-foreground/45">LOY: {tags.lordOfYear}</span>}
              {tags.activeTransits?.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-terracotta/8 text-[10px] text-terracotta/60">{t.replace(/_/g, " ")}</span>
              ))}
            </div>
          )}

          {/* Prompt shown */}
          {selectedEntry.prompt_text && (
            <div className="rounded-xl border border-foreground/8 bg-foreground/3 p-3 mb-4">
              <p className="text-[11px] text-foreground/40 italic">{selectedEntry.prompt_text}</p>
            </div>
          )}

          {/* Entry content */}
          {editingEntry ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full min-h-[200px] bg-transparent text-foreground text-sm leading-relaxed resize-none focus:outline-none border border-foreground/10 rounded-xl p-4"
              />
              <div className="flex gap-2 mt-3">
                <button onClick={handleSaveEdit} className="px-4 py-2 rounded-full bg-terracotta text-cream text-xs font-medium">Save</button>
                <button onClick={() => setEditingEntry(false)} className="px-4 py-2 rounded-full border border-foreground/18 text-foreground/50 text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-wrap">{entryText}</p>
          )}
        </div>
      </main>
    );
  }

  // ─── Patterns View ─────────────────────────────────────────────────────────
  if (view === "patterns") {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <button onClick={() => setView("home")} className="text-foreground/50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          <h2 className="text-base font-semibold text-foreground">Your Patterns</h2>
        </div>
        <div className="flex-1 px-5 pb-8 overflow-y-auto">
          {patterns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/40 text-sm">Need at least 5 entries before patterns surface.</p>
              <p className="text-foreground/25 text-xs mt-1">Keep writing — you'll see things here over time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patterns.map((p) => (
                <div key={p.id} className="rounded-xl border border-foreground/10 bg-foreground/3 p-4">
                  <p className="text-sm text-foreground/70 leading-relaxed">{p.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-foreground/30">{p.supportingEntryIds.length} entries</span>
                    <button
                      onClick={() => { dismissPattern(p.id); setPatterns((prev) => prev.filter((pp) => pp.id !== p.id)); }}
                      className="text-[10px] text-foreground/25 hover:text-foreground/40"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // ─── Home View (default) ───────────────────────────────────────────────────
  const todayPrompt = useMemo(() => selectPrompt(promptContext), []);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-5 py-6 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">Journal</h1>
          {remaining !== null && (
            <span className="text-[10px] text-foreground/35 bg-foreground/5 px-2 py-1 rounded-full">
              {remaining} left this month
            </span>
          )}
        </div>

        {/* First save celebration */}
        {showFirstSaveMsg && (
          <div className="mb-4 rounded-xl border border-sage/20 bg-sage/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs text-sage leading-relaxed">{JOURNAL_PRIVACY_COPY.firstEntrySaved}</p>
          </div>
        )}

        {/* ─── Today's Prompt Card ─── */}
        <div className="rounded-2xl border border-foreground/12 bg-foreground/3 p-5 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-foreground/30 font-semibold mb-2">Today</p>
          <p className="text-sm text-foreground/75 italic leading-relaxed mb-4">{todayPrompt.text}</p>
          <div className="flex gap-2">
            <button
              onClick={startCompose}
              className="px-4 py-2 rounded-full bg-terracotta text-cream text-xs font-medium"
            >
              Begin entry
            </button>
            <button
              onClick={startCompose}
              className="px-4 py-2 rounded-full border border-foreground/15 text-foreground/50 text-xs"
            >
              Write something else
            </button>
          </div>
        </div>

        {/* ─── Filter chips (mid+) ─── */}
        {tier !== "free" && entries.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {([
              { key: "all", label: "All" },
              { key: "full_moon", label: "Full moons" },
              { key: "new_moon", label: "New moons" },
              { key: "quarter_moon", label: "Quarters" },
            ] as { key: FilterKey; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap border transition-all ${
                  activeFilter === key
                    ? "border-terracotta text-terracotta bg-terracotta/8"
                    : "border-foreground/12 text-foreground/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ─── Recent Entries ─── */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-foreground/30 font-semibold mb-3">
            {activeFilter === "all" ? "Recent" : activeFilter.replace("_", " ")}
          </p>
          {filteredEntries.length === 0 ? (
            <div className="rounded-xl border border-foreground/8 bg-foreground/3 p-6 text-center">
              <p className="text-foreground/35 text-sm">No entries yet.</p>
              <p className="text-foreground/25 text-xs mt-1">Tap &quot;Begin entry&quot; to start.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEntries.slice(0, 10).map((entry) => {
                const text = entry.text || entry.content || "";
                const preview = text.slice(0, 80);
                return (
                  <button
                    key={entry.id}
                    onClick={() => openEntry(entry)}
                    className="w-full text-left rounded-xl border border-foreground/8 bg-foreground/3 p-4 hover:border-foreground/15 transition-colors"
                  >
                    <p className="text-xs text-foreground/35 mb-1">
                      {new Date(entry.created_at || entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-sm text-foreground/65 leading-snug">
                      {preview}{text.length > 80 ? "..." : ""}
                    </p>
                    {entry.tags && (
                      <div className="flex gap-1 mt-2">
                        {entry.tags.moonPhase && entry.tags.moonPhase !== "unknown" && (
                          <span className="text-[9px] text-foreground/25">{entry.tags.moonPhase.replace("_", " ")}</span>
                        )}
                        {entry.tags.planetaryDay && (
                          <span className="text-[9px] text-foreground/25">· {entry.tags.planetaryDay} day</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Patterns Card (mid+) ─── */}
        {tier !== "free" && patterns.length > 0 && (
          <div className="rounded-2xl border border-sage/15 bg-sage/5 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-widest text-sage/60 font-semibold">Your patterns</p>
              <button onClick={() => setView("patterns")} className="text-[10px] text-sage/70 hover:text-sage">See all</button>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed">{patterns[0].text}</p>
          </div>
        )}

        {/* Cap reached message */}
        {remaining === 0 && (
          <div className="mt-4 rounded-xl border border-amber/20 bg-amber/5 p-4 text-center">
            <p className="text-xs text-amber/80">{JOURNAL_PRIVACY_COPY.capReached(0)}</p>
          </div>
        )}
      </div>

      {PaywallModal}
    </main>
  );
}
