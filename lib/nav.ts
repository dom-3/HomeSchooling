/** The 7-section IA (Design Spec §2). Icons are simple glyphs as in the mockup. */
export interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** which dashboard count feeds an attention badge, if any */
  badge?: "ops" | "compliance";
}

export const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: "▦" },
  { href: "/learners", label: "Learners", icon: "◧" },
  { href: "/mastery", label: "Mastery map", icon: "⬡" },
  { href: "/motivation", label: "Motivation", icon: "◎" },
  { href: "/operations", label: "Operations", icon: "☰", badge: "ops" },
  { href: "/compliance", label: "Compliance", icon: "⚖", badge: "compliance" },
  { href: "/proof", label: "Proof & insights", icon: "▤" },
];

export const TITLE_BY_PATH: Record<string, string> = {
  "/": "Home",
  "/learners": "Learners",
  "/mastery": "Mastery map",
  "/motivation": "Motivation",
  "/operations": "Operations",
  "/compliance": "Compliance",
  "/proof": "Proof & insights",
};
