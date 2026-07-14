# Home School HQ — CEO / Operations Portal v1

Dominic's command centre. A calm, admin-only console for the five-minute morning
scan plus one-tap quick actions. Next.js (App Router) + Tailwind, deployable on
Vercel.

*Frontend Engineer deliverable. Built against the CEO Portal v1 Design Spec, the
v1 mockup, and the Backend v1 handoff (API contract + the 8 `homeschool.v_*`
views). Grounded in the System Design Document v0.7 (source of truth).*

---

## What it is

- **7-section IA** in a persistent sidebar — Home · Learners · Mastery map ·
  Motivation · Operations · Compliance · Proof & insights — with attention
  badges (overdue/blocking).
- **Global learner switcher** (Both · Rupert · Albie) in the top bar. It is a
  filter, not navigation: it re-scopes every learner-aware screen and pre-fills
  the quick-log. Persisted to `localStorage`.
- **6-widget Home dashboard** — Today's plan & rings, Mastery snapshot,
  Compliance & next actions, Ops hotlist, Upcoming activities, Motivation pulse
  — each with the **designed empty state** so the portal looks intentional on
  day one, before any data exists.
- **One-tap quick-log** sheet (the feature v1 is built around) with smart
  defaults. On save it calls the write loop and shows the fan-out as a toast.
- **Compliance is read-only** (Airtable is the cockpit; SDD decision 17).
- **Proof & insights** ships as a coming-soon shell (deep dashboards are
  explicitly "later").

## Security model (read this)

All Supabase **data access is server-side only**, via route handlers and server
components using the **`service_role` key** — which **never** reaches the
browser (`import "server-only"` guards the admin client). The portal sits behind
a **Supabase Auth login** (Dominic). A logged-in user is treated as admin only
if their email is in `ADMIN_EMAILS` **or** their `homeschool.profiles` row has
`role='admin'` (the Security persona's model), checked server-side from the
verified `auth.uid()` — never from anything the client sends.

- The **publishable (anon) key** is used only by the login form to authenticate.
  It has **no grants** on the `homeschool` schema, so it can't read learner data
  even if used.
- The **quick-log write loop** posts to `/api/quick-log`, which verifies the
  admin session **first**, then calls `homeschool.log_activity(...)` via RPC with
  `service_role`. The function's JSON receipt is returned and rendered as the
  toast (real deltas, not a fixed string).

---

## Run it locally

```bash
cd ceo-portal
npm install
cp .env.local.example .env.local   # then edit (or leave PORTAL_DEMO=1 to demo)
npm run dev                         # http://localhost:3000
```

### Demo mode (default, no backend needed)

With `PORTAL_DEMO=1` (or when the Supabase env vars are absent) the app runs with
**mock data and no login**, behind a "Demo mode" banner. This is for visual
review and Vercel previews **before** the live auth/RLS/exposure gate is closed.
Every interaction works — switcher, quick-log (returns a deterministic receipt
+ toast), plan-item ticking, empty states. **Demo mode must be off for any real
data.**

### Live mode

Set these in `.env.local` (and on Vercel) and **unset `PORTAL_DEMO`**:

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | publishable key — login only |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | bypasses RLS — never `NEXT_PUBLIC_` |
| `ADMIN_EMAILS` | server | comma list, e.g. `pullenmarketing@gmail.com` |

## Deploy on Vercel

1. Push `ceo-portal/` to a Git repo and import it in Vercel (framework: Next.js,
   detected automatically).
2. Add the four live env vars above in **Project → Settings → Environment
   Variables** (mark `SUPABASE_SERVICE_ROLE_KEY` for the server; do **not**
   prefix it `NEXT_PUBLIC_`). Leave `PORTAL_DEMO` unset for production.
3. Deploy. To ship a **preview in demo mode**, set `PORTAL_DEMO=1` on that
   environment only.

## Supabase wiring (what the backend/security personas still own)

The portal reads the 8 views and calls `log_activity` **through PostgREST**, so:

1. Apply **`Home School HQ - Backend v1 - Write Loop + Read Views.sql`** (creates
   the function + the 8 views; grants to `authenticated` + `service_role`, never
   `anon`).
2. Apply the **Security package** (`Security — 01…04`) to enable RLS + policies,
   create `profiles`, and harden the views. This is the blocking go-live gate.
3. Add **`homeschool`** to **Supabase → Settings → API → Exposed schemas**.
   Because the views/function grant nothing to `anon`, exposing the schema does
   **not** make anything anon-readable; only the server's `service_role` (and an
   authenticated session under RLS) can read.
4. Create Dominic's auth user (strong password + **MFA + email confirmation**)
   and insert his `admin` `profiles` row; put his email in `ADMIN_EMAILS`.

**Resilience:** if a view is missing or the schema isn't exposed yet, that slice
falls back to empty and the widget shows its designed empty state — the portal
is never "broken", so you can stand it up before the gate is fully closed.

## Project map

```
app/
  layout.tsx              root (fonts, metadata)
  login/                  Supabase Auth login (live mode only)
  (app)/
    layout.tsx            shell: sidebar + topbar + providers (force-dynamic)
    page.tsx              Home — 6-widget dashboard
    learners | mastery | motivation | operations | compliance | proof
  api/
    quick-log/route.ts    POST → verify admin → log_activity RPC → receipt
    auth/signout/route.ts
lib/
  config.ts               env + demo-mode resolution
  supabase/{admin,server,client,middleware}.ts
  auth.ts                 getAdminUser (allowlist + profiles role)
  data.ts                 reads the 8 views (request-cached, empty-safe)
  demo.ts  types.ts  format.ts  nav.ts
components/
  ui.tsx                  Card, StatusPill, SegmentedControl, ListRow,
                          MetricBlock, Ring, Avatar, Button, EmptyState, Bar
  Sidebar / TopBar / providers (switcher+toast+quicklog) / QuickLogSheet
  Dashboard.tsx           the 6 widgets, switcher-filtered
  sections.tsx            Learners / Mastery / Motivation (functional-lite)
middleware.ts             route gate (live mode)
```

## Flags & open dependencies

See `Home School HQ - CEO Portal v1 — Frontend handoff.md` for the full list.
Headlines:

- **Architecture divergence (flagged, intentional):** this build uses
  *all-server-side `service_role`* rather than *anon key + browser RLS*. For an
  admin-only v1 it's simpler and arguably safer (the browser never touches the
  data schema). RLS remains belt-and-suspenders. **CEO to confirm.**
- **Skill search & today's plan** depend on the **next-task picker** (Content &
  Tasks). Until it lands, the quick-log's skill field offers today's plan skills
  (those with IDs) rather than a full 171-skill search; the plan widget shows its
  empty state.
- **Reward approval** renders the lever, but the approval **write-back**
  (updating `learner_rewards.status`) is a backend dependency not in the v1 SQL.
- **Ops & Compliance are read views** in v1; create/edit is later (Compliance
  edits stay in Airtable by design).
