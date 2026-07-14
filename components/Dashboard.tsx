"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  DashboardData,
  Learner,
  LearnerScope,
  PlanRow,
  LogReceipt,
} from "@/lib/types";
import {
  Card,
  CardHeader,
  CardBody,
  StatusPill,
  MetricBlock,
  Avatar,
  Ring,
  Bar,
  ListRow,
  EmptyState,
  Button,
} from "@/components/ui";
import { useSwitcher, useQuickLog, useToast } from "@/components/providers";
import { aoleLabel, relDays, shortDay, initials } from "@/lib/format";

const LEARNER_COLOR: Record<Learner, string> = {
  rupert: "var(--rupert)",
  albie: "var(--albie)",
};

/** Persona → avatar disc colour for the ops hotlist. */
function personaColor(persona: string | null): string {
  const p = (persona ?? "").toLowerCase();
  if (p.includes("security")) return "var(--info)";
  if (p.includes("backend")) return "var(--brand)";
  if (p.includes("frontend")) return "var(--rupert)";
  if (p.includes("design") || p.includes("ux")) return "var(--albie)";
  if (p.includes("data") || p.includes("analyst")) return "var(--warn)";
  return "var(--ink-2)";
}

const URGENCY_PILL: Record<string, { variant: any; label: string }> = {
  overdue: { variant: "danger", label: "Overdue" },
  due_soon: { variant: "warn", label: "Due soon" },
  scheduled: { variant: "info", label: "Scheduled" },
  later: { variant: "info", label: "Later" },
  no_date: { variant: "info", label: "No date" },
  logged: { variant: "info", label: "Logged" },
};

export function Dashboard({ data }: { data: DashboardData }) {
  const router = useRouter();
  const { scope, learners } = useSwitcher();
  const quicklog = useQuickLog();
  const { showReceipt } = useToast();

  const keyById = useMemo(() => {
    const m = new Map<string, Learner>();
    for (const l of learners) m.set(l.id, l.key);
    return m;
  }, [learners]);
  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of learners) m.set(l.id, l.name);
    return m;
  }, [learners]);

  const inScope = (learnerId: string | null) => {
    if (scope === "both" || learnerId == null) return true;
    return keyById.get(learnerId) === scope;
  };

  const [tickedSkills, setTickedSkills] = useState<Set<string>>(new Set());

  async function logPlanItem(p: PlanRow) {
    if (!p.skill_id) return; // aggregate / no-skill rows: nothing to log
    const key = `${p.learner_id}:${p.skill_id}`;
    if (tickedSkills.has(key)) return;
    setTickedSkills((s) => new Set(s).add(key)); // optimistic
    try {
      const res = await fetch("/api/quick-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId: p.learner_id,
          learnerName: nameById.get(p.learner_id) ?? "learner",
          kind: "skill_practice",
          skillId: p.skill_id,
          result: "got_it",
          minutes: 15,
          ringLabel: p.subject ?? aoleLabel(p.aole),
        }),
      });
      const receipt = await res.json();
      if (res.ok && receipt.ok) {
        showReceipt(receipt as LogReceipt, nameById.get(p.learner_id) ?? "learner");
        router.refresh();
      } else {
        // roll back optimistic tick on failure
        setTickedSkills((s) => {
          const n = new Set(s);
          n.delete(key);
          return n;
        });
      }
    } catch {
      setTickedSkills((s) => {
        const n = new Set(s);
        n.delete(key);
        return n;
      });
    }
  }

  // ---- filtered slices --------------------------------------------------
  const rings = data.rings.filter((r) => inScope(r.learner_id));
  const plan = data.plan.filter((p) => inScope(p.learner_id));
  const mastery = data.mastery.filter((m) => inScope(m.learner_id));
  const sessions = data.sessions.filter((s) => inScope(s.learner_id));
  const motivation = data.motivation.filter((m) => inScope(m.learner_id));
  const rewards = data.rewards.filter((r) => inScope(r.learner_id));

  const scopeText =
    scope === "both" ? "showing both learners" : `showing ${scope[0].toUpperCase()}${scope.slice(1)} only`;

  return (
    <>
    <div className="mb-4 flex items-center justify-between">
      <p className="text-[13.5px] text-ink-2">
        <b className="text-ink">Morning scan.</b> Six things to know in five minutes{" "}
        <span className="text-ink-3">— {scopeText}</span>.
      </p>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* 1 · Today's plan & rings */}
      <Card>
        <CardHeader icon="◴" title="Today's plan & rings" link={{ label: "Open plan →", href: "/learners" }} />
        <CardBody>
          {rings.length === 0 && plan.length === 0 ? (
            <EmptyState
              title="No plan generated yet"
              sub="Once the task-picker runs, today's skills and due reviews appear here."
              action={
                <Button variant="primary" size="sm" onClick={() => quicklog.open()}>
                  Quick-log first activity
                </Button>
              }
            />
          ) : (
            <>
              {rings.length > 0 ? (
                <div className="flex flex-wrap items-center gap-[18px]">
                  {rings.map((r) => {
                    const k = keyById.get(r.learner_id) ?? "rupert";
                    return (
                      <Ring
                        key={`${r.learner_id}-${r.subject_id}`}
                        pct={r.pct}
                        color={LEARNER_COLOR[k]}
                        label={`${r.learner} · ${r.ring_label}`}
                      />
                    );
                  })}
                </div>
              ) : null}
              <div className="mt-[6px] flex flex-col">
                {plan.length === 0 ? (
                  <p className="py-2 text-[12.5px] text-ink-3">No items due today.</p>
                ) : (
                  plan.slice(0, 4).map((p, i) => {
                    const k = keyById.get(p.learner_id) ?? "rupert";
                    const done = p.skill_id
                      ? tickedSkills.has(`${p.learner_id}:${p.skill_id}`)
                      : false;
                    return (
                      <ListRow
                        key={`${p.learner_id}-${p.skill_id ?? i}-${p.item_kind}`}
                        last={i === Math.min(plan.length, 4) - 1}
                        leading={
                          <button
                            aria-label={done ? "Logged" : "Mark done"}
                            onClick={() => logPlanItem(p)}
                            disabled={!p.skill_id}
                            className={`grid h-[18px] w-[18px] flex-none place-items-center rounded-[5px] border-[1.5px] ${
                              done
                                ? "border-ok bg-ok text-white"
                                : "border-hairline hover:border-brand"
                            }`}
                          >
                            {done ? <span className="text-[11px]">✓</span> : null}
                          </button>
                        }
                        title={p.skill ?? p.reason ?? "Item"}
                        subtitle={p.item_kind === "review" ? "spaced repetition" : p.reason ?? undefined}
                        trailing={
                          <StatusPill variant={k}>{nameById.get(p.learner_id) ?? "—"}</StatusPill>
                        }
                      />
                    );
                  })
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* 2 · Mastery snapshot */}
      <Card>
        <CardHeader icon="⬡" title="Mastery snapshot" link={{ label: "Mastery map →", href: "/mastery" }} />
        <CardBody>
          {mastery.length === 0 ? (
            <EmptyState
              title="No mastery recorded yet"
              sub="Run a baseline diagnostic or log activity to start the skill graph."
              action={
                <Button variant="primary" size="sm" onClick={() => quicklog.open()}>
                  Quick-log first activity
                </Button>
              }
            />
          ) : (
            <MasterySnapshot rows={mastery} />
          )}
        </CardBody>
      </Card>

      {/* 3 · Compliance & next actions (household-level — ignores switcher) */}
      <Card>
        <CardHeader icon="⚖" title="Compliance & next actions" link={{ label: "Compliance →", href: "/compliance" }} />
        <CardBody>
          {data.compliance.length === 0 ? (
            <EmptyState title="All clear" sub="Nothing due. The backbone is synced from Airtable." />
          ) : (
            <div className="flex flex-col">
              {data.compliance.slice(0, 4).map((c, i, arr) => {
                const u = URGENCY_PILL[c.urgency] ?? URGENCY_PILL.scheduled;
                return (
                  <ListRow
                    key={c.id}
                    last={i === Math.min(arr.length, 4) - 1}
                    leading={<StatusPill variant={u.variant}>{u.label}</StatusPill>}
                    title={c.event}
                    subtitle={c.notes ?? undefined}
                    trailing={
                      <span
                        className="whitespace-nowrap text-[12px] font-semibold text-ink-2"
                        style={c.urgency === "overdue" ? { color: "var(--danger)" } : undefined}
                      >
                        {c.urgency === "logged" ? "✓" : relDays(c.action_date)}
                      </span>
                    }
                  />
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 4 · Ops hotlist (household-level) */}
      <Card>
        <CardHeader icon="☰" title="Ops hotlist" link={{ label: "Operations →", href: "/operations" }} />
        <CardBody>
          {data.ops.length === 0 ? (
            <EmptyState
              title="No open tasks"
              sub="Build & admin tasks with an assignee show here."
              action={
                <Button variant="primary" size="sm" onClick={() => router.push("/operations")}>
                  Add a task
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col">
              {data.ops.slice(0, 4).map((o, i, arr) => {
                const u = URGENCY_PILL[o.urgency] ?? URGENCY_PILL.later;
                const blocking = (o.category ?? "").toLowerCase().includes("security") || o.urgency === "overdue";
                return (
                  <ListRow
                    key={o.id}
                    last={i === Math.min(arr.length, 4) - 1}
                    leading={<Avatar initials={initials(o.assignee_persona ?? o.assignee)} color={personaColor(o.assignee_persona)} />}
                    title={o.title}
                    subtitle={o.assignee_persona ?? o.assignee ?? undefined}
                    trailing={
                      blocking ? (
                        <StatusPill variant="danger">Blocking</StatusPill>
                      ) : o.due_date ? (
                        <span className="whitespace-nowrap text-[12px] font-semibold text-ink-2">
                          {relDays(o.due_date)}
                        </span>
                      ) : (
                        <StatusPill variant={u.variant}>{u.label}</StatusPill>
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 5 · Upcoming activities */}
      <Card>
        <CardHeader icon="▦" title="Upcoming activities" link={{ label: "Learners →", href: "/learners" }} />
        <CardBody>
          {sessions.length === 0 ? (
            <EmptyState title="Nothing scheduled" sub="Sessions and trips from your calendar appear here." />
          ) : (
            <div className="flex flex-col">
              {sessions.slice(0, 4).map((s, i, arr) => {
                const k = s.learner_id ? keyById.get(s.learner_id) : null;
                return (
                  <ListRow
                    key={s.session_id}
                    last={i === Math.min(arr.length, 4) - 1}
                    leading={
                      k ? (
                        <StatusPill variant={k}>{s.learner}</StatusPill>
                      ) : (
                        <StatusPill variant="neutral">Both</StatusPill>
                      )
                    }
                    title={s.title ?? s.theme ?? "Session"}
                    subtitle={s.theme ?? aoleLabel(s.aole)}
                    trailing={
                      <span className="whitespace-nowrap text-[12px] font-semibold text-ink-2">
                        {sameDay(s.date) ? "Today" : shortDay(s.date)}
                      </span>
                    }
                  />
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 6 · Motivation pulse */}
      <Card>
        <CardHeader icon="◎" title="Motivation pulse" link={{ label: "Motivation →", href: "/motivation" }} />
        <CardBody>
          {motivation.length === 0 ? (
            <EmptyState title="No streaks yet" sub="Streaks, XP and rewards-to-approve build as you log." />
          ) : (
            <>
              <div className="mb-[10px] flex gap-[22px]">
                {motivation.map((m) => {
                  const k = keyById.get(m.learner_id) ?? "rupert";
                  return (
                    <MetricBlock
                      key={m.learner_id}
                      value={`${m.daily_streak}🔥`}
                      label={`${m.learner.toUpperCase()} STREAK`}
                      color={LEARNER_COLOR[k]}
                    />
                  );
                })}
              </div>
              {rewards.length > 0 ? (
                <RewardCallout reward={rewards[0]} />
              ) : (
                <p className="mt-auto text-[12px] text-ink-3">No rewards awaiting approval.</p>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
    </>
  );
}

function MasterySnapshot({ rows }: { rows: DashboardData["mastery"] }) {
  const total = rows[0]?.total_skills ?? 171;
  const mastered = rows.reduce((a, r) => a + r.mastered, 0);
  const learning = rows.reduce((a, r) => a + r.learning, 0);
  const movement = rows.reduce((a, r) => a + r.mastered_last_7d, 0);
  const masteredPct = Math.round((100 * mastered) / total);
  const learningPct = Math.round((100 * learning) / total);

  return (
    <>
      <div className="my-[2px] mb-[10px] flex gap-[22px]">
        <MetricBlock value={mastered} label="MASTERED" />
        <MetricBlock value={learning} label="IN PROGRESS" color="var(--brand)" />
        <MetricBlock value={`/${total}`} label="TOTAL SKILLS" color="var(--ink-3)" />
      </div>
      <Bar
        segments={[
          { pct: masteredPct, color: "var(--ok)" },
          { pct: learningPct, color: "var(--brand)" },
        ]}
      />
      <div className="mt-2 flex gap-[14px] text-[11.5px] text-ink-2">
        <Legend color="var(--ok)" label="Mastered" />
        <Legend color="var(--brand)" label="In progress" />
        <Legend color="var(--surface-2)" label="Locked" border />
      </div>
      <div className="mt-[14px] flex items-center gap-[10px] border-t border-hairline pt-3">
        <StatusPill variant="ok">▲ +{movement} this week</StatusPill>
        <span className="text-[11.5px] text-ink-3">across the 171-skill graph</span>
      </div>
    </>
  );
}

function Legend({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <span className="flex items-center gap-[5px]">
      <i
        className="h-[9px] w-[9px] rounded-[2px]"
        style={{ background: color, border: border ? "1px solid var(--hairline)" : undefined }}
      />
      {label}
    </span>
  );
}

function RewardCallout({ reward }: { reward: DashboardData["rewards"][number] }) {
  const router = useRouter();
  const [approved, setApproved] = useState(false);
  return (
    <div className="mt-auto flex items-center gap-[11px] rounded-[10px] border border-[#cfe3e1] bg-brand-tint p-3">
      <div className="text-[22px]">{reward.reward_type === "experiential" ? "🏁" : "★"}</div>
      <div className="flex-1">
        <div className="text-[13px] font-[650] text-brand">
          {approved ? "Reward approved" : "Reward ready to approve"}
        </div>
        <div className="text-[11.5px] text-ink-2">
          {reward.learner} — {reward.reward}
        </div>
      </div>
      <Button
        variant="primary"
        size="sm"
        disabled={approved}
        onClick={() => {
          setApproved(true);
          // NOTE: reward-approval write-back is a backend dependency (see flags).
          router.refresh();
        }}
      >
        {approved ? "Approved" : "Approve"}
      </Button>
    </div>
  );
}

function sameDay(iso: string): boolean {
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}
