"use client";

/**
 * A true 3D card flip. Both faces (back + front) are always rendered and the
 * inner element rotates on the Y axis, so revealing a card is a smooth flip —
 * no blink, no swap of the same image. The front face is expected to be
 * preloaded by the parent so the reveal is instant.
 */

import Image from "next/image";
import type { CSSProperties } from "react";

const FACE: CSSProperties = {
  position: "absolute",
  inset: 0,
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  borderRadius: 13,
  overflow: "hidden",
  boxShadow: "0 8px 22px rgba(0,0,0,0.4)",
};

export default function FlipCard({
  revealed,
  back,
  face,
  faceAlt,
}: {
  revealed: boolean;
  back: string;
  face: string;
  faceAlt: string;
}) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "941/1672", perspective: 1200 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1)",
          transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Back */}
        <div style={FACE}>
          <Image src={back} alt="Card back" fill className="object-cover" draggable={false} sizes="300px" />
        </div>
        {/* Front (pre-rotated so it faces out after the flip) */}
        <div style={{ ...FACE, transform: "rotateY(180deg)" }}>
          <Image src={face} alt={faceAlt} fill className="object-cover scale-[1.09]" draggable={false} sizes="300px" />
        </div>
      </div>
    </div>
  );
}
