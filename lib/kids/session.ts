import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { SERVICE_ROLE_KEY } from "@/lib/config";

/**
 * Kid session = a signed, HTTP-only cookie carrying ONLY a learner_id.
 *
 * The PIN is verified server-side (bcrypt, via verify_learner_pin); on success
 * we mint this token. It grants no Supabase access on its own — every action
 * route re-reads it server-side and calls the service_role functions with that
 * learner_id. HMAC-SHA256 signature stops tampering; 8-hour expiry.
 */
const SECRET =
  process.env.KID_SESSION_SECRET || SERVICE_ROLE_KEY || "dev-only-insecure-secret";
export const KID_COOKIE = "hshq_kid";
export const KID_MAX_AGE = 60 * 60 * 8; // 8 hours

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function makeKidToken(learnerId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ lid: learnerId, exp: Date.now() + KID_MAX_AGE * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyKidToken(token: string): string | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = sign(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const p = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!p.lid || !p.exp || p.exp < Date.now()) return null;
    return p.lid as string;
  } catch {
    return null;
  }
}

/** The current logged-in learner_id from the cookie, or null. Server-only. */
export function getKidLearnerId(): string | null {
  const c = cookies().get(KID_COOKIE)?.value;
  return c ? verifyKidToken(c) : null;
}
