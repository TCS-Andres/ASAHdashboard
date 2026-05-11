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
2. ~~Scaffold~~ — done (this commit).
3. Mock data layer
4. Executive Overview
5. Patient Acquisition + Revenue
6. Social Media + Paid Ads
7. Strategy & Notes
8. Polish (empty states, loading states, responsive, dark mode, a11y)

## Out of scope for MVP

- Auth and user management
- Real API integrations (Meta, Google, practice management, QuickBooks)
- Per-lead PII display anywhere
- Email/SMS notifications
- PDF export

## Open questions to resolve before Phase 4

- Which practice management software does Austin Sleep use?
- Which CRM holds the quiz leads? (Sets the real `leadTool.url` in client config.)
- Monthly revenue and patient acquisition targets? (Drives MTD pacing.)
- Final brand primary color (currently using the sage from the brand kit).
