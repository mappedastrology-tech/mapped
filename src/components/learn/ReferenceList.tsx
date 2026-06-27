"use client";

import { useMemo, useState } from "react";
import type { LearnDomain, ReferenceEntry } from "@/lib/learn/types";
import { searchReference, domainsWithReference } from "@/lib/learn/reference";
import { domainAccent, DOMAINS } from "@/lib/learn/registry";
import ReferenceSheet from "./ReferenceSheet";

/** Highlights the matched query substring within a label. */
function Highlight({ text, q, accent }: { text: string; q: string; accent: string }) {
  const query = q.trim();
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark style={{ backgroundColor: "transparent", color: accent, fontWeight: 800 }}>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

/** A small icon tile — the entry's art, or its initial as a fallback glyph. */
function IconTile({ entry, accent, size }: { entry: ReferenceEntry; accent: string; size: number }) {
  return (
    <span
      className="shrink-0 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: size * 0.26, background: `${accent}1a`, color: "var(--brass-light)" }}
      aria-hidden="true"
    >
      {entry.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={entry.image} alt="" loading="lazy" style={{ width: size * 0.78, height: size * 0.78, objectFit: "contain" }} />
      ) : (
        <span style={{ fontSize: size * 0.42, fontFamily: "var(--font-display)" }}>{entry.name[0]}</span>
      )}
    </span>
  );
}

export default function ReferenceList({ domain, placeholder = "Search…" }: { domain?: LearnDomain; placeholder?: string }) {
  const [query, setQuery] = useState("");
  // In the all-topics view, filter by topic first; categories appear once a topic
  // is chosen. On a single-topic page (`domain` set), there are no topic chips.
  const [topic, setTopic] = useState<LearnDomain | "All">("All");
  const [cat, setCat] = useState<string>("All");
  const [selected, setSelected] = useState<ReferenceEntry | null>(null);

  const global = !domain;
  const effectiveDomain: LearnDomain | undefined = domain ?? (topic === "All" ? undefined : topic);

  // Topic chips (global view only) — topics that actually have reference content.
  const topics = useMemo(
    () => (global ? DOMAINS.filter((d) => domainsWithReference().has(d.id)) : []),
    [global],
  );

  const all = useMemo(() => searchReference(query, effectiveDomain), [query, effectiveDomain]);

  // Distinct categories present. In the global view, only surface them once a
  // single topic is selected (otherwise there are far too many to be useful).
  const categories = useMemo(() => {
    if (global && topic === "All") return [];
    const set = new Set<string>();
    for (const e of all) if (e.category) set.add(e.category);
    return Array.from(set);
  }, [all, global, topic]);

  const results = useMemo(() => (cat === "All" ? all : all.filter((e) => e.category === cat)), [all, cat]);

  function pickTopic(t: LearnDomain | "All") {
    setTopic(t);
    setCat("All");
  }

  return (
    <div>
      {/* Search */}
      <div className="sticky top-[52px] z-20 py-2" style={{ backgroundColor: "var(--background)" }}>
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-[14px]" style={{ background: "var(--lib-surface)", border: "0.5px solid rgba(201,169,97,0.45)", boxShadow: "0 0 0 3px rgba(201,169,97,0.08)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Search reference"
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ color: "var(--foreground)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="text-[10px] w-[18px] h-[18px] flex items-center justify-center rounded-full" style={{ color: "var(--foreground-muted)", background: "var(--lib-soft)" }}>✕</button>
          )}
        </div>
      </div>

      {/* Topic chips (all-topics view): choose a topic, then its categories appear */}
      {global && topics.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 mb-0.5" style={{ scrollbarWidth: "none" }}>
          {([{ id: "All" as const, title: "All topics", accent: "var(--brass)" }, ...topics]).map((t) => {
            const active = topic === t.id;
            return (
              <button
                key={t.id}
                onClick={() => pickTopic(t.id)}
                className="shrink-0 text-[11px] px-3 py-1.5 rounded-full font-semibold transition-colors"
                style={active
                  ? { background: "var(--brass)", color: "var(--btn-primary-text)" }
                  : { background: "var(--lib-soft)", color: "var(--foreground-secondary)", border: "0.5px solid rgba(201,169,97,0.16)" }}
              >
                {t.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Category chips */}
      {categories.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {["All", ...categories].map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="shrink-0 text-[11px] px-3 py-1.5 rounded-full font-semibold transition-colors"
                style={active
                  ? { background: "var(--brass)", color: "var(--btn-primary-text)" }
                  : { background: "var(--lib-soft)", color: "var(--foreground-secondary)", border: "0.5px solid rgba(201,169,97,0.16)" }}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[9px] uppercase tracking-[0.18em] mt-2 mb-2 px-1 font-medium" style={{ color: "var(--foreground-muted)" }}>
        {results.length} {results.length === 1 ? "result" : "results"}
      </p>

      {results.length === 0 ? (
        <p className="text-center text-[13px] py-8" style={{ color: "var(--foreground-secondary)" }}>
          No matches for &ldquo;{query}&rdquo;. Try a color, a name, or what you&rsquo;re looking for.
        </p>
      ) : (
        <div>
          {results.map((entry, idx) => {
            const accent = domainAccent(entry.domain);
            const featured = idx === 0;
            if (featured) {
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelected(entry)}
                  className="w-full text-left flex items-center gap-3 p-3.5 rounded-2xl mb-1.5 active:scale-[0.99] transition-transform"
                  style={{ background: `linear-gradient(150deg, ${accent}24, rgba(20,14,28,0.6))`, border: `0.5px solid ${accent}66` }}
                >
                  <IconTile entry={entry} accent={accent} size={46} />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-[18px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                        <Highlight text={entry.name} q={query} accent={accent} />
                      </span>
                      {entry.category && (
                        <span className="text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-full font-semibold shrink-0" style={{ color: "var(--btn-primary-text)", background: "var(--brass)" }}>{entry.category}</span>
                      )}
                      {entry.safety && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#d39a3e" }} aria-hidden="true" />}
                    </span>
                    <span className="block text-[11px] mt-1 leading-snug truncate" style={{ color: "var(--foreground-muted)" }}>{entry.summary}</span>
                  </span>
                  <span className="text-[16px] shrink-0" style={{ color: "var(--brass-light)" }}>→</span>
                </button>
              );
            }
            return (
              <button
                key={entry.id}
                onClick={() => setSelected(entry)}
                className="w-full text-left flex items-center gap-3 px-1 py-3 active:opacity-80 transition-opacity"
                style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}
              >
                <IconTile entry={entry} accent={accent} size={40} />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[15px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                      <Highlight text={entry.name} q={query} accent={accent} />
                    </span>
                    {entry.safety && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#d39a3e" }} aria-hidden="true" />}
                  </span>
                  <span className="block text-[10px] mt-0.5 leading-snug truncate" style={{ color: "var(--foreground-muted)" }}>
                    {entry.category ? `${entry.category} · ` : ""}{entry.summary}
                  </span>
                </span>
                <span className="text-[13px] shrink-0" style={{ color: "var(--foreground-faint)" }}>→</span>
              </button>
            );
          })}
        </div>
      )}

      <ReferenceSheet entry={selected} onClose={() => setSelected(null)} onOpenEntry={setSelected} />
    </div>
  );
}
