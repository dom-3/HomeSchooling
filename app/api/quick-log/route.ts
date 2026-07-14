import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { IS_DEMO } from "@/lib/config";
import { demoReceipt } from "@/lib/demo";
import type { LogReceipt } from "@/lib/types";

/**
 * The quick-log write loop — the feature v1 is built around.
 *
 * Server-side only. We verify the admin session FIRST (no service_role call for
 * an unauthenticated request), then call homeschool.log_activity(...) via RPC
 * with the service_role client. The function fans one save out to activity ·
 * XP · credits · skill-state (atomically) and returns a JSON receipt of deltas,
 * which we hand straight back for the toast (Backend handoff "API contract").
 */
export const dynamic = "force-dynamic";

interface Body {
  learnerId: string;
  learnerName: string;
  kind: "skill_practice" | "lesson" | "session" | "venture" | "reading";
  skillId?: string | null;
  activityLabel?: string | null;
  result?: "tried" | "got_it" | "mastered" | null;
  minutes?: number | null;
  note?: string | null;
  evidenceUrl?: string | null;
  ringLabel?: string;
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authorised" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  if (!body.learnerId || !body.kind) {
    return NextResponse.json(
      { ok: false, error: "learnerId and kind are required" },
      { status: 400 }
    );
  }
  if (body.kind === "skill_practice" && !body.skillId) {
    return NextResponse.json(
      { ok: false, error: "skill_practice requires a skill" },
      { status: 400 }
    );
  }

  // DEMO mode: no DB — return a deterministic receipt so the loop is reviewable.
  if (IS_DEMO) {
    const receipt = demoReceipt({
      learnerName: body.learnerName,
      learner_id: body.learnerId,
      kind: body.kind,
      result: body.result ?? null,
      minutes: body.minutes ?? null,
      ring_label: body.ringLabel ?? "Maths & Numeracy",
      skill_id: body.skillId ?? null,
    });
    return NextResponse.json(receipt);
  }

  try {
    const admin = getAdminClient();
    const { data, error } = await admin.rpc("log_activity", {
      p_learner_id: body.learnerId,
      p_kind: body.kind,
      p_skill_id: body.skillId ?? null,
      p_activity_label: body.activityLabel ?? null,
      p_result: body.result ?? null,
      p_minutes: body.minutes ?? null,
      p_note: body.note ?? null,
      p_evidence_url: body.evidenceUrl ?? null,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(data as LogReceipt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "log_activity failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
