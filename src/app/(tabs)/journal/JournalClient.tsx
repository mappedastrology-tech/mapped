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
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
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
      setSelectedMood(null);
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
      setSelectedMood(null);
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
    setSelectedMood(null);
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
      mood: selectedMood || undefined,
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

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" /></div>;
  }

  // ─── Welcome View ──────────────────────────────────────────────────────────
  // ─── Compose View ──────────────────────────────────────────────────────────
  if (view === "compose") {
    return (
      <main className="min-h-full bg-background flex flex-col">
        <div className="max-w-lg mx-auto w-full flex flex-col flex-1">
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
          {/* Prompt card */}
          {currentPrompt && (
            <div className="rounded-2xl border border-foreground/10 bg-foreground/3 p-5 mb-4 animate-in fade-in duration-300">
              <p className="text-sm text-foreground leading-relaxed italic mb-3">{currentPrompt.text}</p>
              <div className="flex gap-3">
                {promptCycleCount < 2 && (
                  <button onClick={cyclePrompt} className="text-[11px] text-terracotta/70 hover:text-terracotta transition-colors">
                    Different prompt
                  </button>
                )}
                <button onClick={goFreeWrite} className="text-[11px] text-muted hover:text-foreground transition-colors">
                  Write something else
                </button>
              </div>
              {promptCycleCount >= 2 && (
                <p className="text-[10px] text-muted mt-2">Run out of prompts? Just write something.</p>
              )}
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

          {/* Mood picker */}
          <div className="mb-4">
            <p className="text-[11px] text-muted uppercase tracking-widest mb-2">How are you feeling?</p>
            <div className="flex flex-wrap gap-1.5">
              {MOOD_PALETTE.map((m) => (
                <button
                  key={m.word}
                  onClick={() => setSelectedMood(selectedMood === m.word ? null : m.word)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedMood === m.word
                      ? `${m.color} text-foreground font-medium ring-1 ring-foreground/20`
                      : "bg-foreground/5 text-muted hover:bg-foreground/10"
                  }`}
                >
                  {m.word}
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <textarea
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            placeholder="Start writing..."
            aria-label="Journal entry"
            className="flex-1 min-h-[200px] bg-transparent text-foreground text-sm leading-relaxed resize-none focus:outline-none placeholder:text-muted"
            autoFocus
          />

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
      <main className="min-h-full bg-background flex flex-col">
        <div className="max-w-lg mx-auto w-full flex flex-col flex-1">
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
            {selectedEntry.mood && (
              <span className="px-2.5 py-0.5 rounded-full bg-terracotta/15 text-[10px] text-terracotta font-medium">
                {selectedEntry.mood}
              </span>
            )}
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
      <main className="min-h-full bg-background flex flex-col">
        <div className="max-w-lg mx-auto w-full flex flex-col flex-1">
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

  // ─── Home View (default) ───────────────────────────────────────────────────
  return (
    <main className="min-h-full bg-background">
      <div className="max-w-lg mx-auto px-5 py-6 pb-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p style={{ fontFamily: "var(--font-script)", fontSize: 30, lineHeight: 1, color: "var(--lavender)", margin: "0 0 2px" }}>Your reflections,</p>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1, color: "var(--foreground)" }}>Journal</h1>
          </div>
          {remaining !== null && activeTab === "calendar" && (
            <span className="text-[10px] text-muted bg-foreground/5 px-2 py-1 rounded-full mt-1">
              {remaining} left this month
            </span>
          )}
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex gap-1 mb-5 bg-foreground/5 rounded-xl p-1">
          {([
            { key: "calendar" as const, label: "Calendar" },
            { key: "pulls" as const, label: "Card Pulls" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* First save celebration */}
        {showFirstSaveMsg && activeTab === "calendar" && (
          <div className="mb-4 rounded-xl border border-sage/20 bg-sage/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs text-sage leading-relaxed">{JOURNAL_PRIVACY_COPY.firstEntrySaved}</p>
          </div>
        )}

        {/* ═══════════════ PULLS TAB ═══════════════ */}
        {activeTab === "pulls" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-widest text-secondary/60 font-semibold">Card Pull History</p>
              {pullHistory.length > 0 && (
                <button
                  onClick={() => {
                    if (bulkSelectMode) {
                      setBulkSelectMode(false);
                      setSelectedPulls(new Set());
                    } else {
                      setBulkSelectMode(true);
                      setSelectedPulls(new Set());
                    }
                  }}
                  className="text-xs font-medium px-3 py-1 rounded-full border border-foreground/12 text-secondary/60 active:bg-foreground/[0.06] transition-colors"
                >
                  {bulkSelectMode ? "Cancel" : "Select"}
                </button>
              )}
            </div>

            {/* Bulk delete bar */}
            {bulkSelectMode && selectedPulls.size > 0 && (
              <div className="flex items-center justify-between mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-sm text-secondary">
                  {selectedPulls.size} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const allIdxs = new Set(pullHistory.map((_, i) => i));
                      setSelectedPulls(selectedPulls.size === pullHistory.length ? new Set() : allIdxs);
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-foreground/12 text-secondary active:bg-foreground/[0.06] transition-colors"
                  >
                    {selectedPulls.size === pullHistory.length ? "Deselect all" : "Select all"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${selectedPulls.size} reading${selectedPulls.size !== 1 ? "s" : ""}?`)) {
                        setPullHistory((prev) => {
                          const updated = prev.filter((_, idx) => !selectedPulls.has(idx));
                          try { localStorage.setItem(getTarotHistoryKey(userId), JSON.stringify(updated)); } catch {}
                          return updated;
                        });
                        setSelectedPulls(new Set());
                        setBulkSelectMode(false);
                        setExpandedPullIdx(null);
                      }
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 active:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {pullHistory.length === 0 ? (
              <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.04] p-8 text-center">
                <p className="text-secondary text-base">No card pulls yet</p>
                <p className="text-secondary/50 text-sm mt-2">Pull a card from the home screen to see it here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pullHistory.slice(0, pullsPage * PULLS_PER_PAGE).map((pull, i) => {
                  const isExpanded = expandedPullIdx === i;
                  const spreadLabel = pull.spreadName || pull.spread || "Reading";
                  const dateStr = new Date(pull.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  return (
                    <div
                      key={pull.id || i}
                      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                        isExpanded
                          ? "border-foreground/15 bg-foreground/[0.05]"
                          : "border-foreground/8 bg-foreground/[0.03]"
                      }`}
                    >
                      {/* Header — tap to expand (or select in bulk mode) */}
                      <button
                        onClick={() => {
                          if (bulkSelectMode) {
                            setSelectedPulls((prev) => {
                              const next = new Set(prev);
                              if (next.has(i)) next.delete(i); else next.add(i);
                              return next;
                            });
                          } else {
                            setExpandedPullIdx(isExpanded ? null : i);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-5 py-4 active:bg-foreground/[0.06] transition-colors"
                      >
                        {bulkSelectMode && (
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            selectedPulls.has(i)
                              ? "bg-terracotta border-terracotta"
                              : "border-foreground/20 bg-transparent"
                          }`}>
                            {selectedPulls.has(i) && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                          <span className="text-foreground text-[15px] truncate">
                            {spreadLabel}
                          </span>
                          <span className="text-secondary/50 text-[13px]">
                            {pull.cards.length} card{pull.cards.length !== 1 ? "s" : ""} · {dateStr}{pull.notes ? " · has notes" : ""}
                          </span>
                        </div>
                        {!bulkSelectMode && (
                          <svg
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            className={`text-secondary/40 transition-transform duration-300 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-5 pb-5">
                          {pull.question && (
                            <p className="text-[14px] text-secondary/60 italic mb-4">&ldquo;{pull.question}&rdquo;</p>
                          )}

                          {/* Cards list */}
                          <div className="space-y-2 mb-5">
                            {pull.cards.map((card, j) => (
                              <div
                                key={j}
                                className="rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] px-4 py-3.5"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    {card.position && (
                                      <p className="text-secondary/50 text-[12px] font-medium uppercase tracking-wider mb-1.5">
                                        {card.position}
                                      </p>
                                    )}
                                    <p className="text-foreground text-[16px]">
                                      {card.name}
                                    </p>
                                    {card.keywords && card.keywords.length > 0 && (
                                      <p className="text-secondary/50 text-[13px] mt-1">
                                        {card.keywords.slice(0, 3).join(" · ")}
                                      </p>
                                    )}
                                  </div>
                                  {card.reversed && (
                                    <span className="text-[11px] font-medium text-secondary/40 bg-foreground/[0.06] px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5">
                                      Reversed
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Notes */}
                          {pull.notes && (
                            <div className="rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] px-4 py-3.5 mb-5">
                              <p className="text-secondary/50 text-[11px] font-medium uppercase tracking-wider mb-2">Notes</p>
                              <p className="text-secondary text-[13px] leading-relaxed whitespace-pre-wrap">{pull.notes}</p>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cardsSummary = pull.cards.map(c =>
                                  `${c.position ? c.position + ": " : ""}${c.name}${c.reversed ? " (Reversed)" : ""}`
                                ).join(". ");
                                const dollyContext = `I did a ${spreadLabel} reading on ${new Date(pull.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}. Cards: ${cardsSummary}.${pull.notes ? ` My notes: "${pull.notes}".` : ""} Help me revisit this reading and understand what these cards were telling me.`;
                                sessionStorage.setItem("dolly-context", dollyContext);
                                router.push("/dolly");
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-foreground/12 bg-foreground/[0.03] text-secondary text-[13px] font-medium active:bg-foreground/[0.08] transition-colors"
                            >
                              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
                                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                              </svg>
                              Ask Dolly
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const fullDateStr = new Date(pull.date).toLocaleDateString("en-US", { month: "long", day: "numeric" });
                                const cardLines = pull.cards.map(c =>
                                  `${c.position ? c.position + ": " : ""}${c.name}${c.reversed ? " (Reversed)" : ""}`
                                ).join("\n");
                                const fallback = `My ${spreadLabel} reading (${fullDateStr}):\n\n${cardLines}\n\n— Mapped Astrology`;
                                setPullCopied(i);
                                await shareReadingAsImage(
                                  { spreadName: spreadLabel, date: fullDateStr, cards: pull.cards },
                                  fallback
                                );
                                setTimeout(() => setPullCopied(null), 2000);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-foreground/12 bg-foreground/[0.03] text-secondary text-[13px] font-medium active:bg-foreground/[0.08] transition-colors"
                            >
                              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                              </svg>
                              {pullCopied === i ? "Shared!" : "Share"}
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this reading?")) {
                                setPullHistory((prev) => {
                                  const updated = prev.filter((_, idx) => idx !== i);
                                  try { localStorage.setItem(getTarotHistoryKey(userId), JSON.stringify(updated)); } catch {}
                                  return updated;
                                });
                                setExpandedPullIdx(null);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1.5 mt-2 py-2.5 text-secondary/30 text-xs font-medium active:text-red-400/60 transition-colors"
                          >
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                            </svg>
                            Delete reading
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {pullHistory.length > pullsPage * PULLS_PER_PAGE && (
                  <button
                    onClick={() => setPullsPage((p) => p + 1)}
                    className="w-full py-3 text-center text-xs text-terracotta/70 hover:text-terracotta transition-colors"
                  >
                    Show more ({pullHistory.length - pullsPage * PULLS_PER_PAGE} remaining)
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* ═══════════════ CALENDAR TAB ═══════════════ */}
        {activeTab === "calendar" && (
          <>
            <JournalCalendar entries={entries} onSelectEntry={openEntry} />

            {/* Tonight's Prompt Card */}
            <div
              className="relative overflow-hidden p-5 mb-5 mt-6"
              style={{ borderRadius: 20, background: "linear-gradient(165deg, var(--plum), var(--plum-deep, #161022))", border: "0.5px solid rgba(201,206,232,0.18)" }}
            >
              <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: -30, right: -24, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,206,232,0.12), transparent 68%)" }} />
              <div className="relative flex items-center gap-1.5 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lavender)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /><circle cx="12" cy="12" r="3.4" /></svg>
                <span className="text-[10px] uppercase font-bold" style={{ letterSpacing: "0.16em", color: "var(--lavender)" }}>Tonight&rsquo;s prompt</span>
              </div>
              {todayEntry ? (
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(123,160,85,0.25)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    <span className="text-sm font-medium" style={{ color: "#f0e6d2" }}>Complete for today</span>
                  </div>
                  <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: "rgba(240,230,210,0.75)" }}>{(todayEntry.text || todayEntry.content || "").slice(0, 120)}</p>
                  <button onClick={() => openEntry(todayEntry)} className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.1em]" style={{ background: "var(--lavender)", color: "#161022" }}>
                    Edit tonight&rsquo;s entry
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <p className="mb-4" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, fontSize: 22, lineHeight: 1.4, color: "#f0e6d2" }}>{todayPrompt.text}</p>
                  <button onClick={startCompose} className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.1em]" style={{ background: "var(--lavender)", color: "#161022" }}>
                    Begin writing
                  </button>
                </div>
              )}
            </div>

            {/* Recent Entries */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-3">Recent</p>
              {entries.length === 0 ? (
                <div className="rounded-xl border border-foreground/8 bg-foreground/3 p-6 text-center">
                  <p className="text-muted text-sm">No entries yet.</p>
                  <p className="text-muted text-xs mt-1">Tap &quot;Begin entry&quot; to start.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.slice(0, entriesPage * ENTRIES_PER_PAGE).map((entry) => {
                    const text = entry.text || entry.content || "";
                    const preview = text.slice(0, 80);
                    return (
                      <button
                        key={entry.id}
                        onClick={() => openEntry(entry)}
                        className="w-full text-left rounded-xl border border-foreground/8 bg-foreground/3 p-4 hover:border-foreground/15 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-muted">
                            {new Date(entry.created_at || entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                          {entry.mood && (
                            <span className="px-2 py-0.5 rounded-full bg-terracotta/12 text-[10px] text-terracotta/80">{entry.mood}</span>
                          )}
                        </div>
                        <p className="text-sm text-secondary leading-snug">
                          {preview}{text.length > 80 ? "..." : ""}
                        </p>
                      </button>
                    );
                  })}
                  {entries.length > entriesPage * ENTRIES_PER_PAGE && (
                    <button
                      onClick={() => setEntriesPage((p) => p + 1)}
                      className="w-full py-3 text-center text-xs text-terracotta/70 hover:text-terracotta transition-colors"
                    >
                      Show more ({entries.length - entriesPage * ENTRIES_PER_PAGE} remaining)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Cap reached message */}
            {remaining === 0 && (
              <div className="mt-4 rounded-xl border border-amber/20 bg-amber/5 p-4 text-center">
                <p className="text-xs text-amber/80">{JOURNAL_PRIVACY_COPY.capReached(0)}</p>
              </div>
            )}
          </>
        )}
      </div>

      {PaywallModal}
    </main>
  );
}

/* ─── Journal Calendar Component ─── */

function JournalCalendar({ entries, onSelectEntry }: { entries: JournalEntry[]; onSelectEntry: (e: JournalEntry) => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Map entry dates to day numbers
  const entryDays = new Map<number, JournalEntry>();
  for (const entry of entries) {
    const d = new Date(entry.created_at || entry.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      entryDays.set(d.getDate(), entry);
    }
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full border border-foreground/12 text-muted" aria-label="Previous month">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <p className="text-sm font-semibold text-secondary">{monthLabel}</p>
        <button onClick={nextMonth} className="w-8 h-8 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full border border-foreground/12 text-muted" aria-label="Next month">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[9px] text-muted font-semibold uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const hasEntry = entryDays.has(day);
          const isToday = isCurrentMonth && day === todayDate;
          const entry = entryDays.get(day);

          return (
            <button
              key={day}
              onClick={() => entry && onSelectEntry(entry)}
              disabled={!hasEntry}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors relative ${
                isToday
                  ? "border border-terracotta/30 text-terracotta font-semibold"
                  : hasEntry
                  ? "text-secondary hover:bg-foreground/5"
                  : "text-muted"
              }`}
            >
              {day}
              {hasEntry && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-sage" />
              )}
            </button>
          );
        })}
      </div>

      {/* Entries for selected month summary */}
      {entryDays.size > 0 && (
        <p className="text-[10px] text-muted text-center mt-4">
          {entryDays.size} {entryDays.size === 1 ? "entry" : "entries"} this month
        </p>
      )}
    </div>
  );
}
