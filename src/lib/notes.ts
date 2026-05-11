// In-memory note entries for the Strategy & Notes tab.
// Per the spec, MVP uses local state with seed data — persistence comes
// later (likely server-side once auth lands).
//
// Reminder: notes are operational/marketing context, not patient data.
// The UI surfaces this caveat to discourage anyone from typing PHI here.

export interface NoteEntry {
  id: string;
  /** ISO date string, e.g. "2026-04-12". */
  date: string;
  title: string;
  /** Markdown source. */
  body: string;
  tags: string[];
}

export const TAG_PRESETS = ['campaign', 'channel', 'decision', 'experiment'] as const;

const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const SEED_NOTES: NoteEntry[] = [
  {
    id: 'seed-1',
    date: daysAgo(2),
    title: 'Increased Facebook spend on Sleep Apnea Quiz — Adult',
    body: `Bumped daily budget on the **Sleep Apnea Quiz — Adult** campaign from $80 → $120/day after two weeks of CPL stability around $22.

**Why:** Lead-to-patient conversion held at ~22% and ROAS settled above 20×. The lookalike audience refresh from 9/15 is still landing.

**Watch:** CTR on the new ad set, and CPL drift past $28 — that's the trigger to dial back.`,
    tags: ['campaign', 'decision'],
  },
  {
    id: 'seed-2',
    date: daysAgo(9),
    title: 'TikTok cadence experiment: 3 → 5 posts/week',
    body: `Moving TikTok posting cadence from 3x to 5x weekly for 4 weeks.

Working theory: TikTok engagement rate (~6.7%) is the highest of any channel and we're under-publishing relative to platform norms.

**Success metric:** follower delta +60 → +90 over the 4-week window. If engagement rate dips below 5% it means we're sacrificing quality for cadence — pull back.`,
    tags: ['channel', 'experiment'],
  },
  {
    id: 'seed-3',
    date: daysAgo(18),
    title: 'Pediatric BEARS quiz creative refresh',
    body: `Paused the **Pediatric Sleep Quiz (BEARS)** ad set. Old creative was running at $31 CPL with 16% lead-to-patient — both below benchmark.

Briefing new creative around "kids who clench at night" and the school-performance angle. Re-launch target: 2 weeks.`,
    tags: ['campaign', 'experiment'],
  },
  {
    id: 'seed-4',
    date: daysAgo(31),
    title: 'Launched fall sleep apnea awareness campaign',
    body: `Kicked off the fall awareness push. Historically September drives a ~30% lift in adult sleep concerns as back-to-school and routine changes surface symptoms.

**Mix:**
- Facebook + Instagram lookalike audience
- TikTok organic content series (5 posts)
- Google Business Profile updates (service highlights)

**Budget:** $4.5K Meta, $1.8K Google Ads for September.`,
    tags: ['campaign', 'decision'],
  },
];

export { today };
