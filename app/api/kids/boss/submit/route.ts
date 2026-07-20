import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getKidLearnerId } from "@/lib/kids/session";

export const dynamic = "force-dynamic";

/**
 * Mark a boss attempt server-side. On a pass (>=90%), this is the ONE place
 * that mints verified mastery: it calls log_activity(result='mastered'), which
 * sets learner_skill_state, mints XP + coins, and counts toward pocket money.
 * Then it advances the plan so the next skill unlocks on the map.
 */
export async function POST(req: NextRequest) {
  const learnerId = getKidLearnerId();
  if (!learnerId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  let body: { attemptId?: string; answers?: number[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.attemptId || !Array.isArray(body.answers)) {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: attempt } = await admin
    .from("boss_attempts")
    .select("*")
    .eq("id", body.attemptId)
    .eq("learner_id", learnerId)
    .maybeSingle();
  if (!attempt) return NextResponse.json({ ok: false, error: "Attempt not found" }, { status: 400 });
  if ((attempt as any).status !== "in_progress") {
    return NextResponse.json({ ok: false, error: "Already finished" }, { status: 409 });
  }

  const items = ((attempt as any).items ?? []) as { q: string; options: string[]; correct: number }[];
  const answers = body.answers;
  const wrong: number[] = [];
  let score = 0;
  items.forEach((it, i) => {
    if (answers[i] === it.correct) score += 1;
    else wrong.push(i);
  });
  const total = items.length;
  const passed = score >= Math.ceil(total * 0.9); // 90% mastery bar

  await admin
    .from("boss_attempts")
    .update({ answers, score, passed, status: passed ? "passed" : "failed", completed_at: new Date().toISOString() })
    .eq("id", body.attemptId);

  let receipt: any = null;
  if (passed) {
    const skillId = (attempt as any).skill_id as string;
    // lesson length for the hours audit trail
    const { data: ci } = await admin
      .from("content_items")
      .select("est_minutes")
      .eq("skill_id", skillId)
      .eq("ctype", "lesson")
      .maybeSingle();
    const { data: logData } = await admin.rpc("log_activity", {
      p_learner_id: learnerId,
      p_kind: "skill_practice",
      p_skill_id: skillId,
      p_result: "mastered",
      p_minutes: (ci as any)?.est_minutes ?? 20,
    });
    receipt = logData;
    // advance the map: drop the cleared quest, regenerate the plan
    await admin.from("tasks").delete().eq("learner_id", learnerId).eq("skill_id", skillId).eq("status", "queued");
    await admin.rpc("generate_tasks", { p_learner_id: learnerId, p_max: 8 });
  }

  return NextResponse.json({ ok: true, passed, score, total, wrong, receipt });
}
