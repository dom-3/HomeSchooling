import { getDashboardData } from "@/lib/data";
import { LearnersSection } from "@/components/sections";

/** Learners — per-child profile + ILP (functional-lite; full ILP later). */
export default async function LearnersPage() {
  const data = await getDashboardData();
  return (
    <div className="px-6 pb-16 pt-[22px]">
      <LearnersSection data={data} />
    </div>
  );
}
