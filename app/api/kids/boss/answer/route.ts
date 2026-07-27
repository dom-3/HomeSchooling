import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getKidLearnerId } from "@/lib/kids/session";

export const dynamic = "force-dynamic";

/**
 * Boss Fight v2 — LIVE, per-answer grading.
 *
 * The child submits ONE answer at a time. We grade it on the SERVER against the
 * stored key (which never reaches the browser), record it, and return the live
 * combat state so the client lands the hit immediately. The verdict is computed
 * here too, so a child can never fake a win — this is the anti-cheat boundary.
 *
 * Combat model (all tunable constants below):
 *  - HP = ceil(total * 0.8) correct hits to KILL the boss. Kill == mastery.
 *  - A "cannon" fires on every 3rd consecutive correct (spectacle; damage is
 *    still 1 per correct, so the boss can only die to real accuracy).
 *  - The boss ESCAPES on 3 wrong in a row, or 6 wrong total, or when it can no
 *    longer be killed with the questions left. Escaping costs the child NOTHING.
 *  - Win == boss killed → mint mastery (log_activity 'mastered') + advance map.
 *
 * Mastery is minted at most ONCE per attempt via a compare-and-set on status.
 */

interface Item {
  q: string;
  options: string[];
  correct: number;
}

const WRONG_STREAK_ESCAPE = 3;
const WRONG_TOTAL_ESCAPE = 6;
const COMBO_EVERY = 3;

export async function POST(req: NextRequest) {
  const learnerId = getKidLearnerId();
  if (!learnerId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  let body: { attemptId?: string; index?: number; choice?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const { attemptId, index, choice } = body;
  if (!attemptId || typeof index !== "number" || typeof choice !== "number") {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: attempt } = await admin
    .from("boss_attempts")
    .select("id, learner_id, skill_id, items, answers, status")
    .eq("id", attemptId)
    .maybeSingle();
  if (!attempt || (attempt as any).learner_id !== learnerId) {
    return NextResponse.json({ ok: false, error: "Attempt not found" }, { status: 404 });
  }

  const items = (((attempt as any).items ?? []) as Item[]);
  const total = items.length;
  const HP = Math.max(1, Math.ceil(total * 0.8));
  const status = (attempt as any).status as string;
  const finished = status === "passed" || status === "failed";

  // choices indexed by question number; null = unanswered
  const answers: (number | null)[] = Array.isArray((attempt as any).answers)
    ? [...((attempt as any).answers as (number | null)[])]
    : new Array(total).fill(null);
  while (answers.length < total) answers.push(null);

  if (!finished) {
    if (index < 0 || index >= total) {
      return NextResponse.json({ ok: false, error: "Bad question" }, { status: 400 });
    }
    // idempotent: ignore a re-tap of an already-answered question
    if (answers[index] == null) answers[index] = choice;
  }

  // Recompute combat state from the answered questions, in question order.
  let correctCount = 0;
  let wrongTotal = 0;
  let wrongStreak = 0;
  let correctStreak = 0;
  let answeredCount = 0;
  for (let i = 0; i < total; i++) {
    const a = answers[i];
    if (a == null) continue;
    answeredCount++;
    if (a === items[i].correct) {
      correctCount++;
      correctStreak++;
      wrongStreak = 0;
    } else {
      wrongTotal++;
      wrongStreak++;
      correctStreak = 0;
    }
  }

  const lastCorrect = answers[index] != null && items[index] ? answers[index] === items[index].correct : false;
  const remaining = total - answeredCount;
  const cannon = !finished && lastCorrect && correctStreak > 0 && correctStreak % COMBO_EVERY === 0;

  // Terminal conditions
  const won = correctCount >= HP;
  const escaped =
    !won &&
    (wrongStreak >= WRONG_STREAK_ESCAPE || wrongTotal >= WRONG_TOTAL_ESCAPE || correctCount + remaining < HP);
  const terminal = won || escaped || answeredCount >= total;
  const outcome: "ongoing" | "won" | "escaped" = won ? "won" : terminal ? "escaped" : "ongoing";

  let receipt: unknown = null;

  if (!finished && terminal) {
    // Compare-and-set: only the first call to flip status from in_progress wins.
    const finalStatus = won ? "passed" : "failed";
    const { data: upd } = await admin
      .from("boss_attempts")
      .update({
        answers,
        score: correctCount,
        passed: won,
        status: finalStatus,
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId)
      .eq("status", "in_progress")
      .select("id");
    const didFinalize = Array.isArray(upd) && upd.length > 0;

    if (won && didFinalize) {
      const skillId = (attempt as any).skill_id as string;
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
      await admin.from("tasks").delete().eq("learner_id", learnerId).eq("skill_id", skillId).eq("status", "queued");
      await admin.rpc("generate_tasks", { p_learner_id: learnerId, p_max: 8 });
    }
  } else if (!finished) {
    // mid-fight: persist so a reload can resume the same attempt
    await admin.from("boss_attempts").update({ answers }).eq("id", attemptId).eq("status", "in_progress");
  }

  return NextResponse.json({
    ok: true,
    index,
    correct: lastCorrect,
    cannon,
    correctCount,
    wrongTotal,
    wrongStreak,
    correctStreak,
    hp: HP,
    hpRemaining: Math.max(0, HP - correctCount),
    answered: answeredCount,
    total,
    outcome, // "ongoing" | "won" | "escaped"
    terminal,
    receipt,
  });
}
