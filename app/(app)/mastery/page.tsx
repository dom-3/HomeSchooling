import { getDashboardData } from "@/lib/data";
import { MasterySection } from "@/components/sections";

/** Mastery map — the 171-skill engine room (functional-lite). */
export default async function MasteryPage() {
  const data = await getDashboardData();
  return (
    <div className="px-6 pb-16 pt-[22px]">
      <MasterySection data={data} />
    </div>
  );
}
