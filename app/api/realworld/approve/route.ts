import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { IS_DEMO } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Parent verifies a boy's real-world (off-screen) quest. This is what actually
 *  mints the XP + coins for getting off the screen and making something real. */
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authorised" }, { status: 401 });

  let body: { completionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.completionId) {
    return NextResponse.json({ ok: false, error: "Missing completion id" }, { status: 400 });
  }
  if (IS_DEMO) return NextResponse.json({ ok: true, status: "verified" });

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("verify_real_world_quest", {
    p_completion: body.completionId,
    p_by: user.email ?? "parent",
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
