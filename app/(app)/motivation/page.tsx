import { getDashboardData } from "@/lib/data";
import { MotivationSection } from "@/components/sections";

/** Motivation — streaks, XP, rings, badges + reward approval (functional-lite). */
export default async function MotivationPage() {
  const data = await getDashboardData();
  return (
    <div className="px-6 pb-16 pt-[22px]">
      <MotivationSection data={data} />
    </div>
  );
}
