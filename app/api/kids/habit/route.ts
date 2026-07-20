import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getKidLearnerId } from "@/lib/kids/session";

export const dynamic = "force-dynamic";

/** Tick off a daily habit (yoga, breathing, feelings). Once/day, small coins. */
export async function POST(req: NextRequest) {
  const learnerId = getKidLearnerId();
  if (!learnerId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  let body: { habitId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.habitId) return NextResponse.json({ ok: false, error: "Missing habit" }, { status: 400 });

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("log_habit", { p_learner: learnerId, p_habit: body.habitId });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
