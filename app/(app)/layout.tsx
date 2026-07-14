import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { getDashboardData, computeBadges } from "@/lib/data";
import { IS_DEMO } from "@/lib/config";
import { aoleLabel, longDate } from "@/lib/format";
import { AppProviders } from "@/components/providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import type { SkillOption } from "@/components/QuickLogSheet";

// Live data console: always render on demand so widgets reflect current data
// and never bake demo/stale rows into a static page.
export const dynamic = "force-dynamic";

/**
 * Authenticated shell: sidebar + top bar + global providers (switcher, toast,
 * quick-log). Data is fetched once here (request-cached) for the learner list,
 * the quick-log skill options, and the sidebar attention badges; pages re-use
 * the same cached read.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user && !IS_DEMO) redirect("/login");

  const data = await getDashboardData();
  const badges = computeBadges(data);

  const skillOptions: SkillOption[] = data.plan
    .filter((p) => p.skill_id && p.skill)
    .map((p) => ({
      id: p.skill_id as string,
      label: p.skill as string,
      ringLabel: p.subject ?? aoleLabel(p.aole) ?? "Skill",
      learnerId: p.learner_id,
    }));

  return (
    <AppProviders learners={data.learners} skillOptions={skillOptions} demo={data.demo}>
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        <Sidebar badges={badges} demo={data.demo} />
        <div className="flex min-w-0 flex-col">
          <TopBar today={longDate()} />
          {data.demo ? <DemoBanner /> : null}
          {children}
        </div>
      </div>
    </AppProviders>
  );
}

function DemoBanner() {
  return (
    <div className="border-b border-warn/30 bg-warn-tint px-6 py-[7px] text-[12px] font-medium text-warn">
      Demo mode — illustrative data, login disabled. Set the Supabase env vars
      (and unset <code className="font-semibold">PORTAL_DEMO</code>) to go live.
    </div>
  );
}
