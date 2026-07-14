/** Small formatting helpers — quiet, sentence-case console tone (spec §4). */

const AOLE_LABEL: Record<string, string> = {
  maths_numeracy: "Maths & Numeracy",
  languages_literacy: "Languages, Literacy & Communication",
  science_technology: "Science & Technology",
  health_wellbeing: "Health & Well-being",
  humanities: "Humanities",
  expressive_arts: "Expressive Arts",
};

export function aoleLabel(aole: string | null | undefined): string {
  if (!aole) return "";
  return AOLE_LABEL[aole] ?? aole.replace(/_/g, " ");
}

export function longDate(d: Date = new Date()): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "2d ago", "in 9d", "today", "✓" — relative day distance from an ISO date. */
export function relDays(iso: string | null | undefined): string {
  if (!iso) return "";
  const target = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000
  );
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return `in ${diff}d`;
}

export function shortDay(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString(
    "en-GB",
    { weekday: "short" }
  );
}

/** 2-letter persona initials for ops avatars (e.g. "Backend Engineer" → "BE"). */
export function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
