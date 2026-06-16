"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Crop,
  SlidersHorizontal,
  Maximize2,
  Camera,
  ScanSearch,
  ShieldCheck,
  Fingerprint,
  Hand,
  Upload,
  RotateCcw,
  RefreshCw,
  Users,
  Sparkles,
  FlaskConical,
  FlipHorizontal2,
  Square,
  AtSign,
  FileMinus,
  Eraser,
  Trophy,
  Flame,
  Shield,
  Share2,
  Skull,
  Timer,
  Crown,
  Loader2,
  Download,
} from "lucide-react";
import {
  MANIPULATIONS,
  applyManipulation,
  applyMultipleManipulations,
  loadImage,
  type ManipulationType,
} from "@/lib/game/manipulations";
import { ScanOverlay } from "./ScanOverlay";
import { Logo } from "@/components/ui/Logo";
import { generateShareCard, shareOrDownload } from "@/lib/game/share-card";
import { submitScore, getWeeklyLeaderboard, type RankedEntry } from "@/lib/supabase";

interface DailyChallengeProps {
  onBack: () => void;
}

type Screen = "intro" | "pick" | "disguise" | "final";

const TOTAL_ROUNDS = 5;

const IMAGES = Array.from({ length: 30 }, (_, i) => {
  const idx = i + 1;
  const creators = [
    { handle: "@sarahchen", name: "Sarah Chen" },
    { handle: "@marcusrivera", name: "Marcus Rivera" },
    { handle: "@aishapatel", name: "Aisha Patel" },
    { handle: "@jamesokafor", name: "James Okafor" },
    { handle: "@lena.wilde", name: "Lena Wilde" },
    { handle: "@kofi.builds", name: "Kofi Mensah" },
    { handle: "@rin_makes", name: "Rin Tanaka" },
    { handle: "@dao.studio", name: "Dao Studio" },
    { handle: "@nova_grabs", name: "Nova Chen" },
    { handle: "@jules.frame", name: "Jules Martin" },
    { handle: "@aria.lens", name: "Aria Nguyen" },
    { handle: "@maxshot", name: "Max Bergström" },
    { handle: "@priya.captures", name: "Priya Sharma" },
    { handle: "@tomaso.photo", name: "Tomaso Ricci" },
    { handle: "@zuri.frames", name: "Zuri Okonkwo" },
    { handle: "@kai.visual", name: "Kai Tanaka" },
    { handle: "@elena.pix", name: "Elena Petrova" },
    { handle: "@diego.snap", name: "Diego Morales" },
    { handle: "@lina.shoot", name: "Lina Johansson" },
    { handle: "@omar.click", name: "Omar Al-Rashid" },
    { handle: "@sofia.gram", name: "Sofia Costa" },
    { handle: "@yuki.raw", name: "Yuki Watanabe" },
    { handle: "@amara.eye", name: "Amara Diallo" },
    { handle: "@leo.studio", name: "Leo Fischer" },
    { handle: "@mei.daily", name: "Mei-Lin Wong" },
    { handle: "@sven.wild", name: "Sven Larsson" },
    { handle: "@nadia.art", name: "Nadia Khoury" },
    { handle: "@ravi.pics", name: "Ravi Patel" },
    { handle: "@clara.view", name: "Clara Müller" },
    { handle: "@jada.mood", name: "Jada Williams" },
  ];
  const c = creators[i] || creators[0];
  return { id: i, ...c, src: `/content/images/demo-${String(idx).padStart(2, "0")}.jpg` };
});

const ICON_MAP: Record<string, React.ElementType> = {
  "sliders-horizontal": SlidersHorizontal, camera: Camera, crop: Crop,
  "flip-horizontal-2": FlipHorizontal2, "maximize-2": Maximize2,
  square: Square, "at-sign": AtSign, eraser: Eraser, "file-minus": FileMinus,
};

const EVADE_POINTS = 15;
const MANIP_COUNT_BONUS = [0, 0, 5, 12];

interface RoundResult {
  round: number;
  imageHandle: string;
  imageSrc: string;
  previewUrl: string | null;
  manipulations: string;
  caught: boolean | null; // null = still scanning
  points: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DailyChallenge({ onBack }: DailyChallengeProps) {
  const [screen, setScreen] = useState<Screen>("intro");
  const [round, setRound] = useState(1);
  const [roundImages, setRoundImages] = useState(() => shuffle(IMAGES).slice(0, TOTAL_ROUNDS * 4));
  const [picked, setPicked] = useState(0);
  const [manips, setManips] = useState<ManipulationType[]>(["remove_watermark"]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manipBlob, setManipBlob] = useState<Blob | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [playerName, setPlayerName] = useState(() => typeof window !== "undefined" ? localStorage.getItem("pp_name") || "" : "");
  const [playerEmail, setPlayerEmail] = useState(() => typeof window !== "undefined" ? localStorage.getItem("pp_email") || "" : "");
  const [leaderboard, setLeaderboard] = useState<RankedEntry[]>([]);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const previewRef = useRef<string | null>(null);

  const manipLabels = manips.length === 0 ? "No modifications" : manips.map((m) => MANIPULATIONS.find((d) => d.key === m)!.label).join(" + ");

  const roundStart = (round - 1) * 4;
  const currentChoices = roundImages.slice(roundStart, roundStart + 4);
  const selectedImage = roundImages[picked] || currentChoices[0];

  const pendingScans = results.filter((r) => r.caught === null).length;
  const completedResults = results.filter((r) => r.caught !== null);
  const totalScore = completedResults.reduce((s, r) => s + r.points, 0);
  const evadedCount = completedResults.filter((r) => !r.caught).length;
  const caughtCount = completedResults.filter((r) => r.caught).length;
  const bestHeist = Math.max(0, ...completedResults.map((r) => r.points));

  const toggleManip = (key: ManipulationType) => {
    setManips((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key); // allow empty
      }
      if (prev.length >= 3) return prev;
      return [...prev, key];
    });
  };

  // Live preview
  useEffect(() => {
    if (screen !== "disguise") return;
    let cancelled = false;
    const configs = manips.map((m) => ({ type: m, strength: "medium" as const }));
    (async () => {
      try {
        const img = await loadImage(selectedImage.src);
        let blob: Blob;
        if (configs.length === 0) {
          const resp = await fetch(selectedImage.src);
          blob = await resp.blob();
        } else if (configs.length === 1) {
          blob = await applyManipulation(img, configs[0].type, configs[0].strength);
        } else {
          blob = await applyMultipleManipulations(img, configs);
        }
        if (cancelled) return;
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        const url = URL.createObjectURL(blob);
        previewRef.current = url;
        setPreviewUrl(url);
        setManipBlob(blob);
      } catch (e) { console.error("Manipulation failed:", e); }
    })();
    return () => { cancelled = true; };
  }, [screen, manips, selectedImage.src]);

  useEffect(() => {
    return () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); };
  }, []);

  // Post stolen content — fires decode in background, immediately moves to next round
  const handlePost = useCallback(async () => {
    if (!manipBlob) return;
    const currentRound = round;
    const currentImage = selectedImage;
    const currentManipLabels = manipLabels;
    const currentManipCount = manips.length;
    const blobToSend = manipBlob;

    // Convert blob to data URL so it persists after blob URL is revoked
    const persistentUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blobToSend);
    });

    // Add a pending result
    const pendingResult: RoundResult = {
      round: currentRound,
      imageHandle: currentImage.handle,
      imageSrc: currentImage.src,
      previewUrl: persistentUrl,
      manipulations: currentManipLabels,
      caught: null, // pending
      points: 0,
    };
    setResults((prev) => [...prev, pendingResult]);

    // Move to next round immediately
    if (currentRound >= TOTAL_ROUNDS) {
      // Last round — go to final screen, but scan is still running
      setScreen("final");
    } else {
      setRound((r) => r + 1);
      setManips(["remove_watermark"]);
      setPreviewUrl(null);
      setManipBlob(null);
      setScreen("pick");
    }

    // Fire decode in background
    try {
      const formData = new FormData();
      formData.append("file", blobToSend, "stolen.jpg");
      const resp = await fetch("/api/decode", { method: "POST", body: formData });
      const data = await resp.json();
      const caught = data.match ?? false;
      const points = caught ? 0 : EVADE_POINTS + MANIP_COUNT_BONUS[currentManipCount];

      // Update the pending result
      setResults((prev) =>
        prev.map((r) =>
          r.round === currentRound && r.caught === null
            ? { ...r, caught, points }
            : r
        )
      );
    } catch (e) {
      console.error("Decode failed:", e);
      const points = EVADE_POINTS + MANIP_COUNT_BONUS[currentManipCount];
      setResults((prev) =>
        prev.map((r) =>
          r.round === currentRound && r.caught === null
            ? { ...r, caught: false, points }
            : r
        )
      );
    }
  }, [manipBlob, manips, manipLabels, round, selectedImage, previewUrl]);

  // Submit score when all scans complete and we're on final screen
  useEffect(() => {
    if (screen !== "final") return;
    if (results.length < TOTAL_ROUNDS) return;
    if (results.some((r) => r.caught === null)) return; // still scanning
    if (scoreSubmitted) return;

    (async () => {
      const lb = await getWeeklyLeaderboard(15);
      setLeaderboard(lb);
      if (playerName.trim()) {
        const allManips = results.map((r) => r.manipulations).join(", ");
        const finalScore = results.reduce((s, r) => s + r.points, 0);
        await submitScore({
          player_name: playerName.trim(),
          score: finalScore,
          rounds: TOTAL_ROUNDS,
          evaded: results.filter((r) => !r.caught).length,
          caught: results.filter((r) => r.caught).length,
          best_heist: Math.max(0, ...results.map((r) => r.points)),
          manipulations: allManips,
          email: playerEmail.trim() || null,
        });
        setScoreSubmitted(true);
        const updated = await getWeeklyLeaderboard(15);
        setLeaderboard(updated);
      }
    })();
  }, [screen, results, scoreSubmitted, playerName]);

  const restart = () => {
    setRound(1);
    setRoundImages(shuffle(IMAGES).slice(0, TOTAL_ROUNDS * 4));
    setPicked(0);
    setManips(["remove_watermark"]);
    setPreviewUrl(null);
    setManipBlob(null);
    setResults([]);
    setScoreSubmitted(false);
    setLeaderboard([]);
    setScreen("intro");
  };

  const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ borderRadius: 18, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", padding: 18, ...style }}>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--pp-bg)", color: "var(--pp-text)", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px 40px" }}>

        {/* HUD */}
        {!["intro", "final"].includes(screen) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", marginBottom: 16, borderRadius: 14, background: "var(--pp-bg2)", border: "1px solid var(--pp-bd)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={onBack} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", color: "var(--pp-fg2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={14} /></button>
              <Logo width={50} height={10} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "ui-monospace, monospace", fontSize: 12, color: "var(--pp-fg3)" }}>
              <Timer size={13} style={{ color: "var(--pp-amber)" }} />
              Round {round}/{TOTAL_ROUNDS}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Pending scans indicator */}
              {pendingScans > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "var(--pp-amber-text)", background: "var(--pp-amber-soft)", border: "1px solid var(--pp-amber-bd)", padding: "3px 8px", borderRadius: 99 }}>
                  <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} />
                  {pendingScans} scanning
                </span>
              )}
              <span className="badge-pirate" style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px" }}>
                <Skull size={11} />
                {totalScore} pts
              </span>
            </div>
          </div>
        )}

        {/* INTRO */}
        {screen === "intro" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center", gap: 24, position: "relative" }}>
            <button onClick={onBack} style={{ position: "absolute", top: 0, right: 0, width: 34, height: 34, borderRadius: 10, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", color: "var(--pp-fg2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={17} /></button>
            <Logo width={80} height={15} />
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 99, background: "var(--pp-purple-soft)", border: "1px solid var(--pp-purple-bd)", color: "var(--pp-purple-text)", fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
                <Flame size={14} />
                Daily Challenge
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(28px,5vw,42px)", letterSpacing: "-0.03em", margin: "0 0 12px", lineHeight: 1 }} className="gradient-text">
                Can you evade Verda?
              </h1>
              <p style={{ fontSize: 16, color: "var(--pp-fg3)", maxWidth: 400, margin: "0 auto 8px", lineHeight: 1.5 }}>
                5 rounds. Steal an image, disguise it, post it. Verda scans every post. Score points for every image that slips through.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 320 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { icon: Hand, label: "Steal", desc: "Pick a target" },
                  { icon: SlidersHorizontal, label: "Disguise", desc: "Apply edits" },
                  { icon: ScanSearch, label: "Scan", desc: "Verda checks" },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center", padding: "12px 8px", borderRadius: 12, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)" }}>
                    <s.icon size={18} style={{ color: "var(--pp-purple)", marginBottom: 6 }} />
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12 }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: "var(--pp-fg4)" }}>{s.desc}</div>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", color: "var(--pp-text)", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, outline: "none" }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", color: "var(--pp-text)", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, outline: "none" }}
              />
              <button
                onClick={() => {
                  if (playerName.trim() && playerEmail.trim()) {
                    localStorage.setItem("pp_name", playerName.trim());
                    localStorage.setItem("pp_email", playerEmail.trim());
                    setScreen("pick");
                  }
                }}
                disabled={!playerName.trim() || !playerEmail.trim()}
                className="btn-purple"
                style={{ width: "100%", padding: 14, fontSize: 16, opacity: playerName.trim() && playerEmail.trim() ? 1 : 0.5 }}
              >
                <Skull size={18} />
                Start Challenge
              </button>
            </div>
          </div>
        )}

        {/* PICK */}
        {screen === "pick" && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, margin: "0 0 4px" }}>Round {round} — Pick your target</h2>
              <p style={{ fontSize: 13, color: "var(--pp-fg3)", margin: 0 }}>Choose an image to steal from the feed.</p>
            </div>
            {/* Recent scan results floating at top */}
            {results.length > 0 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
                {results.map((r) => (
                  <div key={r.round} style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, border: `1px solid ${r.caught === null ? "var(--pp-amber-bd)" : r.caught ? "var(--pp-amber-bd)" : "rgba(74,222,128,0.3)"}`, background: r.caught === null ? "var(--pp-amber-soft)" : r.caught ? "var(--pp-amber-soft)" : "var(--pp-green-soft)", color: r.caught === null ? "var(--pp-amber-text)" : r.caught ? "var(--pp-amber-text)" : "var(--pp-green)" }}>
                    {r.caught === null ? <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> : r.caught ? <ShieldCheck size={10} /> : <Skull size={10} />}
                    R{r.round}: {r.caught === null ? "scanning..." : r.caught ? "caught" : `+${r.points}`}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {currentChoices.map((im) => (
                <button
                  key={im.id}
                  onClick={() => { setPicked(roundImages.indexOf(im)); setScreen("disguise"); }}
                  style={{ position: "relative", padding: 0, border: "1px solid var(--pp-bd)", borderRadius: 12, overflow: "hidden", cursor: "pointer", background: "var(--pp-card2)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.src} alt={im.handle} style={{ width: "100%", height: "auto", display: "block" }} />
                  <span style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: 6, background: "rgba(15,17,18,0.65)", border: "1px solid var(--pp-amber-bd)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pp-amber)" }}><Fingerprint size={10} /></span>
                  <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 8px 6px", background: "linear-gradient(180deg,transparent,rgba(0,0,0,0.75))" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", fontFamily: "var(--font-display)" }}>{im.handle}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DISGUISE — simplified, no intensity options */}
        {screen === "disguise" && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, margin: "0 0 4px" }}>Disguise it</h2>
              <p style={{ fontSize: 13, color: "var(--pp-fg3)", margin: 0 }}>Toggle manipulations on/off. Up to 3.</p>
            </div>
            {/* Side by side preview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid var(--pp-amber-bd)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedImage.src} alt="Original" style={{ width: "100%", height: "auto", display: "block", maxHeight: "30vh", objectFit: "contain", background: "var(--pp-bg)" }} />
                <span style={{ position: "absolute", top: 6, left: 6, fontSize: 9, fontWeight: 700, color: "var(--pp-amber-text)", background: "rgba(15,17,18,0.78)", border: "1px solid var(--pp-amber-bd)", padding: "2px 7px", borderRadius: 99 }}>Original</span>
              </div>
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid var(--pp-purple-bd)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl || selectedImage.src} alt="Preview" style={{ width: "100%", height: "auto", display: "block", maxHeight: "30vh", objectFit: "contain", background: "var(--pp-bg)" }} />
                <span style={{ position: "absolute", top: 6, left: 6, fontSize: 9, fontWeight: 700, color: "var(--pp-purple-text)", background: "rgba(15,17,18,0.78)", border: "1px solid var(--pp-purple-bd)", padding: "2px 7px", borderRadius: 99 }}>Preview</span>
              </div>
            </div>

            {/* 3x3 toggle grid — no intensity, just on/off */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--pp-fg3)" }}>Manipulations</span>
              <span style={{ fontSize: 11, color: "var(--pp-fg4)" }}>{manips.length}/3</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
              {MANIPULATIONS.map((m) => {
                const active = manips.includes(m.key);
                const Icon = ICON_MAP[m.icon] || SlidersHorizontal;
                const atMax = manips.length >= 3 && !active;
                return (
                  <div key={m.key} onClick={() => !atMax && toggleManip(m.key)} style={{ borderRadius: 10, padding: "10px 8px", border: active ? "1px solid var(--pp-purple-bd)" : "1px solid var(--pp-bd)", background: active ? "var(--pp-purple-soft)" : "var(--pp-card2)", opacity: atMax ? 0.35 : 1, cursor: atMax ? "not-allowed" : "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, textAlign: "center" }}>
                    <Icon size={16} style={{ color: active ? "var(--pp-purple-text)" : "var(--pp-fg3)" }} />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, color: active ? "var(--pp-purple-text)" : "var(--pp-fg2)", lineHeight: 1.2 }}>{m.label}</span>
                  </div>
                );
              })}
            </div>

            <button onClick={handlePost} disabled={!manipBlob} className="btn-purple" style={{ width: "100%", padding: 13, fontSize: 15, opacity: manipBlob ? 1 : 0.5 }}>
              <Upload size={16} />
              Post stolen content
            </button>
          </div>
        )}

        {/* FINAL RESULTS */}
        {screen === "final" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 10 }}>
            {/* Close button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", color: "var(--pp-fg2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={17} /></button>
            </div>
            {/* Banner */}
            <div style={{ position: "relative", borderRadius: 22, border: "1px solid var(--pp-purple-bd)", background: "linear-gradient(180deg,var(--pp-purple-soft),var(--pp-card2))", padding: "28px 22px", textAlign: "center", overflow: "hidden" }}>
              <div style={{ position: "absolute", width: 400, height: 200, left: "50%", top: -100, transform: "translateX(-50%)", filter: "blur(70px)", opacity: 0.5, background: "radial-gradient(ellipse,rgba(192,132,252,0.5),transparent 70%)" }} />
              <div style={{ position: "relative" }}>
                <Crown size={32} style={{ color: "var(--pp-purple)", marginBottom: 10 }} />
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(28px,5vw,38px)", letterSpacing: "-0.02em", marginBottom: 6 }}>
                  {pendingScans > 0 ? "Finishing scans..." : "Challenge Complete"}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 42, color: "var(--pp-purple-text)", lineHeight: 1 }}>{totalScore}</div>
                <div style={{ fontSize: 14, color: "var(--pp-fg3)", marginTop: 4 }}>points scored</div>
                {(() => {
                  const myEntry = leaderboard.find((e) => e.player_name.toLowerCase().trim() === playerName.toLowerCase().trim());
                  if (myEntry && myEntry.penalty > 0) {
                    return (
                      <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 99, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)", fontSize: 13, color: "var(--pp-red)" }}>
                        -{myEntry.penalty} retry penalty ({myEntry.attempts} attempts) &middot; Leaderboard score: <strong style={{ color: "var(--pp-text)", marginLeft: 4 }}>{myEntry.effective_score}</strong>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Rounds", value: TOTAL_ROUNDS, color: "var(--pp-text)", icon: Timer },
                { label: "Evaded", value: evadedCount, color: "var(--pp-green)", icon: Skull },
                { label: "Caught", value: caughtCount, color: "var(--pp-amber-text)", icon: ShieldCheck },
                { label: "Best", value: `+${bestHeist}`, color: "var(--pp-purple-text)", icon: Flame },
              ].map((s) => (
                <div key={s.label} style={{ borderRadius: 13, border: "1px solid var(--pp-bd)", background: "var(--pp-card2)", padding: "12px 8px", textAlign: "center" }}>
                  <s.icon size={14} style={{ color: s.color, marginBottom: 4 }} />
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "var(--pp-fg4)", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Image collage — original vs stolen for each round */}
            <Card>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
                <Fingerprint size={14} style={{ color: "var(--pp-amber)" }} />
                Your heists
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(results.length, 5)}, 1fr)`, gap: 6 }}>
                {results.map((r) => (
                  <div key={r.round} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `1.5px solid ${r.caught === null ? "var(--pp-amber-bd)" : r.caught ? "var(--pp-amber-bd)" : "rgba(74,222,128,0.4)"}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.previewUrl || r.imageSrc} alt={`R${r.round}`} style={{ width: "100%", height: "auto", display: "block" }} />
                    {/* Status badge */}
                    <span style={{ position: "absolute", top: 4, left: 4, display: "inline-flex", alignItems: "center", gap: 3, fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 99, background: r.caught === null ? "rgba(255,166,43,0.9)" : r.caught ? "rgba(255,166,43,0.9)" : "rgba(74,222,128,0.9)", color: r.caught === null ? "var(--pp-amber-ink)" : r.caught ? "var(--pp-amber-ink)" : "#0d1a0f" }}>
                      {r.caught === null ? "..." : r.caught ? <><ShieldCheck size={8} />Caught</> : <><Skull size={8} />+{r.points}</>}
                    </span>
                    {/* Round number */}
                    <span style={{ position: "absolute", bottom: 3, right: 4, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: "ui-monospace, monospace" }}>R{r.round}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Round breakdown */}
            <Card>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
                <Trophy size={14} style={{ color: "var(--pp-amber)" }} />
                Round breakdown
              </div>
              {results.map((r) => (
                <div key={r.round} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: r.round < TOTAL_ROUNDS ? "1px solid var(--pp-bd)" : "none" }}>
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: "var(--pp-fg4)", width: 20 }}>R{r.round}</span>
                  <span style={{ flex: 1, fontSize: 12, color: "var(--pp-fg3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.imageHandle} — {r.manipulations}</span>
                  {r.caught === null ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "var(--pp-amber-text)", background: "var(--pp-amber-soft)", border: "1px solid var(--pp-amber-bd)", padding: "2px 8px", borderRadius: 99 }}>
                      <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} />
                      scanning
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: r.caught ? "var(--pp-amber-text)" : "var(--pp-green)", background: r.caught ? "var(--pp-amber-soft)" : "var(--pp-green-soft)", border: `1px solid ${r.caught ? "var(--pp-amber-bd)" : "rgba(74,222,128,0.3)"}`, padding: "2px 8px", borderRadius: 99 }}>
                      {r.caught ? "Caught" : `+${r.points}`}
                    </span>
                  )}
                </div>
              ))}
            </Card>

            {/* How it works explainer */}
            <Card>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pp-fg2)", marginBottom: 10, fontFamily: "var(--font-display)" }}>
                {pendingScans > 0 ? "What\u2019s happening" : "How Verda works"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { text: "Every image in the feed was watermarked with an invisible Verda watermark", color: "var(--pp-amber-text)", done: true },
                  { text: "You applied real manipulations \u2014 crop, filter, mirror, blur, compress \u2014 to disguise each stolen image", color: "var(--pp-purple-text)", done: true },
                  { text: "Each manipulated image was uploaded to Verda\u2019s cloud API for live decode", color: "var(--pp-amber-text)", done: true },
                  { text: pendingScans > 0
                    ? `${pendingScans} image${pendingScans > 1 ? "s are" : " is"} still being scanned \u2014 results update live`
                    : `Verda\u2019s invisible watermark survived ${caughtCount} of ${TOTAL_ROUNDS} manipulations \u2014 tracing each back to its creator`,
                    color: pendingScans > 0 ? "var(--pp-amber-text)" : caughtCount > 0 ? "var(--pp-green)" : "var(--pp-red)", done: pendingScans === 0 },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: s.done ? "var(--pp-amber-soft)" : "var(--pp-card)", border: `1px solid ${s.done ? "var(--pp-amber-bd)" : "var(--pp-bd)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: s.done ? "var(--pp-amber-text)" : "var(--pp-fg4)", flex: "0 0 auto" }}>{s.done ? "\u2713" : i + 1}</span>
                    <span style={{ fontSize: 12, color: "var(--pp-fg3)", lineHeight: 1.4 }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Key takeaway */}
            {pendingScans === 0 && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "13px 15px", borderRadius: 14, background: "var(--pp-amber-soft)", border: "1px solid var(--pp-amber-bd)" }}>
                <Sparkles size={17} style={{ color: "var(--pp-amber)", flex: "0 0 auto", marginTop: 1 }} />
                <span style={{ fontSize: 13, color: "var(--pp-fg2)", lineHeight: 1.45 }}>
                  Verda&apos;s invisible watermarks are embedded across the entire image — not just a visible logo. They survive cropping, filtering, screenshotting, and more. The content always traces back to its creator.
                </span>
              </div>
            )}

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <Card>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
                  <Crown size={14} style={{ color: "var(--pp-purple)" }} />
                  Weekly Leaderboard
                </div>
                {leaderboard.slice(0, 10).map((entry, i) => {
                  const isYou = scoreSubmitted && entry.player_name.toLowerCase().trim() === playerName.toLowerCase().trim();
                  return (
                    <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < Math.min(leaderboard.length, 10) - 1 ? "1px solid var(--pp-bd)" : "none", ...(isYou ? { background: "var(--pp-amber-soft)", margin: "0 -18px", padding: "7px 18px", borderRadius: 8 } : {}) }}>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: i < 3 ? "var(--pp-amber-text)" : "var(--pp-fg4)", width: 22, textAlign: "center", fontWeight: i < 3 ? 700 : 400 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: isYou ? 700 : 400, color: isYou ? "var(--pp-amber-text)" : "var(--pp-text)" }}>{entry.player_name} {isYou && "(you)"}</span>
                        {entry.attempts > 1 && <span style={{ fontSize: 10, color: "var(--pp-fg4)", marginLeft: 6 }}>{entry.attempts} tries, -{entry.penalty}</span>}
                      </div>
                      <span style={{ fontSize: 12, color: "var(--pp-fg4)" }}>{entry.evaded}/{entry.rounds}</span>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, fontSize: 13, color: i < 3 ? "var(--pp-amber-text)" : "var(--pp-text)" }}>{entry.effective_score}</span>
                    </div>
                  );
                })}
              </Card>
            )}

            {/* Share + Save */}
            {pendingScans === 0 && (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={async () => {
                    const blob = await generateShareCard({
                      playerName,
                      score: totalScore,
                      rounds: TOTAL_ROUNDS,
                      evaded: evadedCount,
                      caught: caughtCount,
                      bestHeist: bestHeist,
                      images: results.map((r) => ({ previewUrl: r.previewUrl, imageSrc: r.imageSrc, caught: r.caught, points: r.points })),
                      leaderboard: leaderboard.slice(0, 5).map((e) => ({ name: e.player_name, score: e.effective_score, isYou: e.player_name.toLowerCase().trim() === playerName.toLowerCase().trim() })),
                    });
                    shareOrDownload(blob);
                  }}
                  className="btn-purple"
                  style={{ flex: 1, padding: 14, fontSize: 15 }}
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button
                  onClick={async () => {
                    const blob = await generateShareCard({
                      playerName,
                      score: totalScore,
                      rounds: TOTAL_ROUNDS,
                      evaded: evadedCount,
                      caught: caughtCount,
                      bestHeist: bestHeist,
                      images: results.map((r) => ({ previewUrl: r.previewUrl, imageSrc: r.imageSrc, caught: r.caught, points: r.points })),
                      leaderboard: leaderboard.slice(0, 5).map((e) => ({ name: e.player_name, score: e.effective_score, isYou: e.player_name.toLowerCase().trim() === playerName.toLowerCase().trim() })),
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "evade-verda.png";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="btn-outline"
                  style={{ flex: 1, padding: 14, fontSize: 15 }}
                >
                  <Download size={16} />
                  Save Image
                </button>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={restart} className="btn-purple" style={{ flex: 1, padding: 14, fontSize: 15 }}>
                <RotateCcw size={16} />
                Play Again
              </button>
              <button onClick={onBack} className="btn-outline" style={{ flex: 1, padding: 14, fontSize: 15 }}>
                <ArrowLeft size={16} />
                Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spin animation for loader */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
