import "server-only";
import { createSessionClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { ADMIN_EMAILS, IS_DEMO } from "@/lib/config";

export interface AdminUser {
  id: string;
  email: string | null;
}

/**
 * Returns the verified admin user, or null.
 *
 * A logged-in user is treated as admin only if EITHER their email is in the
 * ADMIN_EMAILS allowlist OR their homeschool.profiles row has role='admin'
 * (the Security persona's model). The profiles lookup uses the service_role
 * client and the verified auth.uid() — never anything the client sends.
 *
 * In demo mode there is no real session; a synthetic demo admin is returned so
 * the UI renders without a login.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (IS_DEMO) {
    return { id: "demo", email: "demo@home-school-hq.local" };
  }

  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const email = (user.email ?? "").toLowerCase();
  if (email && ADMIN_EMAILS.includes(email)) {
    return { id: user.id, email: user.email ?? null };
  }

  // Fall back to the profiles role map (created by the Security package).
  try {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error && data?.role === "admin") {
      return { id: user.id, email: user.email ?? null };
    }
  } catch {
    // profiles table not present yet — allowlist is the source of truth.
  }

  return null;
}
