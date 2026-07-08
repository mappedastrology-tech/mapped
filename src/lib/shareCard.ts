/**
 * Generate a shareable horoscope card image.
 *
 * Renders onto an offscreen canvas and returns a Blob (PNG).
 * Designed for Instagram stories (1080×1920) but also works as a
 * square crop for other platforms.
 */

interface ShareCardData {
  headline: string;
  horoscope: string;
  vibes: string[];
  avoid: string[];
  moonPhase: string;
  moonEmoji: string;
  zodiacSeason: string;
  date: string;
  userName?: string;
}

export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const W = 1080;
  const H = 1350; // 4:5 ratio — works on IG feed + stories
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ─── Background gradient ───
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#2A1F18");   // dark warm brown
  grad.addColorStop(0.5, "#3D2E23"); // mid brown
  grad.addColorStop(1, "#2A1F18");   // back to dark
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle texture overlay
  ctx.fillStyle = "rgba(243, 232, 214, 0.03)";
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const PAD = 80;
  let y = 100;

  // ─── Moon emoji (large, centered) ───
  ctx.font = "120px serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(243, 232, 214, 0.9)";
  ctx.fillText(data.moonEmoji, W / 2, y + 120);
  y += 170;

  // ─── Date + celestial context ───
  ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(200, 140, 100, 0.7)";
  ctx.letterSpacing = "4px";
  ctx.fillText(data.date.toUpperCase(), W / 2, y);
  y += 30;

  ctx.font = "400 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(243, 232, 214, 0.4)";
  ctx.letterSpacing = "2px";
  ctx.fillText(`${data.moonPhase}  ·  ${data.zodiacSeason} season`, W / 2, y);
  y += 60;

  // ─── Headline ───
  ctx.textAlign = "left";
  ctx.font = "600 48px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "rgba(243, 232, 214, 0.95)";
  ctx.letterSpacing = "0px";
  const headlineLines = wrapText(ctx, data.headline, W - PAD * 2, 48);
  for (const line of headlineLines) {
    ctx.fillText(line, PAD, y);
    y += 58;
  }
  y += 15;

  // ─── Divider line ───
  ctx.strokeStyle = "rgba(200, 140, 100, 0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 35;

  // ─── Horoscope body ───
  ctx.font = "400 28px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "rgba(243, 232, 214, 0.8)";
  const bodyLines = wrapText(ctx, data.horoscope, W - PAD * 2, 28);
  const maxBodyLines = 12;
  const displayLines = bodyLines.slice(0, maxBodyLines);
  for (const line of displayLines) {
    ctx.fillText(line, PAD, y);
    y += 38;
  }
  if (bodyLines.length > maxBodyLines) {
    ctx.fillStyle = "rgba(243, 232, 214, 0.4)";
    ctx.fillText("...", PAD, y);
    y += 38;
  }
  y += 20;

  // ─── Vibes / Avoid row ───
  const colW = (W - PAD * 2 - 40) / 2;
  const vibesX = PAD;
  const avoidX = PAD + colW + 40;

  // Vibes box
  drawRoundedRect(ctx, vibesX, y, colW, 180, 20, "rgba(243, 232, 214, 0.06)", "rgba(243, 232, 214, 0.1)");
  ctx.font = "700 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(200, 140, 100, 0.6)";
  ctx.letterSpacing = "3px";
  ctx.fillText("VIBES", vibesX + 20, y + 30);
  ctx.letterSpacing = "0px";
  ctx.font = "400 22px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "rgba(243, 232, 214, 0.75)";
  data.vibes.slice(0, 4).forEach((v, i) => {
    ctx.fillText(`+ ${v}`, vibesX + 20, y + 62 + i * 32);
  });

  // Avoid box
  drawRoundedRect(ctx, avoidX, y, colW, 180, 20, "rgba(243, 232, 214, 0.06)", "rgba(243, 232, 214, 0.1)");
  ctx.font = "700 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(200, 140, 100, 0.6)";
  ctx.letterSpacing = "3px";
  ctx.fillText("AVOID", avoidX + 20, y + 30);
  ctx.letterSpacing = "0px";
  ctx.font = "400 22px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "rgba(243, 232, 214, 0.5)";
  data.avoid.slice(0, 4).forEach((a, i) => {
    ctx.fillText(`- ${a}`, avoidX + 20, y + 62 + i * 32);
  });
  y += 210;

  // ─── Branding ───
  ctx.textAlign = "center";
  ctx.font = "600 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(200, 140, 100, 0.4)";
  ctx.letterSpacing = "6px";
  ctx.fillText("MAPPED", W / 2, H - 60);

  // Convert to blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/png",
      1.0
    );
  });
}

// ─── Helpers ───

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    const metrics = ctx.measureText(test);
    if (metrics.width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  fill: string, stroke: string
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

/* ═══════════════════════════════════════════
   Tarot / Oracle Reading Share Card
   ═══════════════════════════════════════════ */

interface ReadingShareCardData {
  spreadName: string;
  date: string;
  cards: { name: string; reversed?: boolean; keywords?: string[]; position?: string; meaning?: string; image?: string }[];
}

/** Load an image for canvas drawing; resolves null on failure (never throws). */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generate a mystical/celestial shareable image for a tarot or oracle reading.
 * Returns a PNG Blob ready for Web Share or download.
 */
export async function generateReadingShareCard(data: ReadingShareCardData): Promise<Blob> {
  const W = 1080;
  const single = data.cards.length === 1;
  // Preload the single card's artwork so we can feature it.
  const heroImg = single && data.cards[0].image ? await loadImage(data.cards[0].image) : null;
  // Dynamic height: taller hero layout for a single card, list layout otherwise.
  const cardBlockHeight = Math.max(data.cards.length * 110, 200);
  const H = single ? 1500 : Math.min(1920, Math.max(1200, 480 + cardBlockHeight + 200));
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ─── Deep plum-to-navy gradient background ───
  const bg = ctx.createLinearGradient(0, 0, W * 0.3, H);
  bg.addColorStop(0, "#0e0a14");
  bg.addColorStop(0.4, "#1a1028");
  bg.addColorStop(0.7, "#0f0e1a");
  bg.addColorStop(1, "#0e0a14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ─── Stars field ───
  for (let i = 0; i < 120; i++) {
    const sx = Math.random() * W;
    const sy = Math.random() * H;
    const sr = Math.random() * 1.8 + 0.3;
    const alpha = Math.random() * 0.6 + 0.1;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232, 223, 196, ${alpha})`;
    ctx.fill();
  }

  // ─── Decorative celestial ring (top center) ───
  const cx = W / 2;
  const ringY = 160;
  const ringR = 80;
  ctx.beginPath();
  ctx.arc(cx, ringY, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(201, 169, 97, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Inner ring
  ctx.beginPath();
  ctx.arc(cx, ringY, ringR - 15, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(201, 169, 97, 0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Moon crescent inside ring
  ctx.beginPath();
  ctx.arc(cx, ringY, 30, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(201, 169, 97, 0.15)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 12, ringY - 5, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#0e0a14";
  ctx.fill();

  // ─── Decorative dots along top and bottom ───
  for (let i = 0; i < 9; i++) {
    const dotX = W * 0.15 + (W * 0.7 / 8) * i;
    ctx.beginPath();
    ctx.arc(dotX, 50, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(201, 169, 97, 0.25)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(dotX, H - 50, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(201, 169, 97, 0.25)";
    ctx.fill();
  }

  // ─── Vertical decorative lines on sides ───
  ctx.strokeStyle = "rgba(201, 169, 97, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 80);
  ctx.lineTo(60, H - 80);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W - 60, 80);
  ctx.lineTo(W - 60, H - 80);
  ctx.stroke();

  const PAD = 100;
  let y = ringY + ringR + 50;

  // ─── Spread name ───
  ctx.textAlign = "center";
  ctx.font = "700 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(201, 169, 97, 0.6)";
  ctx.letterSpacing = "6px";
  ctx.fillText(data.spreadName.toUpperCase(), cx, y);
  y += 35;

  // ─── Date ───
  ctx.font = "400 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(232, 223, 196, 0.4)";
  ctx.letterSpacing = "3px";
  ctx.fillText(data.date.toUpperCase(), cx, y);
  y += 50;

  // ─── Horizontal ornament ───
  const ornW = 200;
  ctx.strokeStyle = "rgba(201, 169, 97, 0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - ornW, y);
  ctx.lineTo(cx - 20, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 20, y);
  ctx.lineTo(cx + ornW, y);
  ctx.stroke();
  // Center diamond
  ctx.beginPath();
  ctx.moveTo(cx, y - 6);
  ctx.lineTo(cx + 6, y);
  ctx.lineTo(cx, y + 6);
  ctx.lineTo(cx - 6, y);
  ctx.closePath();
  ctx.fillStyle = "rgba(201, 169, 97, 0.4)";
  ctx.fill();
  y += 50;

  // ─── Single-card hero (daily pull): artwork + name + keywords + meaning ───
  if (single) {
    const card = data.cards[0];
    if (heroImg) {
      const cardW = 300;
      const cardH = cardW * (heroImg.height / heroImg.width || 1.6);
      const cardX = (W - cardW) / 2;
      // Crop a hair off the edges so any printed border doesn't show.
      const inset = Math.min(heroImg.width, heroImg.height) * 0.05;
      ctx.save();
      drawRoundedRectPath(ctx, cardX, y, cardW, cardH, 16);
      ctx.clip();
      ctx.drawImage(
        heroImg,
        inset, inset, heroImg.width - inset * 2, heroImg.height - inset * 2,
        cardX, y, cardW, cardH,
      );
      ctx.restore();
      ctx.strokeStyle = "rgba(201,169,97,0.4)";
      ctx.lineWidth = 2;
      drawRoundedRectPath(ctx, cardX, y, cardW, cardH, 16);
      ctx.stroke();
      y += cardH + 46;
    }

    ctx.textAlign = "center";
    ctx.font = "400 46px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "rgba(232, 223, 196, 0.96)";
    ctx.fillText(card.reversed ? `${card.name}  ↓` : card.name, cx, y);
    y += 44;

    if (card.keywords && card.keywords.length > 0) {
      ctx.font = "400 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = "rgba(201, 169, 97, 0.75)";
      ctx.letterSpacing = "1px";
      ctx.fillText(card.keywords.slice(0, 4).join("  ·  "), cx, y);
      ctx.letterSpacing = "0px";
      y += 44;
    }

    if (card.meaning) {
      ctx.font = "400 27px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "rgba(232, 223, 196, 0.72)";
      ctx.textAlign = "left";
      const lines = wrapText(ctx, card.meaning, W - PAD * 2, 27).slice(0, 8);
      for (const line of lines) {
        ctx.fillText(line, PAD, y);
        y += 40;
      }
    }

    // Branding
    ctx.textAlign = "center";
    ctx.font = "700 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(201, 169, 97, 0.4)";
    ctx.letterSpacing = "8px";
    ctx.fillText("MAPPED", cx, H - 60);
    ctx.letterSpacing = "0px";
    ctx.font = "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(232, 223, 196, 0.2)";
    ctx.fillText("astrology", cx, H - 38);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
        "image/png",
        1.0,
      );
    });
  }

  // ─── Cards (multi-card list) ───
  ctx.textAlign = "left";
  const maxCards = Math.min(data.cards.length, 12);
  for (let i = 0; i < maxCards; i++) {
    const card = data.cards[i];

    // Position label (if exists)
    if (card.position) {
      ctx.font = "600 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = "rgba(201, 169, 97, 0.5)";
      ctx.letterSpacing = "3px";
      ctx.fillText(card.position.toUpperCase(), PAD, y);
      ctx.letterSpacing = "0px";
      y += 28;
    }

    // Card name
    ctx.font = "400 32px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "rgba(232, 223, 196, 0.9)";
    const nameStr = card.reversed ? `${card.name}  ↓` : card.name;
    ctx.fillText(nameStr, PAD, y);
    y += 10;

    // Reversed label
    if (card.reversed) {
      ctx.font = "italic 18px Georgia, 'Times New Roman', serif";
      ctx.fillStyle = "rgba(201, 169, 97, 0.4)";
      ctx.fillText("reversed", PAD, y + 18);
      y += 22;
    }

    // Keywords
    if (card.keywords && card.keywords.length > 0) {
      ctx.font = "400 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = "rgba(232, 223, 196, 0.4)";
      ctx.fillText(card.keywords.slice(0, 4).join("  ·  "), PAD, y + 18);
      y += 22;
    }

    y += 36;

    // Subtle separator between cards (except last)
    if (i < maxCards - 1) {
      ctx.strokeStyle = "rgba(201, 169, 97, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
      y += 24;
    }
  }

  if (data.cards.length > maxCards) {
    y += 10;
    ctx.font = "italic 20px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "rgba(232, 223, 196, 0.3)";
    ctx.textAlign = "center";
    ctx.fillText(`+ ${data.cards.length - maxCards} more cards`, cx, y);
    y += 30;
  }

  // ─── Branding ───
  ctx.textAlign = "center";
  ctx.font = "700 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(201, 169, 97, 0.35)";
  ctx.letterSpacing = "8px";
  ctx.fillText("MAPPED", cx, H - 60);
  ctx.letterSpacing = "0px";
  ctx.font = "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(232, 223, 196, 0.2)";
  ctx.fillText("astrology", cx, H - 38);

  // Convert to blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/png",
      1.0
    );
  });
}

/**
 * Share a reading as a graphic image. Falls back to text share if canvas fails.
 */
export async function shareReadingAsImage(
  data: ReadingShareCardData,
  fallbackText: string
): Promise<void> {
  try {
    const blob = await generateReadingShareCard(data);
    const file = new File([blob], "mapped-reading.png", { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `${data.spreadName} — Mapped`,
      });
    } else if (navigator.share) {
      // Device supports share but not file sharing — share text + try to open image
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      await navigator.share({ text: fallbackText });
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } else {
      // Desktop fallback — open image in new tab
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Also copy text to clipboard
      await navigator.clipboard.writeText(fallbackText);
    }
  } catch (err) {
    // Final fallback — plain text
    if (navigator.share) {
      try { await navigator.share({ text: fallbackText }); } catch {}
    } else {
      await navigator.clipboard.writeText(fallbackText);
    }
  }
}

/* ═══════════════════════════════════════════
   Palmistry Reading Share Card
   ═══════════════════════════════════════════ */

interface PalmShareCardData {
  personName: string;
  handLabel: string; // e.g. "Right hand"
  summary: string;
  highlights: { title: string; text: string }[];
}

export async function generatePalmShareCard(data: PalmShareCardData): Promise<Blob> {
  const W = 1080;
  const H = 1350; // 4:5 — IG feed + stories
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Warm background gradient (matches the app's palette)
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#2A1F18");
  grad.addColorStop(0.5, "#3D2E23");
  grad.addColorStop(1, "#2A1F18");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle texture
  ctx.fillStyle = "rgba(243, 232, 214, 0.03)";
  for (let i = 0; i < 180; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const PAD = 90;
  let y = 150;

  // Palm glyph
  ctx.textAlign = "center";
  ctx.font = "110px serif";
  ctx.fillText("✋", W / 2, y + 90);
  y += 150;

  // Eyebrow
  ctx.font = "700 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(200, 140, 100, 0.75)";
  ctx.letterSpacing = "6px";
  ctx.fillText("PALMISTRY", W / 2, y);
  y += 60;

  // Person name
  ctx.font = "600 56px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "rgba(243, 232, 214, 0.96)";
  ctx.letterSpacing = "0px";
  ctx.fillText(data.personName, W / 2, y);
  y += 48;

  // Hand label
  ctx.font = "400 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(243, 232, 214, 0.45)";
  ctx.letterSpacing = "2px";
  ctx.fillText(data.handLabel, W / 2, y);
  y += 55;

  // Divider
  ctx.strokeStyle = "rgba(200, 140, 100, 0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 50;

  // Summary
  ctx.textAlign = "left";
  ctx.letterSpacing = "0px";
  ctx.font = "400 30px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "rgba(243, 232, 214, 0.85)";
  const summaryLines = wrapText(ctx, data.summary, W - PAD * 2, 30).slice(0, 7);
  for (const line of summaryLines) {
    ctx.fillText(line, PAD, y);
    y += 42;
  }
  y += 25;

  // Highlights
  for (const h of data.highlights.slice(0, 3)) {
    if (y > H - 220) break;
    ctx.font = "700 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(200, 140, 100, 0.85)";
    ctx.fillText(h.title, PAD, y);
    y += 38;
    ctx.font = "400 25px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "rgba(243, 232, 214, 0.7)";
    const hl = wrapText(ctx, h.text, W - PAD * 2, 25).slice(0, 2);
    for (const line of hl) {
      ctx.fillText(line, PAD, y);
      y += 34;
    }
    y += 22;
  }

  // Branding
  ctx.textAlign = "center";
  ctx.font = "600 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(200, 140, 100, 0.4)";
  ctx.letterSpacing = "6px";
  ctx.fillText("MAPPED", W / 2, H - 60);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/png",
      1.0,
    );
  });
}

export async function sharePalmReadingAsImage(
  data: PalmShareCardData,
  fallbackText: string,
): Promise<void> {
  try {
    const blob = await generatePalmShareCard(data);
    const file = new File([blob], "mapped-palm-reading.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `${data.personName} — Palmistry · Mapped` });
    } else if (navigator.share) {
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      await navigator.share({ text: fallbackText });
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } else {
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      await navigator.clipboard.writeText(fallbackText);
    }
  } catch {
    if (navigator.share) {
      try { await navigator.share({ text: fallbackText }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(fallbackText); } catch {}
    }
  }
}
