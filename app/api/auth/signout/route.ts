import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

/** Signs the admin out and clears the session cookie. */
export async function POST() {
  try {
    const supabase = createSessionClient();
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
  return NextResponse.json({ ok: true });
}
