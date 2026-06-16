/**
 * Generate a shareable result card using Canvas API.
 * Includes: banner, score, stats, image collage, leaderboard, CTA.
 */

export interface RoundImage {
  previewUrl: string | null;
  imageSrc: string;
  caught: boolean | null;
  points: number;
}

export interface LeaderboardRow {
  name: string;
  score: number;
  isYou: boolean;
}

export interface ShareCardData {
  playerName: string;
  score: number;
  rounds: number;
  evaded: number;
  caught: number;
  bestHeist: number;
  images: RoundImage[];
  leaderboard: LeaderboardRow[];
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const cx = W / 2;
  const pad = 60;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // === BACKGROUND ===
  ctx.fillStyle = "#17191A";
  ctx.fillRect(0, 0, W, H);

  // Amber glow top-right
  const g1 = ctx.createRadialGradient(W * 0.7, H * 0.08, 40, W * 0.7, H * 0.08, W * 0.5);
  g1.addColorStop(0, "rgba(255, 166, 43, 0.22)");
  g1.addColorStop(1, "transparent");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // Green glow bottom-left
  const g2 = ctx.createRadialGradient(W * 0.2, H * 0.55, 40, W * 0.2, H * 0.55, W * 0.4);
  g2.addColorStop(0, "rgba(74, 222, 128, 0.06)");
  g2.addColorStop(1, "transparent");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  let y = 70;

  // === VERDA LOGO ===
  ctx.fillStyle = "#FFA62B";
  ctx.font = "700 36px 'Urbanist', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("VERDA", cx, y);
  y += 50;

  ctx.fillStyle = "rgba(255,255,255,0.09)";
  ctx.fillRect(cx - 30, y, 60, 1);
  y += 20;

  // === TITLE ===
  ctx.fillStyle = "#FCFDFD";
  ctx.font = "700 56px 'Urbanist', system-ui, sans-serif";
  ctx.fillText("Evade Verda", cx, y);
  y += 70;

  // === PLAYER BADGE ===
  const nameW = Math.max(280, ctx.measureText(data.playerName).width + 80);
  ctx.fillStyle = "rgba(255, 166, 43, 0.12)";
  roundRect(ctx, cx - nameW / 2, y, nameW, 52, 26);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 166, 43, 0.3)";
  ctx.lineWidth = 1;
  roundRect(ctx, cx - nameW / 2, y, nameW, 52, 26);
  ctx.stroke();
  ctx.fillStyle = "#FFB94D";
  ctx.font = "700 24px 'Urbanist', system-ui, sans-serif";
  ctx.fillText(data.playerName, cx, y + 14);
  y += 80;

  // === BIG SCORE ===
  ctx.fillStyle = "#FFA62B";
  ctx.font = "700 160px 'Urbanist', system-ui, sans-serif";
  ctx.fillText(String(data.score), cx, y);
  y += 170;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "500 30px 'Urbanist', system-ui, sans-serif";
  ctx.fillText("points scored", cx, y);
  y += 60;

  // === STATS ROW ===
  const stats = [
    { label: "Rounds", value: String(data.rounds), color: "#FCFDFD" },
    { label: "Evaded", value: String(data.evaded), color: "#4ADE80" },
    { label: "Caught", value: String(data.caught), color: "#FFB94D" },
    { label: "Best", value: `+${data.bestHeist}`, color: "#FFA62B" },
  ];
  const statW = (W - pad * 2 - 24) / 4;
  stats.forEach((s, i) => {
    const sx = pad + i * (statW + 8);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    roundRect(ctx, sx, y, statW, 110, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 1;
    roundRect(ctx, sx, y, statW, 110, 16);
    ctx.stroke();
    ctx.fillStyle = s.color;
    ctx.font = "700 40px 'Urbanist', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(s.value, sx + statW / 2, y + 30);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "400 18px 'Host Grotesk', system-ui, sans-serif";
    ctx.fillText(s.label, sx + statW / 2, y + 82);
  });
  y += 135;

  // === IMAGE COLLAGE ===
  const imgSize = (W - pad * 2 - 4 * 10) / 5;
  const imgY = y;
  const loadedImages: (HTMLImageElement | null)[] = [];
  for (const ri of data.images) {
    try {
      const img = await loadImg(ri.previewUrl || ri.imageSrc);
      loadedImages.push(img);
    } catch {
      loadedImages.push(null);
    }
  }

  loadedImages.forEach((img, i) => {
    const ix = pad + i * (imgSize + 10);
    // Card bg
    ctx.fillStyle = "#1e2021";
    roundRect(ctx, ix, imgY, imgSize, imgSize, 12);
    ctx.fill();

    if (img) {
      // Clip and draw
      ctx.save();
      roundRect(ctx, ix, imgY, imgSize, imgSize, 12);
      ctx.clip();
      const scale = Math.max(imgSize / img.width, imgSize / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, ix + (imgSize - sw) / 2, imgY + (imgSize - sh) / 2, sw, sh);
      ctx.restore();
    }

    // Border
    const ri = data.images[i];
    ctx.strokeStyle = ri.caught ? "rgba(255,166,43,0.5)" : "rgba(74,222,128,0.5)";
    ctx.lineWidth = 2;
    roundRect(ctx, ix, imgY, imgSize, imgSize, 12);
    ctx.stroke();

    // Status badge
    const badgeText = ri.caught ? "CAUGHT" : `+${ri.points}`;
    const badgeColor = ri.caught ? "#FFA62B" : "#4ADE80";
    const badgeBg = ri.caught ? "rgba(255,166,43,0.9)" : "rgba(74,222,128,0.9)";
    ctx.fillStyle = badgeBg;
    const tw = ctx.measureText(badgeText).width;
    roundRect(ctx, ix + 4, imgY + 4, tw + 16, 22, 11);
    ctx.fill();
    ctx.fillStyle = "#17191A";
    ctx.font = "700 12px 'Urbanist', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(badgeText, ix + 12, imgY + 9);

    // Round number
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "700 13px ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.fillText(`R${i + 1}`, ix + imgSize - 6, imgY + imgSize - 8);
  });
  ctx.textAlign = "center";
  y = imgY + imgSize + 30;

  // === LEADERBOARD ===
  if (data.leaderboard.length > 0) {
    // Header
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    const lbH = 46 + data.leaderboard.length * 42 + 16;
    roundRect(ctx, pad, y, W - pad * 2, lbH, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 1;
    roundRect(ctx, pad, y, W - pad * 2, lbH, 18);
    ctx.stroke();

    ctx.fillStyle = "#FFA62B";
    ctx.font = "700 22px 'Urbanist', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Weekly Leaderboard", pad + 20, y + 14);
    y += 46;

    data.leaderboard.forEach((entry, i) => {
      const rowY = y + i * 42;

      if (entry.isYou) {
        ctx.fillStyle = "rgba(255,166,43,0.1)";
        roundRect(ctx, pad + 8, rowY - 2, W - pad * 2 - 16, 38, 8);
        ctx.fill();
      }

      // Rank
      ctx.textAlign = "left";
      if (i < 3) {
        const medalColors = ["#FFD66B", "#D7DCE0", "#E0A878"];
        ctx.fillStyle = medalColors[i];
        roundRect(ctx, pad + 20, rowY + 4, 28, 28, 7);
        ctx.fill();
        ctx.fillStyle = "#17191A";
        ctx.font = "700 15px 'Urbanist', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(i + 1), pad + 34, rowY + 10);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "500 15px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(i + 1), pad + 34, rowY + 10);
      }

      // Name
      ctx.textAlign = "left";
      ctx.fillStyle = entry.isYou ? "#FFB94D" : "#FCFDFD";
      ctx.font = `${entry.isYou ? "700" : "400"} 20px 'Urbanist', system-ui, sans-serif`;
      ctx.fillText(entry.name + (entry.isYou ? " (you)" : ""), pad + 64, rowY + 10);

      // Score
      ctx.textAlign = "right";
      ctx.fillStyle = entry.isYou ? "#FFB94D" : "rgba(255,255,255,0.7)";
      ctx.font = "700 20px ui-monospace, monospace";
      ctx.fillText(String(entry.score), W - pad - 20, rowY + 10);
    });
    y += data.leaderboard.length * 42 + 24;
  }

  // === KEY MESSAGE ===
  ctx.fillStyle = "rgba(255, 166, 43, 0.1)";
  roundRect(ctx, pad, y, W - pad * 2, 80, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 166, 43, 0.25)";
  ctx.lineWidth = 1;
  roundRect(ctx, pad, y, W - pad * 2, 80, 16);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "400 22px 'Host Grotesk', system-ui, sans-serif";
  ctx.textAlign = "center";
  if (data.caught >= data.rounds) {
    ctx.fillText("Verda caught every single attempt. Unbreakable.", cx, y + 35);
  } else if (data.evaded > 0) {
    ctx.fillText(`Evaded ${data.evaded} of ${data.rounds} — but Verda still caught the rest.`, cx, y + 35);
  } else {
    ctx.fillText(`Verda caught all ${data.caught} stolen posts. Watermarks win.`, cx, y + 35);
  }
  y += 105;

  // === CTA BUTTON ===
  ctx.fillStyle = "#FFA62B";
  roundRect(ctx, cx - 200, y, 400, 64, 32);
  ctx.fill();
  ctx.fillStyle = "#17191A";
  ctx.font = "700 26px 'Urbanist', system-ui, sans-serif";
  ctx.fillText("Can you beat my score?", cx, y + 20);
  y += 90;

  // === FOOTER ===
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "400 20px 'Host Grotesk', system-ui, sans-serif";
  ctx.fillText("game-kappa-smoky.vercel.app", cx, H - 60);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export async function shareOrDownload(blob: Blob, filename = "evade-verda.png") {
  const file = new File([blob], filename, { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "Evade Verda — Verda",
        text: "Can you evade Verda's invisible watermark? Try to beat my score!",
      });
      return;
    } catch {
      // User cancelled, fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
