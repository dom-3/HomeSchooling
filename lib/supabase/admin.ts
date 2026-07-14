import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SERVICE_ROLE_KEY, DB_SCHEMA } from "@/lib/config";

/**
 * SERVER-ONLY service_role client, scoped to the `homeschool` schema.
 *
 * Security model (from the build instruction + Backend handoff §"Why one
 * function"): all Supabase data access is server-side only via this client.
 * The service_role key bypasses RLS and is NEVER sent to the browser. The
 * `import "server-only"` guard makes any accidental client import a build
 * error.
 *
 * NOTE (dependency / flag): reading the views and calling log_activity through
 * PostgREST requires the `homeschool` schema to be in Supabase's "Exposed
 * schemas". The views/function are granted ONLY to authenticated + service_role
 * (never anon), so exposing the schema does not make anything anon-readable.
 * See README "Supabase wiring" and the flags section.
 */
// Generic params left as `any` so the homeschool-schema client (a non-"public"
// schema) is assignable without fighting supabase-js's schema generics.
let _admin: SupabaseClient<any, any, any> | null = null;

export function getAdminClient(): SupabaseClient<any, any, any> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase admin client requested but NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set."
    );
  }
  if (!_admin) {
    _admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: DB_SCHEMA },
    }) as SupabaseClient<any, any, any>;
  }
  return _admin;
}
