/**
 * T1 "juice" layer for the kids' portal — celebration, sound, haptics, count-up.
 *
 * Pure feel. NO engine logic, NO network. Everything here degrades gracefully:
 * it respects a global mute (sound ON by default) and prefers-reduced-motion,
 * lazily creates a single AudioContext on first use, and uses ONE shared
 * canvas-confetti canvas (no per-frame DOM work). Import from client components.
 */
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

export type World = "rupert" | "albie";
export type CelebrateKind = "click" | "quest" | "chest" | "levelUp" | "boss";

const isBrowser = typeof window !== "undefined";
const prefersReduced = () =>
  isBrowser && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ---------- confetti palettes per world ---------- */
const PALETTE: Record<World, string[]> = {
  rupert: ["#e10600", "#ffb020", "#28c8ff", "#ffffff"], // racing red / amber / telemetry cyan
  albie: ["#22c55e", "#ff8c42", "#facc15", "#ffffff"],  // palm green / coral / gold
};

/* ---------- celebrate event bus (T2 overlays subscribe; no logic duplicated) ---------- */
export type CelebrateEvent = { kind: CelebrateKind; world: World };
const celebrateListeners = new Set<(e: CelebrateEvent) => void>();
/** Subscribe to celebration events (returns an unsubscribe fn). */
export function onCelebrate(fn: (e: CelebrateEvent) => void): () => void {
  celebrateListeners.add(fn);
  return () => { celebrateListeners.delete(fn); };
}

/* ---------- mute: module state + localStorage (sound ON by default) ---------- */
let _muted = false;
if (isBrowser) {
  try { _muted = window.localStorage.getItem("hshq_muted") === "1"; } catch { /* ignore */ }
}
const muteListeners = new Set<(m: boolean) => void>();
export function isMuted() { return _muted; }
export function setMuted(m: boolean) {
  _muted = m;
  try { window.localStorage.setItem("hshq_muted", m ? "1" : "0"); } catch { /* ignore */ }
  muteListeners.forEach((fn) => fn(m));
}
/** React binding for the global mute flag. Returns [muted, toggle]. */
export function useMute(): [boolean, () => void] {
  const [m, setM] = useState(_muted);
  useEffect(() => {
    const fn = (v: boolean) => setM(v);
    muteListeners.add(fn);
    setM(_muted);
    return () => { muteListeners.delete(fn); };
  }, []);
  return [m, () => setMuted(!_muted)];
}

/* ---------- Web Audio SFX (procedural — no asset files, ships today) ---------- */
let _ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (!isBrowser) return null;
  try {
    if (!_ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      _ctx = new AC();
    }
    if (_ctx.state === "suspended") _ctx.resume().catch(() => { /* gesture needed */ });
    return _ctx;
  } catch { return null; }
}

const semi = (base: number, s: number) => base * Math.pow(2, s / 12);

/** Schedule a single enveloped oscillator note. */
function note(freq: number, start: number, dur: number, opts: { type?: OscillatorType; gain?: number } = {}) {
  const ac = _ctx;
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = opts.type ?? "triangle";
  osc.frequency.setValueAtTime(freq, t0);
  const peak = opts.gain ?? 0.16;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function play(fn: () => void) {
  if (_muted) return;
  if (!audio()) return;
  fn();
}

const C5 = 523.25;
const MAJOR = [0, 4, 7, 12, 16, 19];

export const sfx = {
  /** soft UI click */
  click() { play(() => note(660, 0, 0.05, { type: "triangle", gain: 0.07 })); },
  /** "correct" tick — rises in pitch with the current streak */
  tick(streak = 0) {
    play(() => note(semi(C5, Math.min(streak, 12)), 0, 0.09, { type: "sine", gain: 0.16 }));
  },
  /** two-note coin */
  coin() {
    play(() => {
      note(987.77, 0, 0.07, { type: "square", gain: 0.11 });
      note(1318.51, 0.06, 0.12, { type: "square", gain: 0.11 });
    });
  },
  /** chest / unlock arpeggio */
  chest() {
    play(() => [0, 4, 7, 12].forEach((s, i) => note(semi(C5, s), i * 0.07, 0.16, { type: "triangle", gain: 0.14 })));
  },
  /** level-up fanfare */
  levelUp() {
    play(() => {
      MAJOR.forEach((s, i) => note(semi(C5, s), i * 0.09, 0.22, { type: "triangle", gain: 0.16 }));
      [0, 4, 7].forEach((s) => note(semi(C5 * 2, s), MAJOR.length * 0.09, 0.5, { type: "triangle", gain: 0.11 }));
    });
  },
  /** boss-defeat sting — the biggest sound in the app */
  bossWin() {
    play(() => {
      note(196, 0, 0.18, { type: "sawtooth", gain: 0.13 });
      note(261.63, 0.12, 0.18, { type: "sawtooth", gain: 0.13 });
      [0, 4, 7, 12].forEach((s, i) => note(semi(C5, s), 0.28 + i * 0.08, 0.3, { type: "square", gain: 0.14 }));
      [0, 4, 7, 12].forEach((s) => note(semi(C5, s), 0.62, 0.7, { type: "triangle", gain: 0.11 }));
    });
  },
  /** gentle "not yet" — never harsh */
  error() {
    play(() => {
      note(196, 0, 0.12, { type: "sine", gain: 0.09 });
      note(147, 0.1, 0.16, { type: "sine", gain: 0.09 });
    });
  },
};

/* ---------- haptics (navigator.vibrate) ---------- */
type Buzz = "tap" | "unlock" | "win";
const PATTERNS: Record<Buzz, number | number[]> = {
  tap: 12,
  unlock: [0, 20, 40, 20],
  win: [0, 30, 40, 30, 40, 60],
};
export function haptic(kind: Buzz = "tap") {
  if (!isBrowser) return;
  try { navigator.vibrate?.(PATTERNS[kind]); } catch { /* unsupported */ }
}

/* ---------- confetti / celebration (single shared canvas) ---------- */
function burst(world: World, opts: confetti.Options) {
  confetti({ colors: PALETTE[world], disableForReducedMotion: true, ...opts });
}

let flashTimer: ReturnType<typeof setTimeout> | null = null;
function flashScreen() {
  if (!isBrowser || prefersReduced()) return;
  const b = document.body;
  b.classList.remove("k-celebrate");
  void b.offsetWidth; // restart the CSS animation
  b.classList.add("k-celebrate");
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => b.classList.remove("k-celebrate"), 600);
}

/**
 * Fire a celebration. Tiered by `kind`:
 *  - quest / chest → quick single burst
 *  - levelUp / boss → held full-screen moment (flash + staggered cannons)
 */
export function celebrate(kind: CelebrateKind, world: World = "rupert") {
  if (!isBrowser || kind === "click") return;
  celebrateListeners.forEach((fn) => fn({ kind, world }));
  const reduced = prefersReduced();
  if (kind === "quest") {
    burst(world, { particleCount: reduced ? 20 : 60, spread: 70, origin: { y: 0.35 }, startVelocity: 32, scalar: 0.9, ticks: 120 });
    return;
  }
  if (kind === "chest") {
    burst(world, { particleCount: reduced ? 24 : 80, spread: 100, origin: { y: 0.3 }, startVelocity: 38, ticks: 140 });
    return;
  }
  // levelUp | boss — the big moment
  const big = kind === "boss";
  flashScreen();
  burst(world, { particleCount: reduced ? 40 : big ? 160 : 120, spread: 120, origin: { y: 0.35 }, startVelocity: 45, ticks: 200, scalar: 1.1 });
  if (reduced) return;
  setTimeout(() => burst(world, { particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } }), 120);
  setTimeout(() => burst(world, { particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } }), 120);
  if (big) setTimeout(() => burst(world, { particleCount: 120, spread: 140, origin: { y: 0.4 }, startVelocity: 50 }), 420);
}

/* ---------- count-up hook (eased number roll + a brief "pop") ---------- */
export function useCountUp(target: number, ms = 600): { value: number; pop: boolean } {
  const [value, setValue] = useState(target);
  const [pop, setPop] = useState(false);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      fromRef.current = target;
      setValue(target);
      return;
    }
    const from = fromRef.current;
    if (from === target) return;
    if (target > from) {
      setPop(true);
      setTimeout(() => setPop(false), 260);
    }
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(from + (target - from) * e));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    fromRef.current = target;
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, ms]);

  return { value, pop };
}
