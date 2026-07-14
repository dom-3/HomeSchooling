import { Suspense } from "react";
import { redirect } from "next/navigation";
import { IS_DEMO } from "@/lib/config";
import { getAdminUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

/**
 * Login gate (Supabase Auth, email/password). In demo mode there is no login —
 * we send straight to the portal. If already signed in, skip to Home.
 */
export default async function LoginPage() {
  if (IS_DEMO) redirect("/");
  const user = await getAdminUser();
  if (user) redirect("/");

  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6">
      <div className="w-full max-w-[380px] rounded-card border border-hairline bg-surface p-7 shadow-card">
        <div className="mb-5 flex items-center gap-[10px]">
          <div className="grid h-[30px] w-[30px] place-items-center rounded-sm2 bg-brand text-[15px] font-bold text-white">
            H
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-[-0.01em]">Home School HQ</div>
            <div className="text-[11px] font-medium text-ink-3">Command centre · admin only</div>
          </div>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-[11.5px] leading-relaxed text-ink-3">
          Family-only · UK GDPR. Access is restricted to the registered admin account.
        </p>
      </div>
    </main>
  );
}
