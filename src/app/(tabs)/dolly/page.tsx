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
import { getDollyUsageToday, incrementDollyUsage } from "@/lib/tier";
import { getCachedLocation, fetchUserLocation } from "@/lib/userLocation";
import DollyAvatar from "@/components/DollyAvatar";
import { gatherCrossFeatureContext } from "@/lib/dollyCrossFeature";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChartContext {
  bigThree?: { sun: string; moon: string; rising: string };
  planets?: { name: string; sign: string; position: number; house: string | null; retrograde: boolean }[];
  houses?: { number: number; sign: string; position: number }[];
  specialPoints?: { name: string; sign: string; position: number; house: string | null }[];
  birthDate?: string;
  birthTime?: string;
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

const STARTER_PROMPTS = [
  "What should I know about myself right now?",
  "What's the sky doing to me today?",
  "Tell me about my love life based on my chart",
  "What career path fits my chart?",
  "What patterns do I keep repeating?",
  "What's my biggest blind spot?",
];

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

export default function DollyTab() {
  const { gate, PaywallModal } = usePaywall();
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

  // History drawer state
  const [showHistory, setShowHistory] = useState(false);
  const [pastConversations, setPastConversations] = useState<PastConversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewingDay, setViewingDay] = useState<string | null>(null); // which day's chat is loaded

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
        setChart({
          bigThree: chartData.big_three,
          planets: chartData.planets || [],
          houses: chartData.houses || [],
          specialPoints: chartData.special_points || [],
          birthDate: chartData.birth_date,
          birthTime: chartData.birth_time,
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
              zodiacSystem: chartData.zodiac_system || "tropical",
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

  // Save conversation — always to localStorage, Supabase as backup
  const saveConversation = useCallback(async (msgs: Message[]) => {
    if (!msgs.length) return;

    const todayKey = new Date().toISOString().split("T")[0];
    // Ensure we have a unique conversation ID for this chat session
    const convoId = conversationId || generateConvoId();
    if (!conversationId) setConversationId(convoId);

    // Always save to localStorage first (guaranteed to work)
    try {
      const lsKey = getDollyLsKey(currentUserId);
      const existing = JSON.parse(localStorage.getItem(lsKey) || "{}") as Record<string, { messages: Message[]; updated_at: string; day?: string }>;
      existing[convoId] = { messages: msgs, updated_at: new Date().toISOString(), day: viewingDay || todayKey };
      // Keep last 50 conversations
      const entries = Object.entries(existing).sort((a, b) => b[1].updated_at.localeCompare(a[1].updated_at));
      if (entries.length > 50) {
        const pruned: Record<string, { messages: Message[]; updated_at: string; day?: string }> = {};
        entries.slice(0, 50).forEach(([k, v]) => { pruned[k] = v; });
        localStorage.setItem(lsKey, JSON.stringify(pruned));
      } else {
        localStorage.setItem(lsKey, JSON.stringify(existing));
      }
    } catch { /* localStorage full or unavailable */ }

    // Also try Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      if (conversationId) {
        await supabase
          .from("dolly_conversations")
          .update({ messages: msgs, updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      } else {
        const { data } = await supabase
          .from("dolly_conversations")
          .insert({
            user_id: session.user.id,
            day: todayKey,
            messages: msgs,
          })
          .select("id")
          .single();

        if (data) setConversationId(data.id);
      }
    } catch (err) {
      console.error("Save conversation error (Supabase):", err);
    }
  }, [conversationId, viewingDay, currentUserId]);

  // Send message
  async function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;

    // Tier gate: free tier limited to 5 messages/day
    if (tier === "free" && getDollyUsageToday() >= 5) {
      if (gate("unlimited_dolly")) return;
    }

    setInput("");
    incrementDollyUsage();

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

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
      streamTimeout = setTimeout(() => controller.abort(), 90000);

      const { journalContext, tarotContext } = gatherCrossFeatureContext(currentUserId);
      const res = await authedFetch("/api/dolly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-20).map(m => ({
            role: m.role,
            content: m.content,
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
        const errBody = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errBody.error || `API error: ${res.status}`);
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

      // Fold the latest turns into Dolly's cross-session memory (fire-and-forget).
      if (fullText.trim()) {
        try {
          void authedFetch("/api/dolly/memory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recentMessages: finalMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            }),
          }).catch(() => {});
        } catch { /* ignore */ }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Dolly stream error:", errMsg);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `Something went wrong: ${errMsg}` }
            : m
        )
      );
    } finally {
      if (streamTimeout) clearTimeout(streamTimeout);
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleNewChat() {
    if (isStreaming) {
      abortRef.current?.abort();
    }
    setMessages([]);
    setConversationId(null);
    setIsStreaming(false);
    setViewingDay(null);
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
          const alreadyInList = convos.some(c => c.id === convoKey);
          if (!alreadyInList) {
            // day field may be inside val (new format) or the key itself may be a date (old format)
            const day = val.day || (convoKey.match(/^\d{4}-\d{2}-\d{2}$/) ? convoKey : new Date(val.updated_at).toISOString().split("T")[0]);
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
      setViewingDay(null);
    }
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
    return convo.messages.filter(m => m.role === "user").length;
  }

  // Get last Dolly response for a conversation (for chat list preview)
  function getLastDollyResponse(convo: PastConversation): string {
    const lastAssistant = [...convo.messages].reverse().find(m => m.role === "assistant");
    if (lastAssistant) {
      return lastAssistant.content.length > 80
        ? lastAssistant.content.slice(0, 80) + "..."
        : lastAssistant.content;
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
          <h1
            className="text-lg text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Chats
          </h1>
          {/* New reading button — compose style */}
          <button
            onClick={() => {
              handleNewChat();
              setShowHistory(false);
            }}
            className="w-8 h-8 min-w-[44px] min-h-[44px] rounded-full bg-terracotta/15 border border-terracotta/25 flex items-center justify-center text-terracotta hover:bg-terracotta/25 transition-colors active:scale-95"
            aria-label="New conversation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
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
                        <span className="text-muted text-[10px] uppercase tracking-widest font-medium">
                          {formatConvoDate(convo.day)}
                        </span>
                      </div>
                    )}
                    <div className={`flex items-center gap-0 transition-colors ${
                      isActive ? "bg-terracotta/8" : ""
                    }`}>
                      <button
                        onClick={() => loadConversation(convo)}
                        className="flex-1 text-left px-5 py-3.5 flex gap-3 items-start active:bg-foreground/5 min-w-0"
                      >
                        {/* Dolly avatar */}
                        <DollyAvatar size={40} className="mt-0.5" />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-sm font-medium truncate ${
                              isActive ? "text-foreground" : "text-secondary"
                            }`}>
                              {preview}
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

                      {/* Delete button */}
                      <button
                        onClick={() => {
                          if (confirm("Delete this conversation?")) {
                            deleteConversation(convo);
                          }
                        }}
                        className="px-4 py-3.5 flex-shrink-0 text-foreground/20 active:text-red-400/70 transition-colors self-stretch flex items-center"
                        aria-label="Delete conversation"
                      >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                        </svg>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="ml-[4.5rem] border-b border-foreground/15" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  }

  // ═══════════════════════════════════════════
  // VIEW: Active Chat
  // ═══════════════════════════════════════════
  return (
    <main className="flex-1 flex flex-col max-w-lg lg:max-w-3xl mx-auto w-full">
      {/* Header — moon-orb avatar + DOLLY */}
      <style>{`@keyframes dl-orb{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes dl-glow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.85;transform:scale(1.06)}}`}</style>
      <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--border-card)" }}>
        <button
          onClick={openHistory}
          aria-label="Back to conversations"
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-95"
          style={{ color: "var(--foreground-muted)" }}
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
          <div aria-hidden="true" className="absolute rounded-full" style={{ inset: -5, background: "radial-gradient(circle, var(--lavender), transparent 68%)", opacity: 0.4, animation: "dl-glow 4s ease-in-out infinite" }} />
          <DollyAvatar size={44} float className="relative" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 500, letterSpacing: "0.04em", color: "var(--foreground)" }}>DOLLY</h1>
            <span className="rounded-full" style={{ width: 6, height: 6, background: "var(--sage)", boxShadow: "0 0 7px var(--sage)" }} />
          </div>
          <p style={{ fontFamily: "var(--font-script)", fontSize: 18, lineHeight: 1, color: "var(--lavender)", marginTop: 1 }}>your cosmic guide</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--foreground-muted)", border: "1px solid var(--border-card)" }}
          >
            New chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Empty state — Dolly greeting bubble + suggestion chips */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-[18px]">
            <div
              className="max-w-[86%] self-start px-[19px] py-[17px]"
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

            <div className="flex flex-wrap gap-[9px] self-start max-w-[92%]">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-left font-medium transition-all active:scale-[0.98]"
                  style={{
                    padding: "9px 15px",
                    borderRadius: 99,
                    background: "color-mix(in srgb, var(--journal-accent) 8%, transparent)",
                    border: "0.5px solid color-mix(in srgb, var(--journal-accent) 28%, transparent)",
                    color: "var(--journal-accent)",
                    fontSize: 12.5,
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-[18px] flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              <div
                className="max-w-[82%] px-4 py-3 dl-user-bubble"
                style={{ background: "var(--lavender)", borderRadius: "20px 6px 20px 20px" }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
              </div>
            ) : (
              <div
                className="max-w-[88%] px-[19px] py-[17px]"
                style={{ background: "linear-gradient(165deg, var(--plum), var(--plum-deep, #161022))", border: "0.5px solid rgba(201,206,232,0.16)", borderRadius: "6px 20px 20px 20px" }}
              >
                <div className="text-sm leading-[1.7] whitespace-pre-wrap" style={{ color: "rgba(240,230,210,0.9)" }}>
                  {msg.content}
                  {isStreaming && msg === messages[messages.length - 1] && (
                    <span className="inline-block w-1.5 h-4 animate-pulse ml-0.5 align-middle" style={{ background: "var(--lavender)" }} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-end gap-2 pl-[18px] pr-2 py-2 transition-all" style={{ background: "var(--soft, rgba(255,255,255,0.05))", border: "0.5px solid var(--border-card)", borderRadius: 99 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "Reading the stars..." : "Ask Dolly anything…"}
            aria-label="Chat message"
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted resize-none outline-none max-h-[120px] py-1.5"
            style={{ minHeight: "24px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "24px";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
            aria-label="Send message"
            style={{ backgroundColor: "var(--journal-accent)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--journal-on-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 12h11M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <p className="text-muted text-[9px] text-center mt-2">
          Dolly uses astrology as a lens, not a prediction. You always have agency.
        </p>
      </div>
      {PaywallModal}
    </main>
  );
}
