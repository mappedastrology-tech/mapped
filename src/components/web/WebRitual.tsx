"use client";
import WebEmbed from "./WebEmbed";
import RitualPageContent from "@/app/(tabs)/learn/RitualPageContent";

export default function WebRitual() {
  return (
    <WebEmbed footerTagline="A small practice, tuned to the sky.">
      <RitualPageContent />
    </WebEmbed>
  );
}
