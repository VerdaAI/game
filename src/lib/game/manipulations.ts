/**
 * In-browser image manipulation using Canvas API.
 * Each function takes an HTMLImageElement and returns a Blob of the manipulated image.
 */

export type ManipulationType =
  | "crop"
  | "filter"
  | "screenshot"
  | "resize"
  | "mirror"
  | "border"
  | "overlay_watermark"
  | "remove_watermark"
  | "compress";

export interface ManipulationDef {
  key: ManipulationType;
  label: string;
  description: string;
  icon: string; // lucide icon name
  limited?: boolean; // crop is limited to ~10%
}

export const MANIPULATIONS: ManipulationDef[] = [
  { key: "remove_watermark", label: "Remove Watermark", description: "Blur out the visible Verda watermark in the corner", icon: "eraser" },
  { key: "filter", label: "Color Filter", description: "Adjust brightness, contrast & saturation", icon: "sliders-horizontal" },
  { key: "screenshot", label: "Screenshot", description: "Re-encode at lower quality (like a screen grab)", icon: "camera" },
  { key: "crop", label: "Crop", description: "Trim the edges (~10% max before it breaks)", icon: "crop", limited: true },
  { key: "mirror", label: "Mirror / Flip", description: "Flip horizontally to evade reverse search", icon: "flip-horizontal-2" },
  { key: "resize", label: "Resize", description: "Scale down then back up (loses detail)", icon: "maximize-2" },
  { key: "border", label: "Add Border", description: "Add a colored border or frame around the image", icon: "square" },
  { key: "overlay_watermark", label: "Platform Watermark", description: "Overlay a fake social media watermark", icon: "at-sign" },
  { key: "compress", label: "Heavy Compress", description: "Re-save as low-quality JPEG (compression artifacts)", icon: "file-minus" },
];

function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  return [c, ctx];
}

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", quality);
  });
}

/** Crop: remove a percentage from each edge, then scale back to original size */
export function applyCrop(img: HTMLImageElement, percent = 8): Promise<Blob> {
  const cropPx = Math.round(Math.min(img.naturalWidth, img.naturalHeight) * (percent / 100));
  const srcW = img.naturalWidth - cropPx * 2;
  const srcH = img.naturalHeight - cropPx * 2;
  // Output at original dimensions (upscaled from cropped area)
  const [c, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, cropPx, cropPx, srcW, srcH, 0, 0, img.naturalWidth, img.naturalHeight);
  return canvasToBlob(c);
}

/** Color filter: brightness, contrast, saturation adjustments
 * Test results: light=100%, heavy(old)=33%. Toned down heavy.
 */
export function applyFilter(img: HTMLImageElement, strength: "light" | "medium" | "heavy" = "medium"): Promise<Blob> {
  const [c, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  const filters = {
    light: "brightness(1.1) contrast(1.05) saturate(1.1)",
    medium: "brightness(1.12) contrast(1.1) saturate(0.8) hue-rotate(8deg)",
    heavy: "brightness(1.18) contrast(1.15) saturate(0.5) sepia(0.15)",
  };
  ctx.filter = filters[strength];
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(c);
}

/** Screenshot: re-encode at lower quality with slight color shift */
export function applyScreenshot(img: HTMLImageElement, strength: "light" | "medium" | "heavy" = "medium"): Promise<Blob> {
  const qualityMap = { light: 0.75, medium: 0.55, heavy: 0.35 };
  const [c, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  // Slight gamma shift to simulate screen capture
  ctx.filter = strength === "light" ? "none" : `brightness(1.05) contrast(0.97)`;
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(c, qualityMap[strength]);
}

/** Mirror: flip horizontally */
export function applyMirror(img: HTMLImageElement): Promise<Blob> {
  const [c, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  ctx.translate(img.naturalWidth, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(c);
}

/** Resize: scale down to a fraction then back up */
export function applyResize(img: HTMLImageElement, strength: "light" | "medium" | "heavy" = "medium"): Promise<Blob> {
  const scaleMap = { light: 0.7, medium: 0.45, heavy: 0.25 };
  const scale = scaleMap[strength];
  const sw = Math.round(img.naturalWidth * scale);
  const sh = Math.round(img.naturalHeight * scale);
  // Scale down
  const [small, sCtx] = createCanvas(sw, sh);
  sCtx.drawImage(img, 0, 0, sw, sh);
  // Scale back up
  const [c, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "low";
  ctx.drawImage(small, 0, 0, img.naturalWidth, img.naturalHeight);
  return canvasToBlob(c);
}

/** Add border: draw a colored border inside the image (no dimension change) */
export function applyBorder(img: HTMLImageElement, color = "#000000", thickness = 20): Promise<Blob> {
  const [c, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  // Scale image down to fit inside the border
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, thickness, thickness, img.naturalWidth - thickness * 2, img.naturalHeight - thickness * 2);
  return canvasToBlob(c);
}

/** Overlay a fake platform watermark at random position */
export function applyOverlayWatermark(
  img: HTMLImageElement,
  text = "@reposted",
  strength: "light" | "medium" | "heavy" = "medium"
): Promise<Blob> {
  const [c, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);
  const sizeMap = { light: 0.03, medium: 0.05, heavy: 0.08 };
  const fontSize = Math.max(12, Math.round(img.naturalWidth * sizeMap[strength]));
  ctx.font = `bold ${fontSize}px 'Urbanist', system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  // Random position — keep within safe margins
  const textWidth = ctx.measureText(text).width;
  const marginX = textWidth + 20;
  const marginY = fontSize + 20;
  const x = marginX + Math.random() * (img.naturalWidth - marginX * 2);
  const y = marginY + Math.random() * (img.naturalHeight - marginY * 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  // Logo circle next to text
  const logoR = fontSize * 0.4;
  ctx.beginPath();
  ctx.arc(x - logoR - 6, y, logoR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fill();
  return canvasToBlob(c);
}

/** Remove visible watermark — blur the bottom-left corner where Verda's mark sits */
export function applyRemoveWatermark(img: HTMLImageElement, strength: "light" | "medium" | "heavy" = "medium"): Promise<Blob> {
  const blurMap = { light: 10, medium: 20, heavy: 32 };
  const blurRadius = blurMap[strength];
  const coverW = Math.round(img.naturalWidth * 0.35);
  const coverH = Math.round(img.naturalHeight * 0.12);
  const x = 0;
  const y = img.naturalHeight - coverH;

  // Draw full image
  const [c, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);

  // Draw blurred version of just the watermark region
  // Use a temp canvas with blur filter, then composite back
  const [tmp, tmpCtx] = createCanvas(coverW + blurRadius * 2, coverH + blurRadius * 2);
  tmpCtx.filter = `blur(${blurRadius}px)`;
  tmpCtx.drawImage(img, x - blurRadius, y - blurRadius, coverW + blurRadius * 2, coverH + blurRadius * 2, 0, 0, coverW + blurRadius * 2, coverH + blurRadius * 2);
  tmpCtx.filter = "none";

  // Paste blurred region back (clip to just the watermark area)
  ctx.drawImage(tmp, blurRadius, blurRadius, coverW, coverH, x, y, coverW, coverH);

  return canvasToBlob(c);
}

/** Heavy JPEG compression
 * Test results: q40=100% match, q20=33%, q8=0%, q5=0%
 * Adjusted to keep light/medium in survivable range
 */
export function applyCompress(img: HTMLImageElement, strength: "light" | "medium" | "heavy" = "medium"): Promise<Blob> {
  const qualityMap = { light: 0.55, medium: 0.35, heavy: 0.15 };
  const [c, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(c, qualityMap[strength]);
}

/** Apply any manipulation by key */
export function applyManipulation(
  img: HTMLImageElement,
  type: ManipulationType,
  strength: "light" | "medium" | "heavy" = "medium"
): Promise<Blob> {
  switch (type) {
    case "crop": return applyCrop(img, { light: 4, medium: 8, heavy: 12 }[strength]);
    case "filter": return applyFilter(img, strength);
    case "screenshot": return applyScreenshot(img, strength);
    case "mirror": return applyMirror(img);
    case "resize": return applyResize(img, strength);
    case "border": return applyBorder(img, "#000000", { light: 10, medium: 20, heavy: 40 }[strength]);
    case "overlay_watermark": return applyOverlayWatermark(img, "@reposted", strength);
    case "remove_watermark": return applyRemoveWatermark(img, strength);
    case "compress": return applyCompress(img, strength);
  }
}

/** Apply multiple manipulations in sequence (max 3), each with its own strength */
export async function applyMultipleManipulations(
  img: HTMLImageElement,
  configs: { type: ManipulationType; strength: "light" | "medium" | "heavy" }[]
): Promise<Blob> {
  let currentImg = img;
  let blob: Blob | null = null;

  for (let i = 0; i < Math.min(configs.length, 3); i++) {
    const { type, strength } = configs[i];
    blob = await applyManipulation(currentImg, type, strength);
    if (i < configs.length - 1) {
      const url = URL.createObjectURL(blob);
      currentImg = await loadImage(url);
      URL.revokeObjectURL(url);
    }
  }

  return blob!;
}

/** Load an image from a URL and return an HTMLImageElement */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
