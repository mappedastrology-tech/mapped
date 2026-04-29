"use client";

/**
 * Logo — the Mapped brand mark.
 *
 * Uses /logo-terracotta-cropped.png — the terracotta wordmark, tight-cropped
 * to its content bbox so it renders correctly in small inline headers.
 * Three sizes: "sm" (TopBar), "md" (share cards), "lg" (landing/onboarding).
 */

import Image from "next/image";

interface LogoProps {
  /** sm = topbar (inline), md = cards, lg = splash screens */
  size?: "sm" | "md" | "lg";
  /** Optional extra className on the wrapper */
  className?: string;
  /** Use inline styles only (for html2canvas compatibility — uses <img> instead of next/image) */
  inlineStyles?: boolean;
}

// Source image is 3789x1362 (aspect 2.78:1)
const SIZES = {
  sm: { width: 100, height: 36 },
  md: { width: 160, height: 58 },
  lg: { width: 260, height: 93 },
} as const;

const LOGO_SRC = "/logo-terracotta-cropped.png";

export default function Logo({ size = "md", className = "", inlineStyles = false }: LogoProps) {
  const s = SIZES[size];

  if (inlineStyles) {
    // html2canvas can't handle next/image, so use a plain <img>
    return (
      <img
        src={LOGO_SRC}
        alt="Mapped"
        width={s.width}
        height={s.height}
        style={{
          width: s.width,
          height: s.height,
          objectFit: "contain",
          display: "block",
          margin: "0 auto",
        }}
        className={className}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src={LOGO_SRC}
        alt="Mapped"
        width={s.width}
        height={s.height}
        className="object-contain"
        priority
      />
    </div>
  );
}
