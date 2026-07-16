import { redirect } from "next/navigation";
import { getKidLearnerId } from "@/lib/kids/session";
import { getKidHome } from "@/lib/kids/data";
import { KidGame } from "@/components/kids/KidGame";

export const dynamic = "force-dynamic";

export default async function KidHomePage() {
  const learnerId = getKidLearnerId();
  if (!learnerId) redirect("/kids");

  const home = await getKidHome(learnerId);
  if (!home.learner) redirect("/kids");

  return <KidGame home={home} />;
}
