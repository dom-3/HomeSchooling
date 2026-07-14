/**
 * Environment / mode resolution. One place that decides whether we run in
 * DEMO mode (mock data, no login) or LIVE mode (Supabase Auth + service_role).
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** The Postgres schema all data lives in (Project Brief). */
export const DB_SCHEMA = "homeschool";

/** Admin email allowlist (comma-separated env). */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Demo mode is ON when PORTAL_DEMO=1, OR when the Supabase env isn't fully
 * configured (so the app still runs for a visual review). Demo mode skips
 * login and serves mock data behind a banner. It MUST be off for real data.
 */
const liveConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SERVICE_ROLE_KEY
);

export const IS_DEMO =
  process.env.PORTAL_DEMO === "1" || !liveConfigured;
