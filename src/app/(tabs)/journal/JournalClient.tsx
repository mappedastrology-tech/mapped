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

type View = "home" | "compose" | "entry" | "patterns" | "all";

// Entry type categories → themed tokens, tag labels, and the classifier used
// across the home feed, calendar, stats ring, and the All-entries archive.
type EntryType = "ritual" | "tarot" | "prompt" | "heavy";
const TYPE_COLOR: Record<EntryType, string> = { ritual: "var(--type-ritual)", tarot: "var(--type-tarot)", prompt: "var(--type-prompt)", heavy: "var(--type-heavy)" };
const TYPE_LABEL: Record<EntryType, string> = { ritual: "From your ritual", tarot: "From your Tarot pull", prompt: "From your horoscope", heavy: "Free writing" };

// Time-of-day word so the title prompt matches when the user is actually writing.
function currentTimeWord(): string {
  const h = new Date().getHours();
  if (h < 5) return "tonight";
  if (h < 12) return "this morning";
  if (h < 17) return "this afternoon";
  if (h < 21) return "this evening";
  return "tonight";
}

// Tappable title suggestions, tuned to the time of day.
function titleIdeas(timeWord: string): string[] {
  const base = ["What's on my mind", "Letting it out", "A quiet moment", "Where I am right now"];
  if (timeWord.includes("morning")) return ["Morning pages", "Setting my intention", "How I woke up", ...base].slice(0, 5);
  if (timeWord.includes("afternoon")) return ["Midday check-in", "Catching my breath", ...base].slice(0, 5);
  return ["Winding down", "Releasing the day", "Tonight's reflection", ...base].slice(0, 5);
}

// Minimal Web Speech API shapes (not in the standard TS DOM lib).
interface SpeechAlt { transcript: string }
interface SpeechResult { isFinal: boolean; 0: SpeechAlt; length: number }
interface SpeechResults { length: number; [i: number]: SpeechResult }
interface SpeechEvt { resultIndex: number; results: SpeechResults }
interface SpeechRecognitionLike {
  continuous: boolean; interimResults: boolean; lang: string;
  start(): void; stop(): void;
  onresult: ((e: SpeechEvt) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

// Mood-chip dot colors — map mood categories onto the themed entry-type tokens
// (matches the design's mood-dot pattern: each chip carries a small tinted dot).
const MOOD_DOT: Record<string, string> = {
  heavy: "var(--type-heavy)",
  hard: "var(--type-ritual)",
  neutral: "var(--journal-accent)",
  soft_positive: "var(--type-tarot)",
  bright_positive: "var(--type-prompt)",
};

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
  const [composeTitle, setComposeTitle] = useState("");
  // True when compose was opened via the home-page check-in deep link, so the
  // back button returns to the app home rather than the journal's own home tab.
  const [composeFromHome, setComposeFromHome] = useState(false);
  const [isBurn, setIsBurn] = useState(false);
  const [promptCycleCount, setPromptCycleCount] = useState(0);
  const [cycledIds, setCycledIds] = useState<string[]>([]);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showFirstSaveMsg, setShowFirstSaveMsg] = useState(false);
  // Burn ceremony: idle → burning (candle + embers, ~3.15s) → gone (release screen)
  const [burnStage, setBurnStage] = useState<"idle" | "burning" | "gone">("idle");
  const burnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [timeWord] = useState(currentTimeWord);
  const [composeImage, setComposeImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [listening, setListening] = useState(false); // voice-to-text sheet open
  const [voiceSupported, setVoiceSupported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const usedVoiceRef = useRef(false);
  const composeScrollRef = useRef<HTMLDivElement>(null);

  // Calendar month navigation (0 = current month) + All-entries type filter
  const [calOffset, setCalOffset] = useState(0);
  const [allFilter, setAllFilter] = useState<"all" | EntryType>("all");

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setVoiceSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  // Entering compose: start at the top. Without this, switching from a
  // scrolled-down home view (or the textarea's autofocus) left the view stuck
  // near the bottom, unable to scroll up.
  useEffect(() => {
    if (view === "compose") {
      composeScrollRef.current?.scrollTo({ top: 0 });
      if (typeof window !== "undefined") window.scrollTo(0, 0);
    }
  }, [view]);
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
      setComposeFromHome(true);
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
      setComposeFromHome(true);

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
  // ─── Handlers ──────────────────────────────────────────────────────────────

  function startCompose() {
    if (!canWriteEntry(tier as "free" | "mid")) {
      gate("unlimited_dolly"); // triggers paywall
      return;
    }
    const prompt = selectPrompt(promptContext);
    setCurrentPrompt(prompt);
    setComposeText("");
    setComposeTitle("");
    setIsBurn(false);
    setSelectedMoods([]);
    setComposeImage(null);
    setComposeFromHome(false);
    usedVoiceRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* */ }
    setIsRecording(false);
    setPromptCycleCount(0);
    setCycledIds(prompt ? [prompt.id] : []);
    setView("compose");
  }

  // Voice-to-text: the mic FAB opens a "Listening…" sheet; dictated speech is
  // appended to the entry body live via the Web Speech API. "Stop & insert"
  // keeps what was heard; "Cancel" simply stops without adding more.
  function startListening() {
    if (!voiceSupported) return;
    setListening(true);
    try {
      const w = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      };
      const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!Ctor) { setIsRecording(false); return; }
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onresult = (e) => {
        let chunk = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) chunk += e.results[i][0].transcript;
        }
        chunk = chunk.trim();
        if (chunk) {
          usedVoiceRef.current = true;
          setComposeText((prev) => (prev ? prev.replace(/\s+$/, "") + " " : "") + chunk + " ");
        }
      };
      rec.onend = () => setIsRecording(false);
      rec.onerror = () => setIsRecording(false);
      recognitionRef.current = rec;
      rec.start();
      setIsRecording(true);
    } catch { setIsRecording(false); }
  }

  function stopListening() {
    try { recognitionRef.current?.stop(); } catch { /* */ }
    setIsRecording(false);
    setListening(false);
  }

  // Attach a photo — compressed to keep on-device storage reasonable.
  function onPickJournalPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1100;
        const scale = Math.min(1, maxW / img.width);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setComposeImage(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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
      title: composeTitle.trim() || undefined,
      text: composeText,
      content: composeText,
      prompt_id: currentPrompt?.id || null,
      prompt_text: currentPrompt?.text || null,
      prompt: currentPrompt?.text || "(free write)",
      mood: selectedMoods.length ? selectedMoods.join(", ") : undefined,
      image: composeImage || undefined,
      is_burn: isBurn,
      is_voice: usedVoiceRef.current,
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
      // Burn ceremony: candle + embers, then the "You are released." screen.
      // Nothing was persisted above; this only plays the release animation.
      try { recognitionRef.current?.stop(); } catch { /* */ }
      setIsRecording(false);
      setListening(false);
      setBurnStage("burning");
      if (burnTimerRef.current) clearTimeout(burnTimerRef.current);
      burnTimerRef.current = setTimeout(() => setBurnStage("gone"), 3150);
    } else {
      setView("home");
    }
  }

  // "Write another" on the release screen — fresh burn page, same overlay.
  function resetBurn() {
    if (burnTimerRef.current) clearTimeout(burnTimerRef.current);
    setBurnStage("idle");
    setComposeText("");
    setComposeTitle("");
    setSelectedMoods([]);
    usedVoiceRef.current = false;
    composeScrollRef.current?.scrollTo({ top: 0 });
  }

  // "Done" on the release screen (or closing compose) — tear down the overlay.
  // A compose opened from the home check-in returns to /home instead.
  function closeCompose() {
    if (burnTimerRef.current) clearTimeout(burnTimerRef.current);
    try { recognitionRef.current?.stop(); } catch { /* */ }
    setIsRecording(false);
    setListening(false);
    setBurnStage("idle");
    setIsBurn(false);
    setComposeText("");
    if (composeFromHome) {
      setComposeFromHome(false);
      router.push("/home");
    } else {
      setView("home");
    }
  }

  // Clear any pending burn timer on unmount.
  useEffect(() => () => { if (burnTimerRef.current) clearTimeout(burnTimerRef.current); }, []);

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
  const composeMoonSign = useMemo(() => {
    try {
      const m = getMoonPhase(new Date()) as { label?: string; sign?: string } | null;
      return m?.sign ? `${m.label} in ${m.sign}` : (m?.label || "");
    } catch { return composeMoonLabel; }
  }, [composeMoonLabel]);

  // ─── Shared feed ───────────────────────────────────────────────────────────
  // One chronological stream of journal entries + tarot pulls, classified by
  // type. Used by the home week-strip/calendar/stats/recent AND the All-entries
  // archive, so it lives above the per-view early returns.
  const classifyEntry = useCallback((e: JournalEntry): EntryType => {
    const pid = (e.prompt_id || "").toLowerCase();
    const pt = (e.prompt_text || e.prompt || "").toLowerCase();
    if (pid.includes("tarot") || pt.includes("card")) return "tarot";
    if (pid.includes("ritual") || pt.includes("ritual")) return "ritual";
    if (e.prompt_id || e.prompt_text || e.prompt) return "prompt";
    return "heavy";
  }, []);
  type FeedItem = { key: string; date: Date; type: EntryType; excerpt: string; entry: JournalEntry | null };
  const feed: FeedItem[] = useMemo(() => [
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
  ].filter((f) => !isNaN(f.date.getTime())).sort((a, b) => b.date.getTime() - a.date.getTime()), [entries, pullHistory, classifyEntry]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" /></div>;
  }

  // ─── Welcome View ──────────────────────────────────────────────────────────
  // ─── Compose View ──────────────────────────────────────────────────────────
  if (view === "compose") {
    const wordCount = composeText.trim() ? composeText.trim().split(/\s+/).filter(Boolean).length : 0;
    const canSave = !!composeText.trim();
    return (
      <main className="min-h-full flex flex-col">
        <div className="max-w-lg lg:max-w-2xl mx-auto w-full flex flex-col flex-1">
        {/* Header — back · New entry / Burn after writing · Save / Burn */}
        <div className="flex items-center justify-between px-4 py-3 relative z-10" style={{ borderBottom: `0.5px solid ${isBurn ? "rgba(232,130,63,0.22)" : "var(--border-card)"}` }}>
          <button onClick={closeCompose} aria-label="Back" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: "0.5px solid var(--border-card)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <span className="text-[12px] uppercase font-semibold" style={{ letterSpacing: "0.14em", color: isBurn ? "#c99366" : "var(--foreground-muted)" }}>{isBurn ? "Burn after writing" : "New entry"}</span>
          <button
            onClick={saveEntry}
            disabled={!canSave}
            className="px-[18px] py-2 rounded-full text-[12px]"
            style={
              !canSave
                ? { letterSpacing: "0.08em", fontWeight: 700, background: "color-mix(in srgb, var(--foreground) 10%, transparent)", color: "var(--foreground-muted)" }
                : isBurn
                ? { letterSpacing: "0.08em", fontWeight: 800, background: "linear-gradient(180deg,#c46733,#a5451d)", color: "#fdf1e6", boxShadow: "0 6px 18px -6px rgba(165,69,29,0.7)" }
                : { letterSpacing: "0.08em", fontWeight: 700, background: "var(--journal-accent)", color: "var(--journal-on-accent)" }
            }
          >
            {isBurn ? "Burn" : "Save"}
          </button>
        </div>

        {/* Burn ambiance — warm bottom glow + rising embers while burn mode is on */}
        {isBurn && (
          <>
            <div aria-hidden className="absolute inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(120% 68% at 50% 122%, rgba(74,36,16,0.92) 0%, rgba(42,20,9,0.55) 34%, transparent 68%)" }} />
            <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {[[8,4,7,0],[18,3,6,1.2],[27,5,8,0.4],[38,3,7,2.1],[47,4,6,0.8],[55,3,8,1.6],[63,5,7,0.2],[72,3,6,2.6],[80,4,8,1.0],[88,3,7,1.8],[14,2,9,3.0],[34,2,10,2.3],[60,2,9,0.6],[84,2,10,3.4]].map((p, i) => (
                <span key={i} className="absolute rounded-full" style={{ left: `${p[0]}%`, bottom: -12, width: p[1], height: p[1], background: "#ffb066", boxShadow: `0 0 ${p[1] * 2}px ${Math.max(1, Math.round(p[1] / 2))}px rgba(233,112,52,0.75)`, animation: `jt-ember ${p[2]}s ease-in ${p[3]}s infinite` }} />
              ))}
            </div>
          </>
        )}

        <div ref={composeScrollRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-8 relative z-[1]">
          {/* Date */}
          <div className="flex items-baseline gap-3 mb-4 px-1">
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 46, fontWeight: 600, lineHeight: 1, color: "var(--foreground)" }}>{composeDate.day}</span>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--foreground)" }}>{composeDate.month}</div>
              <div className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>{composeDate.weekday} &middot; {composeDate.year}</div>
              {composeMoonLabel && (
                <div className="inline-flex items-center gap-1.5 mt-1 text-[11.5px]" style={{ color: "var(--foreground-muted)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--journal-accent)" strokeWidth="1.5"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
                  {composeMoonLabel}
                </div>
              )}
            </div>
          </div>

          {/* BURN MODE TOGGLE CARD */}
          <button
            type="button"
            onClick={() => setIsBurn((v) => !v)}
            aria-pressed={isBurn}
            className="w-full flex items-center gap-3.5 rounded-2xl px-[15px] py-[13px] mb-4 text-left"
            style={isBurn
              ? { background: "rgba(232,130,63,0.12)", border: "0.5px solid rgba(232,130,63,0.45)" }
              : { background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}
          >
            <span className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isBurn ? "rgba(232,130,63,0.2)" : "color-mix(in srgb, var(--foreground) 5%, transparent)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isBurn ? "#e8823f" : "var(--foreground-muted)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c1 3-1 4-1 6 0 1.6 1.1 2.6 1.1 4.2A3.1 3.1 0 0 1 9 15c0-1.4.6-2 .6-3.2C7.4 13 7 15.4 7 17a5 5 0 0 0 10 0c0-4.4-3.2-6-5-9-.7-1.2-.5-4 0-6z" /></svg>
            </span>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 15.5, lineHeight: 1.1, color: isBurn ? "#e8965a" : "var(--foreground)" }}>Burn mode</div>
              <div className="text-[11.5px] mt-[3px]" style={{ lineHeight: 1.45, color: "var(--foreground-muted)", textWrap: "pretty" }}>Sometimes, you need to get things out and then not ever see it again. Use burn mode to release it.</div>
            </div>
            <span className="shrink-0 relative rounded-full" style={{ width: 44, height: 26, transition: "background 0.2s", ...(isBurn ? { background: "#d9622e" } : { background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: "0.5px solid var(--border-card)" }) }}>
              <span className="absolute rounded-full" style={{ top: "50%", transform: "translateY(-50%)", width: 20, height: 20, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.35)", transition: "left 0.2s", left: isBurn ? 21 : 3 }} />
            </span>
          </button>

          {/* WRITING SHEET */}
          <div className="rounded-[20px] p-[20px_18px] mb-5" style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)", boxShadow: "0 10px 34px -20px rgba(0,0,0,0.55)" }}>
            <input
              value={composeTitle}
              onChange={(e) => setComposeTitle(e.target.value)}
              placeholder={`Give ${timeWord} a title…`}
              aria-label="Entry title"
              className="w-full bg-transparent outline-none pb-3.5"
              style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--foreground)", borderBottom: "0.5px solid var(--border-card)" }}
            />
            {!composeTitle && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {titleIdeas(timeWord).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setComposeTitle(t)}
                    className="px-2.5 py-1 rounded-full text-[11px]"
                    style={{ background: "color-mix(in srgb, var(--journal-accent) 10%, transparent)", border: "0.5px solid color-mix(in srgb, var(--journal-accent) 30%, transparent)", color: "var(--journal-accent)" }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {(composeMoonSign || pullHistory[0]?.cards?.some((c) => c.name)) && (
              <div className="flex flex-wrap gap-[7px] mt-4 mb-4">
                {pullHistory[0]?.cards?.find((c) => c.name)?.name && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: "0.5px solid var(--border-card)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--type-tarot)" }} />
                    <span className="text-[10.5px]" style={{ color: "var(--foreground-secondary)" }}>{pullHistory[0]?.cards?.find((c) => c.name)?.name}</span>
                  </span>
                )}
                {composeMoonSign && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: "0.5px solid var(--border-card)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--type-prompt)" }} />
                    <span className="text-[10.5px]" style={{ color: "var(--foreground-secondary)" }}>{composeMoonSign}</span>
                  </span>
                )}
              </div>
            )}

            {/* Prompt */}
            {currentPrompt && (
              <div style={{ borderLeft: "2px solid var(--journal-accent)", padding: "0 0 0 12px", margin: "2px 0 16px" }}>
                <div className="text-[10px] uppercase font-bold" style={{ letterSpacing: "0.16em", color: "var(--journal-accent)", marginBottom: 6 }}>Tonight&rsquo;s prompt</div>
                <p style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: 16, lineHeight: 1.45, color: "var(--foreground-muted)", margin: 0 }}>{currentPrompt.text}</p>
                <div className="flex gap-3 mt-2">
                  {promptCycleCount < 2 && <button onClick={cyclePrompt} className="text-[11px]" style={{ color: "var(--journal-accent)" }}>Different prompt</button>}
                  <button onClick={goFreeWrite} className="text-[11px] text-muted">Write something else</button>
                </div>
              </div>
            )}
            {aiPromptLoading && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 border rounded-full animate-spin" style={{ borderColor: "color-mix(in srgb, var(--journal-accent) 40%, transparent)", borderTopColor: "var(--journal-accent)" }} />
                <span className="text-[11px] text-muted">Personalizing your prompt…</span>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder={`Let the words come — whatever's on your mind ${timeWord}…`}
              aria-label="Journal entry"
              className="w-full bg-transparent resize-none focus:outline-none"
              style={{ minHeight: 180, fontSize: 15, lineHeight: 1.8, color: "var(--foreground-secondary)" }}
            />

            {/* Attached photo preview */}
            {composeImage && (
              <div className="mt-4 relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={composeImage} alt="Attached to entry" style={{ maxHeight: 220, maxWidth: "100%", borderRadius: 12, display: "block" }} />
                <button
                  type="button"
                  onClick={() => setComposeImage(null)}
                  aria-label="Remove photo"
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                  style={{ background: "var(--oxblood-light)", color: "#fff", border: "none", lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Compose toolbar — add photo (hidden in burn mode; voice lives in the mic FAB) */}
            {!isBurn && (
              <div className="flex items-center flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px]"
                  style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: "0.5px solid var(--border-card)", color: "var(--foreground-muted)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                  {composeImage ? "Change photo" : "Add photo"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickJournalPhoto} className="hidden" />
              </div>
            )}
          </div>

          {/* MOOD */}
          <p className="text-[11px] uppercase font-bold mb-3 px-1" style={{ letterSpacing: "0.1em", color: "var(--foreground-faint)" }}>How the night felt</p>
          <div className="flex flex-wrap gap-2 mb-5 px-1">
            {MOOD_PALETTE.map((m) => {
              const active = selectedMoods.includes(m.word);
              return (
                <button
                  key={m.word}
                  aria-pressed={active}
                  onClick={() => setSelectedMoods((prev) => prev.includes(m.word) ? prev.filter((x) => x !== m.word) : [...prev, m.word])}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] transition-all"
                  style={active
                    ? { background: "color-mix(in srgb, var(--journal-accent) 16%, transparent)", border: "0.5px solid color-mix(in srgb, var(--journal-accent) 45%, transparent)", color: "var(--foreground)", fontWeight: 600 }
                    : { background: "color-mix(in srgb, var(--foreground) 4%, transparent)", border: "0.5px solid var(--border-card)", color: "var(--foreground-muted)" }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: MOOD_DOT[m.category] || "var(--journal-accent)" }} />
                  {m.word}
                </button>
              );
            })}
          </div>

          {/* DETAILS — real sky context (hidden in burn mode; nothing is kept) */}
          {!isBurn && (
            <>
              <p className="text-[11px] uppercase font-bold mb-3 px-1" style={{ letterSpacing: "0.1em", color: "var(--foreground-faint)" }}>Details</p>
              <div className="rounded-[18px] overflow-hidden mb-2" style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}>
                {[
                  { icon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />, label: "Moon", value: composeMoonSign || composeMoonLabel || "—", color: "var(--journal-accent)" },
                  { icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></>, label: "Mood", value: selectedMoods.length ? selectedMoods.join(", ") : "Tap above to set", color: "var(--sage-light)" },
                ].map((row, i) => (
                  <div key={row.label} className="flex items-center gap-3 px-4 py-3.5" style={i === 0 ? { borderBottom: "0.5px solid var(--border-card)" } : undefined}>
                    <span className="shrink-0 w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={row.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{row.icon}</svg>
                    </span>
                    <span className="flex-1 text-[13.5px]" style={{ color: "var(--foreground)" }}>{row.label}</span>
                    <span className="text-[13px] text-right" style={{ color: "var(--foreground-muted)" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Bottom toolbar — word count */}
              <div className="flex items-center pt-4 mt-2" style={{ borderTop: "0.5px solid var(--border-card)" }}>
                <span className="ml-auto text-[12px]" style={{ color: "var(--foreground-faint)" }}>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
              </div>
            </>
          )}
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

        {/* Mic FAB — opens the voice-to-text listening sheet */}
        {voiceSupported && !listening && burnStage === "idle" && (
          <button
            type="button"
            onClick={startListening}
            aria-label="Voice to text"
            className="fixed right-[18px] z-[30] w-14 h-14 rounded-full flex items-center justify-center"
            style={{ bottom: isBurn ? 30 : 98, boxShadow: "0 8px 22px -6px rgba(0,0,0,0.5)", background: isBurn ? "linear-gradient(180deg,#c46733,#a5451d)" : "var(--journal-accent)" }}
          >
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke={isBurn ? "#fdf1e6" : "var(--journal-on-accent)"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 19v3" /></svg>
          </button>
        )}

        {/* Listening sheet — voice-to-text */}
        {listening && (
          <div className="jt-overlay fixed inset-0 z-[45] flex items-end" style={{ background: "rgba(8,6,10,0.55)", backdropFilter: "blur(3px)" }} onClick={stopListening}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full box-border px-[22px] pt-4 pb-[30px]"
              style={{ background: "var(--background-card)", borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTop: "0.5px solid var(--border-card)", boxShadow: "0 -14px 40px -18px rgba(0,0,0,0.6)", animation: "jt-push 0.3s cubic-bezier(0.22,1,0.36,1)" }}
            >
              <div className="mx-auto mb-5 rounded-full" style={{ width: 40, height: 4, background: "color-mix(in srgb, var(--foreground) 12%, transparent)" }} />
              <div className="flex flex-col items-center gap-[5px] mb-5">
                <div className="relative flex items-center justify-center mb-2" style={{ width: 76, height: 76 }}>
                  <div className="absolute rounded-full" style={{ inset: 6, background: "var(--journal-accent)", opacity: 0.35, animation: "jt-pulse 1.6s ease-out infinite" }} />
                  <div className="absolute rounded-full" style={{ inset: 6, background: "var(--journal-accent)", opacity: 0.35, animation: "jt-pulse 1.6s ease-out 0.8s infinite" }} />
                  <div className="relative rounded-full flex items-center justify-center" style={{ width: 60, height: 60, background: "var(--journal-accent)" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--journal-on-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 19v3" /></svg>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: "var(--foreground)" }}>Listening&hellip;</div>
                <div className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>Speak naturally &mdash; tap stop when you&rsquo;re done.</div>
              </div>
              <div className="flex items-center justify-center gap-[5px] mb-[22px]" style={{ height: 44 }}>
                {Array.from({ length: 9 }).map((_, i) => {
                  const dur = (0.62 + (i % 4) * 0.13).toFixed(2);
                  const del = ((i % 5) * 0.09).toFixed(2);
                  const h = 16 + (i % 3) * 7;
                  return <span key={i} className="inline-block rounded-full" style={{ width: 4, height: h, background: "var(--journal-accent)", transformOrigin: "center", animation: `jt-bar ${dur}s ease-in-out ${del}s infinite` }} />;
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={stopListening} className="flex-1 py-3.5 rounded-full text-[12px] font-bold uppercase" style={{ letterSpacing: "0.08em", border: "0.5px solid var(--border-card)", background: "color-mix(in srgb, var(--foreground) 5%, transparent)", color: "var(--foreground-muted)" }}>Cancel</button>
                <button onClick={stopListening} className="py-3.5 rounded-full text-[12px] font-extrabold uppercase" style={{ flex: "2 1 0", letterSpacing: "0.08em", border: "none", background: "var(--journal-accent)", color: "var(--journal-on-accent)" }}>Stop &amp; insert</button>
              </div>
            </div>
          </div>
        )}

        {/* Burn ceremony — candle rises, holds, dims; embers drift up */}
        {burnStage === "burning" && (
          <div className="jt-overlay fixed inset-0 z-[70] overflow-hidden pointer-events-none">
            <div aria-hidden className="absolute inset-0" style={{ background: "#08060a", opacity: 0, animation: "jt-fade-slow 0.9s ease-out forwards" }} />
            <div aria-hidden className="absolute" style={{ left: "50%", bottom: 14, transform: "translateX(-50%)", width: 138, height: 244, opacity: 0, animation: "jt-candlelife 3s ease-in-out forwards" }}>
              <div className="absolute" style={{ left: "50%", top: 20, width: 230, height: 230, borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%, rgba(255,166,76,0.5), transparent 66%)", animation: "jt-glowpulse 2.6s ease-in-out infinite" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
              width={463}
              height={815} src="/images/candle.webp" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transformOrigin: "50% 100%", animation: "jt-candleflick 2.4s ease-in-out infinite", filter: "drop-shadow(0 0 18px rgba(255,150,60,0.32))" }} />
            </div>
            <div aria-hidden className="absolute inset-0 overflow-hidden" style={{ opacity: 0, animation: "jt-fade-slow 0.7s ease-out 1.2s both, jt-fade-out 0.7s ease-in 2.4s forwards" }}>
              {Array.from({ length: 16 }).map((_, i) => {
                const x = 44 + ((i * 5) % 13);
                const sz = 1.5 + (i % 3);
                const dur = 1.6 + (i % 5) * 0.24;
                const delay = ((i % 8) * 0.16).toFixed(2);
                const bottom = 188 + (i % 5) * 9;
                const col = i % 3 ? "#ffcf8a" : "#ff9a3d";
                return <span key={i} className="absolute rounded-full" style={{ left: `${x}%`, bottom, width: sz, height: sz, background: col, boxShadow: `0 0 ${5 + sz}px 1px rgba(233,112,52,0.8)`, animation: `jt-spark ${dur}s ease-out ${delay}s infinite` }} />;
              })}
            </div>
          </div>
        )}

        {/* Release screen — "You are released." */}
        {burnStage === "gone" && (
          <div className="jt-overlay fixed inset-0 z-[80] flex flex-col items-center justify-center px-10 text-center" style={{ background: "#0a0604" }}>
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(110% 68% at 50% 46%, rgba(96,44,18,0.55), transparent 62%)", animation: "jt-glowfade 2.4s ease-out both" }} />
            <div className="relative" style={{ fontFamily: "var(--font-script)", fontSize: 40, lineHeight: 1.08, color: "#e8965a", marginBottom: 16, animation: "jt-fade-in 1.3s ease-out 0.45s both" }}>You are released.</div>
            <p className="relative m-0 mb-10" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: "#d8ceb6", maxWidth: 270, textWrap: "pretty", animation: "jt-fade-in 1.3s ease-out 0.85s both" }}>Carried off with the smoke. Nothing was kept, and nothing is owed.</p>
            <div className="relative flex flex-col gap-3 w-full" style={{ maxWidth: 260, animation: "jt-fade-in 1.2s ease-out 1.4s both" }}>
              <button onClick={resetBurn} className="w-full py-3.5 rounded-full text-[12px] font-bold uppercase" style={{ letterSpacing: "0.1em", border: "0.5px solid rgba(255,180,120,0.28)", background: "transparent", color: "#e8b48a" }}>Write another</button>
              <button onClick={closeCompose} className="w-full py-3.5 rounded-full text-[12px] font-bold uppercase" style={{ letterSpacing: "0.1em", border: "none", background: "rgba(255,240,220,0.08)", color: "#b78d63" }}>Done</button>
            </div>
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

    const entryDate = new Date(selectedEntry.created_at || selectedEntry.date);
    const eMonth = entryDate.toLocaleDateString("en-US", { month: "long" });
    const eWeekday = entryDate.toLocaleDateString("en-US", { weekday: "long" });
    const moonLabel = tags?.moonPhase
      ? tags.moonPhase.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : (getMoonPhase(entryDate)?.label || "");
    const moods = (selectedEntry.mood || "").split(",").map((m) => m.trim()).filter(Boolean);

    return (
      <main className="min-h-full flex flex-col">
        <div className="max-w-lg lg:max-w-2xl mx-auto w-full flex flex-col flex-1">
        {/* Header — back · Edit/Delete */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "0.5px solid var(--border-card)" }}>
          <button onClick={() => { setConfirmingDelete(false); setEditingEntry(false); setView("home"); }} aria-label="Back" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: "0.5px solid var(--border-card)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <div className="flex items-center gap-2">
            {editingEntry ? (
              <>
                <button onClick={() => setEditingEntry(false)} className="px-3.5 py-1.5 rounded-full text-[12px] font-medium" style={{ color: "var(--foreground-muted)", border: "0.5px solid var(--border-card)" }}>Cancel</button>
                <button onClick={handleSaveEdit} className="px-4 py-1.5 rounded-full text-[12px] font-bold" style={{ background: "var(--journal-accent)", color: "var(--journal-on-accent)", letterSpacing: "0.04em" }}>Save</button>
              </>
            ) : confirmingDelete ? (
              <>
                <button onClick={() => setConfirmingDelete(false)} className="px-3.5 py-1.5 rounded-full text-[12px]" style={{ color: "var(--foreground-muted)", border: "0.5px solid var(--border-card)" }}>Cancel</button>
                <button onClick={handleDeleteEntry} className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold" style={{ background: "color-mix(in srgb, var(--oxblood-light) 16%, transparent)", color: "var(--oxblood-light)" }}>Delete for good?</button>
              </>
            ) : (
              <>
                <button onClick={() => { setEditText(entryText); setEditingEntry(true); }} className="px-3.5 py-1.5 rounded-full text-[12px]" style={{ color: "var(--foreground-secondary)", border: "0.5px solid var(--border-card)" }}>Edit</button>
                <button onClick={() => setConfirmingDelete(true)} aria-label="Delete" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ border: "0.5px solid var(--border-card)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--oxblood-light)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-10">
          {/* Date */}
          <div className="flex items-baseline gap-3 mb-4 px-1">
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 46, fontWeight: 600, lineHeight: 1, color: "var(--foreground)" }}>{entryDate.getDate()}</span>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--foreground)" }}>{eMonth}</div>
              <div className="text-[12px]" style={{ color: "var(--foreground-muted)" }}>{eWeekday} &middot; {entryDate.getFullYear()}</div>
              {moonLabel && (
                <div className="inline-flex items-center gap-1.5 mt-1 text-[11.5px]" style={{ color: "var(--foreground-muted)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--journal-accent)" strokeWidth="1.5"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
                  {moonLabel}
                </div>
              )}
            </div>
          </div>

          {/* WRITING SHEET (read-only) */}
          <div className="rounded-[20px] p-[20px_18px] mb-5" style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)", boxShadow: "0 10px 34px -20px rgba(0,0,0,0.55)" }}>
            {selectedEntry.title && (
              <p className="pb-3.5 mb-4" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--foreground)", borderBottom: "0.5px solid var(--border-card)" }}>{selectedEntry.title}</p>
            )}
            {selectedEntry.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedEntry.image} alt="Entry photo" style={{ width: "100%", borderRadius: 12, marginBottom: 16, display: "block" }} />
            )}
            {selectedEntry.prompt_text && (
              <div style={{ borderLeft: "2px solid var(--journal-accent)", padding: "0 0 0 12px", margin: "2px 0 16px" }}>
                <p style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: 16, lineHeight: 1.45, color: "var(--foreground-muted)", margin: 0 }}>{selectedEntry.prompt_text}</p>
              </div>
            )}
            {editingEntry ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                aria-label="Edit journal entry"
                className="w-full bg-transparent resize-none focus:outline-none"
                style={{ minHeight: 200, fontSize: 15, lineHeight: 1.8, color: "var(--foreground-secondary)" }}
                autoFocus
              />
            ) : (
              <p className="whitespace-pre-wrap" style={{ fontSize: 15, lineHeight: 1.8, color: "var(--foreground-secondary)", margin: 0 }}>{entryText}</p>
            )}
          </div>

          {/* MOOD */}
          {moods.length > 0 && (
            <>
              <p className="text-[11px] uppercase font-bold mb-3 px-1" style={{ letterSpacing: "0.1em", color: "var(--foreground-faint)" }}>How the night felt</p>
              <div className="flex flex-wrap gap-2 mb-5 px-1">
                {moods.map((mo) => {
                  const cat = MOOD_PALETTE.find((p) => p.word.toLowerCase() === mo.toLowerCase())?.category;
                  return (
                    <span key={mo} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold" style={{ background: "color-mix(in srgb, var(--journal-accent) 16%, transparent)", border: "0.5px solid color-mix(in srgb, var(--journal-accent) 45%, transparent)", color: "var(--foreground)" }}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: (cat && MOOD_DOT[cat]) || "var(--journal-accent)" }} />
                      {mo}
                    </span>
                  );
                })}
              </div>
            </>
          )}

          {/* DETAILS — sky context */}
          <p className="text-[11px] uppercase font-bold mb-3 px-1" style={{ letterSpacing: "0.1em", color: "var(--foreground-faint)" }}>Details</p>
          <div className="rounded-[18px] overflow-hidden" style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}>
            {[
              ...(moonLabel ? [{ label: "Moon", value: moonLabel, color: "var(--journal-accent)", icon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /> }] : []),
              ...(tags?.planetaryDay ? [{ label: "Day", value: `${tags.planetaryDay} day`, color: "var(--sage-light)", icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></> }] : []),
            ].map((row, i, arr) => (
              <div key={row.label} className="flex items-center gap-3 px-4 py-3.5" style={i < arr.length - 1 ? { borderBottom: "0.5px solid var(--border-card)" } : undefined}>
                <span className="shrink-0 w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={row.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{row.icon}</svg>
                </span>
                <span className="flex-1 text-[13.5px]" style={{ color: "var(--foreground)" }}>{row.label}</span>
                <span className="text-[13px] text-right" style={{ color: "var(--foreground-muted)" }}>{row.value}</span>
              </div>
            ))}
          </div>
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

  // ─── All Entries View — archive grouped by month, filterable by type ────────
  if (view === "all") {
    const allFiltered = feed.filter((f) => allFilter === "all" || f.type === allFilter);
    // Group by "Month Year", preserving the feed's newest-first order.
    const order: string[] = [];
    const byMonth: Record<string, typeof allFiltered> = {};
    allFiltered.forEach((f) => {
      const key = f.date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!byMonth[key]) { byMonth[key] = []; order.push(key); }
      byMonth[key].push(f);
    });
    const filterChips: ("all" | EntryType)[] = ["all", "ritual", "tarot", "prompt", "heavy"];
    const chipLabel: Record<string, string> = { all: "All", ritual: "Ritual", tarot: "Tarot", prompt: "Horoscope", heavy: "Free" };
    const cardBg = "var(--background-card)", cardBd = "var(--border-card)";
    return (
      <main className="jt-overlay min-h-full flex flex-col" style={{ animation: "jt-push 0.28s cubic-bezier(0.22,1,0.36,1)" }}>
        <div className="max-w-lg lg:max-w-2xl mx-auto w-full flex flex-col flex-1">
          {/* Header */}
          <div className="px-4 pt-4 pb-3" style={{ borderBottom: `0.5px solid ${cardBd}` }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setView("home")} aria-label="Back" className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: `0.5px solid ${cardBd}` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <div className="min-w-0">
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--foreground)", lineHeight: 1 }}>All entries</div>
                <div className="text-[11.5px] mt-[3px]" style={{ color: "var(--foreground-muted)" }}>{allFiltered.length} {allFiltered.length === 1 ? "entry" : "entries"}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-[15px] overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {filterChips.map((k) => {
                const on = allFilter === k;
                const dot = k === "all" ? "var(--journal-accent)" : TYPE_COLOR[k];
                return (
                  <button key={k} onClick={() => setAllFilter(k)} className="shrink-0 inline-flex items-center gap-1.5 px-[13px] py-[7px] rounded-full text-[11.5px] font-semibold whitespace-nowrap"
                    style={on
                      ? { background: "color-mix(in srgb, var(--journal-accent) 14%, transparent)", border: "0.5px solid color-mix(in srgb, var(--journal-accent) 45%, transparent)", color: "var(--foreground)" }
                      : { background: "color-mix(in srgb, var(--foreground) 4%, transparent)", border: `0.5px solid ${cardBd}`, color: "var(--foreground-muted)" }}>
                    <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: dot }} />
                    {chipLabel[k]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grouped list */}
          <div className="flex-1 overflow-y-auto px-5 pt-1.5 pb-10">
            {allFiltered.length === 0 ? (
              <div className="rounded-2xl p-8 text-center mt-4" style={{ background: cardBg, border: `0.5px solid ${cardBd}` }}>
                <p className="text-[14px]" style={{ color: "var(--foreground-muted)" }}>No entries in this filter yet.</p>
              </div>
            ) : order.map((month) => (
              <div key={month}>
                <div className="flex items-baseline justify-between mt-4 mb-3">
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 500, color: "var(--foreground)", margin: 0 }}>{month.replace(/ \d{4}$/, "")}</h3>
                  <span className="text-[11px]" style={{ letterSpacing: "0.04em", color: "var(--foreground-faint)" }}>{byMonth[month].length} {byMonth[month].length === 1 ? "entry" : "entries"}</span>
                </div>
                <div className="flex flex-col gap-[11px]">
                  {byMonth[month].map((f) => (
                    <button key={f.key} onClick={() => { if (f.entry) openEntry(f.entry); }} className="flex gap-3.5 p-[15px] rounded-2xl text-left" style={{ background: cardBg, border: `0.5px solid ${cardBd}` }}>
                      <div className="shrink-0 w-11 text-center">
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 600, color: "var(--foreground)", lineHeight: 1 }}>{f.date.getDate()}</div>
                        <div className="text-[10px] uppercase mt-0.5" style={{ letterSpacing: "0.08em", color: "var(--foreground-muted)" }}>{f.date.toLocaleDateString("en-US", { weekday: "short" })}</div>
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
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ─── Home View (default) — matches the "Journal - Today" Claude design ──────
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

  // month calendar — calOffset steps through months (0 = current, prev/next chevrons)
  const calDate = new Date(nowD.getFullYear(), nowD.getMonth() + calOffset, 1);
  const mYear = calDate.getFullYear(), mMonth = calDate.getMonth();
  const firstDow = new Date(mYear, mMonth, 1).getDay();
  const daysInMonth = new Date(mYear, mMonth + 1, 0).getDate();
  const dayType: Record<number, EntryType> = {};
  feed.forEach((f) => { if (f.date.getFullYear() === mYear && f.date.getMonth() === mMonth && !(f.date.getDate() in dayType)) dayType[f.date.getDate()] = f.type; });
  const monthEntryCount = Object.keys(dayType).length;
  const monthName = calDate.toLocaleDateString("en-US", { month: "long" });
  const isCurrentMonth = calOffset === 0;
  const calCells: ({ day: number; type: EntryType | null; isToday: boolean } | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, type: dayType[i + 1] ?? null, isToday: isCurrentMonth && i + 1 === nowD.getDate() })),
  ];

  // stats ring
  const counts: Record<EntryType, number> = { ritual: 0, tarot: 0, prompt: 0, heavy: 0 };
  feed.forEach((f) => { counts[f.type]++; });
  const totalKept = feed.length;
  const ringOrder: EntryType[] = ["ritual", "tarot", "prompt", "heavy"];
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

  // Encouraging banner counts "bright" days in the current month.
  const monthCount = feed.filter((f) => f.date.getFullYear() === nowD.getFullYear() && f.date.getMonth() === nowD.getMonth()).length;
  const cheer = monthCount >= 5;
  const recent = feed.slice(0, 4);
  const cardBg = "var(--background-card)";
  const cardBd = "var(--border-card)";
  const promptText = currentPrompt?.text || todayPrompt?.text || "What are you ready to set down before the new moon?";

  // Context chips for the hero prompt — real tarot pull + moon sign when present.
  const heroCardName = pullHistory[0]?.cards?.find((c) => c.name)?.name;

  return (
    <main className="min-h-full">
      <div className="max-w-lg mx-auto px-5 py-6 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p style={{ fontFamily: "var(--font-script)", fontSize: 32, lineHeight: 1, color: "var(--journal-accent)", margin: "0 0 2px" }}>Your reflections,</p>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1, color: "var(--foreground)" }}>Journal</h1>
          </div>
          {streak > 0 && (
            <span className="flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-full" style={{ background: "color-mix(in srgb, var(--journal-accent) 14%, transparent)", border: "1px solid color-mix(in srgb, var(--journal-accent) 40%, transparent)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--journal-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              <span className="text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{streak}</span>
            </span>
          )}
        </div>

        {/* WEEK STRIP */}
        <div className="flex gap-[7px] mb-[22px]">
          {weekStrip.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 py-[10px] rounded-2xl" style={{
              background: d.isToday ? "var(--journal-accent)" : cardBg,
              border: d.isToday ? "none" : `0.5px solid ${cardBd}`,
            }}>
              <span className="text-[10px] font-semibold" style={{ color: d.isToday ? "var(--journal-on-accent)" : "var(--foreground-muted)" }}>{d.dow}</span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 600, color: d.isToday ? "var(--journal-on-accent)" : "var(--foreground)" }}>{d.num}</span>
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: d.type ? (d.isToday ? "var(--journal-on-accent)" : TYPE_COLOR[d.type]) : "transparent" }} />
            </div>
          ))}
        </div>

        {/* ENCOURAGING BANNER */}
        {cheer && (
          <div className="relative overflow-hidden rounded-[20px] p-[18px_20px] mb-4" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--journal-accent) 22%, var(--background-card)), var(--background-card))", border: `0.5px solid color-mix(in srgb, var(--journal-accent) 24%, transparent)` }}>
            <div className="flex items-center gap-3.5">
              <div className="shrink-0 w-[46px] h-[46px] rounded-[14px] flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--journal-accent) 14%, transparent)", border: "0.5px solid color-mix(in srgb, var(--journal-accent) 40%, transparent)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--journal-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8z" /></svg>
              </div>
              <div className="min-w-0">
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--foreground)", lineHeight: 1.1 }}>{monthCount} bright {monthCount === 1 ? "day" : "days"} this month</div>
                <div className="text-[12.5px] mt-1" style={{ lineHeight: 1.5, color: "var(--foreground-secondary)" }}>Your reflections have leaned toward the light lately — keep the practice going.</div>
              </div>
            </div>
          </div>
        )}

        {/* HERO PROMPT CARD */}
        <div className="relative overflow-hidden rounded-[22px] p-[22px] mb-4" style={{ background: "linear-gradient(165deg, color-mix(in srgb, var(--journal-accent) 20%, var(--background-card)), var(--background-card))", border: `0.5px solid color-mix(in srgb, var(--journal-accent) 22%, transparent)` }}>
          <div aria-hidden className="absolute pointer-events-none" style={{ top: -40, right: -30, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--journal-accent) 14%, transparent), transparent 68%)" }} />
          <div className="flex items-center gap-1.5 mb-3 relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--journal-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /><circle cx="12" cy="12" r="3.4" /></svg>
            <span className="text-[10px] uppercase font-bold" style={{ letterSpacing: "0.16em", color: "var(--journal-accent)" }}>Tonight&rsquo;s prompt</span>
          </div>
          {(heroCardName || composeMoonSign) && (
            <div className="flex flex-wrap gap-2 mb-[15px] relative">
              {heroCardName && (
                <span className="inline-flex items-center gap-1.5 px-[11px] py-1.5 rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 4%, transparent)", border: "0.5px solid var(--border-card)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--type-tarot)" }} />
                  <span className="text-[10.5px]" style={{ color: "var(--foreground-secondary)" }}>Today&rsquo;s card · {heroCardName}</span>
                </span>
              )}
              {composeMoonSign && (
                <span className="inline-flex items-center gap-1.5 px-[11px] py-1.5 rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 4%, transparent)", border: "0.5px solid var(--border-card)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--type-prompt)" }} />
                  <span className="text-[10.5px]" style={{ color: "var(--foreground-secondary)" }}>{composeMoonSign}</span>
                </span>
              )}
            </div>
          )}
          <p style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 500, fontSize: 22, fontStyle: "italic", lineHeight: 1.4, color: "var(--foreground)", margin: "0 0 20px", position: "relative", textWrap: "pretty" }}>{promptText}</p>
          <button onClick={startCompose} className="w-full py-[15px] rounded-full text-[12.5px] font-bold uppercase" style={{ letterSpacing: "0.1em", background: "var(--journal-accent)", color: "var(--journal-on-accent)", border: "none" }}>Begin writing</button>
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
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCalOffset((o) => o - 1)} aria-label="Previous month" className="w-[30px] h-[30px] rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: "0.5px solid var(--border-card)", color: "var(--foreground-muted)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <span className="text-center" style={{ fontFamily: "var(--font-heading)", fontSize: 14, color: "var(--foreground)", minWidth: 44 }}>{monthName}</span>
              <button onClick={() => setCalOffset((o) => Math.min(0, o + 1))} aria-label="Next month" disabled={isCurrentMonth} className="w-[30px] h-[30px] rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: "0.5px solid var(--border-card)", color: "var(--foreground-muted)", opacity: isCurrentMonth ? 0.35 : 1 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {DOW.map((w, i) => <div key={i} className="text-center text-[10px] font-semibold" style={{ color: "var(--foreground-faint)" }}>{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calCells.map((c, i) => {
              const dayEntry = c ? feed.find((f) => f.entry && f.date.getFullYear() === mYear && f.date.getMonth() === mMonth && f.date.getDate() === c.day)?.entry : null;
              return (
                <button key={i} type="button" disabled={!dayEntry} onClick={() => { if (dayEntry) openEntry(dayEntry); }} className="aspect-square flex flex-col items-center justify-center gap-[3px] rounded-[10px]" style={c && c.isToday ? { background: "color-mix(in srgb, var(--journal-accent) 14%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--journal-accent) 50%, transparent)" } : undefined}>
                  {c && <>
                    <span className="text-[13px]" style={{ fontWeight: c.isToday ? 700 : c.type ? 600 : 400, color: c.isToday ? "var(--journal-accent)" : c.type ? "var(--foreground)" : "var(--foreground-faint)" }}>{c.day}</span>
                    <span className="w-[5px] h-[5px] rounded-full" style={{ background: c.type ? TYPE_COLOR[c.type] : "transparent" }} />
                  </>}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3.5 mt-[18px] pt-4" style={{ borderTop: `0.5px solid ${cardBd}` }}>
            {([["Ritual", "ritual"], ["Tarot", "tarot"], ["Horoscope", "prompt"]] as [string, EntryType][]).map(([label, t]) => (
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
          {feed.length > 0 && (
            <button onClick={() => { setAllFilter("all"); setView("all"); }} className="text-[11.5px] font-semibold" style={{ letterSpacing: "0.02em", color: "var(--journal-accent)" }}>
              All entries &rsaquo;
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: cardBg, border: `0.5px solid ${cardBd}` }}>
            <p className="text-[14px]" style={{ color: "var(--foreground-muted)" }}>No entries yet — your first reflection starts above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[11px]">
            {recent.map((f) => (
              <button key={f.key} onClick={() => { if (f.entry) openEntry(f.entry); }} className="flex gap-3.5 p-[15px] rounded-2xl text-left" style={{ background: cardBg, border: `0.5px solid ${cardBd}` }}>
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