"use client";

import dynamic from "next/dynamic";

const AlmanacPageContent = dynamic(() => import("./AlmanacPageContent"), {
  ssr: false,
});

export default function AlmanacPage() {
  return <AlmanacPageContent />;
}
