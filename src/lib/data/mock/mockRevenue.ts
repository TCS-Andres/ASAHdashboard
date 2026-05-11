// Mock revenue data — sums and rates only, no per-case or per-patient detail.
//
// Numbers calibrated to:
//   • $80K–$150K monthly revenue
//   • $1,800–$3,500 average case value
//   • Facebook Ads $3K–$6K/mo as primary paid channel

import { activeClient } from '@/config/clients';
import {
  anchorSeed,
  buildDailySeries,
  clamp,
  endOfMonth,
  jitter,
  lastTwelveMonths,
  makeDelta,
  ok,
  previousWindow,
  round,
  seededRng,
  startOfMonth,
  sum,
  toISODate,
  toISOMonth,
} from '../helpers';
import type {
  ChannelRoas,
  Delta,
  FetchOptions,
  MonthlyRevenuePoint,
  Pacing,
  PacingPoint,
  PatientSource,
  RevenueBySource,
  RevenueKpis,
} from '../types';
import { __internal as P } from './mockPatients';

const BASELINE_ACV = 2_650; // midpoint of $1,800–$3,500
const ACV_AMP = 0.12;

// Channel-level marketing spend ($/mo). Drives ROAS calc.
const CHANNEL_SPEND_BASE: Record<'Facebook Ads' | 'Google Ads', number> = {
  'Facebook Ads': 4_500,
  'Google Ads': 1_800,
};

function avgCaseValueForMonth(date: Date): number {
  const rng = seededRng(anchorSeed(`revenue:acv:${toISOMonth(date)}`));
  return Math.round(clamp(jitter(rng, BASELINE_ACV, ACV_AMP), 1_800, 3_500));
}

function revenueForMonth(date: Date): number {
  const newPts = P.newPatientsForMonth(date);
  const acv = avgCaseValueForMonth(date);
  // Not every new patient becomes a revenue case the same month — apply a
  // soft conversion factor so revenue tracks new patients without being
  // mechanically equal to `count × ACV`.
  const rng = seededRng(anchorSeed(`revenue:month:${toISOMonth(date)}`));
  const conv = clamp(jitter(rng, 0.78, 0.1), 0.6, 0.95);
  return Math.round(newPts * acv * conv);
}

function revenueForDay(date: Date): number {
  const monthly = revenueForMonth(date);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const dow = date.getDay();
  const isWeekend = dow === 0 || dow === 6;
  const base = monthly / daysInMonth;
  const weighted = isWeekend ? base * 0.2 : base * 1.32;
  const rng = seededRng(anchorSeed(`revenue:day:${toISODate(date)}`));
  return Math.max(0, Math.round(jitter(rng, weighted, 0.45)));
}

function totalRevenue(opts: FetchOptions): number {
  const cur = new Date(opts.from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(opts.to);
  end.setHours(0, 0, 0, 0);
  let total = 0;
  while (cur.getTime() <= end.getTime()) {
    total += revenueForDay(cur);
    cur.setDate(cur.getDate() + 1);
  }
  return total;
}

// ─── Public API ────────────────────────────────────────────────────────────

export function fetchRevenueKpis(opts: FetchOptions): Promise<RevenueKpis> {
  const current = totalRevenue(opts);
  const prev = totalRevenue(previousWindow(opts));

  // Average case value = window revenue / window new patients.
  const newPts = P.totalNewPatients(opts);
  const newPtsPrev = P.totalNewPatients(previousWindow(opts));
  const acvCurrent = newPts > 0 ? current / newPts : 0;
  const acvPrev = newPtsPrev > 0 ? prev / newPtsPrev : 0;

  // CPA = paid spend / paid-channel new patients. Approx using Facebook + Google share.
  const paidShare = 0.32 + 0.12; // Facebook + Google weights from mockPatients
  const paidSpend = scaleSpendToWindow(opts, CHANNEL_SPEND_BASE['Facebook Ads'] + CHANNEL_SPEND_BASE['Google Ads']);
  const paidSpendPrev = scaleSpendToWindow(previousWindow(opts), CHANNEL_SPEND_BASE['Facebook Ads'] + CHANNEL_SPEND_BASE['Google Ads']);
  const cpaCurrent = newPts > 0 ? paidSpend / Math.max(1, Math.round(newPts * paidShare)) : 0;
  const cpaPrev = newPtsPrev > 0 ? paidSpendPrev / Math.max(1, Math.round(newPtsPrev * paidShare)) : 0;

  const sparkline = { points: buildDailySeries(opts, date => revenueForDay(date)) };

  return ok({
    revenue: { ...makeDelta(current, prev), sparkline },
    averageCaseValue: makeDelta(round(acvCurrent), round(acvPrev)),
    costPerAcquisition: makeDelta(round(cpaCurrent), round(cpaPrev)),
  });
}

/** 12-month revenue + ACV trend. */
export function fetchMonthlyRevenue(opts: FetchOptions): Promise<MonthlyRevenuePoint[]> {
  const months = lastTwelveMonths(opts.to);
  return ok(
    months.map(m => ({
      month: toISOMonth(m),
      revenue: revenueForMonth(m),
      averageCaseValue: avgCaseValueForMonth(m),
    })),
  );
}

/** Revenue attributed to each patient source for the window. */
export function fetchRevenueBySource(opts: FetchOptions): Promise<RevenueBySource[]> {
  const total = totalRevenue(opts);
  const rng = seededRng(anchorSeed(`revenue:by-source:${toISOMonth(opts.from)}`));

  // Weights mirror patient mix but tilted by source quality:
  // physician referrals have higher case-value, walk-ins lower.
  const sourceQuality: Record<PatientSource, number> = {
    'Facebook Ads': 0.95,
    'Physician Referral': 1.25,
    'Google Organic': 1.0,
    'Google Ads': 1.0,
    'Direct Referral': 1.05,
    'Walk-In': 0.85,
    Other: 0.9,
  };

  const weights: Record<PatientSource, number> = {} as Record<PatientSource, number>;
  for (const [source, w] of Object.entries(P.SOURCE_WEIGHTS) as [PatientSource, number][]) {
    weights[source] = w * sourceQuality[source] * (1 + 0.06 * (rng() * 2 - 1));
  }
  const sumW = sum(Object.values(weights));

  const rows: RevenueBySource[] = (Object.keys(weights) as PatientSource[]).map(source => {
    const share = weights[source] / sumW;
    return { source, revenue: Math.round(total * share), share: round(share, 4) };
  });

  const drift = total - rows.reduce((a, r) => a + r.revenue, 0);
  if (drift !== 0 && rows.length > 0) rows[0].revenue += drift;

  return ok(rows.sort((a, b) => b.revenue - a.revenue));
}

/** ROAS for paid channels in the window. */
export function fetchChannelRoas(opts: FetchOptions): Promise<ChannelRoas[]> {
  const total = totalRevenue(opts);
  const fbRevenue = Math.round(total * 0.30);
  const gRevenue = Math.round(total * 0.13);

  const fbSpend = scaleSpendToWindow(opts, CHANNEL_SPEND_BASE['Facebook Ads']);
  const gSpend = scaleSpendToWindow(opts, CHANNEL_SPEND_BASE['Google Ads']);

  return ok([
    {
      channel: 'Facebook Ads',
      spend: fbSpend,
      revenue: fbRevenue,
      roas: fbSpend > 0 ? round(fbRevenue / fbSpend, 2) : 0,
    },
    {
      channel: 'Google Ads',
      spend: gSpend,
      revenue: gRevenue,
      roas: gSpend > 0 ? round(gRevenue / gSpend, 2) : 0,
    },
  ]);
}

/**
 * Month-to-date pacing vs. monthly target, with end-of-month projection.
 * `opts` is unused — pacing is always for the current month relative to
 * `today`, since that's how the spec frames it. Accepted for API symmetry.
 * `targetOverride` lets callers pass the user-edited target from the
 * targets store; falls back to the client config default.
 */
export function fetchPacing(opts: FetchOptions, targetOverride?: number): Promise<Pacing> {
  void opts;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const target = targetOverride ?? activeClient.defaultTargets.monthlyRevenue;
  const totalDaysInMonth = monthEnd.getDate();
  const dayOfMonth = today.getDate();

  let cumulativeActual = 0;
  const points: PacingPoint[] = [];
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    const targetCum = round(target * (day / totalDaysInMonth));
    if (day < dayOfMonth) {
      cumulativeActual += revenueForDay(date);
      points.push({ date: toISODate(date), actual: cumulativeActual, target: targetCum });
    } else if (day === dayOfMonth) {
      cumulativeActual += revenueForDay(date);
      points.push({ date: toISODate(date), actual: cumulativeActual, target: targetCum });
    } else {
      points.push({ date: toISODate(date), actual: null, target: targetCum });
    }
  }

  const projection = dayOfMonth > 0 ? Math.round((cumulativeActual / dayOfMonth) * totalDaysInMonth) : 0;
  // Stamp projection onto the last actual point for consumers that want it inline.
  const lastActualIdx = points.findIndex(p => p.actual === cumulativeActual);
  if (lastActualIdx >= 0) points[lastActualIdx].projection = projection;

  return ok({
    monthStart: toISOMonth(monthStart),
    target,
    points,
    actualThroughDay: dayOfMonth,
    projection,
  });
}

/**
 * Outstanding accounts receivable — a single dollar figure with delta vs.
 * the prior equal-length window. Until the practice-management software
 * is wired up, this is mocked; once real, the same signature returns.
 */
export function fetchOutstandingAR(opts: FetchOptions): Promise<Delta> {
  const baseline = 58_000;
  const rng = seededRng(anchorSeed(`revenue:ar:${toISODate(opts.to)}`));
  const prevRng = seededRng(anchorSeed(`revenue:ar:${toISODate(opts.from)}`));
  const current = Math.round(clamp(jitter(rng, baseline, 0.18), 30_000, 95_000));
  const previous = Math.round(clamp(jitter(prevRng, baseline * 1.03, 0.18), 30_000, 95_000));
  return ok(makeDelta(current, previous));
}

// ─── Internals ─────────────────────────────────────────────────────────────

/** Scale a per-month spend baseline to the actual span of `opts`. */
function scaleSpendToWindow(opts: FetchOptions, monthlySpend: number): number {
  const days = Math.max(1, Math.round((opts.to.getTime() - opts.from.getTime()) / 86_400_000) + 1);
  return Math.round((monthlySpend / 30) * days);
}

export const __internal = { revenueForMonth, revenueForDay, totalRevenue, scaleSpendToWindow, CHANNEL_SPEND_BASE };
