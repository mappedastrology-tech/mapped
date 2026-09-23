"use client";

/**
 * The chrome every lesson and exercise screen shares.
 *
 * The handoff specifies this once and then says "same chrome" for eight
 * frames, so it lives here rather than being retyped in each. That also means
 * the disabled CTA, the info panel and the feedback colours can only be got
 * right or wrong in one place.
 *
 * Lesson screens sit on bare felt with no plum hero — the plum panels belong
 * to the Library home and the course path, and the point of these screens is
 * that the content is the hero.
 *
 * Colours come from tokens, not the spec's dark-theme literals, so these work
 * on the cream page too.
 */

import type { ReactNode } from "react";

/* ── Progress header ────────────────────────────────────────────────────── */

/**
 * Close button, progress track, step label.
 *
 * The close goes to the logical parent (the course), not browser-back, so
 * stepping out of a lesson lands on the course rather than the previous
 * lesson — the same rule LibraryHeader follows elsewhere in the library.
 */
export function LessonProgressHeader({
  progress,
  label,
  onClose,
  closeLabel = "Close lesson",
}: {
  /** 0–1. */
  progress: number;
  /** e.g. "5 / 9", "Concept 2 / 5", "Explore". */
  label: string;
  onClose: () => void;
  closeLabel?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div className="flex items-center" style={{ padding: "18px 22px 0", gap: 14 }}>
      <button
        onClick={onClose}
        aria-label={closeLabel}
        className="lib-press flex items-center justify-center shrink-0"
        style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "var(--lib-track)", color: "var(--lib-body)",
          // 30px is the design's disc; the tap target is padded out to 44.
          margin: -7, padding: 7, boxSizing: "content-box",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="flex-1 overflow-hidden" style={{ height: 6, borderRadius: 999, background: "var(--lib-track)" }}>
        <div
          style={{
            height: "100%", width: `${pct}%`, borderRadius: 999,
            background: "linear-gradient(90deg,#a88a40,#d4b878)",
            transition: "width .45s cubic-bezier(.34,1.56,.64,1)",
          }}
        />
      </div>

      <span
        className="uppercase shrink-0"
        style={{
          fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 600,
          letterSpacing: "0.14em", color: "var(--lib-muted)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Title block ────────────────────────────────────────────────────────── */

/**
 * Centred eyebrow + screen title.
 *
 * The title is uppercased because --font-display is JS Chanok, which has no
 * lowercase. Mixed-case serif text on these screens uses --font-serif-lib.
 */
export function LessonTitle({
  eyebrow,
  title,
  size = 21,
}: {
  eyebrow?: string;
  title: string;
  size?: number;
}) {
  return (
    <div className="text-center" style={{ padding: "20px 26px 0" }}>
      {eyebrow && (
        <p
          className="uppercase"
          style={{
            fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.2em", color: "var(--brass)",
          }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="uppercase"
        style={{
          fontFamily: "var(--font-display)", fontSize: size, fontWeight: 500,
          letterSpacing: "0.07em", lineHeight: 1.15, color: "var(--lib-ink)",
          marginTop: eyebrow ? 9 : 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

/* ── Primary call to action ─────────────────────────────────────────────── */

/**
 * The gold pill.
 *
 * Disabled is a real visual state rather than a dimmed button, because these
 * screens gate progress ("see every pin first", "answer before continuing")
 * and the reader needs to see that the way on exists but is not open yet.
 */
export function PrimaryPill({
  children,
  onClick,
  href,
  disabled = false,
  full = false,
  arrow = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  full?: boolean;
  arrow?: boolean;
}) {
  const style: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: full ? "14px 22px" : "11px 23px",
    borderRadius: 999,
    background: disabled ? "rgba(201,169,97,0.22)" : "var(--lib-gold-cta)",
    color: disabled ? "rgba(240,230,210,0.55)" : "#1a1815",
    fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.18em", textTransform: "uppercase",
    width: full ? "100%" : undefined,
    cursor: disabled ? "not-allowed" : "pointer",
    // 11px text in an 11px pad is a 33px target; padded out to the 44px minimum.
    minHeight: 44,
  };

  const inner = (
    <>
      <span>{children}</span>
      {arrow && <span aria-hidden="true" style={{ letterSpacing: 0 }}>→</span>}
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} className="lib-press" style={style}>{inner}</a>
    );
  }
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={disabled ? undefined : "lib-press"}
      style={style}
    >
      {inner}
    </button>
  );
}

/* ── Info panel ─────────────────────────────────────────────────────────── */

/**
 * The reveal / caption / detail panel.
 *
 * Dark plum in BOTH themes. --lib-plum turns lavender in light mode, which is
 * why this uses --lib-plum-island: the design keeps these panels dark so the
 * accent eyebrow and cream body stay legible wherever they appear.
 */
export function InfoPanel({
  eyebrow,
  accent = "var(--brass)",
  children,
  style,
}: {
  eyebrow?: string;
  accent?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--lib-plum-island)",
        borderRadius: 16,
        boxShadow: `inset 0 0 0 0.5px color-mix(in srgb, ${accent} 40%, transparent)`,
        padding: "14px 16px",
        ...style,
      }}
    >
      {eyebrow && (
        <p
          className="uppercase"
          style={{
            fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.2em", color: accent, marginBottom: 7,
          }}
        >
          {eyebrow}
        </p>
      )}
      <div style={{ color: "var(--lib-on-plum)", fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.55 }}>
        {children}
      </div>
    </div>
  );
}

/* ── Feedback ───────────────────────────────────────────────────────────── */

/** The panel shown after answering. Correct is sage, wrong is oxblood. */
export function FeedbackPanel({ correct, children }: { correct: boolean; children: ReactNode }) {
  return (
    <div
      role="status"
      style={{
        marginTop: 17,
        padding: "14px 16px",
        borderRadius: 14,
        background: correct ? "rgba(90,122,58,0.12)" : "rgba(90,31,26,0.14)",
        border: correct ? "0.5px solid rgba(90,122,58,0.3)" : "0.5px solid rgba(122,48,40,0.4)",
      }}
    >
      <p
        className="uppercase"
        style={{
          fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700,
          letterSpacing: "0.2em", color: correct ? "var(--sage-bright)" : "#c98a7a",
          marginBottom: 6,
        }}
      >
        {correct ? "Correct" : "Not quite"}
      </p>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.55, color: "var(--lib-ink)" }}>
        {children}
      </div>
    </div>
  );
}

/* ── Quiz option row ────────────────────────────────────────────────────── */

export type OptionState = "idle" | "correct" | "wrong" | "dimmed";

/** One answer row. Bodoni, because the text is mixed case. */
export function OptionRow({
  state, selected, onClick, children, disabled,
}: {
  state: OptionState;
  selected: boolean;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  const bg =
    state === "correct" ? "rgba(90,122,58,0.16)"
    : state === "wrong" ? "rgba(90,31,26,0.18)"
    : "var(--lib-card)";
  const border =
    state === "correct" ? "1.5px solid var(--sage)"
    : state === "wrong" ? "1.5px solid var(--oxblood-light)"
    : "1.5px solid color-mix(in srgb, var(--brass) 12%, transparent)";
  const color = state === "idle" ? "var(--lib-body)" : "var(--lib-ink)";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={disabled ? "flex items-center w-full text-left" : "lib-press flex items-center w-full text-left"}
      style={{
        gap: 13, padding: "15px 16px", borderRadius: 14, minHeight: 44,
        background: bg, border, color,
        opacity: state === "dimmed" ? 0.45 : 1,
        transition: "all .2s ease",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 21, height: 21, borderRadius: "50%", flexShrink: 0,
          border: `2px solid ${
            state === "correct" ? "var(--sage)"
            : state === "wrong" ? "var(--oxblood-light)"
            : selected ? "var(--brass)"
            : "color-mix(in srgb, var(--brass) 30%, transparent)"
          }`,
          background: selected && state === "idle" ? "var(--brass)" : "transparent",
        }}
      />
      <span style={{ fontFamily: "var(--font-serif-lib)", fontSize: 16, lineHeight: 1.3 }}>{children}</span>
    </button>
  );
}
