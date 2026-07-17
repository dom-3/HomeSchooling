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
const SUBJECT_SHORT: Record<string, string> = {
  Maths: "Maths", Reading: "Read", Writing: "Write", Welsh: "Cymraeg",
  "Science & Engineering": "Science", "Creation & Expressive Arts": "Create",
  "Health, PE & Wellbeing": "Move", "Life & Enterprise": "Money",
};
/** Zig-zag x positions (%) for the winding path. */
const MAP_X = [50, 24, 72, 30, 68, 26, 70, 44];
const MAP_STEP = 70;

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
  const boyKey = name.toLowerCase().includes("rupert") ? "rupert" : "albie";
  const [tab, setTab] = useState<"quests" | "rewards" | "base" | "team">("quests");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [chestUsed, setChestUsed] = useState(false);
  const [sel, setSel] = useState<number | null>(null);

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

  // Adventure map layout: one node per quest, winding down the path.
  const mapH = 40 + Math.max(0, home.plan.length - 1) * MAP_STEP + 56;
  const nodes = home.plan.map((q, i) => ({ q, x: MAP_X[i % MAP_X.length], y: 40 + i * MAP_STEP }));
  const curIdx = home.plan.findIndex((q) => q.skill_id && !done.has(q.skill_id));

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

  async function buy(itemKey: string) {
    if (busy) return;
    setBusy(true);
    const r = await post("/api/kids/buy-cosmetic", { itemKey });
    if (r?.ok) {
      flash("Nice upgrade! 🛠️");
      router.refresh();
    } else {
      flash(
        r?.reason === "insufficient" ? "Keep earning! 💪" : r?.reason === "already_owned" ? "Already yours ✓" : "Try again",
        false
      );
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
        <button className={"k-tab" + (tab === "rewards" ? " on" : "")} onClick={() => setTab("rewards")}>🎁 Shop</button>
        <button className={"k-tab" + (tab === "base" ? " on" : "")} onClick={() => setTab("base")}>{boyKey === "rupert" ? "🏠 Garage" : "🏝️ Island"}</button>
        <button className={"k-tab" + (tab === "team" ? " on" : "")} onClick={() => setTab("team")}>🤝 Team</button>
      </div>

      {/* QUESTS — the adventure map */}
      {tab === "quests" && (
        <div>
          {home.plan.length === 0 ? (
            <div className="k-empty">No quests right now — nice work! 🎉</div>
          ) : (
            <div className="k-mapwrap">
              <div className="k-map" style={{ height: mapH }}>
                <svg className="k-road" viewBox={`0 0 100 ${mapH}`} preserveAspectRatio="none">
                  <polyline
                    className="k-roadline"
                    points={nodes.map((n) => `${n.x},${n.y}`).join(" ")}
                    fill="none"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2 5"
                  />
                </svg>
                {nodes.map((n, i) => {
                  const isDone = n.q.skill_id ? done.has(n.q.skill_id) : false;
                  const isCur = i === curIdx;
                  return (
                    <button
                      key={(n.q.skill_id ?? "x") + i}
                      className={"k-node" + (isDone ? " done" : "") + (isCur ? " cur" : "")}
                      style={{ left: n.x + "%", top: n.y + "px" }}
                      onClick={() => setSel(i)}
                    >
                      {isCur && <span className="k-ring" />}
                      <span>{isDone ? "✓" : SUBJECT_ICON[n.q.subject ?? ""] ?? "⭐"}</span>
                      <span className="k-cap">{SUBJECT_SHORT[n.q.subject ?? ""] ?? n.q.subject ?? ""}</span>
                    </button>
                  );
                })}
                {curIdx >= 0 && nodes[curIdx] && (
                  <div className="k-heroav" style={{ left: nodes[curIdx].x + "%", top: nodes[curIdx].y + "px" }}>
                    {t.ava}
                  </div>
                )}
              </div>
            </div>
          )}
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

      {/* BASE */}
      {tab === "base" && (
        <div>
          <div className="k-wallet">
            <div className="k-wlab">🪙 Coins to spend</div>
            <div className="k-wbal">{coins}</div>
          </div>
          <div className="k-th">{boyKey === "rupert" ? "🏠 Kit out your garage" : "🏝️ Build up your island"}</div>
          <div className="k-scene">
            {home.cosmetics
              .filter((c) => c.scope === boyKey || c.scope === "shared")
              .map((c) => {
                const isOwned = home.owned.includes(c.item_key);
                const can = coins >= c.cost_coins;
                return (
                  <div className={"k-slot" + (isOwned ? " have" : "")} key={c.item_key}>
                    <div className="si">{isOwned ? c.icon ?? "✨" : "🔒"}</div>
                    <div className="sl">{c.label}</div>
                    {isOwned ? (
                      <span className="sb owned">Owned ✓</span>
                    ) : (
                      <button className={"sb" + (can ? "" : " cant")} disabled={busy || !can} onClick={() => can && buy(c.item_key)}>
                        {c.cost_coins} 🪙
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TEAM */}
      {tab === "team" && (
        <div>
          <div className="k-th">🤝 Team Pullen — you &amp; your brother</div>
          {home.team ? (
            <div className="k-goalcard">
              <div className="k-goalname">
                <span>{home.team.icon ?? "🎯"} {home.team.name}</span>
                <span>{home.team.team_points}/{home.team.target_points}</span>
              </div>
              <div className="k-tbar">
                <div className="k-tfill" style={{ width: Math.min(100, home.team.pct) + "%" }} />
              </div>
              <div className="k-tmeta">
                {home.team.reward_blurb} · {home.team.bond_quests_done}/{home.team.min_bond_quests} bonding quests done together
                {home.team.unlockable ? " · READY! 🎉" : ""}
              </div>
            </div>
          ) : (
            <div className="k-empty">Your team goal is warming up…</div>
          )}
          <div className="k-th">🌟 Do these together</div>
          {home.bondQuests.map((b) => (
            <div className="k-bond" key={b.quest_key}>
              <span className="bi">{b.icon ?? "🌟"}</span>
              <span className="bn">{b.label}</span>
              <span className="bp">+{b.team_points}</span>
            </div>
          ))}
          <p className="k-hint">Ask a grown-up to tick these off when you do them together.</p>
        </div>
      )}

      {/* QUEST SHEET — opens when a map node is tapped */}
      {(() => {
        const q = sel !== null ? home.plan[sel] : null;
        if (!q) return null;
        const isDone = q.skill_id ? done.has(q.skill_id) : false;
        return (
          <div className="k-sheet up">
            <div className="k-sheetcard">
              <div className="k-qtop">
                <div className="k-ic">{SUBJECT_ICON[q.subject ?? ""] ?? "⭐"}</div>
                <div>
                  <div className="k-t">{q.skill ?? "Learning quest"}</div>
                  <div className="k-sub">
                    {q.subject ?? ""}
                    {q.item_kind === "review" ? " · review" : ""}
                  </div>
                </div>
              </div>
              {isDone ? (
                <button className="k-smash" style={{ background: "#22c55e", boxShadow: "0 4px 0 #15803d" }} disabled>
                  Done ✓
                </button>
              ) : (
                <button
                  className="k-smash"
                  disabled={busy || !q.skill_id}
                  onClick={() => {
                    const sid = q.skill_id;
                    setSel(null);
                    if (sid) smash(sid);
                  }}
                >
                  Smash it! 💥
                </button>
              )}
              <button className="k-later" onClick={() => setSel(null)}>
                close
              </button>
            </div>
          </div>
        );
      })()}

      <div className={"k-toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}
