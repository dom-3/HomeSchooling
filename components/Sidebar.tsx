"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV } from "@/lib/nav";

/**
 * Persistent left sidebar — 7 sections + brand mark + family-only footer.
 * Active item uses the teal tint; attention badges show overdue/blocking counts.
 * Collapses to icon-only below ~1080px (Design Spec §2 "sidebar behaviour").
 */
export function Sidebar({
  badges,
  demo = false,
}: {
  badges: { ops: number; compliance: number };
  demo?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-[6px] border-r border-hairline bg-surface p-[18px_14px]">
      <div className="flex items-center gap-[10px] px-2 pb-4 pt-[6px]">
        <div className="grid h-[30px] w-[30px] place-items-center rounded-sm2 bg-brand text-[15px] font-bold text-white">
          H
        </div>
        <div className="lg:block">
          <div className="text-[15px] font-bold tracking-[-0.01em]">Home School HQ</div>
          <div className="text-[11px] font-medium text-ink-3">Command centre</div>
        </div>
      </div>

      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const count =
          item.badge === "ops" ? badges.ops : item.badge === "compliance" ? badges.compliance : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-[11px] rounded-sm2 px-[10px] py-[9px] text-[14px] font-medium ${
              active
                ? "bg-brand-tint font-semibold text-brand"
                : "text-ink-2 hover:bg-surface-2 hover:text-ink"
            }`}
          >
            <span className="w-[18px] flex-none text-center opacity-85">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {count > 0 ? (
              <span className="rounded-full bg-danger-tint px-[7px] py-[1px] text-[11px] font-bold text-danger">
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}

      <div className="mt-auto border-t border-hairline px-2 pt-[10px] text-[12px] text-ink-3">
        Dominic Pullen · Admin
        <br />
        Family-only · UK GDPR
        {!demo ? (
          <button
            onClick={signOut}
            className="mt-2 block text-[12px] font-semibold text-ink-2 hover:text-ink"
          >
            Sign out →
          </button>
        ) : null}
      </div>
    </aside>
  );
}
