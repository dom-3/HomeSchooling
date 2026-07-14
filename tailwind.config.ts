import type { Config } from "tailwindcss";

/**
 * Design tokens from "Home School HQ - CEO Portal v1 Design Spec.md" §4.
 * A calm professional console: cool, low-saturation, brand teal does the work.
 * Tokens are also exposed as CSS variables in globals.css so SVG/inline styles
 * can reference them; here they become Tailwind utilities (bg-brand, text-ink, …).
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F4F6F8",
        surface: "#FFFFFF",
        "surface-2": "#FBFCFD",
        ink: "#16202B",
        "ink-2": "#5B6675",
        "ink-3": "#8A94A3",
        hairline: "#E4E8EE",
        brand: "#1F6F6B",
        "brand-hover": "#185955",
        "brand-tint": "#E7F1F0",
        rupert: "#B23A2E",
        "rupert-tint": "#F7ECEA",
        albie: "#3E7C59",
        "albie-tint": "#EAF2EC",
        ok: "#2E7D5B",
        "ok-tint": "#E8F3ED",
        warn: "#B7791F",
        "warn-tint": "#FBF2E2",
        danger: "#C2410C",
        "danger-tint": "#FBEBE3",
        info: "#2C6E8F",
        "info-tint": "#E6F0F4",
      },
      borderRadius: {
        card: "12px",
        sm2: "8px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,32,43,.04), 0 2px 8px rgba(16,32,43,.05)",
        sheet: "0 24px 60px rgba(16,32,43,.28)",
        toast: "0 12px 30px rgba(0,0,0,.25)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
