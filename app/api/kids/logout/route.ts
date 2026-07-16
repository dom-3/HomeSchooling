import { NextResponse } from "next/server";
import { KID_COOKIE } from "@/lib/kids/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(KID_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
