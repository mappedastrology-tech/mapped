"use client";

/**
 * Logo — the Mapped brand mark.
 *
 * /logo-dark.webp  = cream text (for dark backgrounds)
 * /logo-light.webp = dark text  (for light/cream backgrounds)
 *
 * Auto-detects theme from <html data-theme> and picks the right logo.
 * Can be overridden with the `variant` prop.
 */

import { useState, useEffect } from "react";
import Image from "next/image";

interface LogoProps {
  /** sm = topbar (inline), md = cards, lg = splash screens */
  size?: "sm" | "md" | "lg";
  /** Optional extra className on the wrapper */
  className?: string;
  /** Use inline styles only (for html2canvas compatibility — uses <img> instead of next/image) */
  inlineStyles?: boolean;
  /** Force a specific variant instead of auto-detecting from theme */
  variant?: "light" | "dark";
}

const SIZES = {
  sm: { width: 90, height: 20 },
  md: { width: 140, height: 30 },
  lg: { width: 220, height: 48 },
} as const;

const LOGO_LIGHT = "/logo-light.webp"; // dark text — for cream/light backgrounds
const LOGO_DARK = "/logo-dark.webp";   // cream text — for dark backgrounds

export default function Logo({ size = "md", className = "", inlineStyles = false, variant }: LogoProps) {
  const s = SIZES[size];

  // Auto-detect theme to pick the right logo
  const [theme, setTheme] = useState<string>("dark");

  useEffect(() => {
    const html = document.documentElement;
    const update = () => setTheme(html.getAttribute("data-theme") || "dark");
    update();
    // Watch for theme changes
    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // If variant is explicitly set, use that; otherwise auto-detect
  const src = variant
    ? (variant === "light" ? LOGO_LIGHT : LOGO_DARK)
    : (theme === "light" ? LOGO_LIGHT : LOGO_DARK);

  if (inlineStyles) {
    return (
      <img
        src={src}
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
        src={src}
        alt="Mapped"
        width={s.width}
        height={s.height}
        className="object-contain"
        style={{ width: s.width, height: "auto" }}
        priority
      />
    </div>
  );
}
