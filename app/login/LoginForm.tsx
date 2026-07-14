"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const supabase = createClientBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="text-[11.5px] font-[650] uppercase tracking-[0.04em] text-ink-2">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-[6px] w-full rounded-[9px] border border-hairline bg-surface-2 px-3 py-[10px] text-[13.5px] normal-case"
        />
      </label>
      <label className="text-[11.5px] font-[650] uppercase tracking-[0.04em] text-ink-2">
        Password
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-[6px] w-full rounded-[9px] border border-hairline bg-surface-2 px-3 py-[10px] text-[13.5px] normal-case"
        />
      </label>
      {error ? (
        <p className="rounded-[8px] bg-danger-tint px-3 py-2 text-[12.5px] font-medium text-danger">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-1 rounded-[9px] border border-brand bg-brand px-[14px] py-[10px] font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
