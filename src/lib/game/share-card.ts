/**
 * Generate a shareable result card using Canvas API.
 * Outputs a 1080×1920 image (Instagram story size) or 1200×630 (OG/Twitter).
 */

interface ShareCardData {
  playerName: string;
  score: number;
  rounds: number;
  evaded: number;
  caught: number;
  bestHeist: number;
}

export async function generateShareCard(
  data: ShareCardData,
  size: "story" | "og" = "story"
): Promise<Blob> {
  const W = size === "story" ? 1080 : 1200;
  const H = size === "story" ? 1920 : 630;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#17191A";
  ctx.fillRect(0, 0, W, H);

  // Amber glow at top
  const grad = ctx.createRadialGradient(W * 0.5, H * 0.15, 50, W * 0.5, H * 0.15, W * 0.6);
  grad.addColorStop(0, "rgba(255, 166, 43, 0.18)");
  grad.addColorStop(1, "rgba(255, 166, 43, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Purple glow at bottom
  const grad2 = ctx.createRadialGradient(W * 0.5, H * 0.75, 50, W * 0.5, H * 0.75, W * 0.5);
  grad2.addColorStop(0, "rgba(192, 132, 252, 0.1)");
  grad2.addColorStop(1, "rgba(192, 132, 252, 0)");
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, W, H);

  if (size === "story") {
    await drawStoryCard(ctx, W, H, data);
  } else {
    await drawOGCard(ctx, W, H, data);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

async function drawStoryCard(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  data: ShareCardData
) {
  const cx = W / 2;

  // "VERDA" logo text at top
  ctx.fillStyle = "#FFA62B";
  ctx.font = "700 42px 'Urbanist', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("VERDA", cx, 120);

  // Divider
  ctx.fillStyle = "rgba(255, 255, 255, 0.09)";
  ctx.fillRect(cx - 40, 180, 80, 1);

  // Title
  ctx.fillStyle = "#FCFDFD";
  ctx.font = "700 64px 'Urbanist', system-ui, sans-serif";
  ctx.fillText("Protect or Pirate", cx, 220);

  // Subtitle
  ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
  ctx.font = "400 28px 'Host Grotesk', system-ui, sans-serif";
  ctx.fillText("Can you evade Verda\u2019s watermark?", cx, 310);

  // Player name badge
  const nameY = 420;
  ctx.fillStyle = "rgba(255, 166, 43, 0.12)";
  roundRect(ctx, cx - 160, nameY - 10, 320, 60, 30);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 166, 43, 0.3)";
  ctx.lineWidth = 1;
  roundRect(ctx, cx - 160, nameY - 10, 320, 60, 30);
  ctx.stroke();
  ctx.fillStyle = "#FFB94D";
  ctx.font = "700 28px 'Urbanist', system-ui, sans-serif";
  ctx.fillText(data.playerName, cx, nameY + 12);

  // Big score
  const scoreY = 580;
  ctx.fillStyle = "#FFA62B";
  ctx.font = "700 180px 'Urbanist', system-ui, sans-serif";
  ctx.fillText(String(data.score), cx, scoreY);
  ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
  ctx.font = "500 36px 'Urbanist', system-ui, sans-serif";
  ctx.fillText("points", cx, scoreY + 190);

  // Stats grid
  const statsY = 900;
  const statW = 200;
  const stats = [
    { label: "Rounds", value: String(data.rounds), color: "#FCFDFD" },
    { label: "Evaded", value: String(data.evaded), color: "#4ADE80" },
    { label: "Caught", value: String(data.caught), color: "#FFB94D" },
    { label: "Best", value: `+${data.bestHeist}`, color: "#CDA0FF" },
  ];
  const gridStartX = cx - (stats.length * statW) / 2;

  stats.forEach((s, i) => {
    const sx = gridStartX + i * statW + statW / 2;
    // Card bg
    ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
    roundRect(ctx, sx - 80, statsY, 160, 140, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
    ctx.lineWidth = 1;
    roundRect(ctx, sx - 80, statsY, 160, 140, 18);
    ctx.stroke();
    // Value
    ctx.fillStyle = s.color;
    ctx.font = "700 48px 'Urbanist', system-ui, sans-serif";
    ctx.fillText(s.value, sx, statsY + 50);
    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "400 22px 'Host Grotesk', system-ui, sans-serif";
    ctx.fillText(s.label, sx, statsY + 110);
  });

  // Result message
  const msgY = 1140;
  ctx.fillStyle = "rgba(255, 166, 43, 0.12)";
  roundRect(ctx, 80, msgY, W - 160, 120, 20);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 166, 43, 0.3)";
  ctx.lineWidth = 1;
  roundRect(ctx, 80, msgY, W - 160, 120, 20);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "400 26px 'Host Grotesk', system-ui, sans-serif";
  if (data.caught >= data.rounds) {
    ctx.fillText("Verda caught every single attempt.", cx, msgY + 45);
    ctx.fillText("The watermark is unbreakable.", cx, msgY + 80);
  } else if (data.evaded === 0) {
    ctx.fillText(`Verda caught all ${data.caught} stolen posts.`, cx, msgY + 45);
    ctx.fillText("Invisible watermarks win.", cx, msgY + 80);
  } else {
    ctx.fillText(`Evaded ${data.evaded} of ${data.rounds} \u2014 not bad.`, cx, msgY + 45);
    ctx.fillText("But Verda still caught the rest.", cx, msgY + 80);
  }

  // CTA
  const ctaY = 1360;
  ctx.fillStyle = "#FFA62B";
  roundRect(ctx, cx - 220, ctaY, 440, 70, 35);
  ctx.fill();
  ctx.fillStyle = "#17191A";
  ctx.font = "700 28px 'Urbanist', system-ui, sans-serif";
  ctx.fillText("Can you beat my score?", cx, ctaY + 24);

  // Footer
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "400 22px 'Host Grotesk', system-ui, sans-serif";
  ctx.fillText("play.verda.ai", cx, H - 120);

  // Fingerprint watermark pattern (decorative)
  ctx.fillStyle = "rgba(255, 166, 43, 0.04)";
  ctx.font = "400 200px system-ui, sans-serif";
  ctx.fillText("\uD83D\uDC46", 60, 1500);
  ctx.fillText("\uD83D\uDC46", W - 200, 400);
}

async function drawOGCard(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  data: ShareCardData
) {
  const cy = H / 2;

  // Left side — branding + score
  ctx.fillStyle = "#FFA62B";
  ctx.font = "700 32px 'Urbanist', system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("VERDA", 60, 40);

  ctx.fillStyle = "#FCFDFD";
  ctx.font = "700 42px 'Urbanist', system-ui, sans-serif";
  ctx.fillText("Protect or Pirate", 60, 90);

  ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
  ctx.font = "400 20px 'Host Grotesk', system-ui, sans-serif";
  ctx.fillText(`${data.playerName} scored ${data.score} points`, 60, 150);

  // Stats row
  const statsY = 220;
  const stats = [
    { label: "Evaded", value: String(data.evaded), color: "#4ADE80" },
    { label: "Caught", value: String(data.caught), color: "#FFB94D" },
    { label: "Rounds", value: String(data.rounds), color: "#FCFDFD" },
  ];
  stats.forEach((s, i) => {
    const sx = 60 + i * 140;
    ctx.fillStyle = s.color;
    ctx.font = "700 36px 'Urbanist', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(s.value, sx, statsY);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "400 16px 'Host Grotesk', system-ui, sans-serif";
    ctx.fillText(s.label, sx, statsY + 44);
  });

  // Right side — big score
  ctx.textAlign = "right";
  ctx.fillStyle = "#FFA62B";
  ctx.font = "700 140px 'Urbanist', system-ui, sans-serif";
  ctx.fillText(String(data.score), W - 60, cy - 100);
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "500 24px 'Urbanist', system-ui, sans-serif";
  ctx.fillText("points", W - 60, cy + 60);

  // Footer
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.font = "400 18px 'Host Grotesk', system-ui, sans-serif";
  ctx.fillText("play.verda.ai \u00b7 Can you beat this score?", 60, H - 40);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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

export async function shareOrDownload(blob: Blob, filename = "protect-or-pirate.png") {
  const file = new File([blob], filename, { type: "image/png" });

  // Try native share (mobile)
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "Protect or Pirate — Verda",
        text: "Can you evade Verda's invisible watermark? Try to beat my score!",
      });
      return;
    } catch (e) {
      // User cancelled or share failed, fall through to download
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
