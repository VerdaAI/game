"use client";

import { useEffect, useRef } from "react";

/**
 * CSS recreation of the app's Skia VerifyScanOverlay shader.
 * Renders a pixel grid with a horizontal wave sweep using Canvas 2D.
 * Amber cells light up as the wave passes, then dim to a shimmer.
 */
export function ScanOverlay({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    const CELL = 6;
    const GAP = 1;
    const CYCLE_S = 4; // seconds per sweep
    const WAVE_TAIL = 25;
    const cols = Math.floor(width / CELL);
    const rows = Math.floor(height / CELL);

    // Pre-compute random jitter per cell
    const jitter = new Float32Array(cols * rows);
    const colorChoice = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        jitter[idx] = pseudoRandom(c, r) * 3.5;
        colorChoice[idx] = pseudoRandom(c + 50, r + 50);
      }
    }

    const startTime = performance.now();

    function draw() {
      const t = (performance.now() - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Ping-pong wave: 0→1→0
      const rawCycle = (t % (CYCLE_S * 2)) / CYCLE_S;
      const cycle = rawCycle <= 1 ? rawCycle : 2 - rawCycle;
      const waveFront = cycle * (cols + 8);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const cellCol = c + jitter[idx];
          const behind = waveFront - cellCol;

          // Calculate wave intensity
          let intensity = 0;
          if (behind >= -3 && behind < WAVE_TAIL) {
            if (behind < 0) {
              intensity = 1 - Math.abs(behind) / 3;
            } else if (behind < 4) {
              intensity = 1;
            } else {
              const falloff = (behind - 4) / (WAVE_TAIL - 4);
              intensity = (1 - falloff) * (1 - falloff);
            }
          }

          // Size boost
          const sizeBoost = intensity * 3;
          const cellX = c * CELL + GAP - sizeBoost * 0.5;
          const cellY = r * CELL + GAP - sizeBoost * 0.5;
          const cellSz = CELL - GAP * 2 + sizeBoost;

          // Alpha
          let a = 0.05;
          a += intensity * 0.28;

          // Shimmer for settled/ahead cells
          const flickerSeed = pseudoRandom(c + Math.floor(t * 8), r + Math.floor(t * 6));
          if (behind >= WAVE_TAIL) {
            a = 0.04 + (flickerSeed - 0.5) * 0.03;
          } else if (behind < -3) {
            a = 0.03 + (flickerSeed - 0.5) * 0.02;
          }

          a = Math.max(a, 0.02);

          // Color — mostly amber, some lighter, some deeper
          const hv = colorChoice[idx];
          let rgb: string;
          if (hv < 0.7) {
            rgb = `255, 166, 43`; // amber
          } else if (hv < 0.9) {
            rgb = `255, 234, 204`; // light amber
            a *= 0.8;
          } else {
            rgb = `230, 140, 30`; // deep amber
          }

          ctx.fillStyle = `rgba(${rgb}, ${a})`;
          ctx.fillRect(cellX, cellY, cellSz, cellSz);

          // White flash at leading edge
          if (behind >= -1 && behind < 2.5) {
            const flashPos = (behind + 1) / 3.5;
            const flash = (1 - Math.abs(flashPos - 0.5) * 2) * 0.18;
            if (flash > 0) {
              ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
              ctx.fillRect(cellX, cellY, cellSz, cellSz);
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}

// Simple hash function matching the Skia shader
function pseudoRandom(x: number, y: number): number {
  const h = x * 127.1 + y * 311.7;
  return ((Math.sin(h) * 43758.5453123) % 1 + 1) % 1;
}
