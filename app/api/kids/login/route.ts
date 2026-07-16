import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { makeKidToken, KID_COOKIE, KID_MAX_AGE } from "@/lib/kids/session";
import { IS_DEMO } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Verify a boy's 4-digit PIN, then set his signed session cookie. */
export async function POST(req: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json({ ok: false, error: "Live mode required" }, { status: 503 });
  }
  let body: { learnerId?: string; pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const { learnerId, pin } = body;
  if (!learnerId || !/^\d{4}$/.test(pin ?? "")) {
    return NextResponse.json({ ok: false, error: "Enter your 4-digit PIN" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("verify_learner_pin", {
    p_learner: learnerId,
    p_pin: pin,
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (data !== true) {
    return NextResponse.json({ ok: false, error: "That PIN doesn't match" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(KID_COOKIE, makeKidToken(learnerId), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: KID_MAX_AGE,
  });
  return res;
}
