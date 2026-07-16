import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { IS_DEMO } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Parent declines a request — the reserved coins are released straight back,
 *  so a "no" costs the child nothing. */
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authorised" }, { status: 401 });

  let body: { learnerRewardId?: string; reason?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.learnerRewardId) {
    return NextResponse.json({ ok: false, error: "Missing redemption id" }, { status: 400 });
  }
  if (IS_DEMO) return NextResponse.json({ ok: true, status: "declined" });

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("decline_redemption", {
    p_lr_id: body.learnerRewardId,
    p_admin: user.email ?? user.id,
    p_reason: body.reason ?? null,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
