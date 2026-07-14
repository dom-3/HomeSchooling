"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for the LOGIN form only. Uses the publishable (anon)
 * key — safe in the browser. It is used purely to authenticate via Supabase
 * Auth; it never reads learner data (the homeschool schema gives anon no
 * grants). All data access is server-side via the service_role admin client.
 */
export function createClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
