"use client";
/**
 * Home Base — the flagship "lobby" scene. A themeable, original SVG environment
 * where the child's centrepiece (Rupert's race car / Albie's island) is ALWAYS
 * drawn, and every EARNED cosmetic is layered on top. Locked upgrades are simply
 * absent — the scene visibly grows as the child masters skills.
 *
 * Same art-direction seam as Mascot/BossSprite: original SVG, tinted from the
 * --accent / --accent2 / --warm / --cool CSS vars set by KidGame's theme(). Fast,
 * resolution-independent, no assets. All motion is transform/opacity only (GPU
 * compositor) and disabled under prefers-reduced-motion in styles.ts.
 *
 * DROP-IN for polished art later: swap the <svg> body for a Lottie/raster layer
 * at the same z-order; the `owned` gating logic stays identical.
 */
import type { World } from "@/components/kids/juice";

export function HomeBaseScene({
  world,
  owned,
  size = 400,
  className = "",
}: {
  world: World;
  owned: string[];
  size?: number;
  className?: string;
}) {
  const has = (k: string) => owned.includes(k);
  return (
    <span
      className={`k-basescene ${className}`}
      style={{ width: "100%", maxWidth: size, display: "block", margin: "0 auto" }}
      aria-hidden
    >
      {world === "rupert" ? <RupertGarage has={has} /> : <AlbieIsland has={has} />}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   RUPERT — a race car in the pit-lane garage.
   accent = livery red · accent2 = deep shadow · warm = amber lights/sparks ·
   cool = telemetry cyan. Base car always drawn; each owned upgrade layers on.
   ══════════════════════════════════════════════════════════════════════════ */
function RupertGarage({ has }: { has: (k: string) => boolean }) {
  const paint = has("rupert.paint");
  const bodyFill = paint ? "var(--accent)" : "#c3c8d2"; // silver base → custom livery
  const bodyDark = paint ? "var(--accent2)" : "#8f96a4";
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <linearGradient id="hb-r-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2f3a" />
          <stop offset="1" stopColor="#1a1e26" />
        </linearGradient>
        <linearGradient id="hb-r-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4150" />
          <stop offset="1" stopColor="#252b36" />
        </linearGradient>
        <radialGradient id="hb-r-spot" cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hb-r-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0e1116" />
          <stop offset="1" stopColor="#232a36" />
        </linearGradient>
      </defs>

      {/* ── Garage shell ── */}
      <rect x="0" y="0" width="400" height="300" fill="url(#hb-r-wall)" />
      {/* overhead spotlight wash */}
      <rect x="0" y="0" width="400" height="220" fill="url(#hb-r-spot)" />
      {/* pit-lane floor */}
      <rect x="0" y="214" width="400" height="86" fill="url(#hb-r-floor)" />
      {/* checkered skirting where wall meets floor */}
      <g className="k-hb-check">
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={i * 20} y={206} width="20" height="10" fill={i % 2 ? "#eef1f5" : "#12151a"} />
        ))}
      </g>
      {/* wall panel seams */}
      <g stroke="#12151a" strokeWidth="2" opacity="0.5">
        <line x1="70" y1="20" x2="70" y2="206" />
        <line x1="200" y1="20" x2="200" y2="206" />
        <line x1="330" y1="20" x2="330" y2="206" />
        <line x1="0" y1="70" x2="400" y2="70" />
      </g>
      {/* hanging pit lights */}
      <g>
        <rect x="120" y="14" width="70" height="9" rx="3" fill="#12151a" />
        <ellipse cx="155" cy="30" rx="42" ry="10" fill="var(--warm)" opacity="0.28" />
        <rect x="222" y="14" width="70" height="9" rx="3" fill="#12151a" />
        <ellipse cx="257" cy="30" rx="42" ry="10" fill="var(--cool)" opacity="0.22" />
      </g>
      {/* telemetry wall screen */}
      <g>
        <rect x="24" y="86" width="66" height="46" rx="5" fill="#0c0f14" stroke="#12151a" strokeWidth="2" />
        <polyline points="30,120 40,108 50,116 60,98 70,110 82,94" fill="none" stroke="var(--cool)" strokeWidth="2.5" className="k-hb-telemetry" />
        <circle cx="82" cy="94" r="2.6" fill="var(--warm)" />
      </g>

      {/* ── Trophy shelf (owned) ── */}
      {has("rupert.trophyshelf") && (
        <g className="k-hb-pop">
          <rect x="300" y="92" width="82" height="8" rx="3" fill="#3a2f22" />
          <rect x="300" y="100" width="82" height="4" rx="2" fill="#20180f" />
          {/* big trophy */}
          <g>
            <rect x="330" y="66" width="22" height="6" rx="2" fill="var(--warm)" />
            <path d="M334 60 h14 v6 q0 8 -7 8 q-7 0 -7 -8z" fill="var(--warm)" />
            <path d="M334 60 q-8 0 -8 6 q0 5 8 5" fill="none" stroke="var(--warm)" strokeWidth="2.5" />
            <path d="M348 60 q8 0 8 6 q0 5 -8 5" fill="none" stroke="var(--warm)" strokeWidth="2.5" />
            <rect x="339" y="74" width="4" height="10" fill="var(--warm)" />
            <rect x="333" y="84" width="16" height="5" rx="2" fill="#c98a12" />
            <path d="M337 62 q4 4 8 0" stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.7" />
          </g>
          {/* medal */}
          <g>
            <path d="M312 72 l4 8 M320 72 l-4 8" stroke="var(--accent)" strokeWidth="2.5" />
            <circle cx="316" cy="86" r="7" fill="var(--warm)" stroke="#c98a12" strokeWidth="2" />
            <circle cx="316" cy="86" r="2.6" fill="#fff" opacity="0.75" />
          </g>
          {/* small cup */}
          <g>
            <path d="M366 74 h12 v4 q0 6 -6 6 q-6 0 -6 -6z" fill="var(--cool)" />
            <rect x="369" y="84" width="6" height="4" fill="var(--cool)" />
            <rect x="365" y="88" width="14" height="4" rx="1.5" fill="#0d7fa0" />
          </g>
        </g>
      )}

      {/* ── Finish flag (owned) — planted beside the car ── */}
      {has("rupert.flag") && (
        <g className="k-hb-sway" style={{ transformOrigin: "58px 250px" }}>
          <rect x="56" y="150" width="5" height="102" rx="2" fill="#dfe4ea" />
          <circle cx="58.5" cy="150" r="4" fill="var(--warm)" />
          <g>
            {Array.from({ length: 4 }).map((_, r) =>
              Array.from({ length: 5 }).map((_, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={61 + c * 9}
                  y={152 + r * 8}
                  width="9"
                  height="8"
                  fill={(r + c) % 2 ? "#12151a" : "#eef1f5"}
                />
              ))
            )}
          </g>
        </g>
      )}

      {/* ══ THE CAR (always drawn) ══ */}
      <g className="k-hb-car">
        {/* contact shadow */}
        <ellipse cx="200" cy="256" rx="150" ry="16" fill="rgba(0,0,0,0.4)" />

        {/* rear wing / spoiler (owned) */}
        {has("rupert.spoiler") && (
          <g className="k-hb-pop">
            <rect x="70" y="150" width="10" height="46" rx="3" fill={bodyDark} />
            <rect x="52" y="146" width="52" height="9" rx="4" fill={bodyDark} />
            <rect x="52" y="146" width="52" height="4" rx="2" fill="#fff" opacity="0.18" />
            <rect x="58" y="155" width="8" height="18" rx="2" fill={bodyDark} />
          </g>
        )}

        {/* headlight glow cones (owned) — drawn behind body edge */}
        {has("rupert.headlights") && (
          <g className="k-hb-glow">
            <polygon points="338,196 392,176 392,214 338,206" fill="var(--warm)" opacity="0.35" />
            <polygon points="338,198 384,184 384,208 338,204" fill="#fff" opacity="0.4" />
          </g>
        )}

        {/* floor / sidepods */}
        <path d="M96 214 q6 -20 40 -22 l120 0 q40 2 58 20 l0 8 -218 0z" fill={bodyDark} />
        {/* main body */}
        <path
          d="M104 210 q4 -30 44 -34 q18 -2 30 -2 l8 -20 q3 -8 12 -8 l18 0 q9 0 12 8 l7 20 q34 2 62 14 q22 10 30 26 l-2 8 q-4 6 -12 6 l-236 0 q-10 0 -13 -8z"
          fill={bodyFill}
        />
        {/* top highlight */}
        <path
          d="M104 208 q4 -28 44 -32 q18 -2 30 -2 l8 -20 q3 -8 12 -8 l18 0 q9 0 12 8 l7 20 q34 2 60 13 l-201 0 z"
          fill="#fff"
          opacity="0.16"
        />

        {/* accent racing stripes (only with custom paint) */}
        {paint && (
          <g>
            <path d="M120 214 l176 0 q10 0 14 -5 l-6 -4 -184 0z" fill="var(--warm)" opacity="0.95" />
            <rect x="176" y="156" width="10" height="30" rx="3" fill="#fff" opacity="0.85" transform="rotate(-14 181 171)" />
            <rect x="190" y="156" width="6" height="30" rx="3" fill="var(--warm)" transform="rotate(-14 193 171)" />
          </g>
        )}

        {/* number roundel */}
        <circle cx="248" cy="196" r="15" fill="#eef1f5" />
        <text x="248" y="203" textAnchor="middle" fontSize="18" fontWeight="900" fill={bodyDark} fontFamily="Fredoka, system-ui, sans-serif">
          1
        </text>

        {/* cockpit + halo */}
        <path d="M186 168 q4 -14 18 -14 l14 0 q14 0 18 14 l-2 6 -46 0z" fill="url(#hb-r-glass)" />
        <path d="M188 158 q3 -10 16 -10 l14 0 q13 0 16 10" fill="none" stroke="#0c0f14" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="210" cy="164" rx="16" ry="6" fill="var(--cool)" opacity="0.5" />

        {/* nose cone */}
        <path d="M322 208 q34 -4 62 4 q6 2 6 6 l-2 6 -66 0z" fill={bodyFill} />
        <path d="M322 208 q34 -4 62 4 l-62 0z" fill="#fff" opacity="0.18" />

        {/* front headlight lamp (owned) */}
        {has("rupert.headlights") && (
          <g className="k-hb-glow">
            <circle cx="356" cy="200" r="7" fill="var(--warm)" />
            <circle cx="356" cy="200" r="3" fill="#fff" />
          </g>
        )}

        {/* ── wheels ── */}
        {[130, 300].map((cx) => {
          const upg = has("rupert.wheels");
          return (
            <g key={cx}>
              <circle cx={cx} cy="236" r="30" fill="#0c0f14" />
              <circle cx={cx} cy="236" r="29" fill="none" stroke="#2a2f3a" strokeWidth="3" />
              {upg ? (
                <>
                  {/* upgraded rim: cyan/gold multi-spoke */}
                  <circle cx={cx} cy="236" r="17" fill="#12151a" />
                  <g className="k-hb-wheel" style={{ transformOrigin: `${cx}px 236px` }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <rect
                        key={i}
                        x={cx - 2}
                        y={222}
                        width="4"
                        height="14"
                        rx="2"
                        fill="var(--cool)"
                        transform={`rotate(${i * 60} ${cx} 236)`}
                      />
                    ))}
                  </g>
                  <circle cx={cx} cy="236" r="6" fill="var(--warm)" />
                  <circle cx={cx} cy="236" r="2.4" fill="#fff" />
                </>
              ) : (
                <>
                  {/* plain base rim */}
                  <circle cx={cx} cy="236" r="12" fill="#3a4150" />
                  <circle cx={cx} cy="236" r="4" fill="#5a6270" />
                </>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ALBIE — a tropical island camp.
   accent = palm/green · accent2 = deep foliage · warm = coral/campfire ·
   cool = lagoon teal. Island, palm & water always drawn; earned items appear.
   ══════════════════════════════════════════════════════════════════════════ */
function AlbieIsland({ has }: { has: (k: string) => boolean }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <linearGradient id="hb-a-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fe0ef" />
          <stop offset="1" stopColor="#d9f3d0" />
        </linearGradient>
        <linearGradient id="hb-a-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--cool)" />
          <stop offset="1" stopColor="#0b7d7d" />
        </linearGradient>
        <radialGradient id="hb-a-sand" cx="0.5" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#ffe9b8" />
          <stop offset="1" stopColor="#e9c583" />
        </radialGradient>
        <radialGradient id="hb-a-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6c8" />
          <stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Sky, sun, water ── */}
      <rect x="0" y="0" width="400" height="300" fill="url(#hb-a-sky)" />
      <circle cx="330" cy="58" r="60" fill="url(#hb-a-sun)" className="k-hb-sun" />
      <circle cx="330" cy="58" r="24" fill="#fff3b0" />
      {/* clouds */}
      <g fill="#ffffff" opacity="0.85" className="k-hb-cloud">
        <ellipse cx="90" cy="52" rx="30" ry="13" />
        <ellipse cx="115" cy="48" rx="22" ry="11" />
        <ellipse cx="70" cy="48" rx="18" ry="9" />
      </g>
      {/* ocean */}
      <rect x="0" y="150" width="400" height="150" fill="url(#hb-a-water)" />
      {/* wave shimmer lines */}
      <g stroke="#ffffff" strokeWidth="2" opacity="0.35" fill="none" className="k-hb-waves">
        <path d="M0 168 q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0" />
        <path d="M0 184 q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0" opacity="0.6" />
      </g>

      {/* ── Boat (owned) — floats on the water ── */}
      {has("albie.boat") && (
        <g className="k-hb-boat" style={{ transformOrigin: "60px 176px" }}>
          <path d="M28 178 l64 0 -10 16 -44 0z" fill="#a25b2b" />
          <path d="M28 178 l64 0 -3 5 -58 0z" fill="#c47a3f" />
          <rect x="58" y="140" width="4" height="38" fill="#7a4a22" />
          <path d="M62 142 l24 30 -24 0z" fill="var(--warm)" />
          <path d="M58 142 l-22 30 22 0z" fill="#fff" opacity="0.92" />
        </g>
      )}

      {/* ── The island (always drawn) ── */}
      <ellipse cx="200" cy="248" rx="180" ry="42" fill="#0b7d7d" opacity="0.4" />
      <path d="M40 232 q30 -40 160 -40 q130 0 160 40 q-20 34 -160 34 q-140 0 -160 -34z" fill="url(#hb-a-sand)" />
      <path d="M40 232 q30 -40 160 -40 q130 0 160 40 q-20 8 -60 12 q-60 -30 -100 -30 q-40 0 -100 30 q-40 -4 -60 -12z" fill="#fff" opacity="0.22" />
      {/* little sand pebbles */}
      <g fill="#d9b673" opacity="0.7">
        <circle cx="120" cy="244" r="3" />
        <circle cx="250" cy="250" r="2.5" />
        <circle cx="300" cy="238" r="2.5" />
      </g>

      {/* ── Palm tree (always drawn, centre-right anchor) ── */}
      <g className="k-hb-palm" style={{ transformOrigin: "268px 216px" }}>
        <path d="M262 216 q4 -50 12 -74 q4 6 2 14 q-6 26 -4 60z" fill="#8a5a2b" />
        <path d="M266 168 q0 -8 6 -14" stroke="#6f4620" strokeWidth="2" fill="none" />
        <g fill="var(--accent)">
          <path d="M272 146 q-40 -14 -60 4 q34 -6 60 6z" />
          <path d="M272 146 q40 -14 60 4 q-34 -6 -60 6z" />
          <path d="M272 146 q-24 -34 -54 -34 q22 12 54 40z" />
          <path d="M272 146 q24 -34 54 -34 q-22 12 -54 40z" />
          <path d="M272 146 q-6 -30 6 -46 q10 18 -6 46z" />
        </g>
        <g fill="var(--accent2)" opacity="0.85">
          <path d="M272 146 q-30 -6 -46 6 q26 -2 46 2z" />
          <path d="M272 146 q30 -6 46 6 q-26 -2 -46 2z" />
        </g>
        {/* coconuts */}
        <circle cx="266" cy="150" r="4" fill="#6f4620" />
        <circle cx="278" cy="151" r="4" fill="#6f4620" />
      </g>

      {/* ── Treehouse (owned) — nestled in the palm ── */}
      {has("albie.treehouse") && (
        <g className="k-hb-pop">
          <rect x="248" y="158" width="42" height="30" rx="4" fill="#b07840" />
          <rect x="248" y="158" width="42" height="8" fill="#8a5a2b" />
          <path d="M244 160 l25 -16 25 16z" fill="var(--warm)" />
          <path d="M244 160 l25 -16 25 16z" fill="#fff" opacity="0.15" />
          <rect x="262" y="170" width="12" height="18" rx="2" fill="#6f4620" />
          <circle cx="271" cy="180" r="1.6" fill="var(--warm)" />
          {/* ladder */}
          <line x1="258" y1="188" x2="256" y2="216" stroke="#6f4620" strokeWidth="2.5" />
          <line x1="266" y1="188" x2="266" y2="216" stroke="#6f4620" strokeWidth="2.5" />
          <line x1="257" y1="196" x2="266" y2="196" stroke="#6f4620" strokeWidth="2" />
          <line x1="257" y1="204" x2="266" y2="204" stroke="#6f4620" strokeWidth="2" />
          <line x1="256" y1="212" x2="266" y2="212" stroke="#6f4620" strokeWidth="2" />
        </g>
      )}

      {/* ── Tent (owned) ── */}
      {has("albie.tent") && (
        <g className="k-hb-pop">
          <ellipse cx="110" cy="232" rx="44" ry="7" fill="rgba(0,0,0,0.15)" />
          <path d="M110 186 l40 46 -80 0z" fill="var(--accent)" />
          <path d="M110 186 l40 46 -14 0z" fill="var(--accent2)" />
          <path d="M110 186 l-4 46 8 0z" fill="#12924a" opacity="0.5" />
          {/* door flap */}
          <path d="M110 210 l14 22 -28 0z" fill="#0d3b22" />
          <path d="M110 210 l6 22 M110 210 l-6 22" stroke="var(--warm)" strokeWidth="2" fill="none" />
          {/* pole tip flag */}
          <line x1="110" y1="186" x2="110" y2="176" stroke="#6f4620" strokeWidth="2" />
          <path d="M110 177 l10 3 -10 4z" fill="var(--warm)" />
        </g>
      )}

      {/* ── Garden (owned) — flower patch ── */}
      {has("albie.garden") && (
        <g className="k-hb-flowers">
          {[
            [172, 250],
            [190, 256],
            [208, 250],
            [226, 257],
          ].map(([x, y], i) => (
            <g key={i} style={{ transformOrigin: `${x}px ${y}px` }} className="k-hb-flower">
              <line x1={x} y1={y} x2={x} y2={y - 14} stroke="var(--accent2)" strokeWidth="2.5" />
              <g>
                {Array.from({ length: 6 }).map((_, p) => (
                  <ellipse
                    key={p}
                    cx={x}
                    cy={y - 20}
                    rx="3.4"
                    ry="6"
                    fill={i % 2 ? "var(--warm)" : "#ff5da2"}
                    transform={`rotate(${p * 60} ${x} ${y - 14})`}
                  />
                ))}
              </g>
              <circle cx={x} cy={y - 14} r="3.2" fill="#fff3b0" />
            </g>
          ))}
        </g>
      )}

      {/* ── Campfire (owned) ── */}
      {has("albie.campfire") && (
        <g>
          {/* stones */}
          <g fill="#7c8794">
            <ellipse cx="316" cy="252" rx="7" ry="4" />
            <ellipse cx="332" cy="254" rx="7" ry="4" />
            <ellipse cx="348" cy="252" rx="7" ry="4" />
          </g>
          {/* logs */}
          <rect x="318" y="246" width="28" height="5" rx="2.5" fill="#7a4a22" transform="rotate(18 332 248)" />
          <rect x="318" y="246" width="28" height="5" rx="2.5" fill="#8a5a2b" transform="rotate(-18 332 248)" />
          {/* flames */}
          <g className="k-hb-flame" style={{ transformOrigin: "332px 246px" }}>
            <path d="M332 218 q12 14 8 26 q-2 8 -8 8 q-6 0 -8 -8 q-4 -12 8 -26z" fill="var(--warm)" />
            <path d="M332 228 q6 8 4 16 q-1 5 -4 5 q-3 0 -4 -5 q-2 -8 4 -16z" fill="#ffe066" />
          </g>
        </g>
      )}

      {/* ── Pet dog (owned) ── */}
      {has("albie.pet") && (
        <g className="k-hb-pet" style={{ transformOrigin: "150px 244px" }}>
          <ellipse cx="150" cy="252" rx="20" ry="5" fill="rgba(0,0,0,0.15)" />
          {/* body */}
          <ellipse cx="150" cy="242" rx="18" ry="11" fill="#c98a3c" />
          <ellipse cx="150" cy="240" rx="18" ry="6" fill="#e0a95a" />
          {/* legs */}
          <rect x="138" y="248" width="5" height="8" rx="2" fill="#a9702c" />
          <rect x="157" y="248" width="5" height="8" rx="2" fill="#a9702c" />
          {/* head */}
          <circle cx="170" cy="234" r="10" fill="#c98a3c" />
          <path d="M162 228 q-4 -8 2 -10 q4 6 2 12z" fill="#a9702c" />
          <circle cx="173" cy="232" r="1.8" fill="#2c1f14" />
          <circle cx="176" cy="238" r="2.2" fill="#2c1f14" />
          {/* tail (wagging) */}
          <path className="k-hb-tail" style={{ transformOrigin: "134px 238px" }} d="M134 238 q-10 -4 -14 -12" stroke="#c98a3c" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
