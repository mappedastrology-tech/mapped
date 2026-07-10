"use client";
import WebEmbed from "./WebEmbed";
import YouTab from "@/app/(tabs)/you/page";

export default function WebChart() {
  return (
    <WebEmbed maxWidth={1000} footerTagline="Your chart, read plainly.">
      <YouTab />
    </WebEmbed>
  );
}
