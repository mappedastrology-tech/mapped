"use client";

/**
 * WebJournal — private reflections (design_handoff_mapped_web "Journal").
 * A compose card bound to today's sky-timed prompt with a live word count; the
 * draft autosaves to localStorage['mapped:web-journal-draft'] on every
 * keystroke, and "Save entry" writes through lib/journal (localStorage plus the
 * Supabase backup), exactly like the mobile Journal.
 *
 * The feed, the streak and the Moon in the prompt header are the signed-in
 * person's own. This page used to show three invented sample entries to any
 * account with none, a hardcoded "7" day streak and "Scorpio Moon" every
 * night; an empty journal now says it is empty.
 */

import { useEffect, useMemo, useState } from "react";
import WebShell, { useWebTheme } from "./WebShell";
import { addEntry, autoTag, type JournalEntry } from "@/lib/journal";
import { getMoonPhase } from "@/lib/celestialCalendar";
import { useJournalEntries } from "./useJournalEntries";
import { useLiveSky } from "./useLiveSky";

type Entry = { key: string; day: string; mon: string; tag: string; moon: string; text: string };
const PROMPTS = [
  "What did today ask of you that you didn’t expect?",
  "Name one thing you’re quietly proud of this week.",
  "Where are you forcing something that wants to be allowed?",
  "Who came to mind today, and what did it stir?",
];
const TAG_STYLE: Record<string, [string, string]> = {
  ritual: ["color-mix(in srgb, var(--go) 16%, transparent)", "var(--go)"],
  tarot: ["color-mix(in srgb, var(--brass) 16%, transparent)", "var(--brass)"],
  prompt: ["color-mix(in srgb, var(--terra) 16%, transparent)", "var(--terra)"],
  note: ["var(--soft)", "var(--muted)"],
};
const MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function panelStars(seed: number, n = 18): React.CSSProperties[] {
  let s = seed;
  const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return Array.from({ length: n }, () => ({
    position: "absolute", left: `${(rand() * 100).toFixed(1)}%`, top: `${(rand() * 100).toFixed(1)}%`,
    width: `${(rand() * 1.5 + 0.5).toFixed(1)}px`, height: `${(rand() * 1.5 + 0.5).toFixed(1)}px`,
    borderRadius: "50%", background: "var(--brass-hi)", opacity: Number((rand() * 0.5 + 0.2).toFixed(2)),
    animation: `mp-tw ${(rand() * 3 + 2).toFixed(1)}s ease-in-out infinite`,
  }));
}

const PROMPT_TEXT = "Where are you carrying tension you could gently set down before the week turns?";

/** Map a real JournalEntry to the feed's display shape. */
function toDisplay(e: JournalEntry, i: number): Entry {
  const dt = e.date ? new Date(`${e.date}T12:00:00`) : new Date(e.created_at);
  const valid = !isNaN(dt.getTime());
  const d = valid ? dt : new Date();
  let moon = "";
  try { moon = getMoonPhase(d).label; } catch { /* ignore */ }
  return {
    key: e.id || `entry-${i}`,
    day: String(d.getDate()),
    mon: MONS[d.getMonth()],
    tag: e.prompt_id ? "prompt" : "note",
    moon,
    text: e.text || e.content || "",
  };
}

export default function WebJournal() {
  const { theme, toggle } = useWebTheme();
  const [draft, setDraft] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const stars = useMemo(() => panelStars(33113), []);
  const journal = useJournalEntries();
  const sky = useLiveSky();

  useEffect(() => {
    try {
      const d = localStorage.getItem("mapped:web-journal-draft"); if (d) setDraft(d);
    } catch { /* ignore */ }
  }, []);

  const onDraft = (v: string) => { setDraft(v); try { localStorage.setItem("mapped:web-journal-draft", v); } catch { /* */ } };
  const saveEntry = () => {
    const txt = draft.trim();
    if (!txt) return;
    const now = new Date();
    const phase = (() => { try { return getMoonPhase(now).phase; } catch { return "unknown"; } })();
    const entry: JournalEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: "local",
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      text: txt,
      content: txt,
      prompt_id: "web-prompt",
      prompt_text: PROMPT_TEXT,
      prompt: PROMPT_TEXT,
      is_burn: false,
      is_voice: false,
      tags: autoTag(txt, now, phase, null, []),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    addEntry(entry);
    journal.refresh();
    setDraft(""); setJustSaved(true);
    try { localStorage.setItem("mapped:web-journal-draft", ""); } catch { /* */ }
  };

  const wordCount = (draft.trim().match(/\S+/g) || []).length;
  const entries = journal.entries.map(toDisplay);
  const streak = journal.streak;
  const streakDots = Array.from({ length: 7 }, (_, i) => i < Math.min(streak, 7));

  return (
    <WebShell current="journal" theme={theme} onToggleTheme={toggle} footerTagline="Your words, kept in rhythm with the sky.">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 32px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px" }}>
          <p style={{ fontFamily: "var(--script)", fontSize: 34, color: "var(--brass)", margin: "0 0 4px" }}>your inner weather</p>
          <h1 style={{ fontFamily: "var(--deco)", fontWeight: 400, fontSize: 54, lineHeight: 1.05, margin: "0 0 14px", color: "var(--fg)" }}>The Journal</h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--fg2)", margin: 0 }}>A private record kept in rhythm with the sky. Today&rsquo;s prompt is timed to the Moon — write freely, and your words are saved right here.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>
          {/* MAIN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            {/* compose */}
            <div className="mp-night" style={{ position: "relative", overflow: "hidden", borderRadius: 22, border: "1px solid var(--hair)", background: "linear-gradient(165deg, #3a2233, var(--card))", boxShadow: "0 12px 40px var(--shadow)", padding: "30px 32px 28px" }}>
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{stars.map((st, i) => <span key={i} style={st} />)}</div>
              <div style={{ position: "relative" }}>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass-hi)", margin: "0 0 12px" }}>{sky ? `Tonight’s prompt · Moon in ${sky.moonSign}` : "Tonight’s prompt"}</p>
                <p style={{ fontFamily: "var(--deco)", fontStyle: "italic", fontSize: 25, lineHeight: 1.4, color: "#f3ecd8", margin: "0 0 22px", textWrap: "pretty" }}>“Where are you carrying tension you could gently set down before the week turns?”</p>
                <textarea
                  className="mp-ta"
                  value={draft}
                  onChange={(e) => onDraft(e.target.value)}
                  placeholder="Start writing…"
                  style={{ width: "100%", minHeight: 170, resize: "vertical", background: "rgba(0,0,0,0.28)", border: "1px solid var(--hair)", borderRadius: 14, padding: "16px 18px", color: "var(--fg)", fontFamily: "var(--wbody)", fontSize: 15.5, lineHeight: 1.75 }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: 14 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "rgba(240,231,208,0.55)" }}>{wordCount} words · saved as you type</span>
                  <button onClick={saveEntry} style={{ fontFamily: "var(--wbody)", fontSize: 14, fontWeight: 700, padding: "12px 26px", borderRadius: 999, cursor: "pointer", background: "var(--brass)", color: "var(--btn-ink)", border: "none" }}>Save entry</button>
                </div>
              </div>
            </div>

            {/* feed */}
            <div>
              <h2 style={{ fontFamily: "var(--deco)", fontSize: 28, fontWeight: 400, margin: "8px 0 18px", color: "var(--fg)" }}>Your reflections</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {entries.length === 0 && (
                  <p style={{ padding: "22px 24px", borderRadius: 16, background: "var(--card)", border: "1px dashed var(--hair)", fontSize: 15, lineHeight: 1.7, color: "var(--muted)", margin: 0 }}>
                    {journal.loading ? "Loading your reflections…" : "Nothing here yet. Your first entry will appear here once you save it."}
                  </p>
                )}
                {entries.map((e, i) => {
                  const ts = TAG_STYLE[e.tag] || TAG_STYLE.note;
                  const isNewest = i === 0 && justSaved;
                  return (
                    <div key={e.key} style={{ padding: "22px 24px", borderRadius: 16, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 14px var(--shadow)", animation: isNewest ? "mp-pop .3s ease" : undefined }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
                        <span style={{ width: 38, textAlign: "center", flex: "0 0 auto" }}>
                          <span style={{ display: "block", fontFamily: "var(--deco)", fontSize: 20, fontWeight: 600, lineHeight: 1, color: "var(--brass)" }}>{e.day}</span>
                          <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--faint)" }}>{e.mon}</span>
                        </span>
                        <span style={{ fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: ts[0], color: ts[1] }}>{e.tag}</span>
                        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--faint)", marginLeft: "auto" }}>{e.moon}</span>
                      </div>
                      <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg2)", margin: 0, textWrap: "pretty" }}>{e.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 96 }}>
            <div style={{ padding: 24, borderRadius: 18, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 16px var(--shadow)", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--deco)", fontSize: 48, fontWeight: 600, lineHeight: 1, color: "var(--brass)", margin: 0 }}>{streak}</p>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--faint)", margin: "6px 0 0" }}>day streak</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
                {streakDots.map((on, i) => (
                  <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: on ? "var(--brass)" : "color-mix(in srgb, var(--brass) 28%, transparent)" }} />
                ))}
              </div>
            </div>
            <div style={{ padding: 24, borderRadius: 18, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 16px var(--shadow)" }}>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: "0 0 14px" }}>Prompt library</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PROMPTS.map((p, i) => (
                  <p key={i} style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--fg2)", margin: 0, paddingBottom: 10, borderBottom: "0.5px solid var(--line)", textWrap: "pretty" }}>{p}</p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </WebShell>
  );
}
