"use client";

/**
 * FolderCard — a card shaped like a manila file folder.
 *
 * A small rounded "tab" projects upward from the top edge, and the main
 * body is a rounded rectangle. The tab can hold a short label (e.g. a
 * category) and the body holds the card content. Designed to evoke
 * physical paper filing, matching the Mapped paper aesthetic.
 */

import React from "react";

type ColorKey = "terracotta" | "amber" | "sage" | "cream" | "paper";

interface FolderCardProps {
  /** Short label shown on the folder tab */
  tabLabel?: string;
  /** Where the tab projects from along the top edge */
  tabPosition?: "left" | "center" | "right";
  /** Main card fill color — references theme CSS vars */
  color?: ColorKey;
  /** Card body content */
  children?: React.ReactNode;
  /** Extra class on the card body wrapper */
  className?: string;
  /** Click handler (makes whole card a button) */
  onClick?: () => void;
}

const COLOR_MAP: Record<ColorKey, { bg: string; text: string; tabBg: string }> = {
  terracotta: {
    bg: "var(--terracotta)",
    text: "var(--cream)",
    tabBg: "var(--rust)",
  },
  amber: {
    bg: "var(--amber)",
    text: "var(--ink)",
    tabBg: "var(--amber-light)",
  },
  sage: {
    bg: "var(--sage)",
    text: "var(--cream)",
    tabBg: "var(--sage-light)",
  },
  cream: {
    bg: "var(--surface)",
    text: "var(--ink)",
    tabBg: "var(--paper-deep)",
  },
  paper: {
    bg: "var(--paper)",
    text: "var(--ink)",
    tabBg: "var(--paper-deep)",
  },
};

export default function FolderCard({
  tabLabel,
  tabPosition = "left",
  color = "terracotta",
  children,
  className = "",
  onClick,
}: FolderCardProps) {
  const palette = COLOR_MAP[color];

  const tabAlign =
    tabPosition === "left"
      ? "left-5"
      : tabPosition === "right"
      ? "right-5"
      : "left-1/2 -translate-x-1/2";

  const Wrapper: React.ElementType = onClick ? "button" : "div";

  return (
    <div className={`relative ${className}`}>
      {/* Tab — projects upward from the card top edge */}
      {tabLabel && (
        <div
          className={`absolute -top-3 ${tabAlign} z-10 pt-1.5 pb-4
                      text-[10px] uppercase tracking-[0.2em] font-bold text-center
                      rounded-t-xl rounded-br-xl`}
          style={{
            backgroundColor: palette.tabBg,
            color: palette.text,
            // Right padding slightly larger to compensate for letter-spacing on last char
            paddingLeft: 16,
            paddingRight: 12,
            // Bottom edge tucks behind the card body
            paddingBottom: 14,
            marginBottom: -12,
          }}
        >
          {tabLabel}
        </div>
      )}

      {/* Card body — rounded rectangle with soft shadow */}
      <Wrapper
        onClick={onClick}
        className={`relative block w-full rounded-[22px] px-6 py-6 text-left transition-transform
                    ${onClick ? "active:scale-[0.99] cursor-pointer" : ""}`}
        style={{
          backgroundColor: palette.bg,
          color: palette.text,
          boxShadow:
            "0 1px 0 rgba(42, 31, 24, 0.04), 0 12px 24px -12px rgba(42, 31, 24, 0.18)",
        }}
      >
        {children}
      </Wrapper>
    </div>
  );
}
