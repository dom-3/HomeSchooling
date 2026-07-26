"use client";
/**
 * Per-world mascots — coherent art direction (not mixed emoji).
 * Shipped as premium themeable SVG (fast, resolution-independent, tinted via the
 * --accent CSS vars). This is the "base your team finishes": to swap in a polished
 * LottieFiles character, render <LottiePlayer load={() => import("./lottie/mascot-rupert.json")}
 * fallback={<Mascot .../>}/> — same seam the chest/bursts use.
 */
import type { World } from "@/components/kids/juice";

type Pose = "idle" | "cheer";
export function Mascot({ world, size = 40, pose = "idle", className = "" }:
  { world: World; size?: number; pose?: Pose; className?: string }) {
  const cls = `k-mascot ${pose === "cheer" ? "cheer" : "idle"} ${className}`;
  return (
    <span className={cls} style={{ width: size, height: size, display: "inline-block" }} aria-hidden>
      {world === "rupert" ? <RupertRacer /> : <AlbieExplorer />}
    </span>
  );
}

/* Rupert — a helmeted racer. Accent = livery; cyan = visor (telemetry). */
function RupertRacer() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <ellipse cx="32" cy="58" rx="18" ry="4" fill="rgba(0,0,0,.15)" />
      <path d="M14 30a18 18 0 0 1 36 0v6H14z" fill="var(--accent)" />
      <path d="M14 30a18 18 0 0 1 36 0v3H14z" fill="#fff" opacity=".18" />
      <rect x="16" y="30" width="32" height="12" rx="6" fill="#12151a" />
      <rect x="19" y="31" width="26" height="8" rx="4" fill="var(--cool)" />
      <rect x="19" y="31" width="26" height="4" rx="2" fill="#fff" opacity=".5" />
      <rect x="12" y="36" width="40" height="12" rx="6" fill="var(--accent2)" />
      <circle cx="24" cy="20" r="3" fill="#fff" opacity=".85" />
    </svg>
  );
}

/* Albie — a friendly island explorer with a leaf/sun hat. */
function AlbieExplorer() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <ellipse cx="32" cy="58" rx="18" ry="4" fill="rgba(0,0,0,.15)" />
      <circle cx="32" cy="34" r="16" fill="#f4d9b0" />
      <circle cx="26" cy="33" r="2.4" fill="#333" />
      <circle cx="38" cy="33" r="2.4" fill="#333" />
      <path d="M27 40q5 4 10 0" stroke="#a25b2b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M14 26q18 -12 36 0q-18 -5 -36 0z" fill="var(--accent)" />
      <path d="M30 14q3 6 0 10q-3 -6 0 -10z" fill="var(--warm)" />
      <path d="M14 26q18 -3 36 0" stroke="var(--accent2)" strokeWidth="2" fill="none" />
    </svg>
  );
}
