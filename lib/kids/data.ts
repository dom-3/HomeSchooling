import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";

/** Loose row shapes — the kid views mirror the reward-economy SQL. */
export interface KidLearner {
  id: string;
  name: string;
  interests: string | null;
  photo_url: string | null;
}
export interface KidPulse {
  learner_id: string;
  learner: string;
  daily_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number | null;
  level_name: string | null;
  coin_balance: number;
}
export interface KidPlanItem {
  learner_id: string;
  item_kind: "review" | "task";
  skill_id: string | null;
  skill: string | null;
  subject: string | null;
  aole: string | null;
  rank: number | null;
}
export interface ShopItem {
  learner_id: string;
  reward_id: string;
  name: string;
  tier: string | null;
  icon: string | null;
  blurb: string | null;
  cost_coins: number;
  time_minutes: number | null;
  requires_approval: boolean;
  fulfilment: string;
  balance: number;
  affordable: boolean;
  coins_to_go: number;
  in_flight: boolean;
}
export interface TeamProgress {
  goal_id: string;
  name: string;
  icon: string | null;
  target_points: number;
  min_bond_quests: number;
  reward_blurb: string | null;
  team_points: number;
  bond_quests_done: number;
  pct: number;
  unlockable: boolean;
}

export interface LevelRow {
  level: number;
  name: string;
  xp_required: number;
}

export interface KidHome {
  learner: KidLearner | null;
  pulse: KidPulse | null;
  wallet: { balance: number; net_today: number } | null;
  plan: KidPlanItem[];
  shop: ShopItem[];
  team: TeamProgress | null;
  levels: LevelRow[];
}

/** For the boy-picker on the PIN gate. */
export async function getLearnersForPicker(): Promise<KidLearner[]> {
  const a = getAdminClient();
  const { data } = await a
    .from("learners")
    .select("id, name, interests, photo_url")
    .order("dob");
  return (data ?? []) as KidLearner[];
}

/** Everything one boy's home screen needs, in one round of reads. */
export async function getKidHome(learnerId: string): Promise<KidHome> {
  const a = getAdminClient();
  const [learner, pulse, wallet, plan, shop, team, levels] = await Promise.all([
    a.from("learners").select("id, name, interests, photo_url").eq("id", learnerId).maybeSingle(),
    a.from("v_motivation_pulse").select("*").eq("learner_id", learnerId).maybeSingle(),
    a.from("v_coin_wallet").select("balance, net_today").eq("learner_id", learnerId).maybeSingle(),
    a.from("v_today_plan").select("*").eq("learner_id", learnerId).order("rank", { ascending: true }),
    a.from("v_reward_shop").select("*").eq("learner_id", learnerId),
    a.from("v_team_progress").select("*").maybeSingle(),
    a.from("levels").select("level, name, xp_required").order("xp_required", { ascending: true }),
  ]);
  return {
    learner: (learner.data ?? null) as KidLearner | null,
    pulse: (pulse.data ?? null) as KidPulse | null,
    wallet: (wallet.data ?? null) as { balance: number; net_today: number } | null,
    plan: (plan.data ?? []) as KidPlanItem[],
    shop: (shop.data ?? []) as ShopItem[],
    team: (team.data ?? null) as TeamProgress | null,
    levels: (levels.data ?? []) as LevelRow[],
  };
}
