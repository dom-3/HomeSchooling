import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { IS_DEMO } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Parent declines a real-world quest — no XP or coins are minted. A gentle
 *  reason goes back so the child knows to give it another go. */
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authorised" }, { status: 401 });

  let body: { completionId?: string; reason?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.completionId) {
    return NextResponse.json({ ok: false, error: "Missing completion id" }, { status: 400 });
  }
  if (IS_DEMO) return NextResponse.json({ ok: true, status: "declined" });

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("decline_real_world_quest", {
    p_completion: body.completionId,
    p_by: user.email ?? "parent",
    p_reason: body.reason ?? "Not quite yet",
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
