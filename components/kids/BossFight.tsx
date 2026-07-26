"use client";
import { useEffect, useState } from "react";
import { celebrate, sfx, haptic, type World } from "@/components/kids/juice";

type Item = { q: string; options: string[] };

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
  const [phase, setPhase] = useState<"loading" | "quiz" | "marking" | "result" | "error">("loading");
  const [items, setItems] = useState<Item[]>([]);
  const [attemptId, setAttemptId] = useState("");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ passed: boolean; score: number; total: number } | null>(null);
  const [err, setErr] = useState("");

  async function start() {
    setPhase("loading");
    setErr("");
    setIdx(0);
    setAnswers([]);
    setResult(null);
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
    sfx.click();
    const next = [...answers];
    next[idx] = optIdx;
    setAnswers(next);
    if (idx + 1 < items.length) setIdx(idx + 1);
    else submit(next);
  }

  async function submit(finalAnswers: number[]) {
    setPhase("marking");
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
      if (d.passed) {
        celebrate("boss", world);
        sfx.bossWin();
        haptic("win");
      } else {
        sfx.error();
      }
      setPhase("result");
    } catch {
      setErr("Couldn't mark it — try again.");
      setPhase("error");
    }
  }

  return (
    <div className="k-boss">
      <div className="k-bosshead">
        <span className="k-bosstag">👑 Boss Fight</span>
        <button className="k-bossx" onClick={() => onClose(false)} aria-label="Leave">✕</button>
      </div>
      <div className="k-bossskill">{skill}</div>

      {phase === "loading" && (
        <div className="k-bosscenter">
          <div className="k-spin" />
          <div className="k-bosssub">The boss is choosing its challenges…</div>
        </div>
      )}

      {phase === "error" && (
        <div className="k-bosscenter">
          <div className="k-bossbig">😅</div>
          <div className="k-bosssub">{err}</div>
          <button className="k-bossgo" onClick={start}>Try again</button>
          <button className="k-bossghost" onClick={() => onClose(false)}>Back to the map</button>
        </div>
      )}

      {phase === "quiz" && items[idx] && (
        <>
          <div className="k-bossprog">
            <div className="k-bossprogf" style={{ width: ((idx) / items.length) * 100 + "%" }} />
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
          <div className="k-spin" />
          <div className="k-bosssub">Checking your answers…</div>
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
              <button className="k-bossgo" onClick={() => onClose(true)}>Onwards! →</button>
            </>
          ) : (
            <>
              <div className="k-bossbig">💪</div>
              <div className="k-bosswin" style={{ color: "#fff" }}>Not this time</div>
              <div className="k-bosssub">
                You got {result.score} of {result.total}. So close! Do the lesson again, ask your coach, and come back — the boss
                waits, and there&rsquo;s no limit on tries.
              </div>
              <button className="k-bossgo" onClick={start}>Try again</button>
              <button className="k-bossghost" onClick={() => onClose(false)}>Back to the map</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
