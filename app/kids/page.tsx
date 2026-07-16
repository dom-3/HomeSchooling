import { redirect } from "next/navigation";
import { IS_DEMO } from "@/lib/config";
import { getKidLearnerId } from "@/lib/kids/session";
import { getLearnersForPicker } from "@/lib/kids/data";
import { PinGate } from "@/components/kids/PinGate";

export const dynamic = "force-dynamic";

export default async function KidsEntry() {
  if (IS_DEMO) {
    return (
      <div className="k-empty" style={{ marginTop: 60 }}>
        The kids&rsquo; portal needs live mode (Supabase connected). Ask a grown-up.
      </div>
    );
  }
  if (getKidLearnerId()) redirect("/kids/home");

  const learners = await getLearnersForPicker();
  return <PinGate learners={learners.map((l) => ({ id: l.id, name: l.name }))} />;
}
