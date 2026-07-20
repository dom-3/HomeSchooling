import React from "react";

/**
 * One coherent line-icon set for the kids' portal — single art direction
 * (24px grid, 2px round strokes, currentColor so each icon themes to the boy's
 * accent). Replaces emoji, which read as "made in an afternoon". A bought
 * (Kenney) or commissioned set can drop into these same names later.
 */
export type IconName =
  | "maths" | "reading" | "writing" | "welsh"
  | "science" | "arts" | "health" | "money"
  | "coin" | "star" | "flame" | "check";

const P: Record<IconName, React.ReactNode> = {
  maths: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <path d="M7 8.4h4M9 6.4v4" />
      <path d="M13.7 14.5l2.6 2.6M16.3 14.5l-2.6 2.6" />
    </>
  ),
  reading: (
    <>
      <path d="M12 6.4C10.6 5.2 8.4 4.8 5.6 4.8H4.2v12.4h1.4c2.8 0 5 .4 6.4 1.6" />
      <path d="M12 6.4c1.4-1.2 3.6-1.6 6.4-1.6h1.4v12.4h-1.4c-2.8 0-5 .4-6.4 1.6" />
      <path d="M12 6.4v12.4" />
    </>
  ),
  writing: (
    <>
      <path d="M4.2 19.8l.9-3.6L15.5 5.8l2.7 2.7L7.8 19z" />
      <path d="M13.8 7.5l2.7 2.7" />
    </>
  ),
  welsh: (
    <>
      <path d="M4.5 5.5h15v9h-8l-3.8 3.4V14.5H4.5z" />
      <path d="M8.3 9.8h7M8.3 12.2h4.5" />
    </>
  ),
  science: (
    <>
      <path d="M9.6 3.6h4.8M10.6 3.6v5.6L6.3 17a2 2 0 0 0 1.8 3h7.8a2 2 0 0 0 1.8-3l-4.3-7.8V3.6" />
      <path d="M8.2 14.4h7.6" />
    </>
  ),
  arts: (
    <>
      <path d="M14.4 6.6l3 3-6 6c-1.5 1.5-4.6 2.2-4.6 2.2s.7-3.1 2.2-4.6z" />
      <path d="M12.8 8.2l3 3" />
    </>
  ),
  health: (
    <>
      <path d="M12 19.6S4.6 15.2 4.6 10.1A3.6 3.6 0 0 1 12 8.2a3.6 3.6 0 0 1 7.4 1.9c0 5.1-7.4 9.5-7.4 9.5z" />
      <path d="M7.2 12h2l1.2-2.1L12 13.8l1-1.8h3.8" />
    </>
  ),
  money: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M13.9 9.3a2.5 2.5 0 0 0-4.3 1.7c0 2.9-1 3.7-1.5 4.1h6.2M9.3 12.3h3.6" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.6l1.3 2.6 2.9.4-2.1 2 .5 2.9L12 16.6l-2.6 1.4.5-2.9-2.1-2 2.9-.4z" />
    </>
  ),
  star: <path fill="currentColor" stroke="none" d="M12 3.5l2.5 5 5.5.8-4 3.9.9 5.5L12 16.1l-4.9 2.6.9-5.5-4-3.9 5.5-.8z" />,
  flame: (
    <path
      fill="currentColor"
      stroke="none"
      d="M13 3c.4 2.5 3.4 3.8 3.4 7.4a4.4 4.4 0 0 1-8.8 0c0-1.6.7-2.7 1.5-3.4.2 1 .8 1.6 1.4 1.6-.3-2.2 1-4.4 2.5-5.6z"
    />
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {P[name]}
    </svg>
  );
}
