"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Boy {
  id: string;
  name: string;
}

function theme(name: string) {
  const r = name.toLowerCase().includes("rupert");
  return { accent: r ? "#e10600" : "#16a34a", accent2: r ? "#a10400" : "#0e7a37", ava: r ? "🏎️" : "🧗" };
}

export function PinGate({ learners }: { learners: Boy[] }) {
  const router = useRouter();
  const [boy, setBoy] = useState<Boy | null>(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);

  const t = boy ? theme(boy.name) : { accent: "#e10600", accent2: "#a10400", ava: "🎮" };

  async function submit(fullPin: string) {
    if (!boy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/kids/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerId: boy.id, pin: fullPin }),
      });
      const data = await res.json();
      if (data.ok) {
        router.replace("/kids/home");
        router.refresh();
        return;
      }
      setErr(data.error || "That didn't work");
    } catch {
      setErr("Something went wrong");
    }
    setPin("");
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setBusy(false);
  }

  function press(d: string) {
    if (busy) return;
    const next = (pin + d).slice(0, 4);
    setPin(next);
    setErr("");
    if (next.length === 4) submit(next);
  }

  if (!boy) {
    return (
      <div>
        <div className="k-pintitle">Who&rsquo;s playing? 🎮</div>
        <div className="k-pinsub">Tap your name to start your adventure</div>
        <div className="k-faces">
          {learners.map((b) => {
            const bt = theme(b.name);
            return (
              <button key={b.id} className="k-face" onClick={() => setBoy(b)} style={{ ["--accent" as any]: bt.accent }}>
                <div className="k-facea" style={{ background: bt.accent, boxShadow: `0 4px 0 ${bt.accent2}` }}>
                  {bt.ava}
                </div>
                <div className="k-facenm">{b.name.split(" ")[0]}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ["--accent" as any]: t.accent, ["--accent2" as any]: t.accent2 }}>
      <div className="k-pintitle">Hi {boy.name.split(" ")[0]}! 👋</div>
      <div className="k-pinsub">Type your secret PIN</div>
      <div className={"k-pad" + (shake ? " k-shake" : "")}>
        <div className="k-dots">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={"k-dot" + (i < pin.length ? " on" : "")} />
          ))}
        </div>
        <div className="k-keys">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button key={d} className="k-key" onClick={() => press(d)}>
              {d}
            </button>
          ))}
          <button className="k-key" onClick={() => setPin(pin.slice(0, -1))}>
            ⌫
          </button>
          <button className="k-key" onClick={() => press("0")}>
            0
          </button>
          <span />
        </div>
        <div className="k-err">{err}</div>
        <button className="k-back" onClick={() => { setBoy(null); setPin(""); setErr(""); }}>
          ← not me
        </button>
      </div>
    </div>
  );
}
