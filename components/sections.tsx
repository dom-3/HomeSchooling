"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardData, Learner } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardBody,
  StatusPill,
  MetricBlock,
  Ring,
  Bar,
  ListRow,
  EmptyState,
  Button,
} from "@/components/ui";
import { useSwitcher, useQuickLog } from "@/components/providers";
import { aoleLabel } from "@/lib/format";

const LEARNER_COLOR: Record<Learner, string> = {
  rupert: "var(--rupert)",
  albie: "var(--albie)",
};

function useScoped(data: DashboardData) {
  const { scope, learners } = useSwitcher();
  const keyById = useMemo(() => {
    const m = new Map<string, Learner>();
    for (const l of learners) m.set(l.id, l.key);
    return m;
  }, [learners]);
  const visible = useMemo(
    () => (scope === "both" ? learners : learners.filter((l) => l.key === scope)),
    [scope, learners]
  );
  return { scope, learners, visible, keyById };
}

/* --------------------------------- Learners -------------------------------- */

export function LearnersSection({ data }: { data: DashboardData }) {
  const { visible, keyById } = useScoped(data);
  const quicklog = useQuickLog();

  if (visible.length === 0) {
    return <EmptyCardNote title="No learners found" sub="Learner profiles will appear once data resolves." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {visible.map((l) => {
        const mot = data.motivation.find((m) => m.learner_id === l.id);
        const mas = data.mastery.find((m) => m.learner_id === l.id);
        const rings = data.rings.filter((r) => r.learner_id === l.id);
        return (
          <Card key={l.id}>
            <CardHeader icon="◧" title={l.name} />
            <CardBody>
              <div className="mb-3 flex items-center gap-2">
                <StatusPill variant={l.key}>{l.name}</StatusPill>
                {mot?.level_name ? (
                  <span className="text-[12px] text-ink-2">
                    Level {mot.level ?? "—"} · {mot.level_name}
                  </span>
                ) : null}
              </div>
              <div className="mb-3 flex gap-[22px]">
                <MetricBlock value={mot?.total_xp ?? 0} label="TOTAL XP" />
                <MetricBlock value={`${mot?.daily_streak ?? 0}🔥`} label="STREAK" color={LEARNER_COLOR[l.key]} />
                <MetricBlock value={mas?.mastered ?? 0} label="MASTERED" />
              </div>
              {rings.length > 0 ? (
                <div className="flex flex-wrap gap-[16px]">
                  {rings.map((r) => (
                    <Ring
                      key={r.subject_id}
                      pct={r.pct}
                      color={LEARNER_COLOR[l.key]}
                      label={r.ring_label}
                      size={50}
                    />
                  ))}
                </div>
              ) : null}
              <p className="mt-4 border-t border-hairline pt-3 text-[12px] text-ink-3">
                Full ILP — academic / passion / character / life-skill goals + self-reflection —
                reads <code>learning_plans</code>, <code>plan_goals</code>,{" "}
                <code>competency_ratings</code> (later build).
              </p>
              <div className="mt-3">
                <Button variant="primary" size="sm" onClick={() => quicklog.open({ learnerId: l.id })}>
                  Quick-log for {l.name}
                </Button>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------- Mastery map ------------------------------- */

export function MasterySection({ data }: { data: DashboardData }) {
  const { visible } = useScoped(data);
  const quicklog = useQuickLog();

  if (visible.length === 0) {
    return (
      <EmptyCardNote
        title="No mastery recorded yet"
        sub="Run a baseline diagnostic or log activity to start the 171-skill graph."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-hairline bg-brand-tint/40 px-4 py-3 text-[12.5px] text-ink-2">
        The engine room. v1 shows mastery counts and in-progress skills per learner. The full
        filterable 171-skill graph with per-skill detail (reading <code>learner_skill_state</code>,{" "}
        <code>skill_guidance</code>, <code>reviews</code>) is the next build; the log-completion
        action is the Quick-log below.
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {visible.map((l) => {
          const mas = data.mastery.find((m) => m.learner_id === l.id);
          const inProgress = data.plan.filter((p) => p.learner_id === l.id && p.skill_id);
          const total = mas?.total_skills ?? 171;
          const masteredPct = mas ? Math.round((100 * mas.mastered) / total) : 0;
          const learningPct = mas ? Math.round((100 * mas.learning) / total) : 0;
          return (
            <Card key={l.id}>
              <CardHeader icon="⬡" title={`${l.name} · skill graph`} />
              <CardBody>
                <div className="mb-3 flex gap-[22px]">
                  <MetricBlock value={mas?.mastered ?? 0} label="MASTERED" />
                  <MetricBlock value={mas?.learning ?? 0} label="IN PROGRESS" color="var(--brand)" />
                  <MetricBlock value={mas?.not_started ?? total} label="LOCKED" color="var(--ink-3)" />
                </div>
                <Bar
                  segments={[
                    { pct: masteredPct, color: "var(--ok)" },
                    { pct: learningPct, color: "var(--brand)" },
                  ]}
                />
                <div className="mt-3 flex flex-col">
                  {inProgress.length === 0 ? (
                    <p className="py-2 text-[12.5px] text-ink-3">No skills in progress.</p>
                  ) : (
                    inProgress.slice(0, 5).map((p, i, arr) => (
                      <ListRow
                        key={`${p.skill_id}-${i}`}
                        last={i === Math.min(arr.length, 5) - 1}
                        title={p.skill ?? "Skill"}
                        subtitle={p.subject ?? aoleLabel(p.aole)}
                        trailing={
                          <Button
                            size="sm"
                            onClick={() =>
                              quicklog.open({
                                learnerId: l.id,
                                skillId: p.skill_id,
                                skillLabel: p.skill ?? "",
                                kind: "skill_practice",
                              })
                            }
                          >
                            Log
                          </Button>
                        }
                      />
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------- Motivation ------------------------------- */

/** Approve / Decline buttons for a pending reward request (admin, live). */
function RewardActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "decline">(null);
  async function act(kind: "approve" | "decline") {
    if (busy) return;
    setBusy(kind);
    try {
      await fetch(`/api/rewards/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerRewardId: id }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" disabled={busy !== null} onClick={() => act("decline")}>
        {busy === "decline" ? "…" : "Decline"}
      </Button>
      <Button variant="primary" size="sm" disabled={busy !== null} onClick={() => act("approve")}>
        {busy === "approve" ? "…" : "Approve"}
      </Button>
    </div>
  );
}

/** Pay button for a boy's weekly pocket-money payslip (admin, live). */
function PaydayActions({ learnerId, paid }: { learnerId: string; paid: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function pay() {
    if (busy || paid) return;
    setBusy(true);
    try {
      await fetch("/api/payday/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerId }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  if (paid) return <StatusPill variant="neutral">Paid ✓</StatusPill>;
  return (
    <Button variant="primary" size="sm" disabled={busy} onClick={pay}>
      {busy ? "…" : "Mark paid"}
    </Button>
  );
}

export function MotivationSection({ data }: { data: DashboardData }) {
  const { visible, keyById } = useScoped(data);
  const rewards = data.rewards.filter((r) => {
    const k = keyById.get(r.learner_id);
    return visible.some((v) => v.id === r.learner_id) && k;
  });
  const payday = data.payday.filter((p) => visible.some((v) => v.id === p.learner_id));
  const tutor = data.tutor.filter((m) => visible.some((v) => v.id === m.learner_id));

  if (visible.length === 0) {
    return <EmptyCardNote title="No streaks yet" sub="Streaks, XP and rewards build as you log." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {visible.map((l) => {
          const mot = data.motivation.find((m) => m.learner_id === l.id);
          const rings = data.rings.filter((r) => r.learner_id === l.id);
          return (
            <Card key={l.id}>
              <CardHeader icon="◎" title={`${l.name} · motivation`} />
              <CardBody>
                <div className="mb-3 flex gap-[22px]">
                  <MetricBlock value={`${mot?.daily_streak ?? 0}🔥`} label="STREAK" color={LEARNER_COLOR[l.key]} />
                  <MetricBlock value={mot?.longest_streak ?? 0} label="LONGEST" />
                  <MetricBlock value={mot?.total_xp ?? 0} label="TOTAL XP" />
                </div>
                {rings.length > 0 ? (
                  <div className="flex flex-wrap gap-[16px]">
                    {rings.map((r) => (
                      <Ring key={r.subject_id} pct={r.pct} color={LEARNER_COLOR[l.key]} label={r.ring_label} size={50} />
                    ))}
                  </div>
                ) : null}
                <p className="mt-3 border-t border-hairline pt-3 text-[12px] text-ink-3">
                  Badges read <code>badges</code> / <code>learner_badges</code> (later).
                </p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader icon="🏁" title="Rewards to approve" />
        <CardBody>
          {rewards.length === 0 ? (
            <p className="py-2 text-[12.5px] text-ink-3">No rewards awaiting approval.</p>
          ) : (
            <div className="flex flex-col">
              {rewards.map((r, i, arr) => (
                <ListRow
                  key={r.learner_reward_id}
                  last={i === arr.length - 1}
                  leading={<StatusPill variant={keyById.get(r.learner_id) ?? "rupert"}>{r.learner}</StatusPill>}
                  title={r.reward}
                  subtitle={`${r.reward_type ?? "reward"} · ${r.coins_reserved ?? r.cost_coins ?? 0} 🪙 reserved${
                    r.scheduled_for ? ` · for ${r.scheduled_for}` : ""
                  }`}
                  trailing={<RewardActions id={r.learner_reward_id} />}
                />
              ))}
            </div>
          )}
          <p className="mt-3 border-t border-hairline pt-3 text-[12px] text-ink-3">
            The boys&rsquo; coins are <i>reserved</i> when they request. Approve charges them and
            marks it fulfilled; Decline releases the coins straight back — a &ldquo;no&rdquo; costs them nothing.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="💷" title="Payday — pocket money" />
        <CardBody>
          {payday.length === 0 ? (
            <p className="py-2 text-[12.5px] text-ink-3">No payslips this week yet.</p>
          ) : (
            <div className="flex flex-col">
              {payday.map((p, i, arr) => (
                <ListRow
                  key={p.learner_id}
                  last={i === arr.length - 1}
                  leading={<StatusPill variant={keyById.get(p.learner_id) ?? "rupert"}>{p.learner}</StatusPill>}
                  title={`£${Number(p.amount_gbp).toFixed(2)} this week`}
                  subtitle={`${p.outputs} skill${p.outputs === 1 ? "" : "s"} mastered · target ${p.weekly_target} · £${Number(
                    p.base_gbp
                  ).toFixed(0)} base + £${Number(p.per_output_gbp).toFixed(0)}/skill (cap £${Number(p.weekly_cap_gbp).toFixed(0)})`}
                  trailing={<PaydayActions learnerId={p.learner_id} paid={p.status === "paid"} />}
                />
              ))}
            </div>
          )}
          <p className="mt-3 border-t border-hairline pt-3 text-[12px] text-ink-3">
            Real £, paid weekly — tied to <i>outputs</i> (skills mastered), not just effort. On payday, check the amount and mark it paid.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="💬" title="Coach transcripts" />
        <CardBody>
          {tutor.length === 0 ? (
            <p className="py-2 text-[12.5px] text-ink-3">
              No coach conversations yet. Anything the boys ask the AI will appear here.
            </p>
          ) : (
            <div className="flex flex-col">
              {tutor.slice(0, 12).map((m, i, arr) => (
                <ListRow
                  key={m.id}
                  last={i === arr.length - 1}
                  leading={<StatusPill variant={keyById.get(m.learner_id) ?? "rupert"}>{m.learner}</StatusPill>}
                  title={`${m.role === "child" ? "🧒" : "🤖"} ${m.text}`}
                  subtitle={`${m.role === "child" ? "asked" : "coach replied"}${m.skill ? ` · ${m.skill}` : ""}${
                    m.subject ? ` · ${m.subject}` : ""
                  }`}
                />
              ))}
            </div>
          )}
          <p className="mt-3 border-t border-hairline pt-3 text-[12px] text-ink-3">
            Every word the AI says to the boys is logged here. It only ever gives <i>hints</i>, never answers, and only
            about the skill they&rsquo;re on — anything else it redirects to you.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function EmptyCardNote({ title, sub }: { title: string; sub: string }) {
  return (
    <Card>
      <CardBody>
        <EmptyState title={title} sub={sub} />
      </CardBody>
    </Card>
  );
}
