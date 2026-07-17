import type { DashboardData, LogReceipt } from "@/lib/types";

/**
 * Mock data for DEMO mode (PORTAL_DEMO=1 or unconfigured Supabase). Mirrors the
 * illustrative content in the design mockup so the portal is reviewable on day
 * one. Replaced entirely by live view data once Supabase env is set.
 */

export const RUPERT_ID = "11111111-1111-1111-1111-111111111111";
export const ALBIE_ID = "22222222-2222-2222-2222-222222222222";

export function demoDashboard(): DashboardData {
  return {
    learners: [
      { id: RUPERT_ID, name: "Rupert", key: "rupert" },
      { id: ALBIE_ID, name: "Albie", key: "albie" },
    ],
    rings: [
      {
        learner_id: RUPERT_ID,
        learner: "Rupert",
        subject_id: "s-maths",
        ring_label: "Maths & Numeracy",
        aole: "maths_numeracy",
        target_xp: 100,
        earned_xp: 75,
        pct: 75,
        status: "open",
        date: today(),
      },
      {
        learner_id: ALBIE_ID,
        learner: "Albie",
        subject_id: "s-lang",
        ring_label: "Languages & Literacy",
        aole: "languages_literacy",
        target_xp: 100,
        earned_xp: 35,
        pct: 35,
        status: "open",
        date: today(),
      },
    ],
    plan: [
      {
        learner_id: RUPERT_ID,
        item_kind: "task",
        skill_id: "sk-mult2",
        skill: "Multiply 2-digit numbers",
        subject: "Maths & Numeracy",
        aole: "maths_numeracy",
        due_date: today(),
        rank: 1,
        reason: "next skill",
      },
      {
        learner_id: ALBIE_ID,
        item_kind: "review",
        skill_id: "sk-blends",
        skill: "Consonant blends",
        subject: "Languages & Literacy",
        aole: "languages_literacy",
        due_date: today(),
        rank: null,
        reason: "review due",
      },
      {
        learner_id: RUPERT_ID,
        item_kind: "review",
        skill_id: "sk-frac",
        skill: "Compare fractions",
        subject: "Maths & Numeracy",
        aole: "maths_numeracy",
        due_date: today(),
        rank: null,
        reason: "review due",
      },
    ],
    mastery: [
      {
        learner_id: RUPERT_ID,
        learner: "Rupert",
        total_skills: 171,
        mastered: 18,
        learning: 7,
        needs_review: 2,
        not_started: 144,
        pct_mastered: 10.5,
        mastered_last_7d: 3,
        touched_last_7d: 6,
      },
      {
        learner_id: ALBIE_ID,
        learner: "Albie",
        total_skills: 171,
        mastered: 5,
        learning: 4,
        needs_review: 1,
        not_started: 161,
        pct_mastered: 2.9,
        mastered_last_7d: 1,
        touched_last_7d: 3,
      },
    ],
    compliance: [
      {
        id: "c1",
        event: "LA annual review pack",
        status: "open",
        date: daysFromNow(-2),
        next_action_date: daysFromNow(-2),
        action_date: daysFromNow(-2),
        document_link: null,
        notes: "Carmarthenshire EHE",
        urgency: "overdue",
      },
      {
        id: "c2",
        event: "Termly benchmark booking",
        status: "open",
        date: daysFromNow(9),
        next_action_date: daysFromNow(9),
        action_date: daysFromNow(9),
        document_link: null,
        notes: "NGRT + PUMA",
        urgency: "due_soon",
      },
      {
        id: "c3",
        event: "Deregistration confirmed",
        status: "logged",
        date: daysFromNow(-30),
        next_action_date: null,
        action_date: daysFromNow(-30),
        document_link: null,
        notes: "both learners",
        urgency: "logged",
      },
    ],
    ops: [
      {
        id: "o1",
        title: "Enable RLS on exposed tables",
        category: "security",
        status: "todo",
        due_date: daysFromNow(0),
        learner_id: null,
        team_member_id: "tm-se",
        assignee: "Security & Data Protection",
        assignee_persona: "Security & Data Protection",
        urgency: "overdue",
      },
      {
        id: "o2",
        title: "Quick-log write loop",
        category: "backend",
        status: "in_progress",
        due_date: daysFromNow(2),
        learner_id: null,
        team_member_id: "tm-be",
        assignee: "Backend Engineer",
        assignee_persona: "Backend Engineer",
        urgency: "due_soon",
      },
      {
        id: "o3",
        title: "Wire dashboard to live data",
        category: "frontend",
        status: "in_progress",
        due_date: daysFromNow(5),
        learner_id: null,
        team_member_id: "tm-fe",
        assignee: "Frontend Engineer",
        assignee_persona: "Frontend Engineer",
        urgency: "due_soon",
      },
    ],
    sessions: [
      {
        session_id: "se1",
        date: today(),
        location: "Carmarthen BJJ",
        duration_min: 60,
        aole: "health_wellbeing",
        learner_id: ALBIE_ID,
        learner: "Albie",
        workshop_id: "w1",
        title: "BJJ session",
        theme: "Health & Well-being",
        type: "club",
        led_by: "Coach",
      },
      {
        session_id: "se2",
        date: daysFromNow(2),
        location: "Workshop",
        duration_min: 90,
        aole: "science_technology",
        learner_id: RUPERT_ID,
        learner: "Rupert",
        workshop_id: "w2",
        title: "STEM Racing build",
        theme: "Passion · F1 thread",
        type: "project",
        led_by: "Dominic",
      },
      {
        session_id: "se3",
        date: daysFromNow(4),
        location: "Climbing centre",
        duration_min: 120,
        aole: "expressive_arts",
        learner_id: null,
        learner: null,
        workshop_id: "w3",
        title: "Climbing centre trip",
        theme: "Expressive Arts + H&WB",
        type: "trip",
        led_by: "Dominic",
      },
    ],
    motivation: [
      {
        learner_id: RUPERT_ID,
        learner: "Rupert",
        daily_streak: 6,
        longest_streak: 9,
        streak_last_date: today(),
        total_xp: 1240,
        level: 4,
        level_name: "Pit Crew",
      },
      {
        learner_id: ALBIE_ID,
        learner: "Albie",
        daily_streak: 3,
        longest_streak: 4,
        streak_last_date: today(),
        total_xp: 560,
        level: 2,
        level_name: "Explorer",
      },
    ],
    rewards: [
      {
        learner_reward_id: "lr1",
        learner_id: RUPERT_ID,
        learner: "Rupert",
        status: "pending_approval",
        requested_at: today(),
        scheduled_for: null,
        reward_id: "r1",
        reward: "Go-kart track day",
        reward_type: "experience",
        cost_coins: 2600,
        coins_reserved: 2600,
        balance_now: 2600,
      },
    ],
    payday: [
      { learner_id: RUPERT_ID, learner: "Rupert", week_start: today(), base_gbp: 5, per_output_gbp: 1, weekly_cap_gbp: 25, weekly_target: 10, outputs: 12, amount_gbp: 17, status: "pending", paid_at: null },
      { learner_id: ALBIE_ID, learner: "Albie", week_start: today(), base_gbp: 5, per_output_gbp: 1, weekly_cap_gbp: 25, weekly_target: 10, outputs: 6, amount_gbp: 11, status: "pending", paid_at: null },
    ],
    demo: true,
  };
}

/** Deterministic fake receipt for DEMO-mode quick-log saves. */
export function demoReceipt(input: {
  learnerName: string;
  learner_id: string;
  kind: string;
  result: string | null;
  minutes: number | null;
  ring_label: string;
  skill_id: string | null;
}): LogReceipt {
  const xpMap: Record<string, number> = {
    mastered: 60,
    got_it: 25,
    tried: 10,
  };
  const xp =
    input.kind === "skill_practice"
      ? xpMap[input.result ?? "tried"] ?? 10
      : input.kind === "lesson"
        ? 20
        : input.kind === "reading"
          ? 15
          : 30;
  const hours = input.minutes ? Math.round((input.minutes / 60) * 100) / 100 : 0;
  const before = 57;
  const after = Math.min(100, before + xp);
  return {
    ok: true,
    activity_event_id: "demo-event",
    learner_id: input.learner_id,
    xp_awarded: xp,
    ring_label: input.ring_label,
    ring_pct_before: before,
    ring_pct_after: after,
    ring_pct_delta: after - before,
    ring_closed: after >= 100,
    credits_added: hours,
    hours_added: hours,
    aole: null,
    skill_id: input.skill_id,
    skill_status_before: "learning",
    skill_status_after: input.result === "mastered" ? "mastered" : "learning",
    mastery_before: 71,
    mastery_after: input.result === "mastered" ? 90 : 84,
    skill_up: input.kind === "skill_practice",
    streak_current: 6,
    logged_at: new Date().toISOString(),
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
