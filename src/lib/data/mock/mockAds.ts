// Mock paid ads data — Meta first, structured to add Google later.
//
// All values are aggregates. The "leads" column is a count, never a list of
// people; the dashboard deep-links to the CRM for actual lead detail.

import {
  anchorSeed,
  clamp,
  jitter,
  ok,
  round,
  seededRng,
  toISODate,
  eachDay,
} from '../helpers';
import type {
  AdSpendPoint,
  CampaignRow,
  Channel,
  FetchOptions,
} from '../types';
import { __internal as R } from './mockRevenue';

interface CampaignSeed {
  id: string;
  name: string;
  channel: Channel;
  status: 'Active' | 'Paused' | 'Ended';
  /** Share of total channel spend over the window. */
  share: number;
  /** CTR baseline (0–1). */
  ctr: number;
  /** Cost-per-lead baseline ($). */
  cpl: number;
  /** Lead-to-patient conversion baseline (0–1). */
  leadToPatient: number;
  /** Average case value attributable here ($). */
  acv: number;
}

const META_CAMPAIGNS: CampaignSeed[] = [
  { id: 'meta-sleep-quiz',     name: 'Sleep Apnea Quiz — Adult',         channel: 'Meta', status: 'Active', share: 0.42, ctr: 0.018, cpl: 22, leadToPatient: 0.22, acv: 2_750 },
  { id: 'meta-tmj-awareness',  name: 'TMJ Awareness — Local Reach',      channel: 'Meta', status: 'Active', share: 0.22, ctr: 0.014, cpl: 31, leadToPatient: 0.18, acv: 2_400 },
  { id: 'meta-snoring-spouse', name: 'Snoring? — Spouse-Targeted Video', channel: 'Meta', status: 'Active', share: 0.20, ctr: 0.022, cpl: 19, leadToPatient: 0.20, acv: 2_650 },
  { id: 'meta-pediatric-bears',name: 'Pediatric Sleep Quiz (BEARS)',     channel: 'Meta', status: 'Paused', share: 0.10, ctr: 0.012, cpl: 28, leadToPatient: 0.16, acv: 2_100 },
  { id: 'meta-retargeting',    name: 'Site Retargeting — Consult Offer', channel: 'Meta', status: 'Active', share: 0.06, ctr: 0.034, cpl: 12, leadToPatient: 0.30, acv: 2_900 },
];

const GOOGLE_CAMPAIGNS: CampaignSeed[] = [
  { id: 'g-search-sleep',      name: 'Search — "sleep apnea austin"',    channel: 'Google', status: 'Active', share: 0.65, ctr: 0.062, cpl: 28, leadToPatient: 0.27, acv: 2_900 },
  { id: 'g-search-tmj',        name: 'Search — "tmj specialist austin"', channel: 'Google', status: 'Active', share: 0.35, ctr: 0.048, cpl: 36, leadToPatient: 0.21, acv: 2_500 },
];

// ─── Public API ────────────────────────────────────────────────────────────

/** Campaign-level aggregates for the window. Defaults to Meta only. */
export function fetchAdCampaigns(
  opts: FetchOptions,
  channel: Channel | 'All' = 'Meta',
): Promise<CampaignRow[]> {
  const seeds = channel === 'All'
    ? [...META_CAMPAIGNS, ...GOOGLE_CAMPAIGNS]
    : channel === 'Meta'
      ? META_CAMPAIGNS
      : GOOGLE_CAMPAIGNS;

  const rows = seeds.map(seed => buildCampaignRow(seed, opts));
  return ok(rows);
}

/** Daily spend series across the window per channel (or All combined). */
export function fetchAdSpendOverTime(
  opts: FetchOptions,
  channel: Channel | 'All' = 'All',
): Promise<AdSpendPoint[]> {
  const days = eachDay(opts.from, opts.to);
  const channels: Channel[] = channel === 'All' ? ['Meta', 'Google'] : [channel];

  const points: AdSpendPoint[] = [];
  for (const ch of channels) {
    const monthlySpend = ch === 'Meta'
      ? R.CHANNEL_SPEND_BASE['Facebook Ads']
      : R.CHANNEL_SPEND_BASE['Google Ads'];
    const baseDaily = monthlySpend / 30;
    for (const date of days) {
      const dow = date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      // Most paid traffic delivers somewhat flat across the week with a
      // slight Mon-Wed lift and weekend dip.
      const dowFactor = isWeekend ? 0.75 : dow >= 1 && dow <= 3 ? 1.12 : 1.0;
      const rng = seededRng(anchorSeed(`ads:${ch}:spend:${toISODate(date)}`));
      points.push({
        date: toISODate(date),
        spend: Math.max(0, Math.round(jitter(rng, baseDaily * dowFactor, 0.18))),
        channel: ch,
      });
    }
  }
  return ok(points);
}

// ─── Internals ─────────────────────────────────────────────────────────────

function buildCampaignRow(seed: CampaignSeed, opts: FetchOptions): CampaignRow {
  const monthlyChannelSpend = seed.channel === 'Meta'
    ? R.CHANNEL_SPEND_BASE['Facebook Ads']
    : R.CHANNEL_SPEND_BASE['Google Ads'];
  const totalChannelSpend = R.scaleSpendToWindow(opts, monthlyChannelSpend);

  const rng = seededRng(anchorSeed(`ads:campaign:${seed.id}:${opts.from.toDateString()}`));

  // Paused campaigns spent only a fraction of the window.
  const activityFactor = seed.status === 'Active' ? 1 : seed.status === 'Paused' ? 0.45 : 0.05;
  const spend = Math.round(jitter(rng, totalChannelSpend * seed.share * activityFactor, 0.08));

  // Backsolve impressions and clicks from CPL/CTR.
  const cpl = Math.round(clamp(jitter(rng, seed.cpl, 0.12), 8, 80));
  const leads = Math.max(0, Math.round(spend / Math.max(1, cpl)));
  const ctr = clamp(jitter(rng, seed.ctr, 0.1), 0.005, 0.08);
  const clicks = Math.max(leads, Math.round(leads * jitter(rng, 4.5, 0.2)));
  const impressions = Math.round(clicks / Math.max(0.001, ctr));

  const leadToPt = clamp(jitter(rng, seed.leadToPatient, 0.12), 0.05, 0.4);
  const patients = Math.max(0, Math.round(leads * leadToPt));
  const cpa = patients > 0 ? Math.round(spend / patients) : 0;
  const revenue = patients * Math.round(jitter(rng, seed.acv, 0.06));
  const roas = spend > 0 ? round(revenue / spend, 2) : 0;

  return {
    id: seed.id,
    name: seed.name,
    channel: seed.channel,
    status: seed.status,
    spend,
    impressions,
    clicks,
    ctr: round(ctr, 4),
    leads,
    cpl,
    cpa,
    roas,
  };
}
