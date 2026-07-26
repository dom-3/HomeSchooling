"use client";
import { useEffect, useRef, useState } from "react";
import { celebrate, sfx, haptic, type World } from "@/components/kids/juice";
import { BossSprite, BOSS_NAME, type BossPose } from "@/components/kids/BossSprite";

type Item = { q: string; options: string[] };

/**
 * Boss Fight — now a real fight (P1a).
 *
 * The engine is untouched: we still start → collect answers → submit, the answer
 * key never reaches the client mid-quiz, and the 90% pass gate lives server-side.
 * On top of that flow we add pure FEEL: a boss character with an HP bar sized so
 * HP hits 0 exactly at the pass threshold, a summon beat, a per-answer "strike
 * wind-up" (no correctness shown), and — after submit — a STRIKE REPLAY that
 * plays the server's per-item results back as a combo that drains the bar.
 *
 * perItemCorrect: the submit response's new boolean[] (added by the architect).
 * We degrade gracefully if it isn't present yet by reconstructing from `wrong[]`
 * (already returned today), so this ships and tests before that one line lands.
 */
export function BossFight({
  skillId,
  skill,
  world = "rupert",
  onClose,
}: {
  skillId: string;
  skill: string;
  world?: World;
  onClose: (mastered: boolean) => void;
}) {
  const [phase, setPhase] = useState<"loading" | "quiz" | "marking" | "replay" | "result" | "error">("loading");
  const [items, setItems] = useState<Item[]>([]);
  const [attemptId, setAttemptId] = useState("");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ passed: boolean; score: number; total: number } | null>(null);
  const [err, setErr] = useState("");

  // ── fight feel state (no engine meaning) ──────────────────────────────
  const [pose, setPose] = useState<BossPose>("idle");
  const [hp, setHp] = useState(1);           // fraction of HP remaining, 1 = full
  const [comboTag, setComboTag] = useState(""); // little "HIT!" / "x3" flourish text
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useRef(false);

  // HP bar is sized to the PASS THRESHOLD, so the boss dying == the child passing.
  const total = items.length;
  const threshold = Math.max(1, Math.ceil(total * 0.9));
  const hpSegments = Math.max(0, Math.round(hp * threshold));

  useEffect(() => {
    reduced.current = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }
  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };

  async function start() {
    clearTimers();
    setPhase("loading");
    setErr("");
    setIdx(0);
    setAnswers([]);
    setResult(null);
    setHp(1);
    setComboTag("");
    setPose("roar"); // SUMMON beat — the boss appears and roars while it "chooses"
    try {
      const r = await fetch("/api/kids/boss/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId }),
      });
      const d = await r.json();
      if (!d.ok) {
        setErr(d.error || "The boss isn't ready.");
        setPhase("error");
        return;
      }
      setItems(d.items);
      setAttemptId(d.attemptId);
      setPhase("quiz");
      sfx.click();
      haptic("tap");
      after(700, () => setPose("idle")); // settle after the roar
    } catch {
      setErr("Couldn't reach the boss — try again.");
      setPhase("error");
    }
  }

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillId]);

  function choose(optIdx: number) {
    // UNCHANGED answer collection — we only add a wind-up flourish.
    sfx.click();
    setPose("brace"); // strike wind-up: the child is committing a hit (no correctness implied)
    after(240, () => setPose("idle"));
    const next = [...answers];
    next[idx] = optIdx;
    setAnswers(next);
    if (idx + 1 < items.length) setIdx(idx + 1);
    else submit(next);
  }

  async function submit(finalAnswers: number[]) {
    setPhase("marking");
    setPose("idle");
    try {
      const r = await fetch("/api/kids/boss/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers: finalAnswers }),
      });
      const d = await r.json();
      if (!d.ok) {
        setErr(d.error || "Couldn't mark it — try again.");
        setPhase("error");
        return;
      }
      setResult({ passed: d.passed, score: d.score, total: d.total });

      // Prefer the server's per-item truth; fall back to `wrong[]` until that
      // one line lands. Either way the client learns correctness ONLY now (post-submit).
      const marks: boolean[] =
        Array.isArray(d.perItemCorrect) && d.perItemCorrect.length === finalAnswers.length
          ? d.perItemCorrect.map(Boolean)
          : finalAnswers.map((_, i) => !((d.wrong ?? []) as number[]).includes(i));

      runReplay(marks, !!d.passed);
    } catch {
      setErr("Couldn't mark it — try again.");
      setPhase("error");
    }
  }

  /** Play the marked answers back as a combo that drains the boss's HP. */
  function runReplay(marks: boolean[], passed: boolean) {
    const th = Math.max(1, Math.ceil(marks.length * 0.9));

    // Reduced motion: no combo animation, no shake — snap to the final HP + result.
    if (reduced.current) {
      const hits = Math.min(marks.filter(Boolean).length, th);
      setHp(Math.max(0, (th - hits) / th));
      finishReplay(passed);
      return;
    }

    setPhase("replay");
    setHp(1);
    const STEP = 470;
    let hits = 0;
    let combo = 0;

    marks.forEach((correct, i) => {
      after(i * STEP, () => {
        if (correct) {
          hits += 1;
          combo += 1;
          if (hits <= th) {
            setHp(Math.max(0, (th - hits) / th));
            setPose("hit");
            sfx.tick(Math.min(combo, 12)); // rising-pitch tick, reused from juice.ts
            haptic("tap");
            setComboTag(combo >= 3 ? `HIT! x${combo}` : "HIT!");
          } else {
            // extra correct beyond the threshold — a bonus critical flourish (HP already 0)
            setPose("hit");
            sfx.tick(12);
            setComboTag("CRIT!");
          }
        } else {
          combo = 0;
          setPose("parry"); // whiff — the boss blocks, unharmed
          sfx.error();       // gentle "not that one", never harsh
          setComboTag("miss");
        }
        after(STEP * 0.5, () => {
          setPose("idle");
          setComboTag("");
        });
      });
    });

    after(marks.length * STEP + 360, () => finishReplay(passed));
  }

  function finishReplay(passed: boolean) {
    setComboTag("");
    if (passed) {
      setPose("defeat");
      celebrate("boss", world); // reuses the shared confetti canvas + held flash + Lottie burst
      sfx.bossWin();
      haptic("win");
    } else {
      setPose("survive");
    }
    setPhase("result");
  }

  const showStage = phase === "loading" || phase === "quiz" || phase === "marking" || phase === "replay";

  return (
    <div className="k-boss" data-world={world}>
      <div className="k-bosshead">
        <span className="k-bosstag">👑 Boss Fight</span>
        <button className="k-bossx" onClick={() => { clearTimers(); onClose(false); }} aria-label="Leave">✕</button>
      </div>
      <div className="k-bossskill">{skill}</div>

      {/* BOSS STAGE — sprite + HP bar. Present through the whole fight. */}
      {showStage && (
        <div className="k-bossstage">
          <div className="k-bossarena">
            <BossSprite world={world} pose={pose} size={168} />
            {comboTag && <span className={"k-bosscombo" + (comboTag === "miss" ? " miss" : "")}>{comboTag}</span>}
          </div>
          {items.length > 0 && (
            <div className="k-bosshpwrap">
              <div className="k-bosshplabel">
                <span>{BOSS_NAME[world]}</span>
                <span>{hpSegments} / {threshold} HP</span>
              </div>
              <div className="k-bosshp" role="img" aria-label={`Boss health ${hpSegments} of ${threshold}`}>
                <div className="k-bosshpf" style={{ width: hp * 100 + "%" }} />
                {Array.from({ length: threshold - 1 }).map((_, i) => (
                  <span key={i} className="k-bosshptick" style={{ left: ((i + 1) / threshold) * 100 + "%" }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "loading" && (
        <div className="k-bosscenter">
          <div className="k-bosssub">The boss is choosing its challenges…</div>
        </div>
      )}

      {phase === "error" && (
        <div className="k-bosscenter">
          <div className="k-bossbig">😅</div>
          <div className="k-bosssub">{err}</div>
          <button className="k-bossgo" onClick={start}>Try again</button>
          <button className="k-bossghost" onClick={() => { clearTimers(); onClose(false); }}>Back to the map</button>
        </div>
      )}

      {phase === "quiz" && items[idx] && (
        <>
          <div className="k-bossprog">
            <div className="k-bossprogf" style={{ width: (idx / items.length) * 100 + "%" }} />
          </div>
          <div className="k-bosstag" style={{ opacity: 0.6, marginBottom: 6 }}>
            Question {idx + 1} of {items.length}
          </div>
          <div className="k-bossq">{items[idx].q}</div>
          <div className="k-opts">
            {items[idx].options.map((o, i) => (
              <button key={i} className="k-opt" onClick={() => choose(i)}>
                {o}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "marking" && (
        <div className="k-bosscenter">
          <div className="k-bosssub">Landing your hits…</div>
        </div>
      )}

      {phase === "replay" && (
        <div className="k-bosscenter">
          <div className="k-bosssub">The strikes land…</div>
        </div>
      )}

      {phase === "result" && result && (
        <div className="k-bosscenter">
          {result.passed ? (
            <>
              <div className="k-bossbig">🏆</div>
              <div className="k-bosswin">BOSS BEATEN!</div>
              <div className="k-bosssub">
                {result.score} out of {result.total} — you&rsquo;ve <b>mastered</b> this skill. New quests just unlocked on your map!
              </div>
              <button className="k-bossgo" onClick={() => { clearTimers(); onClose(true); }}>Onwards! →</button>
            </>
          ) : (
            <>
              <div className="k-bossbig">💪</div>
              <div className="k-bosswin" style={{ color: "#fff" }}>It got you this time</div>
              <div className="k-bosssub">
                You landed {result.score} of {result.total}. So close! Do the lesson again, ask your coach, and come back — the boss
                waits, and there&rsquo;s no limit on tries.
              </div>
              <button className="k-bossgo" onClick={start}>Try again</button>
              <button className="k-bossghost" onClick={() => { clearTimers(); onClose(false); }}>Back to the map</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
