"use client";
import WebEmbed from "./WebEmbed";
import PalmistryPageContent from "@/app/(tabs)/palmistry/PalmistryPageContent";

export default function WebPalmistry() {
  return (
    <WebEmbed footerTagline="Read the map in your hands.">
      <PalmistryPageContent />
    </WebEmbed>
  );
}
