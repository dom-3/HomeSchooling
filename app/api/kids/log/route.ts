import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getKidLearnerId } from "@/lib/kids/session";

export const dynamic = "force-dynamic";

/**
 * A boy completing a quest. The learner is taken from the SIGNED COOKIE, never
 * from the request body, so a child can only ever log for himself. Calls the
 * one write loop, which mints XP + coins atomically and returns the receipt.
 */
export async function POST(req: NextRequest) {
  const learnerId = getKidLearnerId();
  if (!learnerId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  let body: { skillId?: string; result?: string; minutes?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.skillId) {
    return NextResponse.json({ ok: false, error: "Missing skill" }, { status: 400 });
  }
  const result = ["tried", "got_it", "mastered"].includes(body.result ?? "")
    ? body.result
    : "got_it";

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("log_activity", {
    p_learner_id: learnerId,
    p_kind: "skill_practice",
    p_skill_id: body.skillId,
    p_result: result,
    p_minutes: body.minutes ?? null,
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
