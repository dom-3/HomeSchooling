"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { LearnerInfo, LearnerScope, LogReceipt } from "@/lib/types";
import { QuickLogSheet, type SkillOption } from "@/components/QuickLogSheet";

/* ----------------------------- Learner switcher ---------------------------- */

interface SwitcherCtx {
  scope: LearnerScope;
  setScope: (s: LearnerScope) => void;
  learners: LearnerInfo[];
}
const SwitcherContext = createContext<SwitcherCtx | null>(null);
export function useSwitcher() {
  const c = useContext(SwitcherContext);
  if (!c) throw new Error("useSwitcher must be used inside AppProviders");
  return c;
}

const SCOPE_KEY = "hshq.scope";

/* --------------------------------- Toast ----------------------------------- */

interface ToastModel {
  id: number;
  learnerName: string;
  chips: string[];
}
interface ToastCtx {
  showReceipt: (r: LogReceipt, learnerName: string) => void;
}
const ToastContext = createContext<ToastCtx | null>(null);
export function useToast() {
  const c = useContext(ToastContext);
  if (!c) throw new Error("useToast must be used inside AppProviders");
  return c;
}

/** Build the fan-out chips from the write-loop receipt (Design Spec §5). */
export function chipsFromReceipt(r: LogReceipt): string[] {
  const chips: string[] = [`+${r.xp_awarded} XP`];
  if (r.ring_pct_delta > 0) chips.push(`Ring +${r.ring_pct_delta}%`);
  if (r.credits_added > 0) chips.push(`+${r.credits_added} credits`);
  if (r.skill_up) chips.push("skill ↑");
  return chips;
}

/* ------------------------------- Quick-log --------------------------------- */

interface QuickLogCtx {
  open: (prefill?: Partial<QuickLogPrefill>) => void;
}
export interface QuickLogPrefill {
  learnerId: string;
  skillId: string | null;
  skillLabel: string;
  kind: string;
}
const QuickLogContext = createContext<QuickLogCtx | null>(null);
export function useQuickLog() {
  const c = useContext(QuickLogContext);
  if (!c) throw new Error("useQuickLog must be used inside AppProviders");
  return c;
}

/* ------------------------------- Provider ---------------------------------- */

export function AppProviders({
  learners,
  skillOptions = [],
  demo,
  children,
}: {
  learners: LearnerInfo[];
  skillOptions?: SkillOption[];
  demo: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [scope, setScopeState] = useState<LearnerScope>("both");
  const [toast, setToast] = useState<ToastModel | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [prefill, setPrefill] = useState<Partial<QuickLogPrefill> | undefined>();

  // Restore persisted scope (Design Spec §2 — morning scan reopens where left).
  useEffect(() => {
    const saved = localStorage.getItem(SCOPE_KEY) as LearnerScope | null;
    if (saved === "both" || saved === "rupert" || saved === "albie") {
      setScopeState(saved);
    }
  }, []);
  const setScope = useCallback((s: LearnerScope) => {
    setScopeState(s);
    try {
      localStorage.setItem(SCOPE_KEY, s);
    } catch {
      /* ignore */
    }
  }, []);

  const showReceipt = useCallback((r: LogReceipt, learnerName: string) => {
    setToast({ id: Date.now(), learnerName, chips: chipsFromReceipt(r) });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  const openQuickLog = useCallback((p?: Partial<QuickLogPrefill>) => {
    setPrefill(p);
    setSheetOpen(true);
  }, []);

  const onSaved = useCallback(
    (r: LogReceipt, learnerName: string) => {
      setSheetOpen(false);
      showReceipt(r, learnerName);
      // Re-run server components so widgets pick up the new rows.
      router.refresh();
    },
    [router, showReceipt]
  );

  const switcherValue = useMemo(
    () => ({ scope, setScope, learners }),
    [scope, setScope, learners]
  );

  return (
    <SwitcherContext.Provider value={switcherValue}>
      <ToastContext.Provider value={{ showReceipt }}>
        <QuickLogContext.Provider value={{ open: openQuickLog }}>
          {children}

          <QuickLogSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            learners={learners}
            scope={scope}
            prefill={prefill}
            skillOptions={skillOptions}
            demo={demo}
            onSaved={onSaved}
          />

          {/* Toast host (Design Spec §5 — the write loop made visible). */}
          <div
            aria-live="polite"
            className={`fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-[14px] rounded-card bg-ink px-[18px] py-[13px] text-[13px] text-white shadow-toast transition-all duration-200 ${
              toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
            }`}
          >
            {toast ? (
              <>
                <span>✓ Logged for {toast.learnerName}</span>
                <div className="flex gap-[10px]">
                  {toast.chips.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-white/[0.14] px-2 py-[3px] text-[12px] font-bold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <span className="opacity-0">.</span>
            )}
          </div>
        </QuickLogContext.Provider>
      </ToastContext.Provider>
    </SwitcherContext.Provider>
  );
}
