"use client";

import WebEmbed from "./WebEmbed";
import NumerologyPageContent from "@/app/(tabs)/numerology/NumerologyPageContent";

export default function WebNumerology() {
  return (
    <WebEmbed footerTagline="Your numbers, read plainly.">
      <NumerologyPageContent />
    </WebEmbed>
  );
}
