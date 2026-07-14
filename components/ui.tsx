import React from "react";

/**
 * Shared UI primitives (Design Spec §4). Built once, reused everywhere.
 * All presentational and hook-free, so they work in both server and client
 * components. Colours come from the Tailwind token theme.
 */

type Variant = "ok" | "warn" | "danger" | "info" | "rupert" | "albie" | "neutral";

const PILL_CLASS: Record<Variant, string> = {
  ok: "bg-ok-tint text-ok",
  warn: "bg-warn-tint text-warn",
  danger: "bg-danger-tint text-danger",
  info: "bg-info-tint text-info",
  rupert: "bg-rupert-tint text-rupert",
  albie: "bg-albie-tint text-albie",
  neutral: "bg-[#eef0f3] text-ink-2",
};

/** Status pill — tint background + saturated text. Never colour-only: always a word. */
export function StatusPill({
  variant = "neutral",
  children,
}: {
  variant?: Variant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-[2px] text-[10.5px] font-bold ${PILL_CLASS[variant]}`}
    >
      {children}
    </span>
  );
}

/** Card — white, hairline, 12px radius, soft two-layer shadow. */
export function Card({
  children,
  className = "",
  span2 = false,
}: {
  children: React.ReactNode;
  className?: string;
  span2?: boolean;
}) {
  return (
    <section
      className={`flex min-h-[200px] flex-col rounded-card border border-hairline bg-surface shadow-card ${
        span2 ? "lg:col-span-2" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  icon,
  title,
  link,
}: {
  icon?: React.ReactNode;
  title: string;
  link?: { label: string; href: string };
}) {
  return (
    <header className="flex items-center gap-[9px] px-4 pb-[10px] pt-[14px]">
      {icon ? <span className="text-[15px] opacity-80">{icon}</span> : null}
      <span className="text-[14px] font-[650]">{title}</span>
      {link ? (
        <a
          href={link.href}
          className="ml-auto text-[12px] font-semibold text-brand hover:underline"
        >
          {link.label}
        </a>
      ) : null}
    </header>
  );
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col px-4 pb-4 pt-1">{children}</div>;
}

/** Metric block — big tabular number + uppercase caption. */
export function MetricBlock({
  value,
  label,
  color,
}: {
  value: React.ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <div>
      <div
        className="tabnum text-[30px] font-bold leading-none tracking-[-0.02em]"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="mt-1 text-[11.5px] font-semibold text-ink-3">{label}</div>
    </div>
  );
}

/** Avatar chip — 2-letter persona initials on a coloured disc. */
export function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="grid h-[26px] w-[26px] flex-none place-items-center rounded-full text-[11px] font-bold text-white"
      style={{ background: color }}
    >
      {initials}
    </span>
  );
}

/** Progress ring — SVG stroke-dashoffset, learner-coloured. */
export function Ring({
  pct,
  color,
  label,
  sub,
  size = 58,
}: {
  pct: number;
  color: string;
  label?: string;
  sub?: string;
  size?: number;
}) {
  const r = 24;
  const circ = 2 * Math.PI * r; // ~150.8
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = circ * (1 - clamped / 100);
  const c = size / 2;
  return (
    <div className="flex flex-col items-center gap-[6px]">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#E4E8EE" strokeWidth={7} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: "stroke-dashoffset .25s ease" }}
        />
        <text
          x={c}
          y={c + 4}
          textAnchor="middle"
          className="tabnum"
          style={{ fontSize: 13, fontWeight: 700, fill: "var(--ink)" }}
        >
          {Math.round(clamped)}
        </text>
      </svg>
      {label ? (
        <span className="text-[11px] font-semibold" style={{ color }}>
          {label}
        </span>
      ) : null}
      {sub ? <span className="text-[11px] text-ink-3">{sub}</span> : null}
    </div>
  );
}

/** Stacked bar (mastered / in-progress / locked). */
export function Bar({ segments }: { segments: { pct: number; color: string }[] }) {
  return (
    <div className="flex h-2 overflow-hidden rounded-md border border-hairline bg-surface-2">
      {segments.map((s, i) => (
        <i
          key={i}
          className="block h-full"
          style={{ width: `${s.pct}%`, background: s.color }}
        />
      ))}
    </div>
  );
}

/** List row — leading marker, title + subtitle, trailing meta. Used widely. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  last = false,
}: {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-[10px] py-[9px] ${
        last ? "" : "border-b border-hairline"
      }`}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-[550] leading-snug">{title}</div>
        {subtitle ? <div className="text-[11.5px] text-ink-3">{subtitle}</div> : null}
      </div>
      {trailing}
    </div>
  );
}

/** Designed empty state that points back to the quick-log (Design Spec §1, §3). */
export function EmptyState({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[10px] px-2 py-[18px] text-center text-ink-3">
      <div className="grid h-10 w-10 place-items-center rounded-[10px] border border-hairline bg-surface-2 text-lg">
        ＋
      </div>
      <div className="text-[13px] font-semibold text-ink-2">{title}</div>
      <div className="max-w-[230px] text-[12px]">{sub}</div>
      {action}
    </div>
  );
}

/** Button — primary (teal), secondary (white+hairline), small size. */
export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: {
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center gap-2 rounded-[9px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
  const sizes = size === "sm" ? "px-[10px] py-[5px] text-[12.5px] rounded-[7px]" : "px-[14px] py-2";
  const variants =
    variant === "primary"
      ? "bg-brand text-white border border-brand hover:bg-brand-hover"
      : "bg-surface text-ink border border-hairline hover:bg-surface-2";
  return (
    <button className={`${base} ${sizes} ${variants} ${className}`} {...props}>
      {children}
    </button>
  );
}

/** Identity helpers for learner colours/labels. */
export const LEARNER_COLOR: Record<"rupert" | "albie", string> = {
  rupert: "var(--rupert)",
  albie: "var(--albie)",
};
