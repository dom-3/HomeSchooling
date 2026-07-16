import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { IS_DEMO } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Parent approves a boy's reward request. Coins were reserved at request; this
 *  confirms the charge and (for experiences) can carry a scheduled date. */
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authorised" }, { status: 401 });

  let body: { learnerRewardId?: string; scheduledFor?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.learnerRewardId) {
    return NextResponse.json({ ok: false, error: "Missing redemption id" }, { status: 400 });
  }
  if (IS_DEMO) return NextResponse.json({ ok: true, status: "approved" });

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("approve_redemption", {
    p_lr_id: body.learnerRewardId,
    p_admin: user.email ?? user.id,
    p_scheduled_for: body.scheduledFor ?? null,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
