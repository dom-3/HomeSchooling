import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { IS_DEMO } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Record this week's pocket-money payment for a boy (parent action). */
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authorised" }, { status: 401 });

  let body: { learnerId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.learnerId) {
    return NextResponse.json({ ok: false, error: "Missing learner" }, { status: 400 });
  }
  if (IS_DEMO) return NextResponse.json({ ok: true, status: "paid" });

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("pay_pocket_money", {
    p_learner: body.learnerId,
    p_admin: user.email ?? user.id,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
