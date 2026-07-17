/** Shared CSS for the kids' portal (injected once in the kids layout). */
export const KIDS_CSS = `
.kids-root{--accent:#e10600;--accent2:#a10400;min-height:100vh;background:#eef1f5;
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;color:#1a1a1a}
.kids-shell{max-width:540px;margin:0 auto;padding:16px 14px 90px;position:relative}
.k-hero{display:flex;align-items:center;gap:12px;background:#fff;border:2px solid #eee;border-radius:16px;padding:11px 13px}
.k-ava{width:50px;height:50px;flex:none;border-radius:14px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:27px;box-shadow:0 4px 0 var(--accent2)}
.k-who{flex:1;min-width:0}
.k-nm{font-size:18px;font-weight:800;line-height:1}
.k-chip{display:inline-block;font-size:11px;font-weight:700;color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,transparent);padding:2px 8px;border-radius:8px;margin:4px 0 6px}
.k-xpbar{position:relative;height:16px;background:#f0f0f0;border-radius:9px;overflow:hidden}
.k-xpfill{height:100%;background:var(--accent);transition:width .6s cubic-bezier(.2,.8,.2,1)}
.k-xptxt{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;text-shadow:0 1px 2px rgba(255,255,255,.6)}
.k-mini{display:flex;flex-direction:column;gap:3px;flex:none;font-size:13px;font-weight:800;text-align:right}
.k-out{flex:none;border:2px solid #eee;background:#fff;border-radius:10px;width:34px;height:34px;font-size:15px;cursor:pointer}
.k-chest{width:100%;margin-top:12px;border:none;border-radius:16px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;
  background:#f59e0b;color:#fff;box-shadow:0 4px 0 #b45309;display:flex;align-items:center;justify-content:center;gap:9px}
.k-chest:active{transform:translateY(2px);box-shadow:0 2px 0 #b45309}
.k-chest[disabled]{background:#e5e7eb;color:#9aa3af;box-shadow:0 4px 0 #cbd5e1;cursor:default}
.k-tabs{display:flex;gap:8px;margin:14px 0 10px}
.k-tab{flex:1;padding:9px 3px;border:2px solid #e3e3e3;background:#fff;border-radius:13px;font-size:12.5px;font-weight:800;cursor:pointer;color:#333;white-space:nowrap}
.k-tab.on{border-color:var(--accent);background:var(--accent);color:#fff;box-shadow:0 3px 0 var(--accent2)}
.k-card{display:flex;align-items:center;gap:12px;background:#fff;border:2px solid #eee;border-radius:15px;padding:11px 13px;margin-bottom:9px}
.k-card.done{opacity:.55;border-color:#22c55e;background:color-mix(in srgb,#22c55e 8%,transparent)}
.k-ic{width:44px;height:44px;flex:none;border-radius:12px;background:#f4f6fa;display:flex;align-items:center;justify-content:center;font-size:23px}
.k-mid{flex:1;min-width:0}
.k-t{font-size:14px;font-weight:800;line-height:1.15}
.k-sub{font-size:11px;font-weight:700;opacity:.6;margin-top:2px}
.k-rw{font-size:11.5px;font-weight:800;color:var(--accent);margin-top:2px}
.k-bar{height:7px;background:#eef0f4;border-radius:4px;overflow:hidden;margin-top:5px}
.k-barf{height:100%;background:var(--accent);border-radius:4px;transition:width .4s}
.k-togo{font-size:10.5px;font-weight:700;opacity:.6;margin-top:3px}
.k-btn{flex:none;border:none;border-radius:11px;font-weight:800;font-size:13px;padding:9px 14px;cursor:pointer;white-space:nowrap}
.k-btn.go{background:var(--accent);color:#fff;box-shadow:0 3px 0 var(--accent2)}
.k-btn.go:active{transform:translateY(2px);box-shadow:0 1px 0 var(--accent2)}
.k-btn.lock{background:#eef0f4;color:#9aa3af;cursor:default}
.k-btn.done{background:#22c55e;color:#fff;box-shadow:0 3px 0 #15803d;cursor:default}
.k-btn.pend{background:#f59e0b;color:#fff;box-shadow:0 3px 0 #b45309;cursor:default}
.k-th{font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.03em;opacity:.5;margin:14px 2px 8px}
.k-wallet{background:var(--accent);color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 5px 0 var(--accent2);display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.k-wbal{font-size:28px;font-weight:900;line-height:1}
.k-wlab{font-size:13px;font-weight:800;opacity:.9}
.k-empty{text-align:center;opacity:.6;font-size:13px;font-weight:600;padding:24px 10px}
/* toast + overlay */
.k-toast{position:fixed;left:50%;top:16%;transform:translateX(-50%) scale(.7);opacity:0;z-index:60;
  background:#111;color:#fff;font-weight:800;font-size:16px;padding:14px 22px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.3);transition:.35s cubic-bezier(.2,1.5,.4,1);pointer-events:none;text-align:center}
.k-toast.show{transform:translateX(-50%) scale(1);opacity:1}
.k-cf{position:fixed;width:9px;height:9px;border-radius:2px;pointer-events:none;z-index:55}
/* pin gate */
.k-pintitle{text-align:center;font-size:22px;font-weight:900;margin:26px 0 4px}
.k-pinsub{text-align:center;font-size:13px;font-weight:600;opacity:.6;margin-bottom:20px}
.k-faces{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.k-face{width:130px;border:2px solid #e3e3e3;background:#fff;border-radius:20px;padding:18px 10px;cursor:pointer;text-align:center;transition:.15s}
.k-face:hover{border-color:var(--accent);transform:translateY(-2px)}
.k-facea{width:66px;height:66px;margin:0 auto 8px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:36px;color:#fff}
.k-facenm{font-size:16px;font-weight:800}
.k-pad{max-width:250px;margin:0 auto}
.k-dots{display:flex;gap:12px;justify-content:center;margin:14px 0 20px}
.k-dot{width:16px;height:16px;border-radius:50%;background:#e3e3e3;transition:.15s}
.k-dot.on{background:var(--accent)}
.k-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.k-key{padding:16px 0;border:2px solid #e3e3e3;background:#fff;border-radius:14px;font-size:22px;font-weight:800;cursor:pointer}
.k-key:active{background:#f0f0f0}
.k-key.wide{grid-column:span 1}
.k-err{text-align:center;color:#dc2626;font-weight:700;font-size:13px;min-height:18px;margin-top:12px}
.k-back{display:block;margin:16px auto 0;border:none;background:transparent;color:#888;font-weight:700;font-size:13px;cursor:pointer}
.k-shake{animation:kshake .4s}
@keyframes kshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
/* base + team (slice 2) */
.k-scene{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.k-slot{border-radius:14px;border:2px solid var(--border,#eee);background:var(--surface,#fff);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:4px;padding:10px 6px;text-align:center;min-height:112px}
.k-slot.have{border-color:#22c55e;background:color-mix(in srgb,#22c55e 8%,transparent)}
.k-slot .si{font-size:26px}
.k-slot .sl{font-size:9.5px;font-weight:700;opacity:.75;line-height:1.15;flex:1}
.k-slot .sb{border:none;border-radius:9px;font-size:11px;font-weight:800;padding:5px 9px;cursor:pointer;background:var(--accent);color:#fff;box-shadow:0 2px 0 var(--accent2)}
.k-slot .sb:active{transform:translateY(1px);box-shadow:none}
.k-slot .sb.owned{background:#22c55e;box-shadow:none;cursor:default}
.k-slot .sb.cant{background:#e5e7eb;color:#9aa3af;box-shadow:none;cursor:default}
.k-goalcard{background:var(--surface,#fff);border:2px solid var(--border,#eee);border-radius:16px;padding:14px;margin-bottom:12px}
.k-goalname{font-size:15px;font-weight:800;margin-bottom:8px;display:flex;justify-content:space-between;gap:8px}
.k-tbar{height:20px;background:#f0f0f0;border-radius:10px;overflow:hidden}
.k-tfill{height:100%;background:linear-gradient(90deg,#e10600,#16a34a);transition:width .6s cubic-bezier(.2,.8,.2,1)}
.k-tmeta{font-size:11.5px;font-weight:700;opacity:.72;margin-top:8px;line-height:1.4}
.k-bond{display:flex;align-items:center;gap:10px;background:var(--surface,#fff);border:2px solid var(--border,#eee);border-radius:13px;padding:9px 11px;margin-bottom:8px}
.k-bond .bi{font-size:22px}
.k-bond .bn{flex:1;font-size:13px;font-weight:700}
.k-bond .bp{font-size:11px;font-weight:800;color:var(--accent)}
.k-hint{font-size:11px;opacity:.55;font-weight:600;margin-top:6px}
`;
