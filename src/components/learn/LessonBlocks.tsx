import type { CalloutTone, LessonBlock } from "@/lib/learn/types";
import SortBlock from "./blocks/SortBlock";
import FlipBlock from "./blocks/FlipBlock";
import MatchBlock from "./blocks/MatchBlock";
import ExploreBlock from "./blocks/ExploreBlock";
import AnnotatedBlock from "./blocks/AnnotatedBlock";

const TONE: Record<CalloutTone, { label: string; color: string; bg: string; icon: string }> = {
  evidence: { label: "What the evidence says", color: "var(--navy)", bg: "rgba(26,37,72,0.12)", icon: "🔬" },
  safety: { label: "Safety", color: "var(--oxblood-light)", bg: "rgba(122,48,40,0.14)", icon: "⚠️" },
  tradition: { label: "Tradition", color: "var(--plum-light)", bg: "rgba(106,58,96,0.14)", icon: "🕯️" },
  history: { label: "History", color: "var(--brass)", bg: "rgba(201,169,97,0.12)", icon: "📜" },
  culture: { label: "Cultural note", color: "var(--sage-light)", bg: "rgba(45,64,41,0.18)", icon: "🌍" },
  tip: { label: "Tip", color: "var(--brass-light)", bg: "rgba(201,169,97,0.10)", icon: "💡" },
};

/** Renders simple bold markdown (**text**) inline. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} style={{ color: "var(--foreground)", fontWeight: 600 }}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export default function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "heading":
            return (
              <h3 key={i} className="text-[16px] font-semibold mt-2" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
                {b.text}
              </h3>
            );
          case "text":
            return (
              <p key={i} className="text-[15px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                <RichText text={b.text} />
              </p>
            );
          case "list":
            return b.ordered ? (
              <ol key={i} className="list-decimal pl-5 flex flex-col gap-1.5">
                {b.items.map((it, j) => (
                  <li key={j} className="text-[14px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}><RichText text={it} /></li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="list-disc pl-5 flex flex-col gap-1.5">
                {b.items.map((it, j) => (
                  <li key={j} className="text-[14px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}><RichText text={it} /></li>
                ))}
              </ul>
            );
          case "keyfacts":
            return (
              <div key={i} className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--tag-bg)", border: "1px solid var(--border-card)" }}>
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--brass)" }}>Key facts</p>
                <ul className="flex flex-col gap-1.5">
                  {b.items.map((it, j) => (
                    <li key={j} className="text-[13px] leading-relaxed flex gap-2" style={{ color: "var(--foreground-secondary)" }}>
                      <span aria-hidden="true" style={{ color: "var(--brass)" }}>·</span><span><RichText text={it} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          case "callout": {
            const t = TONE[b.tone];
            return (
              <div key={i} className="rounded-xl px-4 py-3" style={{ backgroundColor: t.bg, borderLeft: `3px solid ${t.color}` }}>
                <p className="text-[10px] uppercase tracking-widest mb-1 font-semibold flex items-center gap-1.5" style={{ color: t.color }}>
                  <span aria-hidden="true" className="text-[12px]">{t.icon}</span>{b.title || t.label}
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}><RichText text={b.text} /></p>
              </div>
            );
          }
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border-card)" }}>
                <table className="w-full text-[13px]" style={{ color: "var(--foreground-secondary)" }}>
                  <thead>
                    <tr>
                      {b.headers.map((h, j) => (
                        <th key={j} className="text-left px-3 py-2 font-semibold" style={{ color: "var(--brass)", backgroundColor: "var(--background-elevated)", borderBottom: "1px solid var(--border-card)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 align-top" style={{ borderBottom: ri < b.rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                            <RichText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "sort":
            return <SortBlock key={i} prompt={b.prompt} instructions={b.instructions} groups={b.groups} />;
          case "flip":
            return <FlipBlock key={i} prompt={b.prompt} instructions={b.instructions} cards={b.cards} />;
          case "match":
            return <MatchBlock key={i} prompt={b.prompt} instructions={b.instructions} pairs={b.pairs} />;
          case "explore":
            return <ExploreBlock key={i} prompt={b.prompt} instructions={b.instructions} image={b.image} items={b.items} />;
          case "annotated":
            return <AnnotatedBlock key={i} prompt={b.prompt} instructions={b.instructions} image={b.image} pins={b.pins} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
