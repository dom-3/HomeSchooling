"use client";
/**
 * Listens to T1's celebrate() events (no logic duplicated) and lifts the big
 * moments — level-up / boss — with a Lottie star-burst over the T1 canvas-confetti.
 * Falls back to nothing (confetti already covers it) if Lottie can't load.
 */
import { useEffect, useState } from "react";
import { onCelebrate } from "@/components/kids/juice";
import { LottiePlayer } from "@/components/kids/LottiePlayer";

export function CelebrationOverlay() {
  const [show, setShow] = useState(false);
  useEffect(() => onCelebrate((e) => {
    if (e.kind === "levelUp" || e.kind === "boss") {
      setShow(false);
      requestAnimationFrame(() => setShow(true));
    }
  }), []);
  if (!show) return null;
  return (
    <div className="k-celoverlay" aria-hidden>
      <LottiePlayer
        load={() => import("@/components/kids/lottie/burst.json")}
        loop={false}
        onComplete={() => setShow(false)}
        style={{ width: 260, height: 260 }}
      />
    </div>
  );
}
