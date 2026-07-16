import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { IS_DEMO } from "@/lib/config";

/**
 * Route gate. In LIVE mode every app route requires a Supabase Auth session;
 * unauthenticated requests are redirected to /login. (Admin-role enforcement
 * happens server-side in getAdminUser() — middleware only checks "logged in".)
 * In DEMO mode the gate is disabled so the UI is reviewable without a login.
 */
export async function middleware(request: NextRequest) {
  if (IS_DEMO) return NextResponse.next();

  const { response, user } = await updateSession(request);

  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/login" ||
    path.startsWith("/api/auth") ||
    path.startsWith("/kids") ||
    path.startsWith("/api/kids") ||
    path.startsWith("/_next") ||
    path === "/favicon.ico";

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
