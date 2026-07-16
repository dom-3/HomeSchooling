"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { KidHome, ShopItem } from "@/lib/kids/data";

function theme(name: string) {
  const r = name.toLowerCase().includes("rupert");
  return { accent: r ? "#e10600" : "#16a34a", accent2: r ? "#a10400" : "#0e7a37", ava: r ? "🏎️" : "🧗" };
}
const SUBJECT_ICON: Record<string, string> = {
  Maths: "🔢", Reading: "📖", Writing: "✏️", Welsh: "🐉",
  "Science & Engineering": "🔬", "Creation & Expressive Arts": "🎨",
  "Health, PE & Wellbeing": "⚡", "Life & Enterprise": "💰",
};
const TIERS: { key: string; label: string }[] = [
  { key: "screen_time", label: "🎮 Game time" },
  { key: "treat", label: "🍨 Treats" },
  { key: "privilege", label: "🌙 Privileges" },
  { key: "experience", label: "🏆 Big adventures" },
];

function confetti(n = 22) {
  const cols = ["#e10600", "#16a34a", "#f59e0b", "#a855f7", "#3b82f6", "#ec4899", "#facc15"];
  const x = window.innerWidth / 2, y = window.innerHeight * 0.22;
  for (let i = 0; i < n; i++) {
    const d = document.createElement("div");
    d.className = "k-cf";
    d.style.background = cols[i % cols.length];
    d.style.left = x + "px";
    d.style.top = y + "px";
    const ang = Math.random() * 6.28, dist = 60 + Math.random() * 130;
    d.style.transition = "transform 1s ease-out, opacity 1s";
    document.body.appendChild(d);
    requestAnimationFrame(() => {
      d.style.transform = `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist + 150}px) rotate(${Math.random() * 720}deg)`;
      d.style.opacity = "0";
    });
    setTimeout(() => d.remove(), 1050);
  }
}

export function KidGame({ home }: { home: KidHome }) {
  const router = useRouter();
  const name = home.learner?.name ?? "You";
  const t = theme(name);
  const [tab, setTab] = useState<"quests" | "rewards">("quests");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [chestUsed, setChestUsed] = useState(false);

  const pulse = home.pulse;
  const totalXp = pulse?.total_xp ?? 0;
  const coins = home.wallet?.balance ?? pulse?.coin_balance ?? 0;

  // Accurate level bar from the levels table.
  const levels = [...home.levels].sort((a, b) => a.xp_required - b.xp_required);
  let cur = levels[0], next = null as (typeof levels)[number] | null;
  for (const l of levels) {
    if (l.xp_required <= totalXp) cur = l;
    else { next = l; break; }
  }
  const lvPct = next && cur ? Math.min(100, Math.round(((totalXp - cur.xp_required) / (next.xp_required - cur.xp_required)) * 100)) : 100;
  const levelName = pulse?.level_name ?? cur?.name ?? "Rookie";
  const levelNo = pulse?.level ?? cur?.level ?? 1;

  function flash(msg: string, party = true) {
    setToast(msg);
    if (party) confetti();
    setTimeout(() => setToast(null), 1900);
  }

  async function post(url: string, body?: any) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }

  async function smash(skillId: string) {
    if (busy || done.has(skillId)) return;
    setBusy(true);
    const r = await post("/api/kids/log", { skillId, result: "got_it" });
    if (r && r.ok !== false) {
      setDone((s) => new Set(s).add(skillId));
      const coinsAwd = r.coins_awarded ?? 0;
      flash(`+${r.xp_awarded ?? 0} XP  ·  +${coinsAwd} 🪙`);
      router.refresh();
    } else {
      flash(r?.error || "Try again", false);
    }
    setBusy(false);
  }

  async function openChest() {
    if (busy || chestUsed) return;
    setBusy(true);
    const r = await post("/api/kids/chest");
    if (r?.ok) {
      setChestUsed(true);
      flash(`Daily chest!  +${r.coins} 🪙`);
      router.refresh();
    } else if (r?.reason === "already_opened_today") {
      setChestUsed(true);
      flash("Come back tomorrow! 🎁", false);
    } else {
      flash(r?.error || "Try again", false);
    }
    setBusy(false);
  }

  async function redeem(item: ShopItem) {
    if (busy || item.in_flight) return;
    setBusy(true);
    const r = await post("/api/kids/request-reward", { rewardId: item.reward_id });
    if (r?.ok) {
      if (r.status === "fulfilled") flash("Enjoy! 🎉");
      else flash("Asked a grown-up! ✋");
      router.refresh();
    } else {
      flash(r?.reason === "saving" ? "Keep saving! 💪" : r?.error || "Try again", false);
    }
    setBusy(false);
  }

  const rootStyle = { ["--accent" as any]: t.accent, ["--accent2" as any]: t.accent2 };

  return (
    <div style={rootStyle}>
      {/* HERO */}
      <div className="k-hero">
        <div className="k-ava">{t.ava}</div>
        <div className="k-who">
          <div className="k-nm">{name.split(" ")[0]}</div>
          <div className="k-chip">Lv {levelNo} · {levelName}</div>
          <div className="k-xpbar">
            <div className="k-xpfill" style={{ width: lvPct + "%" }} />
            <span className="k-xptxt">{totalXp} XP</span>
          </div>
        </div>
        <div className="k-mini">
          <div>{coins} 🪙</div>
          <div>{pulse?.daily_streak ?? 0} 🔥</div>
        </div>
        <button className="k-out" title="Sign out" onClick={async () => { await post("/api/kids/logout"); router.replace("/kids"); router.refresh(); }}>
          ⏻
        </button>
      </div>

      {/* DAILY CHEST */}
      <button className="k-chest" onClick={openChest} disabled={chestUsed || busy}>
        🎁 {chestUsed ? "Chest opened today" : "Open your daily chest"}
      </button>

      {/* TABS */}
      <div className="k-tabs">
        <button className={"k-tab" + (tab === "quests" ? " on" : "")} onClick={() => setTab("quests")}>🎯 Quests</button>
        <button className={"k-tab" + (tab === "rewards" ? " on" : "")} onClick={() => setTab("rewards")}>🎁 Rewards</button>
      </div>

      {/* QUESTS */}
      {tab === "quests" && (
        <div>
          {home.plan.length === 0 && <div className="k-empty">No quests right now — nice work! 🎉</div>}
          {home.plan.map((q, i) => {
            const isDone = q.skill_id ? done.has(q.skill_id) : false;
            return (
              <div className={"k-card" + (isDone ? " done" : "")} key={(q.skill_id ?? "x") + i}>
                <div className="k-ic">{SUBJECT_ICON[q.subject ?? ""] ?? "⭐"}</div>
                <div className="k-mid">
                  <div className="k-t">{q.skill ?? "Learning quest"}</div>
                  <div className="k-sub">{q.subject ?? ""}{q.item_kind === "review" ? " · review" : ""}</div>
                </div>
                {isDone ? (
                  <button className="k-btn done">Done ✓</button>
                ) : (
                  <button className="k-btn go" disabled={busy || !q.skill_id} onClick={() => q.skill_id && smash(q.skill_id)}>
                    Smash it! 💥
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* REWARDS */}
      {tab === "rewards" && (
        <div>
          <div className="k-wallet">
            <div className="k-wlab">🪙 Your coins</div>
            <div className="k-wbal">{coins}</div>
          </div>
          {TIERS.map((tier) => {
            const items = home.shop.filter((s) => s.tier === tier.key);
            if (items.length === 0) return null;
            return (
              <div key={tier.key}>
                <div className="k-th">{tier.label}</div>
                {items
                  .sort((a, b) => a.cost_coins - b.cost_coins)
                  .map((it) => {
                    const pct = Math.min(100, Math.round((coins / it.cost_coins) * 100));
                    return (
                      <div className="k-card" key={it.reward_id}>
                        <div className="k-ic">{it.icon ?? "🎁"}</div>
                        <div className="k-mid">
                          <div className="k-t">{it.name}</div>
                          {it.blurb && <div className="k-sub">{it.blurb}</div>}
                          <div className="k-rw">{it.cost_coins} 🪙</div>
                          {!it.affordable && !it.in_flight && (
                            <>
                              <div className="k-bar"><div className="k-barf" style={{ width: pct + "%" }} /></div>
                              <div className="k-togo">{it.coins_to_go} to go · {pct}%</div>
                            </>
                          )}
                        </div>
                        {it.in_flight ? (
                          <button className="k-btn pend">Asked ✋</button>
                        ) : it.affordable ? (
                          <button className="k-btn go" disabled={busy} onClick={() => redeem(it)}>Redeem</button>
                        ) : (
                          <button className="k-btn lock">Save up</button>
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}

      <div className={"k-toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}
