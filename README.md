# ASAH Marketing Dashboard

Marketing-operations dashboard for **Austin Sleep and Airway Health** — the
fractional CMO's central nervous system. Six tabs answer the question
"is our marketing working, where, and what should we do next?"

This is an MVP for one client. The codebase is structured so it can become
multi-tenant later without a rewrite.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Recharts for charts
- React Router v6 (`/overview`, `/acquisition`, `/revenue`, `/social`, `/ads`, `/strategy`)
- React Query for data fetching (mocked for MVP)
- Lucide icons

## Run it

```sh
npm install
npm run dev   # http://localhost:8080
```

Other scripts: `npm run build`, `npm run lint`, `npm test`.

## HIPAA architecture — read this first

**No individual patient or lead PII lives in this dashboard.** Not in state,
not in storage, not in logs. The dashboard shows aggregated metrics
(counts, rates, sums, averages, trends) only.

Lead management uses a deep-link pattern: the dashboard shows the count of
new leads and a "View leads in CRM" button (URL set in
[`src/config/clients/austin-sleep.ts`](src/config/clients/austin-sleep.ts)).
The actual PII stays in the source CRM and is never copied here.

Concrete rules anyone touching this code must follow:

- Mock data and future API responses must never include `name`, `email`,
  `phone`, `address`, `DOB`, `quiz_responses`, or any value that identifies
  an individual patient.
- Do not write to `localStorage`, `sessionStorage`, `IndexedDB`, or cookies
  with PII-shaped data.
- Do not add a route that displays individual leads. If you need to act on a
  specific lead, deep-link to the source CRM.
- When wiring real APIs, the dashboard receives **pre-aggregated** payloads.
  Aggregation happens server-side under proper auth, not in the browser.

## How data is mocked

For MVP, all data is served from `src/lib/data/` mock modules (added in
Phase 3). Each module exports a function with the same signature the real
API client will eventually use, so swapping in real data is a one-file
change per source.

Sources planned:

- `mockPatients.ts` — counts, source mix, funnel
- `mockRevenue.ts` — monthly revenue, average case value, ROAS
- `mockAds.ts` — Meta (and later Google) campaign metrics
- `mockSocial.ts` — Facebook, Instagram, TikTok, YouTube, GBP metrics
- `mockFunnel.ts` — impressions → clicks → quiz starts → leads → consults → treatment

## Wiring real data later

Each `mock*.ts` module will become an API-client module (`patients.ts`,
`revenue.ts`, etc.) reading from server endpoints. Function signatures
stay the same — components don't change.

Server endpoints must:

1. Authenticate the request (auth layer to be added with multi-tenancy).
2. Resolve the requesting client from auth context, not URL params.
3. Aggregate at the source so the response is metrics-only.
4. Never return PII to this dashboard.

## Multi-tenancy

Client-specific values live in `src/config/clients/<client>.ts`. The active
client is resolved in `src/config/clients/index.ts` — currently hardcoded
to `austinSleep`. When the second tenant arrives, that resolver will read
from auth/route context instead.

Every page reads client name, logo, color, locations, targets, external
links, and data-source identifiers from `activeClient`. No client name
should appear as a hardcoded string anywhere outside that config.

## Build phases

1. ~~Audit~~ — done.
2. ~~Scaffold~~ — done.
3. ~~Mock data layer~~ — done.
4. ~~Executive Overview~~ — done (KPI strip, 12-month dual-axis trend,
   signals panel, source donut, marketing funnel).
5. ~~Patient Acquisition + Revenue~~ — done (monthly trends, new-vs-returning,
   source-mix table + stacked-over-time bar, quiz funnel; revenue pacing
   tied to the editable target, monthly revenue + ACV, revenue by source,
   ROAS, outstanding A/R mock).
6. ~~Social Media + Paid Ads~~ — done (per-channel KPIs/follower trend/
   top posts + Compare view across all 5 channels; Meta campaign table,
   spend timeline, ad-click-to-lead quiz funnel, Brevo deep-link).
7. ~~Strategy & Notes~~ — done (dated entries with markdown body + preset
   tags, add/edit/delete via dialog, in-memory state with seed entries).
8. ~~Polish~~ — done (dark mode wired through `next-themes` with a warm
   slate token block, theme toggle in topbar, `EmptyState` component +
   chart-card a11y regions/labels, tightened markdown paragraph spacing
   with `prose-invert` for dark, responsive verified at 375 + 1280).

## MVP done

All six tabs render production-quality with mocked data, both light and
dark modes. No PHI anywhere in the codebase. Editable targets persist in
`localStorage` and drive the pacing visualization. Brevo deep-link is the
contacts surface.

## Out of scope for MVP

- Auth and user management
- Real API integrations (Meta, Google, practice management, QuickBooks)
- Per-lead PII display anywhere
- Email/SMS notifications
- PDF export

## Practice data store (targets + actuals)

The practice owner / CMO can input two kinds of operational data:

**Targets** (goals) across five metrics:
- Monthly revenue
- Monthly new patients
- Monthly ad spend
- Lead-to-patient conversion %
- Cost per acquisition

Each metric has a *default* value plus optional *per-month overrides*. The
per-month override wins for that month; otherwise the default applies.

**Actuals** (what really happened) across five metrics per month:
- Revenue, new patients, returning patients, leads, ad spend

Where actuals are entered, they overlay the mock fallback on every chart.
Months without actuals continue to show mock data, so the dashboard always
feels alive even before the practice has back-filled history.

**Where the inputs live:**
- Topbar "Targets" button — quick-edit the default targets or the
  current month's override.
- "Data" tab in the sidebar — full table editor for the trailing 18
  months (or further back via pagination), switchable between the
  Actuals view and the Per-month Targets view, plus a Defaults section
  at the top.

All values are persisted per-client in `localStorage` under
`asah:practice:<clientId>` via [src/lib/practice.ts](src/lib/practice.ts).
The legacy `asah:targets:<clientId>` key is auto-migrated on first load.

Targets and actuals are **not** PHI — they're operational aggregates
(dollars, counts, rates). `localStorage` is HIPAA-safe for them.

## Brevo, not a CRM

ASAH does not run a CRM. Brevo is their email-marketing tool and the
canonical place for individual contact detail. The dashboard never holds
contact PII; the "View contacts in Brevo" deep-link in
[client config](src/config/clients/austin-sleep.ts) is how the team gets
to individual records.

If we add an Email Marketing surface later (Brevo campaign sends, opens,
clicks, unsubscribes), it would slot under Social Media (or rename that
tab "Channels"). No commitment yet.

## Open questions

- Which practice management software does Austin Sleep use?
  (Determines patient-count + revenue extraction.)
- Where do the quiz submissions land currently — the Sleep Quiz Supabase
  project, Brevo, or somewhere else? (Affects the deep-link target.)
- Final brand primary color (currently using the sage from the brand kit).
- Add Brevo email metrics as a section/tab? (See "Brevo, not a CRM" above.)
