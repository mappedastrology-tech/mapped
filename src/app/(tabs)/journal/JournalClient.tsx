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
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authedFetch } from "@/lib/authedFetch";
import { getTarotHistoryKey } from "@/lib/completionSync";
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
  pullJournalEntries,
} from "@/lib/journal";
import {
  selectPrompt,
  getNextPrompt,
  markPromptShown,
  type PromptContext,
  type JournalPrompt,
} from "@/lib/journal-prompts";
import {
  getMoonPhase,
  PLANETARY_DAYS,
} from "@/lib/celestialCalendar";
import { shareReadingAsImage } from "@/lib/shareCard";
import { MOOD_PALETTE } from "@/lib/feedback";

type View = "home" | "compose" | "entry" | "patterns";

export default function JournalPageWrapper() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" /></div>}>
      <JournalPage />
    </Suspense>
  );
}

function JournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tier } = useTier();
  const { gate, PaywallModal } = usePaywall();

  // ─── State ─────────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>("home");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<"calendar" | "pulls">("calendar");

  // Compose state
  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt | null>(null);
  const [composeText, setComposeText] = useState("");
  const [isBurn, setIsBurn] = useState(false);
  const [promptCycleCount, setPromptCycleCount] = useState(0);
  const [cycledIds, setCycledIds] = useState<string[]>([]);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showFirstSaveMsg, setShowFirstSaveMsg] = useState(false);
  const [showBurnAnimation, setShowBurnAnimation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [aiPromptLoading, setAiPromptLoading] = useState(false);

  // Entry detail
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState(false);
  const [editText, setEditText] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Patterns
  const [patterns, setPatterns] = useState<JournalPattern[]>([]);

  // Filter
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // Pulls tab
  const [pullHistory, setPullHistory] = useState<Array<{ id?: string; date: string; cards: Array<{ name: string; reversed?: boolean; keywords?: string[]; position?: string }>; spread?: string; spreadName?: string; question?: string; notes?: string }>>([]);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedPulls, setSelectedPulls] = useState<Set<number>>(new Set());
  const [expandedPullIdx, setExpandedPullIdx] = useState<number | null>(null);
  const [pullCopied, setPullCopied] = useState<number | null>(null);

  // Pagination
  const [entriesPage, setEntriesPage] = useState(1);
  const [pullsPage, setPullsPage] = useState(1);
  const ENTRIES_PER_PAGE = 8;
  const PULLS_PER_PAGE = 8;

  // ─── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Load entries — pull/merge remote into localStorage first (no-op offline)
      if (user) {
        await pullJournalEntries(user.id);
      }
      const local = getLocalEntries();
      setEntries(local);

      // First-time users go straight to compose with today's prompt
      const hasEntries = local.length > 0;
      if (!hasEntries) {
        const prompt = selectPrompt({
          moonPhase: getMoonPhase(new Date())?.phase || "waxing-crescent",
          dayOfWeek: new Date().getDay(),
          activeTransits: [],
        });
        setCurrentPrompt(prompt);
        setView("compose");
      }

      // Generate patterns
      const allEntries = getLocalEntries();
      if (allEntries.length >= 5 && tier !== "free") {
        setPatterns(surfaceMetadataPatterns(allEntries));
      }

      setLoading(false);
    })();
  }, [tier]);

  // Load tarot pull history (scoped per user)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getTarotHistoryKey(userId));
      if (saved) setPullHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [userId]);

  // ─── Auto-compose from home CTA ────────────────────────────────────────────
  // Navigate here instantly, generate AI prompt in background
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    const generateParam = searchParams.get("generatePrompt");

    if (promptParam) {
      // Already have a cached prompt — go straight to compose
      const ctx = searchParams.get("context") || "";
      setCurrentPrompt({ id: "ai-prompt", text: promptParam, category: "generic" });
      setComposeText("");
      setSelectedMoods([]);
      setView("compose");
      // Clean URL
      window.history.replaceState({}, "", "/journal");
    } else if (generateParam) {
      // Start compose immediately with local prompt, fetch AI prompt in background
      const localPrompt = selectPrompt({
        moonPhase: getMoonPhase(new Date())?.phase || "waxing-crescent",
        dayOfWeek: new Date().getDay(),
        activeTransits: [],
      });
      setCurrentPrompt(localPrompt);
      setComposeText("");
      setSelectedMoods([]);
      setView("compose");

      // Fire AI prompt generation in background
      setAiPromptLoading(true);
      try {
        const body = JSON.parse(decodeURIComponent(generateParam));
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        authedFetch("/api/journal/prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify(body),
        })
          .then((r) => r.json())
          .then((data) => {
            clearTimeout(timeout);
            if (data.prompt) {
              setCurrentPrompt({ id: "ai-prompt", text: data.prompt, category: "generic" });
            }
          })
          .catch(() => { clearTimeout(timeout); })
          .finally(() => setAiPromptLoading(false));
      } catch {
        setAiPromptLoading(false);
      }
      // Clean URL
      window.history.replaceState({}, "", "/journal");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Prompt Context ────────────────────────────────────────────────────────
  const promptContext: PromptContext = useMemo(() => {
    const now = new Date();
    const moonPhase = getMoonPhase(now);
    const dayOfWeek = now.getDay();

    let lordOfYear: string | undefined;
    let activeTransits: string[] = [];

    if (typeof window !== "undefined") {
      try {
        const chart = JSON.parse(sessionStorage.getItem("mapped:chartData") || "{}");
        if (chart.lordOfYear) lordOfYear = chart.lordOfYear;
      } catch { /* ignore */ }

      // Convert stored transit aspects into trigger keys for prompt matching
      try {
        const transits = JSON.parse(sessionStorage.getItem("mapped:transits") || "[]");
        const aspectMap: Record<string, string> = {
          conjunction: "conjunct", opposition: "opposite",
          trine: "trine", square: "square", sextile: "sextile",
        };
        if (Array.isArray(transits)) {
          const natalMap: Record<string, string> = {
            ascendant: "asc", midheaven: "mc", "north node": "north_node",
          };
          activeTransits = transits.map((t: { transitPlanet: string; natalPlanet: string; aspect: string }) => {
            const planet = t.transitPlanet.toLowerCase();
            const aspect = aspectMap[t.aspect.toLowerCase()] || t.aspect.toLowerCase();
            const rawNatal = t.natalPlanet.toLowerCase();
            const natal = natalMap[rawNatal] || rawNatal.replace(/\s+/g, "_");
            return `${planet}_${aspect}_${natal}`;
          }).filter(Boolean);

          // Also check for special compound triggers
          const hasRetroMercury = transits.some((t: { transitPlanet: string }) => t.transitPlanet === "Mercury");
          if (hasRetroMercury) {
            // Check if Mercury is retrograde (simple heuristic: if transit Mercury aspects are present)
            // The mercury_retrograde trigger is handled separately
          }

          // Check for Saturn return (transit Saturn conjunct natal Saturn)
          const saturnReturn = transits.find((t: { transitPlanet: string; natalPlanet: string; aspect: string; orb: number }) =>
            t.transitPlanet === "Saturn" && t.natalPlanet === "Saturn" && t.aspect === "conjunction" && t.orb < 5
          );
          if (saturnReturn) activeTransits.push("saturn_return");

          // Venus return
          const venusReturn = transits.find((t: { transitPlanet: string; natalPlanet: string; aspect: string; orb: number }) =>
            t.transitPlanet === "Venus" && t.natalPlanet === "Venus" && t.aspect === "conjunction" && t.orb < 3
          );
          if (venusReturn) activeTransits.push("venus_return");

          // Mars return
          const marsReturn = transits.find((t: { transitPlanet: string; natalPlanet: string; aspect: string; orb: number }) =>
            t.transitPlanet === "Mars" && t.natalPlanet === "Mars" && t.aspect === "conjunction" && t.orb < 3
          );
          if (marsReturn) activeTransits.push("mars_conjunct_mars");
        }
      } catch { /* ignore */ }
    }

    return {
      moonPhase: moonPhase?.phase || "waxing-crescent",
      dayOfWeek,
      lordOfYear,
      activeTransits,
    };
  }, []);

  // ─── Speech Recognition ─────────────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition isn't supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
          setComposeText((prev) => prev + transcript + " ");
        } else {
          interim = transcript;
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function startCompose() {
    if (!canWriteEntry(tier as "free" | "mid")) {
      gate("unlimited_dolly"); // triggers paywall
      return;
    }
    const prompt = selectPrompt(promptContext);
    setCurrentPrompt(prompt);
    setComposeText("");
    setIsBurn(false);
    setSelectedMoods([]);
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
      // Local calendar date — toISOString() is UTC and stamps evening
      // entries with tomorrow's date.
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      text: composeText,
      content: composeText,
      prompt_id: currentPrompt?.id || null,
      prompt_text: currentPrompt?.text || null,
      prompt: currentPrompt?.text || "(free write)",
      mood: selectedMoods.length ? selectedMoods.join(", ") : undefined,
      is_burn: isBurn,
      is_voice: false,
      tags: autoTag(composeText, now, moonPhase?.phase || "unknown", null, []),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    if (!isBurn) {
      addEntry(entry);
      setEntries((prev) => [entry, ...prev]);
    }

    // Mark the prompt as used so it won't repeat for 30 days
    if (currentPrompt?.id) {
      markPromptShown(currentPrompt.id);
    }

    // Show first-time message
    const isFirst = entries.length === 0;
    if (isFirst && !isBurn) {
      setShowFirstSaveMsg(true);
      setTimeout(() => setShowFirstSaveMsg(false), 4000);
    }

    if (isBurn) {
      // Show burn animation then return
      setShowBurnAnimation(true);
      setTimeout(() => {
        setShowBurnAnimation(false);
        setComposeText("");
        setIsBurn(false);
        setView("home");
      }, 3200);
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
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    deleteEntry(selectedEntry.id);
    setEntries((prev) => prev.filter((e) => e.id !== selectedEntry.id));
    setConfirmingDelete(false);
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
  const remaining = getRemainingEntries(tier as "free" | "mid");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const todayPrompt = useMemo(() => selectPrompt(promptContext), []);

  // Check if today's entry already exists
  const todayEntry = useMemo(() => {
    const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    return entries.find((e) => {
      const d = e.created_at || e.date;
      return d && new Date(d).toLocaleDateString("en-CA") === todayStr;
    }) || null;
  }, [entries]);

  const composeDate = useMemo(() => {
    const d = new Date();
    return {
      day: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "long" }),
      weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
      year: d.getFullYear(),
    };
  }, []);
  const composeMoonLabel = useMemo(() => getMoonPhase(new Date())?.label || "", []);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" /></div>;
  }

  // ─── Welcome View ──────────────────────────────────────────────────────────
  // ─── Compose View ──────────────────────────────────────────────────────────
  if (view === "compose") {
    return (
      <main className="min-h-full flex flex-col">
        <div className="max-w-lg lg:max-w-2xl mx-auto w-full flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={() => setView("home")} className="text-muted text-sm">Cancel</button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBurn(!isBurn)}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${isBurn ? "bg-red-500/10 text-red-500 border border-red-500/20" : "text-muted border border-foreground/12"}`}
            >
              {isBurn ? "Burn mode on" : "Burn mode"}
            </button>
          </div>
        </div>

        {/* Burn mode explanation */}
        {isBurn && (
          <div className="mx-5 mb-3 rounded-xl bg-red-500/5 border border-red-500/10 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs text-secondary leading-relaxed">
              <span className="font-semibold text-red-400/80">Write &amp; burn</span> — get it out, then let it go. When you&apos;re done, your entry is burned. Nothing is saved or stored anywhere. It only exists while you&apos;re writing it.
            </p>
          </div>
        )}

        <div className="flex-1 px-5 pb-6 flex flex-col overflow-y-auto">
          {/* Date header */}
          <div className="flex items-baseline gap-2.5 mb-1.5">
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 54, fontWeight: 600, lineHeight: 1, color: "var(--foreground)" }}>{composeDate.day}</span>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--foreground)" }}>{composeDate.month}</div>
              <div className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>{composeDate.weekday} · {composeDate.year}</div>
            </div>
          </div>
          {composeMoonLabel && (
            <div className="inline-flex items-center gap-1.5 self-start mb-5 mt-1 px-3 py-1.5 rounded-full" style={{ background: "rgba(184,160,210,0.12)", border: "0.5px solid rgba(184,160,210,0.28)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--lavender)" strokeWidth="1.5"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              <span className="text-[11px]" style={{ color: "var(--foreground-secondary)" }}>{composeMoonLabel}</span>
            </div>
          )}

          {/* Prompt — left-bordered accent */}
          {currentPrompt && (
            <div className="mb-6" style={{ borderLeft: "2px solid var(--lavender)", padding: "2px 0 2px 16px" }}>
              <p className="text-[10px] uppercase font-bold mb-1.5" style={{ letterSpacing: "0.16em", color: "var(--lavender)" }}>Tonight&rsquo;s prompt</p>
              <p style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: 20, lineHeight: 1.45, color: "var(--foreground)" }}>{currentPrompt.text}</p>
              <div className="flex gap-3 mt-2.5">
                {promptCycleCount < 2 && (
                  <button onClick={cyclePrompt} className="text-[11px] transition-colors" style={{ color: "var(--lavender)" }}>
                    Different prompt
                  </button>
                )}
                <button onClick={goFreeWrite} className="text-[11px] text-muted hover:text-foreground transition-colors">
                  Write something else
                </button>
              </div>
            </div>
          )}

          {!currentPrompt && (
            <div className="mb-4">
              <p className="text-xs text-muted italic">Free write — no prompt.</p>
            </div>
          )}

          {/* AI prompt loading indicator */}
          {aiPromptLoading && (
            <div className="flex items-center gap-2 mb-3 animate-in fade-in duration-300">
              <div className="w-3 h-3 border border-terracotta/40 border-t-terracotta rounded-full animate-spin" />
              <span className="text-[11px] text-muted">Personalizing your prompt...</span>
            </div>
          )}

          {/* Mood picker — pick as many as fit */}
          <div className="mb-4">
            <p className="text-[11px] text-muted uppercase tracking-widest mb-2">How the night felt · pick any</p>
            <div className="flex flex-wrap gap-1.5">
              {MOOD_PALETTE.map((m) => {
                const active = selectedMoods.includes(m.word);
                return (
                  <button
                    key={m.word}
                    aria-pressed={active}
                    onClick={() => setSelectedMoods((prev) => prev.includes(m.word) ? prev.filter((x) => x !== m.word) : [...prev, m.word])}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      active
                        ? `${m.color} text-foreground font-medium ring-1 ring-foreground/20`
                        : "bg-foreground/5 text-muted hover:bg-foreground/10"
                    }`}
                  >
                    {m.word}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text input — a clearly-defined writing area */}
          <p className="text-[11px] text-muted uppercase tracking-widest mb-2">Your entry</p>
          <div
            className="flex-1 flex flex-col rounded-2xl px-4 py-3.5 min-h-[220px] transition-colors focus-within:border-terracotta/40"
            style={{ background: "var(--background-card)", border: "1px solid var(--border-card)" }}
            onClick={() => textareaRef.current?.focus()}
          >
            <textarea
              ref={textareaRef}
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder="Start writing here — whatever's on your mind…"
              aria-label="Journal entry"
              className="flex-1 min-h-[190px] w-full bg-transparent text-foreground text-[15px] leading-relaxed resize-none focus:outline-none placeholder:text-muted"
              autoFocus
            />
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-4 border-t border-foreground/8 mt-4">
            <div className="flex items-center gap-3">
              {/* Voice-to-text */}
              <button
                onClick={toggleListening}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                  isListening
                    ? "border-red-400 bg-red-500/10 animate-pulse"
                    : "border-foreground/15 hover:border-foreground/30"
                }`}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isListening ? "var(--terracotta)" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
              {isListening && (
                <span className="text-[10px] text-red-400 font-medium">Listening...</span>
              )}
              {!isListening && composeText && (
                <span className="text-[10px] text-muted">
                  {composeText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>
            <button
              onClick={saveEntry}
              disabled={!composeText.trim()}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                !composeText.trim()
                  ? "bg-foreground/10 text-muted"
                  : isBurn
                    ? "bg-gradient-to-r from-red-600 to-orange-500 text-white"
                    : "bg-terracotta text-cream"
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
              <p className="text-sm text-secondary leading-relaxed mb-5">{CRISIS_RESPONSE.text}</p>
              <div className="flex flex-col gap-2">
                {CRISIS_RESPONSE.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setShowCrisisModal(false)}
                    className="py-2.5 rounded-xl border border-foreground/15 text-secondary text-sm hover:border-foreground/30 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Burn animation overlay */}
        {showBurnAnimation && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black overflow-hidden">
            {/* Fire particles rising */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    bottom: `-${5 + Math.random() * 15}%`,
                    width: `${3 + Math.random() * 8}px`,
                    height: `${3 + Math.random() * 8}px`,
                    background: [
                      "rgba(255,90,20,0.85)",
                      "rgba(255,140,30,0.75)",
                      "rgba(255,180,50,0.6)",
                      "rgba(200,60,10,0.7)",
                    ][i % 4],
                    animation: `burnRise ${2.5 + Math.random() * 2}s ease-out ${Math.random() * 1.2}s forwards`,
                    filter: `blur(${0.5 + Math.random() * 1.5}px)`,
                  }}
                />
              ))}
            </div>

            {/* Bottom fire glow */}
            <div
              className="absolute bottom-0 left-0 right-0 h-40"
              style={{
                background: "linear-gradient(to top, rgba(255,70,10,0.4) 0%, rgba(255,100,20,0.15) 50%, transparent 100%)",
                animation: "burnGlow 1.2s ease-in-out infinite alternate",
              }}
            />

            {/* Text */}
            <div className="relative z-10 text-center px-8" style={{ animation: "burnTextFade 3s ease-in-out forwards" }}>
              <p className="text-xl font-light tracking-wide" style={{ color: "rgba(255,200,120,0.85)" }}>
                let it go
              </p>
            </div>

            {/* CSS animations */}
            <style>{`
              @keyframes burnRise {
                0% { transform: translateY(0) scale(1); opacity: 0.85; }
                60% { opacity: 0.5; }
                100% { transform: translateY(-110vh) scale(0.15); opacity: 0; }
              }
              @keyframes burnGlow {
                0% { opacity: 0.5; }
                100% { opacity: 0.9; }
              }
              @keyframes burnTextFade {
                0% { opacity: 0; transform: translateY(12px); }
                25% { opacity: 1; transform: translateY(0); }
                75% { opacity: 1; }
                100% { opacity: 0; }
              }
            `}</style>
          </div>
        )}

        {PaywallModal}
        </div>{/* close max-w-lg wrapper */}
      </main>
    );
  }

  // ─── Entry Detail View ─────────────────────────────────────────────────────
  if (view === "entry" && selectedEntry) {
    const entryText = selectedEntry.text || selectedEntry.content || "";
    const tags = selectedEntry.tags;

    return (
      <main className="min-h-full flex flex-col">
        <div className="max-w-lg lg:max-w-2xl mx-auto w-full flex flex-col flex-1">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={() => { setConfirmingDelete(false); setView("home"); }} className="text-muted">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          <div className="flex items-center gap-3">
            {!editingEntry && (
              <>
                {confirmingDelete ? (
                  <>
                    <button onClick={() => setConfirmingDelete(false)} className="text-xs text-muted">Cancel</button>
                    <button onClick={handleDeleteEntry} className="text-xs text-red-500 font-medium">Are you sure?</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditText(entryText); setEditingEntry(true); }} className="text-xs text-muted">Edit</button>
                    <button onClick={handleDeleteEntry} className="text-xs text-red-400/70">Delete</button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex-1 px-5 pb-8 overflow-y-auto">
          {/* Date & sky context */}
          <p className="text-xs text-muted mb-1">
            {new Date(selectedEntry.created_at || selectedEntry.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>

          {/* Mood + sky context chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selectedEntry.mood && selectedEntry.mood.split(",").map((mo) => mo.trim()).filter(Boolean).map((mo) => (
              <span key={mo} className="px-2.5 py-0.5 rounded-full bg-terracotta/15 text-[10px] text-terracotta font-medium">
                {mo}
              </span>
            ))}
            {tags?.moonPhase && <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-[10px] text-muted">{tags.moonPhase.replace("_", " ")} moon</span>}
            {tags?.planetaryDay && <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-[10px] text-muted">{tags.planetaryDay} day</span>}
            {tags?.lordOfYear && <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-[10px] text-muted">LOY: {tags.lordOfYear}</span>}
            {tags?.activeTransits?.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-terracotta/8 text-[10px] text-terracotta/60">{t.replace(/_/g, " ")}</span>
            ))}
          </div>

          {/* Prompt shown */}
          {selectedEntry.prompt_text && (
            <div className="rounded-xl border border-foreground/8 bg-foreground/3 p-3 mb-4">
              <p className="text-[11px] text-muted italic">{selectedEntry.prompt_text}</p>
            </div>
          )}

          {/* Entry content */}
          {editingEntry ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                aria-label="Edit journal entry"
                className="w-full min-h-[200px] bg-transparent text-foreground text-sm leading-relaxed resize-none focus:outline-none border border-foreground/10 rounded-xl p-4"
              />
              <div className="flex gap-2 mt-3">
                <button onClick={handleSaveEdit} className="px-4 py-2 rounded-full bg-terracotta text-cream text-xs font-medium">Save</button>
                <button onClick={() => setEditingEntry(false)} className="px-4 py-2 rounded-full border border-foreground/18 text-muted text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">{entryText}</p>
          )}
        </div>
        </div>{/* close max-w-lg wrapper */}
      </main>
    );
  }

  // ─── Patterns View ─────────────────────────────────────────────────────────
  if (view === "patterns") {
    return (
      <main className="min-h-full flex flex-col">
        <div className="max-w-lg lg:max-w-2xl mx-auto w-full flex flex-col flex-1">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <button onClick={() => setView("home")} className="text-muted">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          <h2 className="text-base font-semibold text-foreground">Your Patterns</h2>
        </div>
        <div className="flex-1 px-5 pb-8 overflow-y-auto">
          {patterns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted text-sm">Need at least 5 entries before patterns surface.</p>
              <p className="text-muted text-xs mt-1">Keep writing — you'll see things here over time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patterns.map((p) => (
                <div key={p.id} className="rounded-xl border border-foreground/10 bg-foreground/3 p-4">
                  <p className="text-sm text-secondary leading-relaxed">{p.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted">{p.supportingEntryIds.length} entries</span>
                    <button
                      onClick={() => { dismissPattern(p.id); setPatterns((prev) => prev.filter((pp) => pp.id !== p.id)); }}
                      className="text-[10px] text-muted hover:text-foreground"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>{/* close max-w-lg wrapper */}
      </main>
    );
  }

  // ─── Home View (default) — matches the "Journal - Today" Claude design ──────
  const TYPE_COLOR: Record<string, string> = { ritual: "#9aa2c8", tarot: "#d99bb0", prompt: "#8fb894", heavy: "#b58a6a" };
  const TYPE_LABEL: Record<string, string> = { ritual: "From your ritual", tarot: "From your Tarot pull", prompt: "From your horoscope", heavy: "Free writing" };
  const classifyEntry = (e: JournalEntry): keyof typeof TYPE_COLOR => {
    const pid = (e.prompt_id || "").toLowerCase();
    const pt = (e.prompt_text || e.prompt || "").toLowerCase();
    if (pid.includes("tarot") || pt.includes("card")) return "tarot";
    if (pid.includes("ritual") || pt.includes("ritual")) return "ritual";
    if (e.prompt_id || e.prompt_text || e.prompt) return "prompt";
    return "heavy";
  };
  type FeedItem = { key: string; date: Date; type: keyof typeof TYPE_COLOR; excerpt: string; entry: JournalEntry | null };
  const feed: FeedItem[] = [
    ...entries.map((e, i) => ({
      key: `e${e.id || i}`,
      date: new Date(e.created_at || e.date || Date.now()),
      type: classifyEntry(e),
      excerpt: (e.text || e.content || "").trim(),
      entry: e,
    })),
    ...pullHistory.map((p, i) => ({
      key: `p${p.id || i}`,
      date: new Date(p.date),
      type: "tarot" as const,
      excerpt: p.notes?.trim() || (p.cards?.map((c) => c.name).filter(Boolean).join(", ")) || "Card pull",
      entry: null,
    })),
  ].filter((f) => !isNaN(f.date.getTime())).sort((a, b) => b.date.getTime() - a.date.getTime());

  const nowD = new Date();
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  // week strip — Sunday…Saturday of the current week
  const weekStart = new Date(nowD); weekStart.setDate(nowD.getDate() - nowD.getDay());
  const DOW = ["S", "M", "T", "W", "T", "F", "S"];
  const weekStrip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    const hit = feed.find((f) => sameDay(f.date, d));
    return { dow: DOW[i], num: d.getDate(), isToday: sameDay(d, nowD), type: hit?.type ?? null };
  });

  // month calendar
  const mYear = nowD.getFullYear(), mMonth = nowD.getMonth();
  const firstDow = new Date(mYear, mMonth, 1).getDay();
  const daysInMonth = new Date(mYear, mMonth + 1, 0).getDate();
  const dayType: Record<number, keyof typeof TYPE_COLOR> = {};
  feed.forEach((f) => { if (f.date.getFullYear() === mYear && f.date.getMonth() === mMonth && !(f.date.getDate() in dayType)) dayType[f.date.getDate()] = f.type; });
  const monthEntryCount = Object.keys(dayType).length;
  const monthName = nowD.toLocaleDateString("en-US", { month: "long" });
  const calCells: ({ day: number; type: keyof typeof TYPE_COLOR | null; isToday: boolean } | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, type: dayType[i + 1] ?? null, isToday: i + 1 === nowD.getDate() })),
  ];

  // stats ring
  const counts: Record<string, number> = { ritual: 0, tarot: 0, prompt: 0, heavy: 0 };
  feed.forEach((f) => { counts[f.type]++; });
  const totalKept = feed.length;
  const ringOrder: (keyof typeof TYPE_COLOR)[] = ["ritual", "tarot", "prompt", "heavy"];
  let acc = 0;
  const ringStops = totalKept === 0 ? "var(--foreground-ghost) 0 100%" : ringOrder.map((t) => {
    const frac = counts[t] / totalKept;
    const start = acc * 100, end = (acc + frac) * 100; acc += frac;
    return `${TYPE_COLOR[t]} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  }).join(", ");

  // streak — consecutive days with an entry ending today (or yesterday)
  let streak = 0;
  { const cur = new Date(nowD);
    if (!feed.some((f) => sameDay(f.date, cur))) cur.setDate(cur.getDate() - 1);
    while (feed.some((f) => sameDay(f.date, cur))) { streak++; cur.setDate(cur.getDate() - 1); } }

  const cheer = monthEntryCount >= 5;
  const recent = feed.slice(0, 4);
  const cardBg = "var(--background-card)";
  const cardBd = "var(--border-card)";
  const promptText = currentPrompt?.text || todayPrompt?.text || "What are you ready to set down before the new moon?";

  return (
    <main className="min-h-full">
      <div className="max-w-lg mx-auto px-5 py-6 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p style={{ fontFamily: "var(--font-script)", fontSize: 32, lineHeight: 1, color: "var(--lavender)", margin: "0 0 2px" }}>Your reflections,</p>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1, color: "var(--foreground)" }}>Journal</h1>
          </div>
          {streak > 0 && (
            <span className="flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-full" style={{ background: "color-mix(in srgb, var(--lavender) 14%, transparent)", border: "1px solid color-mix(in srgb, var(--lavender) 40%, transparent)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--lavender)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              <span className="text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{streak}</span>
            </span>
          )}
        </div>

        {/* WEEK STRIP */}
        <div className="flex gap-[7px] mb-[22px]">
          {weekStrip.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 py-[10px] rounded-2xl" style={{
              background: d.isToday ? "var(--lavender)" : cardBg,
              border: d.isToday ? "none" : `0.5px solid ${cardBd}`,
            }}>
              <span className="text-[10px] font-semibold" style={{ color: d.isToday ? "var(--plum-deep)" : "var(--foreground-muted)" }}>{d.dow}</span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 600, color: d.isToday ? "var(--plum-deep)" : "var(--foreground)" }}>{d.num}</span>
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: d.type ? (d.isToday ? "var(--plum-deep)" : TYPE_COLOR[d.type]) : "transparent" }} />
            </div>
          ))}
        </div>

        {/* ENCOURAGING BANNER */}
        {cheer && (
          <div className="relative overflow-hidden rounded-[20px] p-[18px_20px] mb-4" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--lavender) 22%, var(--background-card)), var(--background-card))", border: `0.5px solid color-mix(in srgb, var(--lavender) 24%, transparent)` }}>
            <div className="flex items-center gap-3.5">
              <div className="shrink-0 w-[46px] h-[46px] rounded-[14px] flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--lavender) 14%, transparent)", border: "0.5px solid color-mix(in srgb, var(--lavender) 40%, transparent)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lavender)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8z" /></svg>
              </div>
              <div className="min-w-0">
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--foreground)", lineHeight: 1.1 }}>{monthEntryCount} nights kept this month</div>
                <div className="text-[12.5px] mt-1" style={{ lineHeight: 1.5, color: "var(--foreground-secondary)" }}>Your reflections are becoming a rhythm — keep the practice going.</div>
              </div>
            </div>
          </div>
        )}

        {/* HERO PROMPT CARD */}
        <div className="relative overflow-hidden rounded-[22px] p-[22px] mb-4" style={{ background: "linear-gradient(165deg, color-mix(in srgb, var(--lavender) 20%, var(--background-card)), var(--background-card))", border: `0.5px solid color-mix(in srgb, var(--lavender) 22%, transparent)` }}>
          <div aria-hidden className="absolute pointer-events-none" style={{ top: -40, right: -30, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--lavender) 14%, transparent), transparent 68%)" }} />
          <div className="flex items-center gap-1.5 mb-3 relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lavender)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /><circle cx="12" cy="12" r="3.4" /></svg>
            <span className="text-[10px] uppercase font-bold" style={{ letterSpacing: "0.16em", color: "var(--lavender)" }}>Tonight&rsquo;s prompt</span>
          </div>
          <p style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 22, fontStyle: "italic", lineHeight: 1.4, color: "var(--foreground)", margin: "0 0 20px", position: "relative", textWrap: "pretty" }}>{promptText}</p>
          <button onClick={startCompose} className="w-full py-[15px] rounded-full text-[12.5px] font-bold uppercase" style={{ letterSpacing: "0.1em", background: "var(--lavender)", color: "var(--plum-deep)", border: "none" }}>Begin writing</button>
        </div>

        {/* MORNING / EVENING SPLIT */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { title: "Morning intention", sub: "Set the day", color: TYPE_COLOR.heavy, icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></> },
            { title: "Evening reflection", sub: "Unwind & release", color: TYPE_COLOR.ritual, icon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /> },
          ].map((c) => (
            <button key={c.title} onClick={startCompose} className="text-left rounded-[18px] p-4" style={{ background: cardBg, border: `0.5px solid ${cardBd}` }}>
              <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center mb-3.5" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: "0.5px solid var(--border-card)" }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{c.icon}</svg>
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--foreground)", marginBottom: 3 }}>{c.title}</div>
              <div className="text-[11.5px]" style={{ color: "var(--foreground-muted)" }}>{c.sub}</div>
            </button>
          ))}
        </div>

        {/* CALENDAR CARD */}
        <div className="rounded-[22px] p-[20px_18px] mb-4" style={{ background: cardBg, border: `0.5px solid ${cardBd}` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--foreground)", lineHeight: 1 }}>Your month</div>
              <div className="text-[11.5px] mt-[3px]" style={{ color: "var(--foreground-muted)" }}>{monthEntryCount} {monthEntryCount === 1 ? "night" : "nights"} kept in {monthName}</div>
            </div>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: "var(--foreground)" }}>{monthName}</span>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {DOW.map((w, i) => <div key={i} className="text-center text-[10px] font-semibold" style={{ color: "var(--foreground-faint)" }}>{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calCells.map((c, i) => (
              <div key={i} className="aspect-square flex flex-col items-center justify-center gap-[3px] rounded-[10px]" style={c && c.isToday ? { background: "color-mix(in srgb, var(--lavender) 14%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--lavender) 50%, transparent)" } : undefined}>
                {c && <>
                  <span className="text-[13px]" style={{ fontWeight: c.isToday ? 700 : c.type ? 600 : 400, color: c.isToday ? "var(--lavender)" : c.type ? "var(--foreground)" : "var(--foreground-faint)" }}>{c.day}</span>
                  <span className="w-[5px] h-[5px] rounded-full" style={{ background: c.type ? TYPE_COLOR[c.type] : "transparent" }} />
                </>}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3.5 mt-[18px] pt-4" style={{ borderTop: `0.5px solid ${cardBd}` }}>
            {[["Ritual", "ritual"], ["Tarot", "tarot"], ["Horoscope", "prompt"]].map(([label, t]) => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLOR[t] }} />
                <span className="text-[10.5px]" style={{ color: "var(--foreground-muted)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STATS RING */}
        <div className="rounded-[22px] p-[22px_20px] mb-6" style={{ background: cardBg, border: `0.5px solid ${cardBd}` }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--foreground)", marginBottom: 2 }}>Your journal, so far</div>
          <div className="text-[11.5px] mb-5" style={{ color: "var(--foreground-muted)" }}>Every night you&rsquo;ve kept the practice</div>
          <div className="flex items-center justify-center mb-[22px]">
            <div className="relative w-[186px] h-[186px] rounded-full" style={{ background: `conic-gradient(from -90deg, ${ringStops})` }}>
              <div className="absolute rounded-full flex flex-col items-center justify-center" style={{ inset: 15, background: cardBg }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 52, fontWeight: 600, lineHeight: 1, color: "var(--foreground)" }}>{totalKept}</div>
                <div className="text-[10.5px] uppercase mt-1.5" style={{ letterSpacing: "0.1em", color: "var(--foreground-muted)" }}>Entries kept</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {ringOrder.map((t) => (
              <div key={t} className="flex items-center gap-3">
                <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: TYPE_COLOR[t] }} />
                <span className="text-[13.5px] flex-1" style={{ color: "var(--foreground-secondary)" }}>{TYPE_LABEL[t].replace("From your ", "From your ").replace("ritual", "rituals").replace("Tarot pull", "Tarot pulls")}</span>
                <div className="w-[88px] h-[5px] rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--foreground) 6%, transparent)" }}>
                  <div className="h-full rounded-full" style={{ width: `${totalKept ? Math.round((counts[t] / totalKept) * 100) : 0}%`, background: TYPE_COLOR[t] }} />
                </div>
                <span className="text-[13px] font-semibold text-right min-w-[26px]" style={{ color: "var(--foreground)" }}>{counts[t]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT */}
        <div className="flex items-baseline justify-between mb-3">
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 500, color: "var(--foreground)", margin: 0 }}>Recent</h3>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: cardBg, border: `0.5px solid ${cardBd}` }}>
            <p className="text-[14px]" style={{ color: "var(--foreground-muted)" }}>No entries yet — your first reflection starts above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[11px]">
            {recent.map((f) => (
              <button key={f.key} onClick={() => { if (f.entry) { setSelectedEntry(f.entry); setView("entry"); } }} className="flex gap-3.5 p-[15px] rounded-2xl text-left" style={{ background: cardBg, border: `0.5px solid ${cardBd}` }}>
                <div className="shrink-0 w-11 text-center">
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 600, color: "var(--foreground)", lineHeight: 1 }}>{f.date.getDate()}</div>
                  <div className="text-[10px] uppercase mt-0.5" style={{ letterSpacing: "0.08em", color: "var(--foreground-muted)" }}>{f.date.toLocaleDateString("en-US", { month: "short" })}</div>
                </div>
                <div className="flex-1 min-w-0 pl-[13px]" style={{ borderLeft: `0.5px solid ${cardBd}` }}>
                  <div className="inline-flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLOR[f.type] }} />
                    <span className="text-[10px] font-semibold" style={{ color: TYPE_COLOR[f.type] }}>{TYPE_LABEL[f.type]}</span>
                  </div>
                  <p className="text-[13.5px] m-0" style={{ lineHeight: 1.55, color: "var(--foreground-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.excerpt || "(no words)"}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}