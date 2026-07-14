"use client";

import { useEffect, useMemo, useState } from "react";
import type { LearnerInfo, LearnerScope, LogReceipt } from "@/lib/types";
import type { QuickLogPrefill } from "@/components/providers";

export interface SkillOption {
  id: string;
  label: string;
  ringLabel: string;
  learnerId: string;
}

type Kind = "skill_practice" | "lesson" | "session" | "venture" | "reading";
type Result = "tried" | "got_it" | "mastered";

const KINDS: { key: Kind; label: string }[] = [
  { key: "skill_practice", label: "Skill practice" },
  { key: "lesson", label: "Lesson" },
  { key: "session", label: "Session / trip" },
  { key: "venture", label: "Venture work" },
  { key: "reading", label: "Reading" },
];

const isSkillKind = (k: Kind) => k === "skill_practice" || k === "lesson";

/**
 * One-tap quick-log sheet (Design Spec §5). Smart defaults are pre-filled so
 * the user can hit Save in one tap. The footer states the fan-out; on Save we
 * POST to /api/quick-log and hand the receipt back for the toast.
 */
export function QuickLogSheet({
  open,
  onClose,
  learners,
  scope,
  prefill,
  skillOptions = [],
  demo,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  learners: LearnerInfo[];
  scope: LearnerScope;
  prefill?: Partial<QuickLogPrefill>;
  skillOptions?: SkillOption[];
  demo: boolean;
  onSaved: (r: LogReceipt, learnerName: string) => void;
}) {
  const defaultLearnerId =
    prefill?.learnerId ??
    (scope !== "both"
      ? learners.find((l) => l.key === scope)?.id
      : undefined) ??
    learners[0]?.id ??
    "";

  const [learnerId, setLearnerId] = useState(defaultLearnerId);
  const [kind, setKind] = useState<Kind>((prefill?.kind as Kind) ?? "skill_practice");
  const [skillId, setSkillId] = useState<string | null>(prefill?.skillId ?? null);
  const [activity, setActivity] = useState(prefill?.skillLabel ?? "");
  const [result, setResult] = useState<Result>("got_it");
  const [minutes, setMinutes] = useState(25);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed defaults whenever the sheet (re)opens, honouring the switcher.
  useEffect(() => {
    if (!open) return;
    setLearnerId(defaultLearnerId);
    setKind((prefill?.kind as Kind) ?? "skill_practice");
    setSkillId(prefill?.skillId ?? null);
    setActivity(prefill?.skillLabel ?? "");
    setResult("got_it");
    setMinutes(25);
    setNote("");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const learner = learners.find((l) => l.id === learnerId);
  const mySkills = useMemo(
    () => skillOptions.filter((s) => s.learnerId === learnerId),
    [skillOptions, learnerId]
  );
  const selectedSkill = mySkills.find((s) => s.id === skillId) ?? null;

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const needsSkill = kind === "skill_practice" && !skillId;
  const ringLabel = selectedSkill?.ringLabel ?? "Life & passion";

  async function save() {
    setError(null);
    if (!learnerId) return setError("Pick a learner.");
    if (needsSkill)
      return setError("Pick a skill from today's plan (full skill search arrives with the task-picker).");
    setSaving(true);
    try {
      const res = await fetch("/api/quick-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId,
          learnerName: learner?.name ?? "learner",
          kind,
          skillId: isSkillKind(kind) ? skillId : null,
          activityLabel: isSkillKind(kind) ? selectedSkill?.label ?? null : activity || null,
          result: isSkillKind(kind) ? result : null,
          minutes,
          note: note || null,
          ringLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Save failed.");
        return;
      }
      onSaved(data as LogReceipt, learner?.name ?? "learner");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(16,32,43,0.42)] p-[60px_16px] backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Quick-log"
    >
      <div className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-surface shadow-sheet">
        <div className="flex items-center gap-[10px] px-5 pb-[6px] pt-[18px]">
          <span className="text-[16px] font-bold">Quick-log</span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto text-[20px] leading-none text-ink-3 hover:text-ink"
          >
            ×
          </button>
        </div>
        <p className="px-5 pb-[10px] text-[12px] font-medium text-ink-3">
          Smart defaults are pre-filled — hit <b>Save</b> in one tap, or adjust first.
        </p>

        <div className="flex flex-col gap-[14px] px-5 pb-1 pt-[6px]">
          {/* 1 · Learner */}
          <Field label="Learner">
            <Chips>
              {learners.map((l) => (
                <Chip key={l.id} selected={l.id === learnerId} onClick={() => setLearnerId(l.id)}>
                  {l.name}
                </Chip>
              ))}
            </Chips>
          </Field>

          {/* 2 · What happened */}
          <Field label="What happened">
            <Chips>
              {KINDS.map((k) => (
                <Chip
                  key={k.key}
                  selected={kind === k.key}
                  onClick={() => {
                    setKind(k.key);
                    if (!isSkillKind(k.key)) setSkillId(null);
                  }}
                >
                  {k.label}
                </Chip>
              ))}
            </Chips>
          </Field>

          {/* 3 · Skill or activity */}
          <Field label={isSkillKind(kind) ? "Skill" : "Activity"}>
            {isSkillKind(kind) ? (
              mySkills.length > 0 ? (
                <select
                  className="w-full rounded-[9px] border border-hairline bg-surface-2 px-3 py-[10px] text-[13.5px]"
                  value={skillId ?? ""}
                  onChange={(e) => setSkillId(e.target.value || null)}
                >
                  <option value="">
                    {kind === "lesson" ? "— none (general lesson) —" : "Select a skill…"}
                  </option>
                  {mySkills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.ringLabel} · {s.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded-[9px] border border-dashed border-hairline bg-surface-2 px-3 py-[10px] text-[12.5px] text-ink-3">
                  No skills queued for {learner?.name ?? "this learner"} yet. The searchable
                  171-skill picker arrives with the task-picker — until then, log an activity.
                </p>
              )
            ) : (
              <input
                className="w-full rounded-[9px] border border-hairline bg-surface-2 px-3 py-[10px] text-[13.5px]"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="e.g. BJJ class, STEM Racing build, climbing trip…"
              />
            )}
          </Field>

          {/* 4 + 5 · How it went / Time */}
          <div className="grid grid-cols-2 gap-3">
            {isSkillKind(kind) ? (
              <Field label="How it went">
                <Chips>
                  {(["tried", "got_it", "mastered"] as Result[]).map((r) => (
                    <Chip key={r} selected={result === r} onClick={() => setResult(r)}>
                      {r === "got_it" ? "Got it" : r[0].toUpperCase() + r.slice(1)}
                    </Chip>
                  ))}
                </Chips>
              </Field>
            ) : (
              <div />
            )}
            <Field label="Time (audit only)">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-[9px] border border-hairline bg-surface-2 px-3 py-[10px] text-[13.5px]"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                />
                <span className="text-[12.5px] text-ink-3">min</span>
              </div>
            </Field>
          </div>

          {/* 6 · Curriculum tag (auto) */}
          <Field label="Curriculum tag (auto)">
            <div className="flex items-center gap-[7px] rounded-[7px] bg-ok-tint px-[10px] py-[7px] text-[11.5px] font-semibold text-ok">
              ✓{" "}
              {selectedSkill
                ? `${selectedSkill.ringLabel} — tagged automatically from the skill`
                : "Derived automatically on save from the skill or activity's subject"}
            </div>
          </Field>

          {/* 7 · Note & evidence (optional) */}
          <Field label="Note & evidence (optional)">
            <input
              className="w-full rounded-[9px] border border-hairline bg-surface-2 px-3 py-[10px] text-[13.5px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="One line, or note a photo to attach…"
            />
          </Field>

          {error ? (
            <p className="rounded-[8px] bg-danger-tint px-3 py-2 text-[12.5px] font-medium text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-2 flex items-center gap-[10px] border-t border-hairline px-5 pb-[18px] pt-[14px]">
          <div className="flex-1 text-[11.5px] text-ink-3">
            One save writes to <b className="text-brand">activity</b> ·{" "}
            <b className="text-brand">XP</b> · <b className="text-brand">credits</b> ·{" "}
            <b className="text-brand">skill-state</b>
            {demo ? " · demo" : ""}
          </div>
          <button
            onClick={onClose}
            className="rounded-[7px] border border-hairline bg-surface px-[10px] py-[5px] text-[12.5px] font-semibold hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-[7px] border border-brand bg-brand px-[10px] py-[5px] text-[12.5px] font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save log"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-[6px] block text-[11.5px] font-[650] uppercase tracking-[0.04em] text-ink-2">
        {label}
      </label>
      {children}
    </div>
  );
}
function Chips({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-[13px] py-[7px] text-[12.5px] font-semibold ${
        selected
          ? "border-[#bcdcd9] bg-brand-tint text-brand"
          : "border-hairline bg-surface text-ink-2 hover:bg-surface-2"
      }`}
    >
      {children}
    </button>
  );
}
