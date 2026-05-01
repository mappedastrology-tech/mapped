"use client";

/**
 * TarotCardImage — renders a tarot card's image or a styled fallback.
 *
 * Usage:
 *   <TarotCardImage cardId="major-0" size="sm" />       — small (mini badge in reading list)
 *   <TarotCardImage cardId="cups-14" size="md" />       — medium (spread view)
 *   <TarotCardImage cardId="wands-1" size="lg" />       — large (detail view / home)
 *   <TarotCardImage back size="md" />                   — card back
 */

import Image from "next/image";
import { getCardImagePath, CARD_BACK_IMAGE } from "@/lib/tarot";

interface TarotCardImageProps {
  cardId?: string;
  back?: boolean;
  reversed?: boolean;
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
  /** Fallback content rendered when no image exists */
  fallback?: React.ReactNode;
}

const SIZE_MAP = {
  sm: { w: 40, h: 56 },
  md: { w: 58, h: 93 },
  lg: { w: 120, h: 192 },
  full: { w: 200, h: 320 },
};

export default function TarotCardImage({
  cardId,
  back,
  reversed,
  size = "md",
  className = "",
  fallback,
}: TarotCardImageProps) {
  const dims = SIZE_MAP[size];
  const imagePath = back ? CARD_BACK_IMAGE : cardId ? getCardImagePath(cardId) : null;

  if (!imagePath) {
    // No image available — render fallback or nothing
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <Image
      src={imagePath}
      alt={back ? "Card back" : cardId || "Tarot card"}
      width={dims.w}
      height={dims.h}
      className={`object-cover ${reversed && !back ? "rotate-180" : ""} ${className}`}
      draggable={false}
      priority={size === "lg" || size === "full"}
    />
  );
}
