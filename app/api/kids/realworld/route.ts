import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getKidLearnerId } from "@/lib/kids/session";

export const dynamic = "force-dynamic";

/**
 * A child submitting a REAL-WORLD quest (handwriting, drawing, building,
 * gardening, teaching…). The learner comes from the signed cookie, never the
 * body. This only marks it PENDING — a grown-up verifies it in the CEO portal,
 * and only then does it mint XP + coins + hours. The reward economy paying out
 * for getting off the screen.
 */
export async function POST(req: NextRequest) {
  const learnerId = getKidLearnerId();
  if (!learnerId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  let body: { questId?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.questId) return NextResponse.json({ ok: false, error: "Missing quest" }, { status: 400 });

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("submit_real_world_quest", {
    p_learner: learnerId,
    p_quest: body.questId,
    p_note: (body.note ?? "").slice(0, 300) || null,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
