"use client";
/**
 * Per-world attract / loading screen — a short premium entry so landing feels
 * like walking into an arcade. Shows once per session (sessionStorage), auto-
 * dismisses (~2.2s), tap-to-skip, and goes static for prefers-reduced-motion.
 */
import { useEffect, useRef, useState } from "react";
import type { World } from "@/components/kids/juice";
import { Backdrop } from "@/components/kids/Backdrop";
import { Mascot } from "@/components/kids/Mascot";

export function Attract({ world, name }: { world: World; name: string }) {
  const key = `hshq_attract_${world}`;
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(key) === "1"; } catch { /* ignore */ }
    if (seen) return;
    setShow(true);
    try { sessionStorage.setItem(key, "1"); } catch { /* ignore */ }
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(dismiss, reduced ? 900 : 2200);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    if (timer.current) clearTimeout(timer.current);
    setLeaving(true);
    setTimeout(() => setShow(false), 420);
  }
  if (!show) return null;

  return (
    <div className={"k-attract" + (leaving ? " leave" : "")} data-world={world} onClick={dismiss} role="button" aria-label="Enter">
      <div className="k-attract-bg"><Backdrop world={world} /></div>
      <div className="k-attract-inner">
        <Mascot world={world} size={96} pose="cheer" />
        <div className="k-attract-title">{world === "rupert" ? "THE CIRCUIT" : "THE ISLAND"}</div>
        <div className="k-attract-sub">Welcome back, {name.split(" ")[0]}</div>
        <div className="k-attract-press">Tap to start ▸</div>
      </div>
    </div>
  );
}
