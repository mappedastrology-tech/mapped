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
