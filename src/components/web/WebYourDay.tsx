"use client";

/**
 * "Your day" on the desktop almanac — the categories this person tracks, read
 * from the real sky (lib/almanacCategories), in the web design language: a card
 * of tiles, the chosen tile's reasons and best window beside them, and an edit
 * mode for adding and removing categories. Same storage as the mobile almanac
 * (useAlmanacCategories), so a list set on the phone shows up here.
 */

import { useMemo, useState } from "react";
import { getCategoryDefinitions, readCategoryForDay, SCORE_EXPLAINER, type CategoryReading } from "@/lib/almanacCategories";
import { useAlmanacCategories } from "@/components/almanac/useAlmanacCategories";

const card: React.CSSProperties = { borderRadius: 20, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "0 4px 18px var(--shadow)" };
const eyebrow: React.CSSProperties = { fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--brass)", margin: 0 };

const ACCENT: Record<CategoryReading["tier"], string> = { favorable: "var(--go)", mixed: "var(--brass)", quiet: "var(--muted)" };

function unslug(id: string): string {
  return id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function Bar({ score, tier }: { score: number; tier: CategoryReading["tier"] }) {
  return (
    <span aria-hidden="true" style={{ display: "block", flex: 1, height: 5, borderRadius: 999, overflow: "hidden", background: "color-mix(in srgb, var(--fg) 10%, transparent)" }}>
      <span style={{ display: "block", height: "100%", width: `${score * 10}%`, borderRadius: 999, background: ACCENT[tier] }} />
    </span>
  );
}

function Mark({ weight }: { weight: number }) {
  const color = weight > 0 ? "var(--go)" : weight < 0 ? "var(--terra)" : "var(--faint)";
  const text = weight === 0 ? "Neutral" : `${weight > 0 ? "Helps +" : "Hinders −"}${Math.abs(weight).toFixed(1)}`;
  return (
    <span style={{ flex: "0 0 auto", fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 6, color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>{text}</span>
  );
}

export default function WebYourDay({ date }: { date: Date | null }) {
  const { categories, customNames, add, remove, addCustom } = useAlmanacCategories();
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const readings = useMemo(
    () => (date ? categories.map((id) => readCategoryForDay(id, date, { name: customNames[id] })).filter((r) => r.scored) : []),
    [date, categories, customNames],
  );
  const current = readings.find((r) => r.id === selected) ?? readings[0] ?? null;
  const defs = getCategoryDefinitions();
  const domains = useMemo(() => {
    const m = new Map<string, typeof defs>();
    for (const d of defs) m.set(d.isBase ? "Base" : d.domain, [...(m.get(d.isBase ? "Base" : d.domain) ?? []), d]);
    return [...m.entries()];
  }, [defs]);
  const nameOf = (id: string) => defs.find((d) => d.id === id)?.name ?? customNames[id] ?? unslug(id);

  return (
    <div style={{ ...card, padding: "28px 30px 30px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <h2 style={{ fontFamily: "var(--deco)", fontSize: 24, fontWeight: 500, letterSpacing: "0.02em", margin: 0, color: "var(--fg)" }}>Your day</h2>
        <button
          onClick={() => setEditing((v) => !v)}
          aria-expanded={editing}
          style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 700, color: "var(--brass)", background: "transparent", border: "1px solid var(--hair)", borderRadius: 999, padding: "6px 14px", cursor: "pointer" }}
        >
          {editing ? "Done" : "Edit categories"}
        </button>
      </div>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--faint)", margin: "6px 0 18px", textWrap: "pretty" }}>{SCORE_EXPLAINER}</p>

      {editing && (
        <div style={{ marginBottom: 22, padding: "18px 20px", borderRadius: 14, background: "var(--soft)", border: "1px solid var(--line)" }}>
          <p style={eyebrow}>Tracking</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0 16px" }}>
            {categories.length === 0 && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--muted)" }}>Nothing yet — add one below.</span>}
            {categories.map((id) => (
              <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, padding: "5px 6px 5px 12px", borderRadius: 999, background: "var(--card)", border: "1px solid var(--hair)", color: "var(--fg)" }}>
                {nameOf(id)}
                <button onClick={() => remove(id)} aria-label={`Remove ${nameOf(id)}`} style={{ width: 20, height: 20, borderRadius: 999, border: "none", background: "transparent", color: "var(--terra)", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          {domains.map(([domain, list]) => {
            const open = list.filter((d) => !categories.includes(d.id));
            if (open.length === 0) return null;
            return (
              <div key={domain} style={{ marginBottom: 12 }}>
                <p style={{ ...eyebrow, color: "var(--muted)", fontSize: 9.5 }}>{domain}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 7 }}>
                  {open.map((d) => (
                    <button key={d.id} onClick={() => add(d.id)} title={d.description}
                      style={{ fontFamily: "var(--font-ui)", fontSize: 12, padding: "5px 11px", borderRadius: 999, border: "1px dashed var(--hair)", background: "transparent", color: "var(--fg2)", cursor: "pointer" }}>
                      + {d.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <form
            onSubmit={(e) => { e.preventDefault(); setNote(addCustom(custom)); setCustom(""); }}
            style={{ display: "flex", gap: 8, marginTop: 14 }}
          >
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Your own — e.g. Focus, Pottery"
              aria-label="Custom category name"
              style={{ flex: 1, fontFamily: "var(--font-ui)", fontSize: 13.5, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--hair)", background: "var(--card)", color: "var(--fg)" }}
            />
            <button type="submit" style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 10, border: "none", background: "var(--brass)", color: "var(--card)", cursor: "pointer" }}>Add</button>
          </form>
          {note && <p role="status" style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--muted)", margin: "8px 0 0" }}>{note}</p>}
        </div>
      )}

      {!date && <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--muted)", margin: 0 }}>Reading today’s sky…</p>}
      {date && readings.length === 0 && !editing && (
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--muted)", margin: 0 }}>You aren’t tracking any categories. Choose “Edit categories” to add a few.</p>
      )}

      {readings.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.15fr)", gap: 22, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }} aria-label="Your categories today">
            {readings.map((r) => {
              const on = current?.id === r.id;
              const top = [...r.reasons].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))[0];
              return (
                <button
                  key={r.id}
                  aria-pressed={on}
                  onClick={() => setSelected(r.id)}
                  style={{
                    textAlign: "left", cursor: "pointer", padding: "13px 15px", borderRadius: 14,
                    background: on ? "color-mix(in srgb, var(--brass) 9%, var(--card))" : "transparent",
                    border: on ? "1px solid color-mix(in srgb, var(--brass) 45%, transparent)" : "1px solid var(--line)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", flex: "0 0 auto" }}>{r.name}</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ACCENT[r.tier] }}>{r.word}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontFamily: "var(--deco)", fontSize: 16, color: "var(--fg2)" }}>{r.score.toFixed(1)}</span>
                  </span>
                  <span style={{ display: "flex", margin: "8px 0 6px" }}><Bar score={r.score} tier={r.tier} /></span>
                  {top && <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{top.label}</span>}
                </button>
              );
            })}
          </div>

          {current && (
            <div aria-live="polite" style={{ padding: "4px 0 0" }}>
              <p style={eyebrow}>{current.name} · {current.word} · {current.score.toFixed(1)} / 10</p>
              {current.readAs && current.readAs !== "General" && (
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--faint)", margin: "6px 0 0" }}>“{current.name}” is read like {current.readAs}.</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
                {current.reasons.map((x, i) => (
                  <div key={i} style={{ paddingBottom: 12, borderBottom: "0.5px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, justifyContent: "space-between" }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--fg)" }}>{x.label}</span>
                      <Mark weight={x.weight} />
                    </div>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, lineHeight: 1.55, color: "var(--muted)", margin: "4px 0 0", textWrap: "pretty" }}>{x.note}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: "13px 16px", borderRadius: 12, background: "color-mix(in srgb, var(--go) 8%, var(--card))", border: "1px solid color-mix(in srgb, var(--go) 18%, transparent)" }}>
                <p style={{ ...eyebrow, color: "var(--muted)", fontSize: 9.5 }}>Best window</p>
                {current.bestWindow ? (
                  <>
                    <p style={{ fontFamily: "var(--deco)", fontSize: 19, color: "var(--fg)", margin: "4px 0 2px" }}>{current.bestWindow.start} – {current.bestWindow.end}</p>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--muted)", margin: 0 }}>{current.bestWindow.reason}</p>
                  </>
                ) : (
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--muted)", margin: "4px 0 0" }}>{current.windowNote}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
