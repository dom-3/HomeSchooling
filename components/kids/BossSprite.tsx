"use client";
/**
 * Per-world BOSS characters for the Boss Fight — themeable SVG, coherent with
 * the Mascot art direction. Shipped as original SVG (fast, resolution-independent,
 * tinted via the --accent / --warm / --cool CSS vars set by KidGame's theme()).
 *
 * DROP-IN SEAM for polished art later: this is the same seam Mascot/chest use —
 * render <LottiePlayer load={() => import("./lottie/boss-rupert.json")}
 * fallback={<BossSprite .../>}/> at the same z-order; no other change needed.
 *
 * Feel is pose-driven: a single `pose` prop flips a CSS class. Every pose is
 * transform/opacity ONLY (60fps on an M1, GPU compositor) and every animation is
 * disabled under prefers-reduced-motion in styles.ts. No logic, no network here.
 */
import type { World } from "@/components/kids/juice";

export type BossPose =
  | "idle"     // gentle breathing while the child reads
  | "roar"     // summon beat — appears and roars
  | "brace"    // wind-up — child locked an answer (no correctness implied)
  | "hit"      // took a hit during the strike replay
  | "parry"    // whiffed hit (a miss) — blocks, unharmed
  | "defeat"   // beaten — HP hit zero
  | "survive"; // survived — "it got you this time"

export function BossSprite({
  world,
  pose = "idle",
  size = 168,
  className = "",
}: {
  world: World;
  pose?: BossPose;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`k-bosssprite k-bp-${pose} ${className}`}
      style={{ width: size, height: size, display: "inline-block" }}
      aria-hidden
    >
      {world === "rupert" ? <GridRival /> : <IslandBeast />}
    </span>
  );
}

/** Human-friendly names shown in the fight banner. */
export const BOSS_NAME: Record<World, string> = {
  rupert: "The Grid Rival",
  albie: "Grumbleback",
};

/* ── Rupert — a rival race machine with an attitude ───────────────────────
   Accent = livery, cyan = angry visor/telemetry, warm = exhaust glow.       */
function GridRival() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%">
      {/* ground shadow */}
      <ellipse cx="100" cy="132" rx="72" ry="10" fill="rgba(0,0,0,.28)" />
      {/* exhaust flare (behind) */}
      <g className="k-boss-flare">
        <polygon points="18,86 44,80 44,98 18,96" fill="var(--warm)" opacity=".9" />
        <polygon points="26,88 44,84 44,94 26,94" fill="#fff" opacity=".7" />
      </g>
      {/* rear wing */}
      <rect x="150" y="52" width="34" height="8" rx="3" fill="var(--accent2)" />
      <rect x="164" y="52" width="8" height="34" rx="3" fill="var(--accent2)" />
      {/* body */}
      <path d="M40 104 q8 -34 40 -40 l48 0 q30 4 40 26 q6 12 4 18 l-4 4 -168 0 q-4 -14 0 -32z"
            fill="var(--accent)" />
      <path d="M40 104 q8 -34 40 -40 l48 0 q30 4 40 26 q1 3 2 6 l-172 0 q-2 -8 2 -18z"
            fill="#fff" opacity=".14" />
      {/* cockpit / halo */}
      <path d="M96 62 q4 -12 16 -12 q12 0 15 12" fill="none" stroke="#12151a" strokeWidth="5" strokeLinecap="round" />
      {/* angry visor "eyes" */}
      <g className="k-boss-eyes">
        <path d="M70 78 l30 -6 0 14 -30 4z" fill="#12151a" />
        <path d="M74 80 l22 -4 0 8 -22 3z" fill="var(--cool)" />
        <path d="M74 80 l22 -4 0 3 -22 2z" fill="#fff" opacity=".6" />
        <path d="M112 72 l26 6 0 12 -26 -4z" fill="#12151a" />
        <path d="M116 75 l18 4 0 7 -18 -3z" fill="var(--cool)" />
      </g>
      {/* toothy grille "mouth" */}
      <g className="k-boss-mouth">
        <rect x="86" y="98" width="40" height="12" rx="3" fill="#12151a" />
        <g fill="#fff">
          <polygon points="90,98 96,98 93,106" />
          <polygon points="100,98 106,98 103,106" />
          <polygon points="110,98 116,98 113,106" />
          <polygon points="120,98 126,98 123,106" />
        </g>
      </g>
      {/* wheels */}
      <circle cx="66" cy="116" r="16" fill="#12151a" />
      <circle cx="66" cy="116" r="7" fill="var(--accent2)" />
      <circle cx="140" cy="116" r="16" fill="#12151a" />
      <circle cx="140" cy="116" r="7" fill="var(--accent2)" />
      {/* parry shield (shown only on a whiffed hit) */}
      <g className="k-boss-shield">
        <circle cx="100" cy="90" r="60" fill="none" stroke="var(--cool)" strokeWidth="5" opacity=".9" />
      </g>
    </svg>
  );
}

/* ── Albie — Grumbleback, a big friendly island beast (grumpy, not scary) ──
   Accent = mossy body, warm = belly/cheeks, cool = eyes.                     */
function IslandBeast() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%">
      <ellipse cx="100" cy="134" rx="66" ry="9" fill="rgba(0,0,0,.22)" />
      {/* little island leaves on his back */}
      <g className="k-boss-flare">
        <path d="M60 44 q-10 -18 6 -26 q6 16 -6 26z" fill="var(--accent2)" />
        <path d="M140 44 q10 -18 -6 -26 q-6 16 6 26z" fill="var(--accent2)" />
      </g>
      {/* body */}
      <path d="M46 112 q-6 -58 54 -62 q60 4 54 62 q-2 12 -14 12 l-80 0 q-12 0 -14 -12z" fill="var(--accent)" />
      {/* belly */}
      <ellipse cx="100" cy="98" rx="34" ry="30" fill="var(--warm)" opacity=".85" />
      {/* horns */}
      <path d="M64 56 q-6 -16 4 -22 q6 12 2 22z" fill="#efe3c8" />
      <path d="M136 56 q6 -16 -4 -22 q-6 12 -2 22z" fill="#efe3c8" />
      {/* grumpy brows */}
      <g className="k-boss-eyes">
        <path d="M70 64 l26 10" stroke="#2c1f14" strokeWidth="5" strokeLinecap="round" />
        <path d="M130 64 l-26 10" stroke="#2c1f14" strokeWidth="5" strokeLinecap="round" />
        {/* eyes */}
        <circle cx="82" cy="80" r="10" fill="#fff" />
        <circle cx="118" cy="80" r="10" fill="#fff" />
        <circle cx="84" cy="82" r="5" fill="var(--cool)" />
        <circle cx="116" cy="82" r="5" fill="var(--cool)" />
        <circle cx="86" cy="80" r="1.8" fill="#fff" />
        <circle cx="118" cy="80" r="1.8" fill="#fff" />
      </g>
      {/* mouth — grumpy frown that opens on a roar */}
      <g className="k-boss-mouth">
        <path d="M84 104 q16 14 32 0 q-4 12 -16 12 q-12 0 -16 -12z" fill="#2c1f14" />
        <path d="M90 108 q10 6 20 0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
      </g>
      {/* stubby arms */}
      <path d="M46 100 q-14 4 -14 18 q10 2 18 -6z" fill="var(--accent)" />
      <path d="M154 100 q14 4 14 18 q-10 2 -18 -6z" fill="var(--accent)" />
      {/* parry shield */}
      <g className="k-boss-shield">
        <circle cx="100" cy="88" r="62" fill="none" stroke="var(--cool)" strokeWidth="5" opacity=".9" />
      </g>
    </svg>
  );
}
