import "server-only";
import { cache } from "react";
import { getAdminClient } from "@/lib/supabase/admin";
import { IS_DEMO } from "@/lib/config";
import { demoDashboard } from "@/lib/demo";
import type {
  DashboardData,
  Learner,
  LearnerInfo,
  RingRow,
  PlanRow,
  MasteryRow,
  ComplianceRow,
  OpsRow,
  SessionRow,
  MotivationRow,
  RewardRow,
  PaydayRow,
} from "@/lib/types";

/**
 * Reads the 8 homeschool.v_* views server-side via the service_role client and
 * assembles the dashboard bundle for ALL learners (the switcher filters on the
 * client, so the morning scan never round-trips on a learner change).
 *
 * Resilient by design (Design Spec §1 "graceful when empty"): if the schema
 * isn't exposed yet, a view is missing, or a query errors, that slice falls
 * back to [] and the widget shows its designed empty state — so the portal is
 * never "broken", even before the backend exposure/RLS gate is closed.
 */
export const getDashboardData = cache(_getDashboardData);

async function _getDashboardData(): Promise<DashboardData> {
  if (IS_DEMO) return demoDashboard();

  const admin = getAdminClient();

  const safe = async <T>(view: string): Promise<T[]> => {
    try {
      const { data, error } = await admin.from(view).select("*");
      if (error) {
        console.warn(`[data] ${view} read failed: ${error.message}`);
        return [];
      }
      return (data ?? []) as T[];
    } catch (e) {
      console.warn(`[data] ${view} threw`, e);
      return [];
    }
  };

  const [
    rings,
    plan,
    mastery,
    compliance,
    ops,
    sessions,
    motivation,
    rewards,
    payday,
  ] = await Promise.all([
    safe<RingRow>("v_today_rings"),
    safe<PlanRow>("v_today_plan"),
    safe<MasteryRow>("v_mastery_snapshot"),
    safe<ComplianceRow>("v_compliance_next_actions"),
    safe<OpsRow>("v_ops_hotlist"),
    safe<SessionRow>("v_upcoming_sessions"),
    safe<MotivationRow>("v_motivation_pulse"),
    safe<RewardRow>("v_rewards_to_approve"),
    safe<PaydayRow>("v_payday"),
  ]);

  return {
    rings,
    plan,
    mastery,
    compliance,
    ops,
    sessions,
    motivation,
    rewards,
    payday,
    learners: deriveLearners(mastery, motivation, rings),
    demo: false,
  };
}

/** Best-effort identity map from whatever rows resolved. */
function deriveLearners(
  mastery: MasteryRow[],
  motivation: MotivationRow[],
  rings: RingRow[]
): LearnerInfo[] {
  const map = new Map<string, string>();
  for (const r of motivation) map.set(r.learner_id, r.learner);
  for (const r of mastery) if (!map.has(r.learner_id)) map.set(r.learner_id, r.learner);
  for (const r of rings) if (!map.has(r.learner_id)) map.set(r.learner_id, r.learner);
  return [...map.entries()].map(([id, name]) => ({ id, name, key: keyOf(name) }));
}

export function keyOf(name: string): Learner {
  return (name ?? "").toLowerCase().includes("albie") ? "albie" : "rupert";
}

/** Sidebar attention badges: blocking/overdue ops + overdue compliance. */
export function computeBadges(data: DashboardData) {
  const ops = data.ops.filter(
    (o) => o.urgency === "overdue" || o.urgency === "due_soon"
  ).length;
  const compliance = data.compliance.filter((c) => c.urgency === "overdue").length;
  return { ops, compliance };
}
