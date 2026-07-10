"use client";
import WebEmbed from "./WebEmbed";
import HumanDesignPageContent from "@/app/(tabs)/human-design/HumanDesignPageContent";

export default function WebHumanDesign() {
  return (
    <WebEmbed maxWidth={1000} footerTagline="Your Human Design, decoded.">
      <HumanDesignPageContent />
    </WebEmbed>
  );
}
