"use client";
/**
 * Lazy Lottie wrapper. Both the lottie-web runtime AND the animation JSON are
 * loaded on demand (never in the initial bundle). If anything fails to load or
 * render, it shows `fallback` (we always pass premium SVG/CSS fallbacks), so a
 * missing/broken asset never breaks the portal. Swap `load` to point at polished
 * LottieFiles / AI assets when they land — nothing else changes.
 */
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

class Boundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { err: boolean }
> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? <>{this.props.fallback}</> : <>{this.props.children}</>; }
}

type Props = {
  load: () => Promise<{ default: unknown } | unknown>;
  loop?: boolean;
  autoplay?: boolean;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
};

export function LottiePlayer({
  load, loop = true, autoplay = true, onComplete, className, style, fallback = null,
}: Props) {
  const [data, setData] = useState<unknown>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    load()
      .then((m) => { if (alive) setData((m as { default?: unknown })?.default ?? m); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [load]);

  if (failed || !data) return <>{fallback}</>;
  return (
    <Boundary fallback={fallback}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Lottie animationData={data as any} loop={loop} autoplay={autoplay} onComplete={onComplete} className={className} style={style} />
    </Boundary>
  );
}
