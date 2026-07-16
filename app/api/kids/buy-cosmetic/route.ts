import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getKidLearnerId } from "@/lib/kids/session";

export const dynamic = "force-dynamic";

/** Instant in-game purchase (garage/island upgrades) — coins spent immediately. */
export async function POST(req: NextRequest) {
  const learnerId = getKidLearnerId();
  if (!learnerId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  let body: { itemKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.itemKey) {
    return NextResponse.json({ ok: false, error: "Missing item" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("buy_cosmetic", {
    p_learner: learnerId,
    p_item_key: body.itemKey,
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
