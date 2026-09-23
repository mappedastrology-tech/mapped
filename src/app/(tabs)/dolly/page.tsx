"use client";

/**
 * Dolly Tab — AI life coach powered by Claude + your full chart.
 *
 * Streaming chat interface. Dolly knows your birth chart, current transits,
 * and the people in your Maps. Conversations auto-save to Supabase per day.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { authedFetch } from "@/lib/authedFetch";
import { usePaywall } from "@/hooks/usePaywall";
import { useTier } from "@/components/TierProvider";
import { incrementDollyUsage } from "@/lib/tier";
import { getCachedLocation, fetchUserLocation } from "@/lib/userLocation";
import DollyAvatar from "@/components/DollyAvatar";
import { gatherCrossFeatureContext } from "@/lib/dollyCrossFeature";
import { useStickToBottom } from "@/lib/useStickToBottom";
import { AI_UPGRADE_MESSAGE } from "@/lib/ai/messages";
import { detectCrisis, crisisAnnouncement } from "@/lib/crisis";
import CrisisCard from "@/components/CrisisCard";
import { useDialogKeys } from "@/lib/useDialogKeys";
import { useKeyboardInset } from "@/lib/useKeyboardInset";
import { parseDollyReply, dollyBody, type DollyTagKind } from "@/lib/dollyReply";
import { getMoonPhaseLabel, getCurrentMoonSign } from "@/lib/astro/currentSky";
import { chartSystemFromRow, transitParams } from "@/lib/astro/vedic/system";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  /**
   * A rule, not a reply.
   *
   * Hitting the daily limit, running out of this month's AI time, or not
   * being on a paid plan are all deliberate business rules — but they used to
   * arrive as `Something went wrong: <the server's message>` inside Dolly's
   * own plum speech bubble. So "Dolly comes with Mapped+" was delivered as a
   * malfunction spoken by the character, and a subscriber who hit their limit
   * was told the app was broken rather than that they had reached a limit.
   * That generates refund requests, not upgrades.
   *
   * Notices render as a plain system line instead, and never get a prefix.
   */
  notice?: boolean;
  /** Renders the local support card instead of any text. See lib/crisis.ts. */
  crisis?: boolean;
}

interface ChartContext {
  bigThree?: { sun: string; moon: string; rising: string };
  planets?: { name: string; sign: string; position: number; house: string | null; retrograde: boolean }[];
  houses?: { number: number; sign: string; position: number }[];
  specialPoints?: { name: string; sign: string; position: number; house: string | null }[];
  birthDate?: string;
  birthTime?: string;
  ascendant?: { sign: string; position: number } | null;
  midheaven?: { sign: string; position: number } | null;
  // Which zodiac/houses the positions are in — so Dolly never mixes systems.
  zodiacSystem?: string;
  ayanamsa?: string;
  houseSystem?: string;
  nodeType?: string;
}

interface TransitContext {
  transitDate?: string;
  transitAspects?: {
    transitPlanet: string;
    transitSign: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
    transitHouse: number;
  }[];
}

interface ConnectionContext {
  name: string;
  relationship: string;
  category: string;
  bigThree?: { sun: string; moon: string; rising: string } | null;
  planets?: { name: string; sign: string; position: number; house: string | null; retrograde: boolean }[] | null;
  houses?: { number: number; sign: string; position: number }[] | null;
}

/* ═══════════════════════════════════════════
   Suggested prompts
   ═══════════════════════════════════════════ */

/**
 * Four, not six.
 *
 * Six did not fit: at 390px roughly four and a half cleared the composer, so
 * the last two sat below the fold with nothing to suggest they existed —
 * which is a worse offer than four that can all be seen. These four also
 * cover all three sources, so the colour key opposite them means something on
 * first sight.
 */
const STARTER_PROMPTS: { text: string; kind: DollyTagKind }[] = [
  { text: "What should I know about myself right now?", kind: "chart" },
  { text: "What's the sky doing to me today?", kind: "sky" },
  { text: "What patterns do I keep repeating?", kind: "card" },
  { text: "What's my biggest blind spot?", kind: "chart" },
];

/** Long enough that a divider means "you came back", not "you paused". */
const GAP_MS = 60 * 60 * 1000;

/** "Today, 9:14 PM" / "Tue 14 Oct, 9:14 PM". */
function formatThreadStamp(ts: number): string {
  const d = new Date(ts);
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return `Today, ${time}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
}

/**
 * Where a line of a reading came from — her chart, the live sky, or a card
 * she pulled. Two sets, because the same three kinds are drawn on two very
 * different surfaces.
 *
 * The old single map did not work as either. `chart` was --journal-accent
 * (#b8a4e0) and `sky` was --lavender (#B8A0D2): the same colour to the eye,
 * so "Saturn square Moon" and "Moon in Scorpio" carried indistinguishable
 * dots. `card` pointed at --rose, which is defined nowhere in the codebase
 * and so always fell through to its hardcoded pink — a colour from no
 * palette in Mapped.
 */

/** On the page: starter-card dots, on cream or on near-black. Theme-aware. */
const TYPE_COLOR: Record<DollyTagKind, string> = {
  chart: "var(--dl-src-chart)",
  sky: "var(--dl-src-sky)",
  card: "var(--dl-src-card)",
};

/**
 * Inside Dolly's bubble. Fixed, not theme-aware, because her bubble is dark
 * plum in BOTH themes — the light-theme values would be dark-on-dark there.
 * Measured against the gradient's midpoint: 6.8, 6.5 and 6.5 to 1.
 */
const TYPE_COLOR_ON_PLUM: Record<DollyTagKind, string> = {
  chart: "#c9a961",
  sky: "#B8A0D2",
  card: "#d99b7a",
};

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

interface PastConversation {
  id: string;
  day: string;       // YYYY-MM-DD the conversation was started
  messages: Message[];
  updated_at: string;
}

// Generate a unique conversation ID
function generateConvoId(): string {
  return `convo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Return user-scoped Dolly conversations localStorage key. */
function getDollyLsKey(uid?: string | null): string {
  const base = "mapped:dolly-conversations";
  return uid ? `${base}:${uid}` : base;
}

/**
 * Cache of AI-generated chat summaries, so we summarize each chat only once.
 *
 * The key carries a version. v2 retires every title generated before replies
 * were stripped of their meta line — those were written from raw JSON and read
 * like it, and a cached bad title would otherwise never be revisited.
 */
function getDollySummaryKey(uid?: string | null): string {
  const base = "mapped:dolly-summaries:v2";
  return uid ? `${base}:${uid}` : base;
}

export default function DollyTab() {
  const { gateWithReason, PaywallModal, setShowPlans } = usePaywall();
  // iOS Safari resizes neither the layout viewport nor the WebView, so the
  // composer would sit under the keyboard. See useKeyboardInset.
  const keyboardInset = useKeyboardInset();
  const { tier } = useTier();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [chart, setChart] = useState<ChartContext | null>(null);
  const [transits, setTransits] = useState<TransitContext | null>(null);
  const [connections, setConnections] = useState<ConnectionContext[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  /** What the live region says once a reply lands. See the region itself. */
  const [announcement, setAnnouncement] = useState("");
  /** Shown when the paywall is in its 24h cooldown — see handleSend. */
  const [upgradeNotice, setUpgradeNotice] = useState(false);

  // History drawer state
  const [showHistory, setShowHistory] = useState(false);
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [pastConversations, setPastConversations] = useState<PastConversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewingDay, setViewingDay] = useState<string | null>(null); // which day's chat is loaded
  /**
   * The delete about to happen, pending confirmation.
   *
   * Single delete used the browser's confirm(), which inside Capacitor renders
   * the system alert titled "localhost says…" — the app's own name for itself
   * leaking into the most alarming dialog it shows. Bulk delete had no
   * confirmation at all: one tap destroyed every selected reading with no
   * undo. Both now go through the sheet pattern this screen already uses.
   */
  const [pendingDelete, setPendingDelete] = useState<
    { kind: "one"; convo: PastConversation } | { kind: "many"; count: number } | null
  >(null);

  /** The last question actually sent, so a failed turn can be retried
   *  without the reader retyping it. */
  const lastAskRef = useRef<string | null>(null);
  const leaveRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** True when the 90s safety net fired, so a timeout can be told apart from
   *  the user starting a new chat — one deserves an explanation, one doesn't. */
  const timedOutRef = useRef(false);
  // The active conversation's canonical id, kept in a ref so saves within a
  // session always reuse the same id (state updates are async).
  const conversationIdRef = useRef<string | null>(null);

  // The thread follows new content only while the reader is already at the
  // bottom. Scroll up mid-reply and the position holds while Dolly keeps
  // generating underneath — see useStickToBottom for why scrollIntoView, which
  // this replaces, could never do that.
  const { ref: threadRef, pinned, scrollToBottom } = useStickToBottom<HTMLDivElement>(messages, messages.length > 0);

  // Load chart data, transits, connections, and saved conversation
  useEffect(() => {
    async function loadContext() {
      let userId: string | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          userId = session.user.id;
          setCurrentUserId(userId);
        }
      } catch { /* continue without auth */ }

      if (!userId) {
        // Try loading from sessionStorage chart
        try {
          const saved = typeof window !== "undefined" ? sessionStorage.getItem("chartResult") : null;
          if (saved) {
            const parsed = JSON.parse(saved);
            setChart({
              bigThree: parsed.bigThree,
              planets: parsed.planets,
              houses: parsed.houses,
              specialPoints: parsed.specialPoints || parsed.special_points,
              birthDate: parsed.birthDate || parsed.birth_date,
              birthTime: parsed.birthTime || parsed.birth_time,
            });
            setUserName(parsed.name || "");
          }
        } catch { /* ignore */ }
        setIsLoading(false);

        // Check for "Go deeper" context even without auth
        try {
          const ctx = sessionStorage.getItem("dolly-context");
          if (ctx) {
            sessionStorage.removeItem("dolly-context");
            setPendingContext(ctx);
          }
        } catch { /* ignore */ }
        return;
      }

      // Load chart from Supabase
      const { data: chartData } = await supabase
        .from("charts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (chartData) {
        const system = chartSystemFromRow(chartData);
        setChart({
          bigThree: chartData.big_three,
          planets: chartData.planets || [],
          houses: chartData.houses || [],
          specialPoints: chartData.special_points || [],
          birthDate: chartData.birth_date,
          birthTime: chartData.birth_time,
          ascendant: chartData.ascendant || null,
          midheaven: chartData.midheaven || null,
          ...system,
        });
        setUserName(chartData.name || "");

        // Fetch current transits
        try {
          const today = new Date().toISOString().split("T")[0];
          const loc = getCachedLocation(userId) ?? (await fetchUserLocation(userId));
          const res = await fetch("/api/transits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              natalPlanets: chartData.planets || [],
              natalHouses: chartData.houses || [],
              transitDate: today,
              latitude: chartData.latitude ?? loc?.lat,
              longitude: chartData.longitude ?? loc?.lng,
              ...transitParams(system),
            }),
          });
          if (res.ok) {
            const transitData = await res.json();
            setTransits(transitData);
          }
        } catch (err) {
          console.error("Transit fetch for Dolly:", err);
        }
      }

      // Load connections for Maps context (include full chart data)
      const { data: conns } = await supabase
        .from("connections")
        .select("name, relationship, category, big_three, planets, houses")
        .eq("user_id", userId);

      if (conns) {
        setConnections(conns.map(c => ({
          name: c.name,
          relationship: c.relationship,
          category: c.category,
          bigThree: c.big_three,
          planets: c.planets,
          houses: c.houses,
        })));
      }

      // Start fresh each time — don't auto-load previous conversations.
      // History is browsable via the chat list.
      setIsLoading(false);

      // Check if we were sent here with context (e.g., "Go deeper" from horoscope)
      try {
        const ctx = sessionStorage.getItem("dolly-context");
        if (ctx) {
          sessionStorage.removeItem("dolly-context");
          setPendingContext(ctx);
        }
      } catch { /* ignore */ }
    }

    loadContext();
  }, []);

  // Auto-send pending context from horoscope "Go deeper"
  const [pendingContext, setPendingContext] = useState<string | null>(null);
  useEffect(() => {
    if (pendingContext && !isLoading && !isStreaming && messages.length === 0) {
      handleSend(pendingContext);
      setPendingContext(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingContext, isLoading]);

  // Save conversation — one row per user/day, mirrored to localStorage under
  // the same canonical id so a chat never appears twice in history.
  const saveConversation = useCallback(async (msgs: Message[]) => {
    if (!msgs.length) return;

    const todayKey = new Date().toISOString().split("T")[0];
    const day = viewingDay || todayKey;
    let id = conversationIdRef.current;

    // Supabase first (when signed in): upsert on (user_id, day) so we always
    // reuse one canonical id per day instead of inserting a new mismatched row.
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from("dolly_conversations")
          .upsert(
            { user_id: session.user.id, day, messages: msgs, updated_at: new Date().toISOString() },
            { onConflict: "user_id,day" }
          )
          .select("id")
          .single();
        if (!error && data?.id) id = data.id;
      }
    } catch (err) {
      console.error("Save conversation error (Supabase):", err);
    }

    // Stable local id when offline / signed out.
    if (!id) id = generateConvoId();
    conversationIdRef.current = id;
    setConversationId(id);

    // Mirror to localStorage under the same id; drop any stale entry for the
    // same day so history stays deduplicated.
    try {
      const lsKey = getDollyLsKey(currentUserId);
      const existing = JSON.parse(localStorage.getItem(lsKey) || "{}") as Record<string, { messages: Message[]; updated_at: string; day?: string }>;
      for (const k of Object.keys(existing)) {
        if (k !== id && existing[k]?.day === day) delete existing[k];
      }
      existing[id] = { messages: msgs, updated_at: new Date().toISOString(), day };
      const entries = Object.entries(existing).sort((a, b) => b[1].updated_at.localeCompare(a[1].updated_at));
      const out: Record<string, { messages: Message[]; updated_at: string; day?: string }> = {};
      entries.slice(0, 50).forEach(([k, v]) => { out[k] = v; });
      localStorage.setItem(lsKey, JSON.stringify(out));
    } catch { /* localStorage full or unavailable */ }
  }, [viewingDay, currentUserId]);

  // Send message
  async function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;

    /**
     * Before any gate, without exception.
     *
     * Everything below this — the paywall, the cooldown, the daily cap, the
     * monthly ceiling, the network itself — can refuse a message without it
     * ever reaching Dolly. So a free user writing "I don't want to be here
     * any more" was answered with an upgrade prompt, and a heavy user with
     * "You've reached the daily limit. Try again tomorrow." This runs first,
     * locally, and needs no quota, no account and no connection.
     */
    const crisis = detectCrisis(msg);

    // Tier gate. Dolly is the paid boundary, so the free tier gets the paywall
    // on the first message rather than after a handful — the server refuses
    // these calls outright, and letting someone type a question only to be told
    // no is a worse way to learn that than being told up front.
    // `!crisis`: the gate is skipped entirely rather than handled afterwards,
    // because gateWithReason SHOWS the paywall modal. Popping a subscription
    // offer over a message like this is the exact failure being fixed.
    if (tier === "free" && !crisis) {
      const reason = gateWithReason("ai_features");
      // Dismissing the paywall silences it for 24 hours. That used to silence
      // this whole screen with it: the composer, the send button and all six
      // starter prompts did nothing, with no paywall and no message, for a
      // full day. Say it inline instead, once, with somewhere to go — this is
      // the moment the free tier is supposed to convert, not the moment the
      // app looks broken.
      if (reason === "cooldown") {
        // Deliberately NOT a thread message. Pushing it into `messages` made
        // messages.length non-zero, which tore down the greeting and all six
        // starter prompts — so the one tap that was supposed to sell the plan
        // emptied the screen instead. It would also have been carried into
        // saved history the moment the reader subscribed and started talking.
        setUpgradeNotice(true);
        setAnnouncement(AI_UPGRADE_MESSAGE);
        return;
      }
      if (reason !== "allowed") return;
    }

    setInput("");
    // Nothing to retry for a crisis turn — "Try again" under a support card
    // would be a strange thing to offer.
    lastAskRef.current = crisis ? null : msg;
    if (!crisis) incrementDollyUsage();

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: Date.now(),
    };

    const crisisCard: Message | null = crisis
      ? { id: `crisis-${Date.now()}`, role: "assistant", content: "", timestamp: Date.now(), crisis: true }
      : null;

    const updatedMessages = crisisCard
      ? [...messages, userMsg, crisisCard]
      : [...messages, userMsg];
    setMessages(updatedMessages);
    if (crisisCard) setAnnouncement(crisisAnnouncement());
    // Sending is an explicit "take me to the bottom", even if they'd scrolled up.
    scrollToBottom("auto");

    // A paid account still gets Dolly's own reply under the card: her prompt
    // handles this carefully, and a human-sounding response matters here. A
    // free account stops at the card, having been shown the help without ever
    // being asked to pay for it.
    if (crisis && tier === "free") {
      saveConversation(updatedMessages);
      return;
    }

    // Create placeholder for streaming response
    const assistantId = `a-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages([...updatedMessages, assistantMsg]);
    setIsStreaming(true);

    let streamTimeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const controller = new AbortController();
      abortRef.current = controller;
      // Safety net: abort a hung stream after 90s so it can never spin forever.
      streamTimeout = setTimeout(() => { timedOutRef.current = true; controller.abort(); }, 90000);

      const { journalContext, tarotContext } = gatherCrossFeatureContext(currentUserId);
      const res = await authedFetch("/api/dolly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          // Notices and support cards are the app talking, not the
          // conversation. A crisis card carries no text at all, so sending it
          // would put an empty assistant turn in the history — which the API
          // rejects outright.
          history: messages
            .filter(m => !m.notice && !m.crisis && m.content.trim())
            .slice(-20)
            .map(m => ({
              role: m.role,
              content: m.role === "assistant" ? dollyBody(m.content) : m.content,
            })),
          chart,
          transits,
          connections,
          userName,
          journalContext,
          tarotContext,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "" }));
        // 402 and 429 are policy: the plan, the daily limit, the monthly AI
        // ceiling. 503 is us being unreachable, which the server words
        // honestly too. All three are answered in the server's own words, as
        // a notice — not thrown, because a thrown rule becomes "Something
        // went wrong" in Dolly's own voice.
        if (res.status === 402 || res.status === 429 || res.status === 503) {
          // The support card is already on screen for this turn. A server
          // that refused without taking the crisis branch — an older build,
          // or an edge the route does not cover — must not be allowed to
          // stack "you've reached the daily limit" underneath it.
          if (crisis) {
            setMessages(prev => prev.filter(m => m.id !== assistantId));
            return;
          }
          const text = typeof errBody.error === "string" && errBody.error.trim()
            ? errBody.error
            : "Dolly isn't available on your plan right now.";
          setMessages(prev =>
            prev.map(m => (m.id === assistantId ? { ...m, content: text, notice: true } : m)),
          );
          return;
        }
        throw new Error(errBody.error || `API error: ${res.status}`);
      }

      // The server refused a gate but the message looked like crisis, so it
      // answered 200 with this instead of a limit. Not an error, and not a
      // stream: the support card is rendered locally.
      if (res.headers.get("content-type")?.includes("application/json")) {
        const ok = await res.json().catch(() => null);
        if (ok?.crisis) {
          setMessages(prev => {
            // The local check almost always fired first, so a card is already
            // on screen; drop the empty streaming bubble and leave it alone
            // rather than showing the same card twice.
            const withoutPlaceholder = prev.filter(m => m.id !== assistantId);
            if (withoutPlaceholder.some(m => m.crisis)) return withoutPlaceholder;
            return [...withoutPlaceholder, {
              id: `crisis-${Date.now()}`, role: "assistant", content: "", timestamp: Date.now(), crisis: true,
            }];
          });
          setAnnouncement(crisisAnnouncement());
          return;
        }
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId ? { ...m, content: fullText } : m
                  )
                );
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }

      // Save final conversation
      const finalMessages = [...updatedMessages, { ...assistantMsg, content: fullText }];
      setMessages(finalMessages);
      saveConversation(finalMessages);

      // Read the finished reply out. dollyBody, not the raw text, so the
      // follow-up chips aren't read as part of the sentence.
      setAnnouncement(fullText.trim() ? dollyBody(fullText) : "");

      // Fold the latest turns into Dolly's cross-session memory (fire-and-forget).
      if (fullText.trim()) {
        try {
          void authedFetch("/api/dolly/memory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recentMessages: finalMessages.slice(-6).map((m) => ({
                role: m.role,
                content: m.role === "assistant" ? dollyBody(m.content) : m.content,
              })),
            }),
          }).catch(() => {});
        } catch { /* ignore */ }
      }
    } catch (err) {
      const aborted = (err as Error).name === "AbortError";
      // A timeout is an abort too, and it used to return here silently —
      // leaving an empty bubble on screen after ninety seconds of waiting.
      // Only the user's own "new chat" abort should vanish without a word.
      if (aborted && !timedOutRef.current) return;

      const errMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Dolly stream error:", errMsg);
      // navigator.onLine is only reliable in the negative — false really does
      // mean no connection — which is exactly the direction needed here.
      // Same reasoning as the refusal branch above: the card said the useful
      // thing already, and "Dolly couldn't finish that answer" under it is
      // both noise and slightly cruel.
      if (crisis) {
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        return;
      }
      const offline = typeof navigator !== "undefined" && navigator.onLine === false;
      const failure = offline
        ? "You're offline, so Dolly can't answer right now. She'll pick this up when you're back."
        : aborted
        ? "That one took too long and I lost the thread. Ask me again?"
        : "Dolly couldn't finish that answer. Try asking again?";
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                // The exception text is our diagnostic, not the reader's.
                content: failure,
                // A failure is the app talking, not Dolly. Rendering it in her
                // bubble reads as her saying it, and — the reason this matters
                // more than tone — it skipped the announced path, so a screen
                // reader user waited out a silence that never resolved.
                notice: true,
              }
            : m
        )
      );
      setAnnouncement(failure);
    } finally {
      timedOutRef.current = false;
      if (streamTimeout) clearTimeout(streamTimeout);
      setIsStreaming(false);
      abortRef.current = null;
      // Back to where the person was typing. Focus used to land on <body>
      // after every send and stay there.
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // isComposing: while an IME is open, Enter commits the candidate word.
    // Without this check a Japanese, Chinese or Korean speaker cannot type a
    // sentence — the first Enter sends the half-finished one.
    if (e.key === "Enter" && !e.shiftKey && !(e.nativeEvent as KeyboardEvent).isComposing) {
      e.preventDefault();
      handleSend();
    }
  }

  // Declared up here, not beside the sheet's markup: the early returns for the
  // loading spinner and the history view sit between, and a hook after them
  // changes the hook count between renders.
  const closeLeave = useCallback(() => setShowLeavePrompt(false), []);
  useDialogKeys(showLeavePrompt, leaveRef, closeLeave);
  const closeDelete = useCallback(() => setPendingDelete(null), []);
  useDialogKeys(pendingDelete !== null, deleteRef, closeDelete);

  /**
   * Confirmation for both deletes. Rendered inside the history view, which is
   * the only place either can be started.
   */
  const deleteSheet = pendingDelete && (
    <div
      onClick={closeDelete}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        ref={deleteRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dl-del-title"
        aria-describedby="dl-del-body"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 440, margin: 12, borderRadius: 18, background: "var(--card)", border: "1px solid var(--border-card)", padding: 20, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}
      >
        <p id="dl-del-title" style={{ fontFamily: "var(--font-serif)", fontSize: 17, color: "var(--foreground)", margin: "0 0 6px" }}>
          {pendingDelete.kind === "one"
            ? "Delete this reading?"
            : `Delete ${pendingDelete.count} ${pendingDelete.count === 1 ? "reading" : "readings"}?`}
        </p>
        <p id="dl-del-body" style={{ fontSize: 13, lineHeight: 1.5, color: "var(--foreground-muted)", margin: "0 0 16px" }}>
          This can&rsquo;t be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={closeDelete}
            style={{ flex: 1, minHeight: 44, borderRadius: 12, background: "transparent", color: "var(--foreground-muted)", border: "1px solid var(--border-card)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Keep
          </button>
          <button
            onClick={() => {
              const target = pendingDelete;
              setPendingDelete(null);
              if (target.kind === "one") deleteConversation(target.convo);
              else void deleteSelected();
            }}
            style={{ flex: 1, minHeight: 44, borderRadius: 12, background: "var(--oxblood-light)", color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  function handleNewChat() {
    if (isStreaming) {
      abortRef.current?.abort();
    }
    setMessages([]);
    setConversationId(null);
    conversationIdRef.current = null;
    setIsStreaming(false);
    setViewingDay(null);
    setShowLeavePrompt(false);
  }

  // "Discard" from the leave prompt: remove the current reading, then start new.
  async function discardCurrentAndNew() {
    const id = conversationIdRef.current;
    const day = viewingDay || new Date().toISOString().split("T")[0];
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        if (id) await supabase.from("dolly_conversations").delete().eq("id", id).eq("user_id", session.user.id);
        else await supabase.from("dolly_conversations").delete().eq("day", day).eq("user_id", session.user.id);
      }
    } catch { /* ignore */ }
    try {
      const lsKey = getDollyLsKey(currentUserId);
      const ls = JSON.parse(localStorage.getItem(lsKey) || "{}") as Record<string, { day?: string }>;
      for (const k of Object.keys(ls)) { if (k === id || ls[k]?.day === day) delete ls[k]; }
      localStorage.setItem(lsKey, JSON.stringify(ls));
    } catch { /* ignore */ }
    setPastConversations((prev) => prev.filter((c) => c.id !== id && c.day !== day));
    handleNewChat();
  }

  // Load conversation history list
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setHistoryLoading(false); return; }

      const { data } = await supabase
        .from("dolly_conversations")
        .select("id, day, messages, updated_at")
        .eq("user_id", session.user.id)
        .order("day", { ascending: false })
        .limit(50);

      let convos: PastConversation[] = (data || []).filter(c => c.messages && c.messages.length > 0);

      // Merge localStorage conversations that Supabase might not have
      try {
        const lsData = JSON.parse(localStorage.getItem(getDollyLsKey(currentUserId)) || "{}") as Record<string, { messages: Message[]; updated_at: string; day?: string }>;
        for (const [convoKey, val] of Object.entries(lsData)) {
          if (!val?.messages?.length) continue;
          // day field may be inside val (new format) or the key itself may be a date (old format)
          const day = val.day || (convoKey.match(/^\d{4}-\d{2}-\d{2}$/) ? convoKey : new Date(val.updated_at).toISOString().split("T")[0]);
          // Dedup by id AND by day (one conversation per day) so legacy
          // mismatched-id entries don't show alongside the Supabase row.
          const alreadyInList = convos.some(c => c.id === convoKey || c.day === day);
          if (!alreadyInList) {
            convos.push({ id: convoKey, day, messages: val.messages, updated_at: val.updated_at });
          }
        }
      } catch { /* ignore */ }

      // Merge the current in-memory conversation so it always appears,
      // even if it hasn't been saved to Supabase yet or has newer messages
      if (messages.length > 0) {
        const todayKey = viewingDay || new Date().toISOString().split("T")[0];
        const currentConvo: PastConversation = {
          id: conversationId || `local-${todayKey}`,
          day: todayKey,
          messages,
          updated_at: new Date().toISOString(),
        };

        // Replace the matching DB row with the in-memory version (it's more up to date)
        // or prepend it if no match exists
        const existingIdx = convos.findIndex(c =>
          (conversationId && c.id === conversationId) || c.day === todayKey
        );
        if (existingIdx >= 0) {
          convos[existingIdx] = currentConvo;
        } else {
          convos.unshift(currentConvo);
        }

        // Re-sort by day descending since we may have changed order
        convos.sort((a, b) => b.day.localeCompare(a.day));
      }

      setPastConversations(convos);
      void ensureSummaries(convos);
    } catch (err) {
      console.error("Load history error:", err);
    }
    setHistoryLoading(false);
  }, [messages, conversationId, viewingDay]);

  // Load a specific past conversation
  function loadConversation(convo: PastConversation) {
    if (isStreaming) {
      abortRef.current?.abort();
      setIsStreaming(false);
    }
    setMessages(convo.messages);
    setConversationId(convo.id);
    conversationIdRef.current = convo.id;
    setViewingDay(convo.day);
    setShowHistory(false);
  }

  // Delete a conversation
  async function deleteConversation(convo: PastConversation) {
    // Remove from Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from("dolly_conversations").delete().eq("id", convo.id).eq("user_id", session.user.id);
      }
    } catch { /* ignore */ }

    // Remove from localStorage
    try {
      const lsKey = getDollyLsKey(currentUserId);
      const lsData = JSON.parse(localStorage.getItem(lsKey) || "{}");
      delete lsData[convo.id];
      localStorage.setItem(lsKey, JSON.stringify(lsData));
    } catch { /* ignore */ }

    // Remove from state
    setPastConversations((prev) => prev.filter((c) => c.id !== convo.id));

    // If we deleted the active conversation, reset to new chat
    if (convo.id === conversationId) {
      setMessages([]);
      setConversationId(null);
      conversationIdRef.current = null;
      setViewingDay(null);
    }
  }

  // Load cached chat summaries for this user.
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem(getDollySummaryKey(currentUserId)) || "{}");
      if (c && typeof c === "object") setSummaries(c);
    } catch { /* ignore */ }
  }, [currentUserId]);

  // Generate a short summary for any chat that doesn't have one yet (cached).
  async function ensureSummaries(convos: PastConversation[]) {
    let cache: Record<string, string> = {};
    try { cache = JSON.parse(localStorage.getItem(getDollySummaryKey(currentUserId)) || "{}"); } catch { /* */ }
    const todo = convos.filter(
      (c) => c.messages.length >= 2 && c.messages.some((m) => m.role === "assistant") && !cache[c.id]
    ).slice(0, 20); // bound the number of calls per history open
    if (!todo.length) return;
    const updated = { ...cache };
    for (const c of todo) {
      try {
        const res = await authedFetch("/api/dolly/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: c.messages.slice(0, 12).map((m) => ({
              role: m.role,
              content: m.role === "assistant" ? dollyBody(m.content) : m.content,
            })),
          }),
        });
        if (res.ok) {
          const { summary } = await res.json();
          if (summary) {
            updated[c.id] = summary;
            setSummaries((prev) => ({ ...prev, [c.id]: summary }));
          }
        }
      } catch { /* skip this one */ }
    }
    try { localStorage.setItem(getDollySummaryKey(currentUserId), JSON.stringify(updated)); } catch { /* */ }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  // Delete all selected conversations at once.
  async function deleteSelected() {
    const toDelete = pastConversations.filter((c) => selectedIds.has(c.id));
    if (!toDelete.length) { setSelectMode(false); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const lsKey = getDollyLsKey(currentUserId);
      const ls = JSON.parse(localStorage.getItem(lsKey) || "{}") as Record<string, { day?: string }>;
      for (const c of toDelete) {
        if (session?.user) {
          try { await supabase.from("dolly_conversations").delete().eq("id", c.id).eq("user_id", session.user.id); } catch { /* */ }
        }
        delete ls[c.id];
        for (const k of Object.keys(ls)) { if (ls[k]?.day === c.day) delete ls[k]; }
      }
      localStorage.setItem(lsKey, JSON.stringify(ls));
    } catch { /* ignore */ }
    const deletedActive = conversationId ? selectedIds.has(conversationId) : false;
    setPastConversations((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    if (deletedActive) {
      setMessages([]);
      setConversationId(null);
      conversationIdRef.current = null;
      setViewingDay(null);
    }
    setSelectedIds(new Set());
    setSelectMode(false);
  }

  // Open history drawer
  function openHistory() {
    setShowHistory(true);
    loadHistory();
  }

  // ─── Helpers ───

  function formatConvoDate(day: string): string {
    const d = new Date(day + "T12:00:00");
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (day === todayStr) return "Today";
    if (day === yesterdayStr) return "Yesterday";

    const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${dayOfWeek[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  }

  function getConvoPreview(convo: PastConversation): string {
    // Get the first user message as preview
    const firstUser = convo.messages.find(m => m.role === "user");
    if (firstUser) {
      return firstUser.content.length > 60
        ? firstUser.content.slice(0, 60) + "..."
        : firstUser.content;
    }
    return "Empty conversation";
  }

  function getConvoMessageCount(convo: PastConversation): number {
    // Both sides. Counting only the user's turns labelled a question-and-answer
    // exchange "1 message", which reads as a bug in the list. System notices
    // are not part of the conversation and don't count.
    return convo.messages.filter(m => !m.notice).length;
  }

  // Get last Dolly response for a conversation (for chat list preview).
  // dollyBody, not .content: a reply is STORED with its leading meta line so a
  // reopened conversation still has its chips and follow-ups, but that line is
  // machinery. Sliced raw, the history list previewed a row of JSON.
  function getLastDollyResponse(convo: PastConversation): string {
    const lastAssistant = [...convo.messages].reverse().find(m => m.role === "assistant");
    if (lastAssistant) {
      const text = dollyBody(lastAssistant.content).trim();
      return text.length > 80 ? text.slice(0, 80) + "..." : text;
    }
    return "";
  }

  // Get formatted time from timestamp
  function formatConvoTime(convo: PastConversation): string {
    const lastMsg = convo.messages[convo.messages.length - 1];
    if (!lastMsg?.timestamp) return "";
    const d = new Date(lastMsg.timestamp);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  // ─── Render ───

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  // ═══════════════════════════════════════════
  // VIEW: History / Chat List
  // ═══════════════════════════════════════════
  if (showHistory) {
    return (
      <main className="flex-1 flex flex-col max-w-lg lg:max-w-3xl mx-auto w-full">
        {/* History header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/15">
          <div className="flex items-center gap-1">
            {/* The only ways out of this screen were opening a chat or
                starting a new one — someone who came in to look had no way
                back to the conversation they were in the middle of. */}
            <button
              onClick={() => setShowHistory(false)}
              aria-label="Back to conversation"
              className="-ml-2 w-11 h-11 rounded-full flex items-center justify-center text-secondary hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1
              className="text-lg text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Chats
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {pastConversations.length > 0 && (
              <button
                onClick={() => { setSelectMode((s) => !s); setSelectedIds(new Set()); }}
                aria-pressed={selectMode}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors min-h-[44px]"
                style={{ color: "var(--foreground-muted)", border: "1px solid var(--border-card)" }}
              >
                {selectMode ? "Cancel" : "Select"}
              </button>
            )}
            {selectMode && selectedIds.size > 0 && (
              <button
                onClick={() => setPendingDelete({ kind: "many", count: selectedIds.size })}
                className="text-xs px-3 py-1.5 rounded-lg font-medium min-h-[44px]"
                style={{ background: "var(--oxblood-light)", color: "#fff", border: "none" }}
              >
                Delete ({selectedIds.size})
              </button>
            )}
            {!selectMode && (
              <button
                onClick={() => {
                  handleNewChat();
                  setShowHistory(false);
                }}
                className="w-11 h-11 rounded-full bg-terracotta/15 border border-terracotta/25 flex items-center justify-center text-terracotta hover:bg-terracotta/25 transition-colors active:scale-95"
                aria-label="New conversation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {historyLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
            </div>
          ) : pastConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-8">
              <div className="w-16 h-16 rounded-full bg-terracotta/8 border border-terracotta/15 flex items-center justify-center mb-4">
                <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1" stroke="var(--terracotta)" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                </svg>
              </div>
              <p className="text-muted text-sm text-center mb-1">No readings yet</p>
              <p className="text-muted text-xs text-center max-w-[240px]">
                Start a conversation with Dolly and your past readings will show up here
              </p>
            </div>
          ) : (
            <div>
              {pastConversations.map((convo, idx) => {
                const isActive = convo.id === conversationId;
                const isToday = convo.day === new Date().toISOString().split("T")[0];
                const preview = getConvoPreview(convo);
                const lastResponse = getLastDollyResponse(convo);
                const msgCount = getConvoMessageCount(convo);

                // Group header: show date label before first item of each day
                const prevDay = idx > 0 ? pastConversations[idx - 1].day : null;
                const showDateHeader = convo.day !== prevDay;

                return (
                  <div key={convo.id}>
                    {showDateHeader && (
                      <div className="px-5 pt-4 pb-1.5">
                        {/* A heading, not a styled span: these are the only
                            structure this list has, and heading navigation is
                            how a screen reader user skips a month of chats. */}
                        <h2 className="text-muted text-[10px] uppercase tracking-widest font-medium">
                          {formatConvoDate(convo.day)}
                        </h2>
                      </div>
                    )}
                    <div className={`flex items-center gap-0 transition-colors ${
                      isActive ? "bg-terracotta/8" : ""
                    }`}>
                      <button
                        onClick={() => { if (selectMode) toggleSelect(convo.id); else loadConversation(convo); }}
                        {...(selectMode
                          // In select mode this button IS a checkbox — the tick
                          // is drawn with a coloured span, which says nothing
                          // aloud, so selected and unselected rows were
                          // indistinguishable.
                          ? { role: "checkbox" as const, "aria-checked": selectedIds.has(convo.id) }
                          : {})}
                        className="flex-1 text-left px-5 py-3.5 flex gap-3 items-start active:bg-foreground/5 min-w-0"
                      >
                        {selectMode && (
                          <span
                            className="mt-2.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                            style={selectedIds.has(convo.id)
                              ? { background: "var(--terracotta)", border: "1px solid var(--terracotta)" }
                              : { border: "1.5px solid var(--border-card)" }}
                          >
                            {selectedIds.has(convo.id) && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                            )}
                          </span>
                        )}
                        {/* The avatar used to sit here on every row — the
                            same 40px portrait, forty times down the list,
                            carrying no information and costing the summary
                            and preview the width they needed to be readable.
                            Every row in this list is a conversation with
                            Dolly; saying so once per row says nothing. */}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-sm font-medium truncate ${
                              isActive ? "text-foreground" : "text-secondary"
                            }`}>
                              {summaries[convo.id] || preview}
                            </span>
                            <span className="text-muted text-[10px] ml-2 flex-shrink-0">
                              {formatConvoTime(convo)}
                            </span>
                          </div>
                          {lastResponse && (
                            <p className="text-muted text-xs leading-relaxed truncate">
                              {lastResponse}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-muted text-[10px]">
                              {msgCount} {msgCount === 1 ? "message" : "messages"}
                            </span>
                            {isToday && isActive && (
                              <span className="text-terracotta/50 text-[9px] uppercase tracking-widest">
                                active
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Delete button (hidden in multi-select mode) */}
                      {!selectMode && (
                        <button
                          onClick={() => {
                            setPendingDelete({ kind: "one", convo });
                          }}
                          // text-foreground/20 was a 20%-opacity icon: around
                          // 1.3:1 against the background, invisible to anyone
                          // who isn't looking for it.
                          className="px-4 py-3.5 flex-shrink-0 text-muted hover:text-foreground active:text-red-400/70 transition-colors self-stretch flex items-center"
                          // Named by its row. Every one of these said "Delete
                          // conversation", so a screen reader user heard the
                          // same button forty times with no way to tell which
                          // reading they were about to destroy.
                          aria-label={`Delete conversation: ${summaries[convo.id] || preview}`}
                        >
                          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="ml-5 border-b border-foreground/15" />
                  </div>
                );
              })}
              {/* Spacer so the last row's delete button clears the floating
                  "report a bug" button at the bottom-right. */}
              <div className="h-36" aria-hidden="true" />
            </div>
          )}
        </div>
        {deleteSheet}
      </main>
    );
  }

  // ═══════════════════════════════════════════
  // VIEW: Active Chat
  // ═══════════════════════════════════════════

  // Real sky, not decoration: the divider above the thread reads from the same
  // ephemeris the almanac uses.
  const skyLine = (() => {
    const now = new Date();
    const hour = now.getHours();
    const when = hour < 12 ? "This morning" : hour < 18 ? "This afternoon" : "Tonight";
    try {
      return `${when} · ${getMoonPhaseLabel(now)} in ${getCurrentMoonSign(now).full}`;
    } catch {
      return when;
    }
  })();

  const lastMessage = messages[messages.length - 1];

  return (
    <main className="flex-1 min-h-0 flex flex-col relative max-w-lg lg:max-w-3xl mx-auto w-full">
      <style>{`
        @keyframes dl-orb{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes dl-glow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.85;transform:scale(1.06)}}
        @keyframes dl-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dl-dot{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
        .dl-thread::-webkit-scrollbar{width:0;height:0}
        .dl-thread{scrollbar-width:none}
        .dl-bubble{animation:dl-rise .3s ease both}
        /* The streaming bubble grows every token; browser scroll anchoring
           would try to compensate and fight our own scrolling. */
        .dl-live{overflow-anchor:none}
        @media (prefers-reduced-motion: reduce){
          .dl-bubble{animation:none}
          [class*="dl-"]{animation-duration:.001ms!important}
        }
      `}</style>

      {/* Backdrop — a soft glow from the top, behind everything, never tappable. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(120% 70% at 50% 0%, color-mix(in srgb, var(--lavender) 16%, transparent) 0%, transparent 58%)" }}
      />

      {/* Header — moon-orb avatar + DOLLY */}
      <div className="relative z-10 flex items-center gap-3 px-5 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border-card)" }}>
        <button
          onClick={openHistory}
          aria-label="Conversations"
          className="shrink-0 rounded-full flex items-center justify-center transition-transform active:scale-95"
          /* Was rgba(255,255,255,0.05) — invisible on the cream page. */
          style={{ width: 42, height: 42, background: "var(--surface-mid)", border: "0.5px solid var(--border-card)", color: "var(--foreground-muted)" }}
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
            <path d="M8 9h9M8 13h6" />
          </svg>
        </button>
        <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
          <div aria-hidden="true" className="absolute rounded-full" style={{ inset: -5, background: "radial-gradient(circle, var(--lavender), transparent 68%)", opacity: 0.4, animation: "dl-glow 4s ease-in-out infinite" }} />
          <DollyAvatar size={44} float className="relative" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 500, letterSpacing: "0.04em", color: "var(--foreground)" }}>DOLLY</h1>
            {/*
              This was a glowing green dot. A green dot beside a name, next to
              a portrait, means one thing to everyone who has used a messaging
              app: a person is online. Dolly is not a person and there is
              nobody to be online — it was decoration that happened to make a
              claim, and the claim was false in the direction that matters.
              An AI mark in its place, which is the thing actually worth
              saying about her.
            */}
            <span
              aria-label="Dolly is an AI assistant"
              style={{
                fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 700,
                letterSpacing: "0.12em", padding: "2px 6px", borderRadius: 4,
                background: "var(--surface-mid)", color: "var(--foreground-secondary)",
                border: "0.5px solid var(--border-card)",
              }}
            >
              AI
            </span>
          </div>
          {/* 11px uppercase, like every other subordinate line on this screen
              (the sky line, "TRY ASKING"). At 18px it was nearly the size of
              the wordmark above it and outweighed it. */}
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, lineHeight: 1.3, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--foreground-muted)", marginTop: 3 }}>your cosmic guide</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setShowLeavePrompt(true)}
            aria-label="New chat"
            className="shrink-0 rounded-full flex items-center justify-center transition-transform active:scale-95"
            style={{ width: 42, height: 42, background: "var(--surface-mid)", border: "0.5px solid var(--border-card)" }}
          >
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--lavender)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </button>
        )}
      </div>

      {/* Leave prompt — offer to keep or discard the current reading.
          A real dialog: it was a bare div, so it had no role, Escape did
          nothing, and Tab left the panel for the thread and composer behind
          the scrim. See useDialogKeys. */}
      {showLeavePrompt && (
        <div
          onClick={() => setShowLeavePrompt(false)}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        >
          <div
            ref={leaveRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dl-leave-title"
            aria-describedby="dl-leave-body"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 440, margin: 12, borderRadius: 18, background: "var(--card)", border: "1px solid var(--border-card)", padding: 20, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}
          >
            <p id="dl-leave-title" style={{ fontFamily: "var(--font-serif)", fontSize: 17, color: "var(--foreground)", margin: "0 0 6px" }}>Save this reading?</p>
            <p id="dl-leave-body" style={{ fontSize: 13, lineHeight: 1.5, color: "var(--foreground-muted)", margin: "0 0 16px" }}>
              It&rsquo;s kept in your history so you can reopen it anytime. Save it, or discard it before starting fresh.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {/* Brass with its paired ink, like every other primary action.
                  This was a hardcoded #1a1020 on var(--lavender) — fine in
                  dark (7.9:1) but --lavender flips to #6a4a90 in light, making
                  it dark ink on dark purple at 2.63:1. The same trap as the
                  send button: a token that changes lightness between themes,
                  paired with a colour that doesn't. Now 8.01:1 / 4.88:1. */}
              <button
                onClick={() => { setShowLeavePrompt(false); handleNewChat(); }}
                style={{ flex: 1, minHeight: 44, borderRadius: 12, background: "var(--brass)", color: "var(--btn-primary-text)", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                Save &amp; start new
              </button>
              {/* Discard throws the reading away, so it is coloured as the
                  destructive choice rather than as a twin of the safe one —
                  the two were indistinguishable outlined pills. */}
              <button
                onClick={discardCurrentAndNew}
                style={{ flex: 1, minHeight: 44, borderRadius: 12, background: "transparent", color: "var(--danger-text)", border: "1px solid var(--border-card)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Thread ──────────────────────────────────────────────────────────
          The ONLY scroll region on this page. It follows new content while
          you're at the bottom and holds still the moment you scroll up. */}
      {/*
        tabIndex={0} because this is a scroll region: without it a keyboard-only
        user could not scroll back through the conversation at all — there is
        nothing focusable inside a reply, so Tab skipped the whole thread.

        role="log" for the semantics (a running list of messages) but
        aria-live="off" deliberately: a live log announces every DOM change,
        which during streaming is every few tokens, and the announcements
        interrupt each other so the reader hears fragments and never a
        sentence. The sr-only region below does the announcing instead, once,
        when the reply is finished.
      */}
      <div
        ref={threadRef}
        tabIndex={0}
        role="log"
        aria-live="off"
        aria-label="Conversation with Dolly"
        className="dl-thread relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
        style={{ ["--tw-ring-color" as string]: "var(--lavender)" }}
      >
        <div className="flex flex-col gap-[18px]">
          <div className="text-center" style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--foreground-muted)", opacity: 0.7 }}>
            {skyLine}
          </div>

          {/* Greeting + starters, until the first message */}
          {messages.length === 0 && (
            <>
              <div
                className="dl-bubble max-w-[88%] self-start px-[19px] py-[17px]"
                style={{ background: "linear-gradient(165deg, var(--plum), var(--plum-deep, #161022))", border: "0.5px solid rgba(201,206,232,0.16)", borderRadius: "6px 20px 20px 20px" }}
              >
                <p
                  className="mb-2.5"
                  style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, fontSize: 18, lineHeight: 1.45, color: "rgba(244,236,214,0.96)" }}
                >
                  {(() => {
                    const h = new Date().getHours();
                    const salutation = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
                    return `${salutation}, ${userName ? userName.split(" ")[0] : "Seeker"}.`;
                  })()}
                </p>
                <p className="text-sm" style={{ lineHeight: 1.65, color: "rgba(240,230,210,0.9)" }}>
                  Your chart, your transits, your relationships — I know it all. What&rsquo;s sitting with you?
                </p>
              </div>

              {/*
                Free accounts are told the price before they spend a question
                on it.
                The screen offers a warm greeting by name, six tempting
                starters and a working composer, and said nothing about Dolly
                being paid until after the reader had typed something real —
                at which point a paywall appeared over their own words. Saying
                it here costs one quiet line and turns the surprise into a
                choice.
              */}
              {tier === "free" && (
                <div
                  className="self-start flex flex-wrap items-center gap-x-2 gap-y-1"
                  style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--foreground-muted)" }}
                >
                  <span>Talking with Dolly is part of Mapped+.</span>
                  <button
                    onClick={() => setShowPlans(true)}
                    className="min-h-[44px] flex items-center font-semibold"
                    style={{ color: "var(--foreground)", textDecoration: "underline", textUnderlineOffset: 3 }}
                  >
                    See what&rsquo;s included
                  </button>
                </div>
              )}

              <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: "var(--foreground-muted)", opacity: 0.75 }}>
                Try asking
              </div>
              <div className="flex flex-col gap-2.5">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => handleSend(prompt.text)}
                    className="flex items-center gap-3 w-full text-left transition-transform active:scale-[0.99]"
                    /* The card sits on the PAGE, not on a plum bubble, so its edge has to
                       be a theme token — the old rgba(201,206,232,0.16) was a pale blue
                       at 16% and left the light-mode cards with no edge at all. */
                    style={{ padding: "14px 15px", borderRadius: 16, background: "color-mix(in srgb, var(--lavender) 10%, var(--background-elevated))", border: "0.5px solid var(--border-card)" }}
                  >
                    <span
                      className="shrink-0 flex items-center justify-center"
                      style={{ width: 34, height: 34, borderRadius: 11, background: "var(--surface-mid)" }}
                    >
                      <span className="rounded-full" style={{ width: 7, height: 7, background: TYPE_COLOR[prompt.kind], boxShadow: `0 0 7px ${TYPE_COLOR[prompt.kind]}` }} />
                    </span>
                    <span className="flex-1 min-w-0 font-medium" style={{ fontSize: 13.5, lineHeight: 1.4, color: "var(--foreground-secondary, rgba(240,230,210,0.9))" }}>
                      {prompt.text}
                    </span>
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Message list */}
          {messages.map((msg, i) => {
            /**
             * A time divider when the conversation picks up after a gap.
             *
             * Every message carried a `timestamp` that nothing ever rendered,
             * so a thread resumed the next morning read as one unbroken
             * exchange — "what you said earlier" meaning something quite
             * different to the reader than to Dolly. Only on a real gap: a
             * time against every line would be noise.
             */
            const prev = i > 0 ? messages[i - 1] : null;
            const gap = prev && msg.timestamp - prev.timestamp > GAP_MS;
            const divider = (i === 0 || gap) && msg.timestamp ? (
              <div
                key={`t-${msg.id}`}
                className="text-center"
                style={{ fontFamily: "var(--font-ui)", fontSize: 10.5, letterSpacing: "0.08em", color: "var(--foreground-muted)", opacity: 0.8 }}
              >
                {formatThreadStamp(msg.timestamp)}
              </div>
            ) : null;

            const withDivider = (node: React.ReactNode) =>
              divider ? <div key={`g-${msg.id}`} className="contents">{divider}{node}</div> : node;

            if (msg.role === "user") {
              return withDivider(
                <div key={msg.id} role="article" className="dl-bubble self-end max-w-[82%] px-4 py-3" style={{ background: "var(--dl-you-bg)", border: "1px solid var(--dl-you-border)", borderRadius: "20px 6px 20px 20px" }}>
                  {/* Who is speaking. On screen the side of the thread and the
                      colour say it; read aloud, every turn ran together into
                      one voice and the conversation was unfollowable. */}
                  <span className="sr-only">You said: </span>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium" style={{ color: "var(--dl-you-ink)" }}>{msg.content}</p>
                </div>
              );
            }

            /**
             * A rule, not a reply.
             *
             * Rendered as a plain centred line rather than a plum bubble with
             * Dolly's avatar: a limit or a plan boundary is the product
             * speaking, not the character. Putting it in her voice made a
             * deliberate rule read as the app breaking.
             */
            // Before the notice branch: a crisis card has no text, so any
            // branch that renders msg.content would render nothing.
            if (msg.crisis) {
              return withDivider(
                <div key={msg.id} className="self-stretch w-full" style={{ padding: "4px 0" }}>
                  <CrisisCard />
                </div>
              );
            }

            if (msg.notice) {
              // A plan boundary needs somewhere to go, and a failure needs a
              // way to try again. This was a grey slab with neither: the
              // upgrade line — the most commercially important moment on the
              // screen — had no route to plans on mobile at all (desktop got
              // one), and a failed answer meant retyping the question.
              const isUpgrade = /Mapped\+|plan/i.test(msg.content);
              const isFailure = msg.id.startsWith("a-");
              return withDivider(
                <div key={msg.id} className="self-center w-full flex flex-col items-center gap-2.5" style={{ padding: "4px 8px" }}>
                  <p
                    className="text-center"
                    style={{
                      fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.6,
                      color: "var(--foreground-secondary)",
                      background: "var(--lib-track)",
                      borderRadius: 14, padding: "12px 16px", margin: 0,
                    }}
                  >
                    {msg.content}
                  </p>
                  {isUpgrade && (
                    <button
                      onClick={() => setShowPlans(true)}
                      className="px-4 min-h-[44px] rounded-full font-semibold transition-transform active:scale-[0.98]"
                      style={{ background: "var(--brass)", color: "var(--btn-primary-text)", fontFamily: "var(--font-ui)", fontSize: 13 }}
                    >
                      See plans
                    </button>
                  )}
                  {isFailure && lastAskRef.current && (
                    <button
                      onClick={() => {
                        const again = lastAskRef.current;
                        if (!again) return;
                        // Drop the failed turn so the thread doesn't keep a
                        // dead end in it, then ask the same thing again.
                        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                        handleSend(again);
                      }}
                      disabled={isStreaming}
                      className="px-4 min-h-[44px] rounded-full font-semibold transition-transform active:scale-[0.98] disabled:opacity-45"
                      style={{ background: "transparent", color: "var(--foreground)", border: "0.5px solid var(--border-card)", fontFamily: "var(--font-ui)", fontSize: 13 }}
                    >
                      Try again
                    </button>
                  )}
                </div>
              );
            }

            const live = isStreaming && msg === lastMessage;
            // The newest reply, and finished: the only turn whose next-step
            // chips are still worth offering.
            const isLatest = !live && msg === lastMessage;
            const { meta, body, metaPending } = parseDollyReply(msg.content);

            // Nothing to show yet (empty placeholder, or the meta line still
            // arriving) — the dots stand in for the whole bubble.
            if (!body && !meta && (metaPending || live)) {
              return withDivider(
                <div
                  key={msg.id}
                  className="dl-bubble self-start flex items-center gap-1.5"
                  style={{ padding: "15px 20px", borderRadius: "6px 20px 20px 20px", background: "linear-gradient(165deg, var(--plum), var(--plum-deep, #161022))", border: "0.5px solid rgba(201,206,232,0.16)" }}
                  aria-label="Dolly is writing"
                >
                  {[0, 0.18, 0.36].map((d) => (
                    <span key={d} className="rounded-full" style={{ width: 6, height: 6, background: "var(--lavender)", animation: `dl-dot 1.1s ease-in-out ${d}s infinite` }} />
                  ))}
                </div>
              );
            }

            return withDivider(
              <div key={msg.id} role="article" className="flex flex-col gap-[18px]">
                <div
                  className={`dl-bubble self-start max-w-[88%] px-[19px] py-[17px] ${live ? "dl-live" : ""}`}
                  style={{ background: "linear-gradient(165deg, var(--plum), var(--plum-deep, #161022))", border: "0.5px solid rgba(201,206,232,0.16)", borderRadius: "6px 20px 20px 20px" }}
                >
                  <span className="sr-only">Dolly said: </span>
                  {!!meta?.tags.length && (
                    <div className="flex flex-wrap gap-[7px] mb-[13px]">
                      {meta.tags.map((tag) => (
                        <span
                          key={tag.label}
                          className="inline-flex items-center gap-1.5"
                          style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: "rgba(255,255,255,0.05)", border: `0.5px solid color-mix(in srgb, ${TYPE_COLOR_ON_PLUM[tag.kind]} 34%, transparent)`, color: "rgba(240,230,210,0.9)" }}
                        >
                          <span className="rounded-full" style={{ width: 5, height: 5, background: TYPE_COLOR_ON_PLUM[tag.kind] }} />
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {meta?.lead && (
                    <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, fontSize: 17, lineHeight: 1.45, color: "rgba(244,236,214,0.96)", margin: "0 0 11px" }}>
                      {meta.lead}
                    </p>
                  )}
                  <div className="text-sm leading-[1.7] whitespace-pre-wrap" style={{ color: "rgba(240,230,210,0.9)" }}>
                    {body}
                    {live && (
                      <span className="inline-block w-1.5 h-4 animate-pulse ml-0.5 align-middle" style={{ background: "var(--lavender)" }} />
                    )}
                  </div>
                </div>

                {/* The action chip and follow-ups only once the reply has
                    landed — offering a next step mid-sentence reads as a bug —
                    and only on the LATEST reply. They used to render on every
                    assistant turn, so three exchanges left three stale "See
                    today's almanac" chips and six out-of-date follow-up
                    questions still sitting in the thread, all still tappable. */}
                {isLatest && meta?.action && (
                  <a
                    href={meta.action.href}
                    className="self-start inline-flex items-center gap-2"
                    style={{ padding: "12px 18px", borderRadius: 99, background: "color-mix(in srgb, var(--lavender) 8%, transparent)", border: "0.5px solid color-mix(in srgb, var(--lavender) 28%, transparent)" }}
                  >
                    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--lavender)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2c1 3-1 4-1 6 0 1.5 1 2.5 1 2.5s1.2-1 1.2-3c2 1.3 3.3 3.6 3.3 6.3A6.8 6.8 0 0 1 5.2 14C5.2 9 9 7 9 4c0 0 2 1 3-2z" />
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{meta.action.label}</span>
                  </a>
                )}
                {isLatest && !!meta?.follow.length && (
                  <div className="flex flex-wrap gap-[9px] self-start max-w-[92%]">
                    {meta.follow.map((f) => (
                      <button
                        key={f}
                        onClick={() => handleSend(f)}
                        disabled={isStreaming}
                        className="font-medium transition-transform active:scale-[0.98] disabled:opacity-40"
                        style={{ padding: "9px 15px", borderRadius: 99, background: "color-mix(in srgb, var(--lavender) 8%, transparent)", border: "0.5px solid color-mix(in srgb, var(--lavender) 28%, transparent)", color: "var(--lavender)", fontFamily: "var(--font-ui)", fontSize: 12.5 }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Jump back to the newest message. Only offered when you've scrolled
          away — it is the way back, never something that grabs you. */}
      {!pinned && messages.length > 0 && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute z-20 left-1/2 flex items-center gap-1.5 transition-transform active:scale-95"
          style={{ bottom: 92, transform: "translateX(-50%)", padding: "8px 15px", borderRadius: 99, background: "var(--card)", border: "0.5px solid var(--border-card)", boxShadow: "0 6px 20px rgba(0,0,0,0.35)", color: "var(--foreground)", fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600 }}
        >
          {isStreaming ? "Dolly is writing" : "Latest"}
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      )}

      {/*
        What a screen reader hears.
        There was no live region anywhere on this screen: a blind user sent a
        message and heard silence, with no signal that a reply had started,
        finished, or what it said. The whole point of the screen was
        unreachable.

        Deliberately NOT streamed into. Announcing every token produces a
        torrent that interrupts itself; this says she has started, then reads
        the finished answer once. The region is always mounted and empty, and
        written into, because a live region that appears with its text already
        inside is unreliable on iOS VoiceOver — which is a Capacitor target.
      */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isStreaming ? "Dolly is writing…" : announcement}
      </div>

      {/*
        The paid boundary, said out loud.
        This is the 24h window after someone dismisses the paywall. It used to
        be complete silence — composer, send button and every starter prompt
        inert, with nothing on screen to explain it. Sits above the composer
        rather than in the thread so the greeting and the starters stay put.
      */}
      {upgradeNotice && (
        <div className="relative z-10 px-5 pb-1 flex flex-col items-center gap-2.5">
          <p
            className="text-center"
            style={{
              fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.6,
              color: "var(--foreground-secondary)", background: "var(--lib-track)",
              borderRadius: 14, padding: "12px 16px", margin: 0,
            }}
          >
            {AI_UPGRADE_MESSAGE}
          </p>
          <button
            onClick={() => setShowPlans(true)}
            className="px-4 min-h-[44px] rounded-full font-semibold transition-transform active:scale-[0.98]"
            style={{ background: "var(--brass)", color: "var(--btn-primary-text)", fontFamily: "var(--font-ui)", fontSize: 13 }}
          >
            See plans
          </button>
        </div>
      )}

      {/* Input area. dl-scrim: in light mode the parchment illustration runs
          straight under the composer — see globals.css. */}
      <div
        className="dl-scrim relative z-10 shrink-0 px-4 pt-2"
        style={{
          // max(), so the gesture bar on a notched phone is cleared when no
          // keyboard is up, and the keyboard wins when one is. This screen
          // had neither: no safe-area padding anywhere, so the composer sat
          // in the home-indicator strip on an iPhone.
          paddingBottom: `max(1rem, env(safe-area-inset-bottom), ${keyboardInset}px)`,
        }}
      >
        <div className="flex items-end gap-2 ml-12 lg:ml-0 pl-[18px] pr-2 py-2 transition-all" /* No inline fallback: --soft is a real token now, and the fallback
               that used to cover for it (white at 5%) was itself the bug — on
               the cream page it meant the composer had no surface at all. */
            style={{ background: "var(--soft)", border: "0.5px solid var(--border-card)", borderRadius: 99 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "Dolly is reading your chart…" : "Ask Dolly anything…"}
            aria-label="Chat message"
            /*
             * NOT disabled while streaming.
             *
             * Disabling the focused textarea makes the browser drop focus to
             * the document, so after every single send the caret vanished and
             * a keyboard user had to Tab in from the top of the page again.
             * For a screen-reader user it also threw the reading cursor to the
             * top of the document mid-conversation. handleSend already refuses
             * to run while streaming, so the guard was never needed here —
             * and leaving it live means you can write your next question while
             * Dolly answers.
             */
            aria-busy={isStreaming}
            rows={1}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted resize-none outline-none max-h-[120px] py-1.5"
            /* 16px exactly. Below that, iOS zooms the page in when the field
               takes focus and leaves it zoomed — the usual "fix" for which is
               maximum-scale=1, which takes pinch-zoom away from everyone (see
               the viewport in layout.tsx). Sizing the input correctly solves
               it without costing anyone their magnification. */
            style={{ minHeight: "24px", fontSize: 16 }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "24px";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          {/* Send, or Stop while she is writing. There was no way to stop a
              reply at all: the only route to the abort controller was "New
              chat", which is behind a prompt and destroys the conversation. */}
          <button
            onClick={() => {
              if (isStreaming) { abortRef.current?.abort(); return; }
              handleSend();
            }}
            disabled={!isStreaming && !input.trim()}
            // disabled:opacity-30 was invisible; 45% still reads as "off"
            // without vanishing into the page.
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-45"
            aria-label={isStreaming ? "Stop generating" : "Send message"}
            /* Brass, like every other primary action in the app. This was
               --journal-accent, borrowed from the Journal tab, which is
               lavender in dark but SLATE BLUE (#5b6180) in light — a colour
               from no palette in Mapped, reading as a greyed-out disc that
               looked disabled even when it wasn't. Measured: 8.01:1 dark,
               4.88:1 light against --btn-primary-text. */
            style={{ backgroundColor: "var(--brass)" }}
          >
            {isStreaming ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--btn-primary-text)" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--btn-primary-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 12h11M13 6l6 6-6 6" />
              </svg>
            )}
          </button>
        </div>
        {/* Said plainly and once, where someone about to type a real thing
            about their life will see it. 10px, not 9: this is the line that
            tells them who they are talking to. */}
        <p className="text-muted text-[10px] text-center mt-2 leading-relaxed">
          Dolly is an AI, not a person. She uses astrology as a lens, not a prediction &mdash; you always have agency.
        </p>
      </div>
      {PaywallModal}
    </main>
  );
}
