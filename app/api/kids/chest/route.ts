import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getKidLearnerId } from "@/lib/kids/session";

export const dynamic = "force-dynamic";

/** Open today's daily chest (once per day, streak-scaled — enforced in SQL). */
export async function POST() {
  const learnerId = getKidLearnerId();
  if (!learnerId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const admin = getAdminClient();
  const { data, error } = await admin.rpc("open_daily_chest", { p_learner: learnerId });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
