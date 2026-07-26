"use client";
/**
 * Daily chest as a real motion asset. Closed chest → tap → Lottie opens with the
 * reward flying out (founder-requested). Wraps the existing openChest() server
 * call passed in as `onOpen` — NO engine change. The reward toast + celebrate()
 * + sfx.chest() already fire inside openChest (T1); this adds the opening motion.
 * Lottie falls back to an SVG chest so it always works.
 */
import { useState } from "react";
import { LottiePlayer } from "@/components/kids/LottiePlayer";
import type { World } from "@/components/kids/juice";

export function Chest({ world, used, disabled, onOpen }:
  { world: World; used: boolean; disabled: boolean; onOpen: () => void | Promise<void> }) {
  const [opening, setOpening] = useState(false);

  function handle() {
    if (disabled || used || opening) return;
    setOpening(true);
    onOpen();
  }

  const open = opening || used;
  return (
    <button className="k-chest2" data-world={world} onClick={handle} disabled={disabled || used}>
      <span className="k-chestart">
        {open ? (
          <LottiePlayer
            load={() => import("@/components/kids/lottie/chest.json")}
            loop={false}
            fallback={<ChestSvg open />}
          />
        ) : (
          <ChestSvg />
        )}
      </span>
      <span className="k-chestlbl">{used ? "Come back tomorrow 🎁" : "Open your daily chest"}</span>
    </button>
  );
}

function ChestSvg({ open = false }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect x="10" y="30" width="44" height="24" rx="4" fill="#6b3d1e" />
      <rect x="10" y="30" width="44" height="8" fill="#7d4a26" />
      <g style={{ transformOrigin: "14px 30px", transform: open ? "rotate(-100deg)" : "none", transition: "transform .35s cubic-bezier(.3,1.4,.5,1)" }}>
        <rect x="12" y="18" width="40" height="14" rx="5" fill="#8a5327" />
      </g>
      <rect x="28" y="36" width="8" height="12" rx="2" fill="var(--warm)" />
      {open && <circle cx="32" cy="24" r="5" fill="var(--warm)" />}
    </svg>
  );
}
