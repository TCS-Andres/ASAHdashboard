// Mock patient acquisition data — counts only, no PII.
//
// Numbers calibrated to a single-location sleep/airway practice:
//   • 40–80 new patients/month
//   • Mixed organic + paid + referral sources, with Facebook Ads and
//     physician referral as the largest two channels.

import {
  anchorSeed,
  buildDailySeries,
  clamp,
  dayCount,
  jitter,
  lastTwelveMonths,
  makeDelta,
  ok,
  previousWindow,
  round,
  seededRng,
  toISOMonth,
} from '../helpers';
import type {
  FetchOptions,
  MonthlyPatientPoint,
  PatientKpis,
  PatientSource,
  SourceMonthlyPoint,
  SourceShare,
} from '../types';

// Source weights sum to 1.0. Tweak here to reshape the channel mix.
const SOURCE_WEIGHTS: Record<PatientSource, number> = {
  'Facebook Ads': 0.32,
  'Physician Referral': 0.22,
  'Google Organic': 0.15,
  'Google Ads': 0.12,
  'Direct Referral': 0.1,
  'Walk-In': 0.05,
  Other: 0.04,
};

const SOURCES = Object.keys(SOURCE_WEIGHTS) as PatientSource[];

const BASELINE_NEW_PER_MONTH = 60; // midpoint of 40–80
const SEASONAL_AMP = 0.18; // +/- 18% over the year
const RETURNING_RATIO = 0.55; // returning ≈ 0.55 × new

function monthSeasonalFactor(monthIndex: number): number {
  // Mild back-to-school + new-year lifts, late-summer dip.
  // monthIndex: 0 = Jan, 11 = Dec
  const cycle = Math.cos(((monthIndex - 8) / 12) * 2 * Math.PI);
  return 1 + SEASONAL_AMP * cycle;
}

function newPatientsForMonth(date: Date): number {
  const rng = seededRng(anchorSeed(`patients:month:${toISOMonth(date)}`));
  const base = BASELINE_NEW_PER_MONTH * monthSeasonalFactor(date.getMonth());
  return Math.round(clamp(jitter(rng, base, 0.18), 38, 88));
}

function newPatientsForDay(date: Date): number {
  // Distribute the month's volume across business days with weekend dropoff.
  const monthlyTotal = newPatientsForMonth(date);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const dow = date.getDay();
  const isWeekend = dow === 0 || dow === 6;
  const dailyAvg = monthlyTotal / daysInMonth;
  const weighted = isWeekend ? dailyAvg * 0.35 : dailyAvg * 1.25;
  const rng = seededRng(anchorSeed(`patients:day:${date.toISOString().slice(0, 10)}`));
  return Math.max(0, Math.round(jitter(rng, weighted, 0.5)));
}

function totalNewPatients(opts: FetchOptions): number {
  let total = 0;
  const cur = new Date(opts.from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(opts.to);
  end.setHours(0, 0, 0, 0);
  while (cur.getTime() <= end.getTime()) {
    total += newPatientsForDay(cur);
    cur.setDate(cur.getDate() + 1);
  }
  return total;
}

// ─── Public API ────────────────────────────────────────────────────────────

export function fetchPatientKpis(opts: FetchOptions): Promise<PatientKpis> {
  const current = totalNewPatients(opts);
  const prev = totalNewPatients(previousWindow(opts));

  const sparkline = {
    points: buildDailySeries(opts, date => newPatientsForDay(date)),
  };

  // Returning patients track new with a softer, lagged jitter.
  const returningCurrent = Math.round(current * RETURNING_RATIO);
  const returningPrev = Math.round(prev * RETURNING_RATIO);

  // Lead-to-patient % comes from the funnel module's ratios in spec
  // (≈ 35 of 180 leads → ~19%). Drift it a bit per window for realism.
  const ratioRng = seededRng(anchorSeed(`patients:l2p:${opts.from.toDateString()}`));
  const conv = clamp(jitter(ratioRng, 0.19, 0.12), 0.12, 0.28);
  const prevRatioRng = seededRng(anchorSeed(`patients:l2p-prev:${opts.from.toDateString()}`));
  const prevConv = clamp(jitter(prevRatioRng, 0.19, 0.12), 0.12, 0.28);

  return ok({
    newPatients: { ...makeDelta(current, prev), sparkline },
    returningPatients: makeDelta(returningCurrent, returningPrev),
    leadToPatientPct: makeDelta(round(conv * 100, 1), round(prevConv * 100, 1)),
  });
}

/** 12-month new vs. returning trend, ending at the month containing `to`. */
export function fetchMonthlyPatients(opts: FetchOptions): Promise<MonthlyPatientPoint[]> {
  const months = lastTwelveMonths(opts.to);
  return ok(
    months.map(m => {
      const newPatients = newPatientsForMonth(m);
      const rng = seededRng(anchorSeed(`patients:returning:${toISOMonth(m)}`));
      const returning = Math.round(jitter(rng, newPatients * RETURNING_RATIO, 0.15));
      return { month: toISOMonth(m), newPatients, returning };
    }),
  );
}

/** Source mix totals for the window. */
export function fetchSourceMix(opts: FetchOptions): Promise<SourceShare[]> {
  const total = totalNewPatients(opts);
  const rng = seededRng(anchorSeed(`patients:mix:${toISOMonth(opts.from)}-${dayCount(opts.from, opts.to)}`));

  // Apply small per-window jitter so the mix moves a bit between periods.
  const jittered: Record<PatientSource, number> = { ...SOURCE_WEIGHTS };
  for (const s of SOURCES) jittered[s] = Math.max(0.01, jitter(rng, SOURCE_WEIGHTS[s], 0.18));
  const sumJ = SOURCES.reduce((a, s) => a + jittered[s], 0);

  const rows: SourceShare[] = SOURCES.map(source => {
    const share = jittered[source] / sumJ;
    return { source, count: Math.round(total * share), share: round(share, 4) };
  });

  // Reconcile rounding so counts add to total.
  const drift = total - rows.reduce((a, r) => a + r.count, 0);
  if (drift !== 0 && rows.length > 0) rows[0].count += drift;

  return ok(rows.sort((a, b) => b.count - a.count));
}

/** Source mix per month for the trailing 12 months — drives the stacked bar. */
export function fetchSourceMixOverTime(opts: FetchOptions): Promise<SourceMonthlyPoint[]> {
  const months = lastTwelveMonths(opts.to);
  return ok(
    months.map(m => {
      const total = newPatientsForMonth(m);
      const rng = seededRng(anchorSeed(`patients:mix-month:${toISOMonth(m)}`));
      const jittered: Record<PatientSource, number> = { ...SOURCE_WEIGHTS };
      for (const s of SOURCES) jittered[s] = Math.max(0.01, jitter(rng, SOURCE_WEIGHTS[s], 0.22));
      const sumJ = SOURCES.reduce((a, s) => a + jittered[s], 0);

      const bySource = SOURCES.reduce(
        (acc, source) => {
          acc[source] = Math.round(total * (jittered[source] / sumJ));
          return acc;
        },
        {} as Record<PatientSource, number>,
      );

      return { month: toISOMonth(m), bySource };
    }),
  );
}

// Re-export so other modules can share the canonical baseline & weights.
export const __internal = {
  SOURCE_WEIGHTS,
  newPatientsForMonth,
  totalNewPatients,
};
