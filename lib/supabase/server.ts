import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/config";

/**
 * Cookie-bound Supabase client for the LOGIN/SESSION layer only.
 *
 * Uses the publishable (anon) key — safe in this context: it authenticates the
 * user via Supabase Auth and reads the verified session from cookies. It is NOT
 * used to read learner data (that's the service_role admin client). The anon key
 * has no grants on the homeschool schema, so even if it were used it would
 * return nothing.
 */
export function createSessionClient() {
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from a Server Component — ignored; middleware refreshes.
        }
      },
    },
  });
}
