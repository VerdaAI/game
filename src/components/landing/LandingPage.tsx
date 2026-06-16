"use client";

import {
  Play,
  ScanSearch,
  Skull,
  Fingerprint,
  ShieldCheck,
  SlidersHorizontal,
  Camera,
  Crop,
  Sparkles,
  Hand,
  Swords,
  Flag,
  Trophy,
  ArrowRight,
  Image,
  AlertTriangle,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ScanOverlay } from "@/components/game/ScanOverlay";

interface LandingPageProps {
  onDemo: () => void;
  onPlay: () => void;
}

const PROOFS = [
  { icon: SlidersHorizontal, label: "Filtered", conf: "94%" },
  { icon: Camera, label: "Screenshot", conf: "90%" },
  { icon: Crop, label: "Cropped", conf: "88%" },
];

const STEPS = [
  { num: "1", title: "Pick a target", desc: "Choose an image from the feed" },
  { num: "2", title: "Disguise it", desc: "Apply up to 3 manipulations" },
  { num: "3", title: "Post it", desc: "Verda scans for the watermark" },
  { num: "4", title: "Results", desc: "See if you got caught" },
];

export function LandingPage({ onDemo, onPlay }: LandingPageProps) {
  return (
    <div style={{ background: "var(--pp-bg)", color: "var(--pp-text)", minHeight: "100vh" }}>
      {/* NAV */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          background: "var(--pp-nav)",
          borderBottom: "1px solid var(--pp-bd)",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "12px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo width={72} height={13} />
            <span style={{ width: 1, height: 16, background: "var(--pp-bd2)" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--pp-fg2)", whiteSpace: "nowrap" }}>
              Evade Verda
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onDemo} className="btn-outline" style={{ padding: "7px 16px", fontSize: 13 }}>
              <ScanSearch size={14} />
              Demo
            </button>
            <button onClick={onPlay} className="btn-primary" style={{ padding: "7px 16px", fontSize: 13 }}>
              <Play size={14} />
              Play
            </button>
          </div>
        </div>
      </header>

      {/* HERO — compact */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 450,
            right: -150,
            top: -180,
            filter: "blur(80px)",
            opacity: 0.8,
            background: "radial-gradient(ellipse at 60% 40%, var(--pp-glow) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: 1080,
            margin: "0 auto",
            padding: "clamp(28px,5vw,64px) 24px clamp(24px,3vw,40px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(24px,4vw,48px)",
            alignItems: "center",
          }}
        >
          {/* Copy */}
          <div style={{ flex: "1 1 380px", minWidth: 240 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 12px",
                borderRadius: 999,
                background: "var(--pp-amber-soft)",
                border: "1px solid var(--pp-amber-bd)",
                color: "var(--pp-amber-text)",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 18,
              }}
            >
              <Fingerprint size={13} />
              The invisible-watermark game
            </div>
            <h1
              className="gradient-text"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(30px,5.5vw,56px)",
                lineHeight: 0.98,
                letterSpacing: "-0.03em",
                margin: "0 0 16px",
              }}
            >
              Steal the photo.
              <br />
              Verda still finds it.
            </h1>
            <p style={{ fontSize: "clamp(14px,1.6vw,17px)", lineHeight: 1.5, color: "var(--pp-fg3)", maxWidth: 420, margin: "0 0 24px" }}>
              Disguise content with real manipulations — crop, filter, compress, mirror — then watch Verda&apos;s invisible watermark trace it back to the creator. Every time.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              <button
                onClick={onPlay}
                className="btn-primary"
                style={{ padding: "12px 24px", fontSize: 15, boxShadow: "0 8px 30px -8px var(--pp-glow)" }}
              >
                <Skull size={17} />
                Daily Challenge
              </button>
              <button onClick={onDemo} className="btn-outline" style={{ padding: "12px 24px", fontSize: 15 }}>
                <ScanSearch size={17} />
                Try the Demo
              </button>
            </div>
            <span style={{ fontSize: 12, color: "var(--pp-fg4)", lineHeight: 1.4 }}>
              Powered by{" "}
              <a href="https://verda.ai" target="_blank" rel="noopener noreferrer" style={{ color: "var(--pp-amber-text)", fontWeight: 600, textDecoration: "none" }}>
                Verda watermarking
              </a>
              {" "}&middot; 5 rounds &middot; free to play
            </span>
          </div>

          {/* Phone mock */}
          <div style={{ flex: "1 1 260px", minWidth: 220, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 260, maxWidth: "100%", borderRadius: 38, border: "1px solid #34383a", background: "#0f1112", padding: 9, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)", position: "relative" }}>
              <div style={{ position: "absolute", top: 17, left: "50%", transform: "translateX(-50%)", width: 80, height: 5, borderRadius: 99, background: "#26292b", zIndex: 3 }} />
              <div style={{ borderRadius: 30, overflow: "hidden", background: "#17191A" }}>
                <div style={{ padding: "26px 14px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>Feed</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "#FFA62B" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFA62B", animation: "pp-pulse 2s ease-in-out infinite" }} />
                    live
                  </span>
                </div>
                <div style={{ padding: "11px 12px 6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#C084FC,#7c3aed)", flex: "0 0 auto" }} />
                    <div style={{ lineHeight: 1.15 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-display)" }}>@nova_grabs</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>reposted &middot; 2m</div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 600, color: "#C084FC", background: "rgba(192,132,252,0.14)", border: "1px solid rgba(192,132,252,0.3)", padding: "2px 6px", borderRadius: 99 }}>
                      <AlertTriangle size={9} style={{ marginRight: 3 }} />
                      flagged
                    </span>
                  </div>
                  <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 170, background: "url(/content/images/demo-01.jpg) center/cover" }}>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(13,13,17,0.35)", zIndex: 1 }} />
                    <ScanOverlay width={238} height={170} />
                    <div style={{ position: "absolute", left: 8, bottom: 8, right: 8, background: "rgba(15,17,18,0.92)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,166,43,0.4)", borderRadius: 10, padding: "8px 10px", zIndex: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                        <ShieldCheck size={12} style={{ color: "#FFA62B" }} />
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#FFA62B", fontFamily: "var(--font-display)" }}>Watermark traced</span>
                        <span style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 700, color: "#FFA62B", fontFamily: "ui-monospace, monospace" }}>97.2%</span>
                      </div>
                      <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.7)" }}>
                        Original by <span style={{ color: "#FCFDFD", fontWeight: 600 }}>@sarahchen</span> &middot; 3h ago
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "9px 2px 2px", color: "rgba(255,255,255,0.5)" }}>
                    <Heart size={15} />
                    <MessageCircle size={15} />
                    <Send size={15} />
                    <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, color: "#FFA62B", background: "rgba(255,166,43,0.14)", border: "1px solid rgba(255,166,43,0.32)", padding: "4px 10px", borderRadius: 99 }}>
                      <ScanSearch size={11} />
                      Trace
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF + HOW IT WORKS — combined compact section */}
      <section style={{ background: "var(--pp-bg2)", borderTop: "1px solid var(--pp-bd)", borderBottom: "1px solid var(--pp-bd)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(32px,5vw,56px) 24px" }}>
          {/* Proof row */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pp-amber-text)", marginBottom: 10 }}>The whole point</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(22px,3.5vw,34px)", lineHeight: 1.05, margin: "0 0 10px" }}>
              The watermark survives manipulation
            </h2>
            <p style={{ fontSize: "clamp(13px,1.5vw,16px)", color: "var(--pp-fg3)", margin: 0 }}>
              Filter it, screenshot it, crop it — Verda still traces it back.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
            {PROOFS.map((p) => (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 14, border: "1px solid var(--pp-bd)", background: "var(--pp-card)" }}>
                <p.icon size={18} style={{ color: "var(--pp-fg2)" }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{p.label}</span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, fontSize: 14, color: "var(--pp-amber-text)" }}>{p.conf}</span>
                <ShieldCheck size={14} style={{ color: "var(--pp-amber)" }} />
              </div>
            ))}
          </div>

          {/* How it works — horizontal steps */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pp-fg4)", marginBottom: 10 }}>5 rounds, 2 minutes</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(22px,3.5vw,34px)", lineHeight: 1.05, margin: 0 }}>
              How the challenge works
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {STEPS.map((s) => (
              <div key={s.num} style={{ borderRadius: 14, border: "1px solid var(--pp-bd)", background: "var(--pp-card)", padding: "16px 14px", textAlign: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--pp-amber-soft)", border: "1px solid var(--pp-amber-bd)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pp-amber)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, margin: "0 auto 10px" }}>
                  {s.num}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--pp-fg3)", lineHeight: 1.35 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(28px,4vw,48px) 24px" }}>
        <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", border: "1px solid var(--pp-amber-bd)", background: "linear-gradient(135deg,var(--pp-bg2),var(--pp-card2))", padding: "clamp(24px,3.5vw,40px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div style={{ position: "absolute", width: 400, height: 280, right: -100, top: -100, filter: "blur(80px)", opacity: 0.7, background: "radial-gradient(ellipse,var(--pp-glow) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: 440, minWidth: 200 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(22px,3vw,32px)", lineHeight: 1.05, margin: "0 0 8px" }}>
              Can you evade Verda?
            </h2>
            <p style={{ fontSize: "clamp(13px,1.4vw,15px)", lineHeight: 1.5, color: "var(--pp-fg3)", margin: 0 }}>
              5 rounds. Steal, disguise, post. Your score goes to the weekly leaderboard.
            </p>
          </div>
          <div style={{ position: "relative", display: "flex", gap: 10 }}>
            <button onClick={onPlay} className="btn-primary" style={{ padding: "13px 26px", fontSize: 15, boxShadow: "0 8px 30px -8px var(--pp-glow)" }}>
              <Skull size={17} />
              Play Now
            </button>
            <button onClick={onDemo} className="btn-outline" style={{ padding: "13px 26px", fontSize: 15 }}>
              <ScanSearch size={17} />
              Demo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--pp-bd)", background: "var(--pp-bg2)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo width={64} height={12} style={{ opacity: 0.9 }} />
            <span style={{ fontSize: 12, color: "var(--pp-fg4)" }}>Evade Verda — a watermarking demo</span>
          </div>
          <a href="https://verda.ai" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--pp-fg3)", textDecoration: "none" }}>
            verda.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
