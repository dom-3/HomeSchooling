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
  // A child can log EFFORT ("tried"/"got_it") but can NEVER self-declare
  // mastery — mastery is only ever minted by beating the Boss (verified).
  const result = body.result === "tried" ? "tried" : "got_it";

  const admin = getAdminClient();

  // Time matters: credit_ledger is the legal audit trail of educational hours.
  // The kids' portal doesn't ask a child to time themselves, so fall back to the
  // skill's own estimated lesson length. Dominic can adjust any entry later.
  let minutes = body.minutes ?? null;
  if (minutes == null) {
    const { data: ci } = await admin
      .from("content_items")
      .select("est_minutes")
      .eq("skill_id", body.skillId)
      .eq("ctype", "lesson")
      .maybeSingle();
    minutes = (ci as any)?.est_minutes ?? 20;
  }

  const { data, error } = await admin.rpc("log_activity", {
    p_learner_id: learnerId,
    p_kind: "skill_practice",
    p_skill_id: body.skillId,
    p_result: result,
    p_minutes: minutes,
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
