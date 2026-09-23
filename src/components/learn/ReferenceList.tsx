"use client";

import { useMemo, useState } from "react";
import type { LearnDomain, ReferenceEntry } from "@/lib/learn/types";
import { searchReference, referenceByDomain, domainsWithReference } from "@/lib/learn/reference";
import { domainAccent, DOMAINS } from "@/lib/learn/registry";
import ReferenceSheet from "./ReferenceSheet";

/** Decorative starfield for the browse header (dark felt) — fixed positions. */
const STARS: [number, number, number, number, number][] = [
  [231, 53, 1.7, 0.6, 4.1], [206, 138, 2.4, 0.24, 5.0], [88, 37, 2.5, 0.23, 3.4],
  [21, 19, 1.9, 0.55, 4.5], [284, 18, 1.9, 0.4, 2.9], [340, 18, 2.2, 0.27, 2.5],
  [275, 119, 2.3, 0.5, 4.6], [152, 53, 2.1, 0.3, 4.7], [120, 134, 1.8, 0.32, 4.3],
  [39, 124, 1.1, 0.26, 4.6], [233, 101, 2.4, 0.3, 3.6], [60, 80, 1.5, 0.34, 3.9],
];

/** A small icon tile — the entry's art, or its initial as a fallback glyph. */
function IconTile({ entry, accent, size }: { entry: ReferenceEntry; accent: string; size: number }) {
  return (
    <span
      className="shrink-0 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: size * 0.26, background: `${accent}1a`, color: "var(--brass)" }}
      aria-hidden="true"
    >
      {entry.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={entry.image} alt="" loading="lazy" style={{ width: size * 0.78, height: size * 0.78, objectFit: "contain" }} />
      ) : (
        <span style={{ fontSize: size * 0.42, fontFamily: "var(--font-serif-lib)" }}>{entry.name[0]}</span>
      )}
    </span>
  );
}

/**
 * The Library reference — "Look it up". Browse an index of topics, tap one to
 * follow it, then search within that topic and open any entry's detail sheet.
 * When a `domain` is supplied (e.g. from a course's Domain Hub) it opens
 * straight into that topic with no browse index.
 */
export default function ReferenceList({ domain, placeholder }: { domain?: LearnDomain; placeholder?: string }) {
  const [topic, setTopic] = useState<LearnDomain | null>(domain ?? null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ReferenceEntry | null>(null);

  const topics = useMemo(() => DOMAINS.filter((d) => domainsWithReference().has(d.id)), []);
  const counts = useMemo(
    () => Object.fromEntries(topics.map((d) => [d.id, referenceByDomain(d.id).length])) as Record<string, number>,
    [topics],
  );

  const meta = topic ? DOMAINS.find((d) => d.id === topic) ?? null : null;
  const accent = topic ? domainAccent(topic) : "var(--brass)";
  const [filter, setFilter] = useState<string | null>(null);
  const found = useMemo(() => (topic ? searchReference(query, topic) : []), [query, topic]);

  /**
   * Filter chips come from the entries themselves rather than a fixed list.
   * The design names All / Signs / Planets / Cards, which are astrology's and
   * tarot's categories — every other topic has its own, and hard-coding those
   * four would leave nine topics with chips that match nothing.
   */
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of topic ? referenceByDomain(topic) : []) {
      if (e.category) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    }
    // Only the few biggest. Astrology alone carries twenty-odd categories —
    // "Annual chart", "Asteroid", "Chart pattern" — and a chip for every one
    // is a worse way in than no chips at all. The rest stay reachable through
    // the search field.
    return [...counts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 4)
      .map(([name]) => name)
      .sort();
  }, [topic]);

  const results = useMemo(
    () => (filter ? found.filter((e) => e.category === filter) : found),
    [found, filter],
  );

  /** For the empty state: a few real entries to offer instead of nothing. */
  const suggestions = useMemo(() => (topic ? referenceByDomain(topic).slice(0, 6) : []), [topic]);

  const sheet = <ReferenceSheet entry={selected} onClose={() => setSelected(null)} onOpenEntry={setSelected} />;

  /* ─── BROWSE: the topic index ─── */
  if (!topic) {
    return (
      <div className="relative">
        {/* Starfield is a dark-mode ornament — in light theme it would paint ink specks on the parchment. */}
        <style>{`@keyframes ref-tw{0%,100%{opacity:.25}50%{opacity:.9}} [data-theme="light"] .ref-stars{display:none}`}</style>
        <div aria-hidden="true" className="ref-stars pointer-events-none absolute inset-x-0 top-0 h-[200px] overflow-hidden" style={{ zIndex: 0 }}>
          {STARS.map(([x, y, s, o, d], i) => (
            <span key={i} className="absolute rounded-full" style={{ left: x, top: y, width: s, height: s, background: "var(--foreground)", opacity: o, animation: `ref-tw ${d}s ease-in-out infinite` }} />
          ))}
        </div>

        <div className="relative" style={{ zIndex: 1 }}>
          <div className="flex items-center justify-center gap-2.5 pt-5 pb-1.5">
            <span style={{ width: 16, height: 1, background: "color-mix(in srgb, var(--brass) 45%, transparent)" }} />
            <span className="text-[9px] font-semibold uppercase" style={{ letterSpacing: "0.2em", color: "var(--foreground-muted)" }}>The Library</span>
            <span style={{ width: 16, height: 1, background: "color-mix(in srgb, var(--brass) 45%, transparent)" }} />
          </div>
          <h1 className="text-center font-medium" style={{ fontFamily: "var(--font-serif-lib)", color: "var(--foreground)", fontSize: 34, lineHeight: 1.05 }}>Look it up</h1>
          <p className="text-[13px] leading-relaxed text-center mt-1.5 mb-5" style={{ color: "var(--foreground-muted)" }}>An index of every topic — tap a thread to follow it.</p>

          <div style={{ borderTop: "0.5px solid var(--border-card)" }}>
            {topics.map((d) => (
              <button
                key={d.id}
                onClick={() => { setTopic(d.id); setQuery(""); }}
                className="w-full flex items-center gap-4 py-4 px-1.5 text-left active:opacity-80 transition-opacity"
                style={{ borderBottom: "0.5px solid var(--border-card)" }}
              >
                <span className="shrink-0 rounded-full" style={{ width: 11, height: 11, background: d.accent, boxShadow: `0 0 0 4px ${d.accent}22` }} />
                <span className="flex-1 min-w-0">
                  <span className="block leading-tight" style={{ fontFamily: "var(--font-serif-lib)", fontSize: 19, fontWeight: 500, color: "var(--foreground)" }}>{d.title}</span>
                  <span className="block text-[11px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>{d.evidenceTag} · {counts[d.id]} entries</span>
                </span>
                <span className="text-[14px] shrink-0" style={{ color: "var(--foreground-faint)" }}>→</span>
              </button>
            ))}
          </div>

          <p className="text-[11px] leading-relaxed mt-6 text-center px-3" style={{ color: "var(--foreground-faint)" }}>
            Evidence-first, with honest safety notes. For learning and reflection — not medical, legal, or financial advice.
          </p>
        </div>
        {sheet}
      </div>
    );
  }

  /* ─── TOPIC: per-topic search + entries ─── */
  const ph = domain && placeholder ? placeholder : `Search ${meta?.title ?? ""}…`;
  return (
    <div>
      {/* Header (only when drilled in from browse; Domain Hub provides its own) */}
      {!domain && meta && (
        <div className="flex items-center gap-3 pt-3 pb-3.5">
          <button
            onClick={() => { setTopic(null); setQuery(""); }}
            aria-label="Back to topics"
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ border: "1px solid var(--border-card)", background: "var(--lib-soft)", color: "var(--foreground)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase font-semibold" style={{ letterSpacing: "0.2em", color: accent }}>{meta.evidenceTag}</p>
            <h1 className="leading-tight" style={{ fontFamily: "var(--font-serif-lib)", fontSize: 26, fontWeight: 500, color: "var(--foreground)" }}>{meta.title}</h1>
          </div>
        </div>
      )}

      {/* Search */}
      <div
        className="flex items-center gap-2.5 px-4 py-3 lib-search"
        style={{
          borderRadius: 14, background: "var(--lib-card)",
          border: "0.5px solid color-mix(in srgb, var(--brass) 45%, transparent)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ph}
          aria-label="Search reference"
          className="flex-1 bg-transparent outline-none"
          style={{ color: "var(--lib-ink)", fontFamily: "var(--font-serif-lib)", fontSize: 15, caretColor: "var(--brass)" }}
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search" className="text-[11px] w-5 h-5 flex items-center justify-center rounded-full shrink-0" style={{ color: "var(--foreground-muted)", background: "var(--lib-soft)" }}>✕</button>
        )}
      </div>

      {/* Filter chips, only where the topic actually has categories. */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[null, ...categories].map((c) => {
            const active = filter === c;
            return (
              <button
                key={c ?? "all"}
                onClick={() => setFilter(c)}
                className="lib-press"
                style={{
                  padding: "6px 13px", borderRadius: 999, minHeight: 32,
                  fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600,
                  background: active ? "var(--lib-gold-cta)" : "var(--lib-card)",
                  color: active ? "#1a1420" : "var(--lib-body)",
                  border: `0.5px solid color-mix(in srgb, var(--brass) ${active ? 60 : 22}%, transparent)`,
                }}
              >
                {c ?? "All"}
              </button>
            );
          })}
        </div>
      )}

      {results.length > 0 && (
        <p className="uppercase" style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: "var(--lib-muted)", marginTop: 14, marginBottom: 6 }}>
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>
      )}

      {results.length === 0 ? (
        /* Edge state 2 — nothing matched. Rather than a dead end, the topic's
           own entries are offered as tappable chips. */
        <div className="text-center" style={{ padding: "34px 8px 10px" }}>
          <span
            className="inline-flex items-center justify-center"
            style={{
              width: 56, height: 56, borderRadius: "50%",
              border: "1.5px dashed color-mix(in srgb, var(--brass) 40%, transparent)",
              color: "var(--lib-muted)", fontFamily: "var(--font-serif-lib)", fontSize: 24,
            }}
            aria-hidden="true"
          >
            ?
          </span>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--lib-ink)", marginTop: 14 }}>
            No entries for &ldquo;{query}&rdquo; yet
          </p>
          {suggestions.length > 0 && (
            <>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--lib-muted)", marginTop: 6 }}>Try one of these instead</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {suggestions.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className="lib-press"
                    style={{
                      padding: "7px 13px", borderRadius: 999, minHeight: 34,
                      fontFamily: "var(--font-serif-lib)", fontSize: 13,
                      background: "var(--lib-card)", color: "var(--lib-ink)",
                      border: "0.5px solid color-mix(in srgb, var(--brass) 25%, transparent)",
                    }}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          {results.map((entry, i) => {
            const a = domainAccent(entry.domain);
            // The first result is the answer most of the time, so it is given
            // the weight of one rather than being lost in an even list.
            const top = i === 0;
            return (
              <button
                key={entry.id}
                onClick={() => setSelected(entry)}
                className="lib-press w-full text-left flex items-center gap-3"
                style={{
                  padding: top ? "13px 14px" : "12px 4px",
                  borderRadius: top ? 16 : 0,
                  marginBottom: top ? 8 : 0,
                  background: top
                    ? "linear-gradient(150deg, rgba(201,169,97,.14), color-mix(in srgb, var(--lib-card) 92%, transparent))"
                    : "transparent",
                  border: top ? "1px solid color-mix(in srgb, var(--brass) 40%, transparent)" : "none",
                  borderBottom: top ? undefined : "0.5px solid var(--lib-card-border)",
                }}
              >
                <IconTile entry={entry} accent={a} size={top ? 46 : 40} />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate" style={{ fontFamily: "var(--font-serif-lib)", fontSize: top ? 18 : 15, color: "var(--lib-ink)" }}>{entry.name}</span>
                    {entry.safety && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#d39a3e" }} aria-hidden="true" />}
                    {top && entry.category && (
                      <span
                        className="uppercase shrink-0"
                        style={{ padding: "2px 7px", borderRadius: 999, background: "color-mix(in srgb, var(--brass) 16%, transparent)", color: "var(--brass-light)", fontFamily: "var(--font-body)", fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em" }}
                      >
                        {entry.category}
                      </span>
                    )}
                  </span>
                  <span className="block mt-0.5 leading-snug truncate" style={{ fontFamily: "var(--font-body)", fontSize: top ? 11 : 10.5, color: "var(--lib-muted)" }}>
                    {!top && entry.category ? `${entry.category} · ` : ""}{entry.summary}
                  </span>
                </span>
                <span className="text-[13px] shrink-0" style={{ color: "var(--lib-muted)" }}>→</span>
              </button>
            );
          })}
        </div>
      )}
      {sheet}
    </div>
  );
}
