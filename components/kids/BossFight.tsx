"use client";
import { useEffect, useRef, useState } from "react";
import { celebrate, sfx, haptic, type World } from "@/components/kids/juice";
import { BossSprite, BOSS_NAME, type BossPose } from "@/components/kids/BossSprite";

type Item = { q: string; options: string[] };

/** Loose view of the server's log_activity receipt (win-screen numbers only). */
type Receipt = { xp_awarded?: number; coins_awarded?: number } | null;

/** The one true shape returned by POST /api/kids/boss/answer. */
type AnswerResp = {
  ok: boolean;
  index: number;
  correct: boolean;
  cannon: boolean;
  correctCount: number;
  wrongTotal: number;
  wrongStreak: number;
  correctStreak: number;
  hp: number;
  hpRemaining: number;
  answered: number;
  total: number;
  outcome: "ongoing" | "won" | "escaped";
  terminal: boolean;
  receipt?: Receipt;
  error?: string;
};

/**
 * Boss Fight v2 — a LIVE, turn-by-turn battle.
 *
 * The engine is untouched and the answer key never reaches the client. We POST
 * ONE answer at a time to /api/kids/boss/answer and drive EVERY visual from the
 * server's reply: a correct pick lands a hit (boss flinches, HP drops, rising
 * tick, combo count), a 3-in-a-row fires a CANNON (screen shake + flash + big
 * sound), a wrong pick is parried (gentle, no HP change, an earned "watch out!"
 * on the 2nd miss). The boss dies exactly when hpRemaining hits 0 → BOSS BEATEN;
 * if it escapes, the child loses nothing and can jump straight back in.
 *
 * All motion is gated by prefers-reduced-motion: outcomes are identical, we just
 * snap instead of animating and skip the shake/flash.
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
  const [phase, setPhase] = useState<
    "loading" | "gate" | "fight" | "won" | "escaped" | "error"
  >("loading");
  const [items, setItems] = useState<Item[]>([]);
  const [attemptId, setAttemptId] = useState("");
  const [total, setTotal] = useState(0);
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false); // inputs disabled while grading/animating

  // ── combat state, all driven by the server's reply ───────────────────────
  const [pose, setPose] = useState<BossPose>("idle");
  const [hpMax, setHpMax] = useState(0);       // hits needed to kill (server `hp`)
  const [hpRem, setHpRem] = useState(0);       // hits left in the boss (server `hpRemaining`)
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [flourish, setFlourish] = useState<{ text: string; kind: "hit" | "cannon" | "miss" } | null>(null);
  const [shake, setShake] = useState(false);   // screen kick on a cannon
  const [warn, setWarn] = useState(false);     // "watch out!" after 2 misses
  const [receipt, setReceipt] = useState<Receipt>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useRef(false);

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

  const hpPct = hpMax > 0 ? Math.max(0, Math.min(1, hpRem / hpMax)) * 100 : 100;

  async function start() {
    clearTimers();
    setPhase("loading");
    setErr("");
    setIdx(0);
    setBusy(false);
    setCorrectStreak(0);
    setWrongStreak(0);
    setFlourish(null);
    setShake(false);
    setWarn(false);
    setReceipt(null);
    setCorrectCount(0);
    setPose("roar"); // SUMMON beat — the boss appears and roars
    try {
      const r = await fetch("/api/kids/boss/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId }),
      });
      const d = await r.json();
      if (d.locked) {
        setErr(d.error || "Do the lesson first — then face the boss!");
        setPhase("gate");
        return;
      }
      if (!d.ok) {
        setErr(d.error || "The boss isn't ready.");
        setPhase("error");
        return;
      }
      setItems(d.items);
      setAttemptId(d.attemptId);
      setTotal(d.total);
      // Estimate max HP so the bar is full from the first beat; the server's
      // exact `hp` reconciles it on the first answer (they match).
      const estHp = Math.max(1, Math.ceil(d.total * 0.8));
      setHpMax(estHp);
      setHpRem(estHp);
      setPhase("fight");
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

  async function choose(choice: number) {
    if (busy || phase !== "fight") return;
    setBusy(true);
    setFlourish(null);
    sfx.click();
    haptic("tap");

    let d: AnswerResp;
    try {
      const r = await fetch("/api/kids/boss/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, index: idx, choice }),
      });
      d = await r.json();
      if (!d.ok) {
        setErr(d.error || "Couldn't land that — try again.");
        setPhase("error");
        return;
      }
    } catch {
      setErr("Lost the boss for a moment — try again.");
      setPhase("error");
      return;
    }

    // Source of truth: reconcile every meter from the server.
    setHpMax(d.hp);
    setHpRem(d.hpRemaining);
    setCorrectStreak(d.correctStreak);
    setWrongStreak(d.wrongStreak);
    setCorrectCount(d.correctCount);
    if (d.receipt) setReceipt(d.receipt);

    const snap = reduced.current;

    if (d.correct) {
      setWarn(false);
      setPose("hit");
      if (d.cannon) {
        // 3-in-a-row COMBO — the spectacle beat.
        sfx.chest();
        haptic("win");
        setFlourish({ text: "CANNON! 💥", kind: "cannon" });
        if (!snap) {
          setShake(true);
          after(360, () => setShake(false));
        }
      } else {
        sfx.tick(Math.min(d.correctStreak, 12));
        haptic("tap");
        setFlourish({
          text: d.correctStreak >= 2 ? `HIT!  x${d.correctStreak}` : "HIT!",
          kind: "hit",
        });
      }
    } else {
      // Miss — the boss blocks, unharmed. Never harsh, never reveals the answer.
      setPose("parry");
      sfx.error();
      setFlourish({ text: "miss", kind: "miss" });
      setWarn(d.wrongStreak >= 2 && !d.terminal);
    }

    const settle = snap ? 260 : d.cannon ? 780 : 620;

    if (d.terminal) {
      after(snap ? 120 : 640, () => finish(d));
      return;
    }

    after(settle, () => {
      setPose("idle");
      setFlourish(null);
      setIdx((i) => i + 1);
      setBusy(false);
    });
  }

  function finish(d: AnswerResp) {
    setFlourish(null);
    setWarn(false);
    if (d.outcome === "won") {
      setPose("defeat");
      celebrate("boss", world);
      sfx.bossWin();
      haptic("win");
      setPhase("won");
    } else {
      setPose("survive");
      setPhase("escaped");
    }
  }

  const showStage = phase === "loading" || phase === "fight";
  const question = items[idx];

  return (
    <div className={"k-boss" + (shake ? " k-shake" : "")} data-world={world}>
      <div className="k-bosshead">
        <span className="k-bosstag">👑 Boss Fight</span>
        <button className="k-bossx" onClick={() => { clearTimers(); onClose(false); }} aria-label="Leave">✕</button>
      </div>
      <div className="k-bossskill">{skill}</div>

      {/* BOSS STAGE — sprite + HP bar. Present through the whole live fight. */}
      {showStage && (
        <div className="k-bossstage">
          <div className="k-bossarena">
            {flourish?.kind === "cannon" && !reduced.current && <span className="k-bosscannon" aria-hidden />}
            <BossSprite world={world} pose={pose} size={168} />
            {flourish && (
              <span className={"k-bosscombo" + (flourish.kind === "miss" ? " miss" : flourish.kind === "cannon" ? " cannon" : "")}>
                {flourish.text}
              </span>
            )}
          </div>
          {hpMax > 0 && (
            <div className="k-bosshpwrap">
              <div className="k-bosshplabel">
                <span>{BOSS_NAME[world]}</span>
                <span>{hpRem} / {hpMax} HP</span>
              </div>
              <div className="k-bosshp" role="img" aria-label={`Boss health ${hpRem} of ${hpMax}`}>
                <div className="k-bosshpf" style={{ width: hpPct + "%" }} />
                {Array.from({ length: Math.max(0, hpMax - 1) }).map((_, i) => (
                  <span key={i} className="k-bosshptick" style={{ left: ((i + 1) / hpMax) * 100 + "%" }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "loading" && (
        <div className="k-bosscenter">
          <div className="k-spin" />
          <div className="k-bosssub">The boss is choosing its challenges…</div>
        </div>
      )}

      {phase === "gate" && (
        <div className="k-bosscenter">
          <div className="k-bossbig">🔒</div>
          <div className="k-bosswin">Not yet!</div>
          <div className="k-bosssub">{err}</div>
          <button className="k-bossgo" onClick={() => { clearTimers(); onClose(false); }}>Back to the map</button>
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

      {phase === "fight" && question && (
        <>
          <div className="k-bossmeta">
            <span className="k-bosstag" style={{ opacity: 0.7 }}>Question {idx + 1} of {total}</span>
            {correctStreak >= 2 && <span className="k-bossstreak">🔥 x{correctStreak}</span>}
          </div>
          <div className="k-bossprog">
            <div className="k-bossprogf" style={{ width: (idx / Math.max(1, total)) * 100 + "%" }} />
          </div>
          {warn && <div className="k-bosswarn">⚠️ Watch out — it&rsquo;s about to get away!</div>}
          <div className="k-bossq">{question.q}</div>
          <div className="k-opts">
            {question.options.map((o, i) => (
              <button key={i} className="k-opt" disabled={busy} onClick={() => choose(i)}>
                {o}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "won" && (
        <div className="k-bosscenter">
          <div className="k-bossbig">🏆</div>
          <div className="k-bosswin">BOSS BEATEN!</div>
          <div className="k-bosssub">
            You landed {correctCount} clean hits and <b>mastered</b> this skill. New quests just unlocked on your map!
          </div>
          {receipt && (receipt.xp_awarded || receipt.coins_awarded) ? (
            <div className="k-bossloot">
              {receipt.xp_awarded ? <span>+{receipt.xp_awarded} XP</span> : null}
              {receipt.coins_awarded ? <span>+{receipt.coins_awarded} 🪙</span> : null}
            </div>
          ) : null}
          <button className="k-bossgo" onClick={() => { clearTimers(); onClose(true); }}>Onwards! →</button>
        </div>
      )}

      {phase === "escaped" && (
        <div className="k-bosscenter">
          <div className="k-bossbig">💨</div>
          <div className="k-bosswin" style={{ color: "#fff" }}>The boss got away!</div>
          <div className="k-bosssub">
            It slipped away this time — but you lose <b>nothing</b>. Practise a little more, then challenge it again. You&rsquo;ve got this!
          </div>
          <button className="k-bossgo" onClick={start}>Try again</button>
          <button className="k-bossghost" onClick={() => { clearTimers(); onClose(false); }}>Back to the map</button>
        </div>
      )}
    </div>
  );
}
