/**
 * Row shapes for the 8 dashboard read views in
 * "Home School HQ - Backend v1 - Write Loop + Read Views.sql".
 * These mirror the SELECT lists of each homeschool.v_* view exactly.
 */

export type Learner = "rupert" | "albie";
export type LearnerScope = Learner | "both";

/** v_today_rings — one row per learner/subject ring for today. */
export interface RingRow {
  learner_id: string;
  learner: string;
  subject_id: string | null;
  ring_label: string;
  aole: string | null;
  target_xp: number;
  earned_xp: number;
  pct: number;
  status: string | null;
  date: string;
}

/** v_today_plan — tickable items (due reviews + queued picker tasks). */
export interface PlanRow {
  learner_id: string;
  item_kind: "review" | "task";
  skill_id: string | null;
  skill: string | null;
  subject: string | null;
  aole: string | null;
  due_date: string | null;
  rank: number | null;
  reason: string | null;
}

/** v_mastery_snapshot — counts vs the 171-skill graph + weekly movement. */
export interface MasteryRow {
  learner_id: string;
  learner: string;
  total_skills: number;
  mastered: number;
  learning: number;
  needs_review: number;
  not_started: number;
  pct_mastered: number | null;
  mastered_last_7d: number;
  touched_last_7d: number;
}

/** v_compliance_next_actions — household-level, read-only. */
export interface ComplianceRow {
  id: string;
  event: string;
  status: string | null;
  date: string | null;
  next_action_date: string | null;
  action_date: string | null;
  document_link: string | null;
  notes: string | null;
  urgency: "overdue" | "due_soon" | "scheduled" | "logged";
}

/** v_ops_hotlist — open ops/build tasks + assignee persona + urgency. */
export interface OpsRow {
  id: string;
  title: string;
  category: string | null;
  status: string | null;
  due_date: string | null;
  learner_id: string | null;
  team_member_id: string | null;
  assignee: string | null;
  assignee_persona: string | null;
  urgency: "overdue" | "due_soon" | "later" | "no_date";
}

/** v_upcoming_sessions — future dated sessions/trips. */
export interface SessionRow {
  session_id: string;
  date: string;
  location: string | null;
  duration_min: number | null;
  aole: string | null;
  learner_id: string | null;
  learner: string | null;
  workshop_id: string | null;
  title: string | null;
  theme: string | null;
  type: string | null;
  led_by: string | null;
}

/** v_motivation_pulse — streaks + XP/level per learner. */
export interface MotivationRow {
  learner_id: string;
  learner: string;
  daily_streak: number;
  longest_streak: number;
  streak_last_date: string | null;
  total_xp: number;
  level: number | null;
  level_name: string | null;
}

/** v_rewards_to_approve — rewards awaiting Dominic's approval (go-kart lever). */
export interface RewardRow {
  learner_reward_id: string;
  learner_id: string;
  learner: string;
  status: string | null;
  requested_at: string | null;
  scheduled_for: string | null;
  reward_id: string;
  reward: string;
  reward_type: string | null;
  cost_coins: number | null;
  coins_reserved: number | null;
  balance_now: number | null;
}

/** The full bundle the dashboard server-fetches once (all learners). */
export interface DashboardData {
  rings: RingRow[];
  plan: PlanRow[];
  mastery: MasteryRow[];
  compliance: ComplianceRow[];
  ops: OpsRow[];
  sessions: SessionRow[];
  motivation: MotivationRow[];
  rewards: RewardRow[];
  /** stable learner_id → identity map, derived from whatever rows resolved. */
  learners: LearnerInfo[];
  demo: boolean;
}

export interface LearnerInfo {
  id: string;
  name: string;
  key: Learner; // rupert | albie (best-effort from name)
}

/** Shape returned by homeschool.log_activity — drives the toast. */
export interface LogReceipt {
  ok: boolean;
  activity_event_id: string;
  learner_id: string;
  xp_awarded: number;
  ring_label: string;
  ring_pct_before: number;
  ring_pct_after: number;
  ring_pct_delta: number;
  ring_closed: boolean;
  credits_added: number;
  hours_added: number;
  aole: string | null;
  skill_id: string | null;
  skill_status_before: string;
  skill_status_after: string;
  mastery_before: number;
  mastery_after: number;
  skill_up: boolean;
  streak_current: number;
  logged_at: string;
}
