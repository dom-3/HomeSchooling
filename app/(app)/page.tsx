import { getDashboardData } from "@/lib/data";
import { Dashboard } from "@/components/Dashboard";

/** Home — the 6-widget morning-scan dashboard (Design Spec §3). */
export default async function HomePage() {
  const data = await getDashboardData();
  return (
    <div className="px-6 pb-16 pt-[22px]">
      <Dashboard data={data} />
    </div>
  );
}
