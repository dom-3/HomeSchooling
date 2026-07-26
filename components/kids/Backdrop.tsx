"use client";
/**
 * World backdrop behind the adventure map — layered SVG with gentle pointer
 * parallax so the map becomes an environment. SVG keeps it lean + resolution
 * independent + themeable; swap the raster in later (AI-generated key art) by
 * replacing the <svg> layers with <img>/<Image> at the same z-order. Parallax is
 * GPU transform only and disabled for prefers-reduced-motion.
 */
import { useEffect, useRef } from "react";
import type { World } from "@/components/kids/juice";

export function Backdrop({ world }: { world: World }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;   // -0.5..0.5
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.setProperty("--px", (dx * 14).toFixed(1) + "px");
        el.style.setProperty("--py", (dy * 8).toFixed(1) + "px");
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} className="k-backdrop" data-world={world} aria-hidden>
      {world === "rupert" ? <CircuitScene /> : <IslandScene />}
    </div>
  );
}

function CircuitScene() {
  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <defs>
        <linearGradient id="sky-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2f3a" /><stop offset="1" stopColor="#12151a" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sky-r)" />
      <circle className="k-far" cx="320" cy="60" r="46" fill="var(--warm)" opacity=".55" />
      <g className="k-far" opacity=".5" fill="#1b1f27">
        <rect x="20" y="70" width="26" height="70" /><rect x="60" y="55" width="26" height="85" />
        <rect x="300" y="60" width="26" height="80" /><rect x="345" y="78" width="26" height="62" />
      </g>
      <g className="k-mid" stroke="var(--accent)" strokeWidth="3" opacity=".7">
        <line x1="0" y1="150" x2="400" y2="150" /><line x1="0" y1="150" x2="400" y2="150" strokeDasharray="18 16" stroke="#fff" opacity=".25" />
      </g>
      <rect className="k-near" x="0" y="160" width="400" height="60" fill="#0e1116" />
      <g className="k-near" fill="var(--accent)"><polygon points="60,160 74,160 66,150" /><polygon points="330,160 344,160 337,150" /></g>
    </svg>
  );
}

function IslandScene() {
  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <defs>
        <linearGradient id="sky-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fe0ef" /><stop offset="1" stopColor="#d9f3d0" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sky-a)" />
      <circle className="k-far" cx="70" cy="52" r="30" fill="#fff6c8" opacity=".9" />
      <path className="k-mid" d="M0 150 Q100 120 200 150 T400 150 V220 H0Z" fill="var(--cool)" opacity=".55" />
      <path className="k-near" d="M0 175 Q120 150 260 175 T400 172 V220 H0Z" fill="var(--accent)" opacity=".9" />
      <g className="k-near">
        <rect x="300" y="120" width="6" height="46" fill="#8a5a2b" />
        <path d="M303 118 q-26 -8 -34 4 q22 -4 34 4 q12 -8 34 -4 q-8 -12 -34 -4z" fill="var(--accent2)" />
      </g>
    </svg>
  );
}
