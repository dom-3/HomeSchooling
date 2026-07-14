"use client";

import { usePathname } from "next/navigation";
import { TITLE_BY_PATH } from "@/lib/nav";
import { useSwitcher, useQuickLog } from "@/components/providers";
import type { LearnerScope } from "@/lib/types";

/**
 * Persistent top bar: page title, today's date, the learner switcher (global
 * filter), and the Quick-log button — present on every screen (Design Spec §2,
 * §5). The date is passed from the server to avoid hydration drift.
 */
export function TopBar({ today }: { today: string }) {
  const pathname = usePathname();
  const { scope, setScope } = useSwitcher();
  const quicklog = useQuickLog();

  const title =
    TITLE_BY_PATH[pathname] ??
    (pathname.startsWith("/learners") ? "Learners" : "Home School HQ");

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-hairline bg-surface/[0.86] px-6 py-3 backdrop-blur">
      <h1 className="text-[18px] tracking-[-0.01em]">{title}</h1>
      <span className="text-[12.5px] font-medium text-ink-3">{today}</span>
      <div className="flex-1" />

      <Switcher scope={scope} onChange={setScope} />

      <button
        onClick={() => quicklog.open()}
        className="inline-flex items-center gap-2 rounded-[9px] border border-brand bg-brand px-[14px] py-2 font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        <span className="-mt-px text-[16px] leading-none">＋</span> Quick-log
      </button>
    </header>
  );
}

function Switcher({
  scope,
  onChange,
}: {
  scope: LearnerScope;
  onChange: (s: LearnerScope) => void;
}) {
  const opts: { key: LearnerScope; label: string; dot: React.ReactNode }[] = [
    {
      key: "both",
      label: "Both",
      dot: (
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: "linear-gradient(90deg,var(--rupert) 50%,var(--albie) 50%)",
          }}
        />
      ),
    },
    {
      key: "rupert",
      label: "Rupert",
      dot: <span className="h-2 w-2 rounded-full" style={{ background: "var(--rupert)" }} />,
    },
    {
      key: "albie",
      label: "Albie",
      dot: <span className="h-2 w-2 rounded-full" style={{ background: "var(--albie)" }} />,
    },
  ];
  return (
    <div
      role="tablist"
      aria-label="Learner switcher"
      className="inline-flex gap-[2px] rounded-[10px] border border-hairline bg-surface-2 p-[3px]"
    >
      {opts.map((o) => {
        const active = scope === o.key;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.key)}
            className={`flex items-center gap-[7px] rounded-[7px] px-[14px] py-[6px] text-[13px] font-semibold ${
              active ? "bg-surface text-ink shadow-card" : "text-ink-2"
            }`}
          >
            {o.dot}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
