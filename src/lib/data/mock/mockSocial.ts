// Mock social media data — per-channel KPIs, follower trend, top posts.
//
// Top-post snippets are practice-authored content topics. No usernames,
// commenter names, or identifiable engagement attributed to individuals.

import {
  anchorSeed,
  buildDailySeries,
  clamp,
  eachDay,
  jitter,
  makeDelta,
  ok,
  previousWindow,
  round,
  seededRng,
  toISODate,
} from '../helpers';
import type {
  Delta,
  FetchOptions,
  FollowerPoint,
  SocialChannel,
  SocialChannelMetrics,
  SocialKpis,
  Sparkline,
  TopPost,
} from '../types';

interface ChannelSeed {
  followersAt12moAgo: number;
  monthlyFollowerGrowth: number;
  reachPerDay: number;
  impressionsPerDay: number;
  engagementRate: number;
}

const CHANNEL_SEEDS: Record<SocialChannel, ChannelSeed> = {
  Facebook:                   { followersAt12moAgo: 2_400,  monthlyFollowerGrowth: 45, reachPerDay: 1_800, impressionsPerDay: 4_300, engagementRate: 0.034 },
  Instagram:                  { followersAt12moAgo: 1_650,  monthlyFollowerGrowth: 80, reachPerDay: 2_400, impressionsPerDay: 5_100, engagementRate: 0.052 },
  TikTok:                     { followersAt12moAgo: 420,    monthlyFollowerGrowth: 60, reachPerDay: 3_600, impressionsPerDay: 9_200, engagementRate: 0.067 },
  YouTube:                    { followersAt12moAgo: 180,    monthlyFollowerGrowth: 8,  reachPerDay: 320,   impressionsPerDay: 850,   engagementRate: 0.041 },
  'Google Business Profile':  { followersAt12moAgo: 0,      monthlyFollowerGrowth: 0,  reachPerDay: 540,   impressionsPerDay: 1_400, engagementRate: 0.022 },
};

// Practice-authored content topics by channel. Snippets describe what the
// post is about, not who interacted with it.
const POST_TOPICS: Record<SocialChannel, string[]> = {
  Facebook: [
    "What every spouse should know about loud snoring",
    "5 signs your child's sleep might be affecting their grades",
    "We're hiring: dental hygienist with sleep medicine interest",
    "Patient education night: airway health 101 — RSVP inside",
    "Why oral appliance therapy is changing the sleep apnea conversation",
    "Holiday hours and tips for staying rested through the season",
  ],
  Instagram: [
    "Behind-the-scenes: how we make a custom oral appliance",
    "TMJ vs. tension headache — quick visual guide",
    "Dr. Culotta's morning routine for better sleep posture",
    "Carousel: 7 questions to ask your dentist about sleep",
    "Patient case study (anonymized) — before/after airway scan",
    "Reel: 60-second nasal breathing reset",
  ],
  TikTok: [
    "POV: you finally figured out you have sleep apnea",
    "Things I wish I knew before getting a CPAP",
    "Dentists react: \"I just clench my jaw\"",
    "How tongue position affects your face shape (yes, really)",
    "Trick to stop mouth breathing at night",
    "Walking through what a sleep airway exam actually looks like",
  ],
  YouTube: [
    "Sleep apnea in kids: a parent's complete guide (12 min)",
    "Oral appliances vs CPAP: how to choose (18 min)",
    "What a real airway exam looks like (full walkthrough)",
    "Q&A: TMJ, jaw clicking, and chronic headaches",
    "Patient story (with permission): how treatment changed her sleep",
  ],
  'Google Business Profile': [
    "Posted office hours update for the holiday week",
    "Photo update: new airway diagnostic suite",
    "Service highlight: TMJ and craniofacial pain treatment",
    "Service highlight: adult sleep apnea consultation",
    "Patient FAQ: do you accept medical insurance for sleep care?",
  ],
};

// ─── Public API ────────────────────────────────────────────────────────────

export function fetchSocialChannel(
  opts: FetchOptions,
  channel: SocialChannel,
): Promise<SocialChannelMetrics> {
  const seed = CHANNEL_SEEDS[channel];

  // Followers: linear-ish growth from 12mo ago to now, with mild jitter.
  const today = new Date();
  const dayMs = 86_400_000;
  const monthsBackAtFrom = Math.max(
    0,
    Math.round((today.getTime() - opts.from.getTime()) / dayMs / 30),
  );
  const monthsBackAtTo = Math.max(
    0,
    Math.round((today.getTime() - opts.to.getTime()) / dayMs / 30),
  );
  const followersFrom = seed.followersAt12moAgo + seed.monthlyFollowerGrowth * (12 - monthsBackAtFrom);
  const followersTo = seed.followersAt12moAgo + seed.monthlyFollowerGrowth * (12 - monthsBackAtTo);
  const followerSeries = buildFollowerSeries(opts, channel, followersFrom, followersTo);

  const days = Math.max(1, Math.round((opts.to.getTime() - opts.from.getTime()) / dayMs) + 1);
  const prev = previousWindow(opts);

  const reach = seed.reachPerDay * days;
  const impressions = seed.impressionsPerDay * days;
  const er = seed.engagementRate;

  // Soft per-window jitter.
  const rng = seededRng(anchorSeed(`social:${channel}:${opts.from.toDateString()}`));
  const prevRng = seededRng(anchorSeed(`social:${channel}:${prev.from.toDateString()}`));
  const reachCur = Math.round(jitter(rng, reach, 0.12));
  const reachPrev = Math.round(jitter(prevRng, reach * 0.94, 0.12));
  const imprCur = Math.round(jitter(rng, impressions, 0.1));
  const imprPrev = Math.round(jitter(prevRng, impressions * 0.96, 0.1));
  const erCur = round(clamp(jitter(rng, er, 0.18), 0.01, 0.12), 4);
  const erPrev = round(clamp(jitter(prevRng, er * 0.95, 0.18), 0.01, 0.12), 4);

  const kpis: SocialKpis = {
    followers: makeDelta(Math.round(followersTo), Math.round(followersFrom)),
    reach: makeDelta(reachCur, reachPrev),
    impressions: makeDelta(imprCur, imprPrev),
    engagementRate: makeDelta(erCur, erPrev),
  };

  return ok({
    channel,
    kpis,
    followerSeries,
    topPosts: buildTopPosts(opts, channel, reachCur, erCur),
  });
}

/** Side-by-side comparison view: KPIs only, all channels. */
export function fetchSocialComparison(
  opts: FetchOptions,
): Promise<Array<{ channel: SocialChannel; kpis: SocialKpis }>> {
  const channels = Object.keys(CHANNEL_SEEDS) as SocialChannel[];
  return Promise.all(channels.map(c => fetchSocialChannel(opts, c))).then(rows =>
    rows.map(r => ({ channel: r.channel, kpis: r.kpis })),
  );
}

// ─── Internals ─────────────────────────────────────────────────────────────

function buildFollowerSeries(
  opts: FetchOptions,
  channel: SocialChannel,
  from: number,
  to: number,
): FollowerPoint[] {
  const days = eachDay(opts.from, opts.to);
  if (days.length === 0) return [];
  return days.map((date, i) => {
    const t = days.length === 1 ? 1 : i / (days.length - 1);
    const linear = from + (to - from) * t;
    const rng = seededRng(anchorSeed(`social:${channel}:fol:${toISODate(date)}`));
    return { date: toISODate(date), followers: Math.max(0, Math.round(jitter(rng, linear, 0.005))) };
  });
}

function buildTopPosts(
  opts: FetchOptions,
  channel: SocialChannel,
  windowReach: number,
  engagementRate: number,
): TopPost[] {
  const topics = POST_TOPICS[channel];
  const rng = seededRng(anchorSeed(`social:${channel}:posts:${opts.from.toDateString()}`));
  // Top 5 posts ranked by reach.
  const sampled = topics
    .map((snippet, i) => ({
      id: `${channel.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      snippet,
      score: jitter(rng, 1, 0.6),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Spread post reach as a soft fraction of total channel reach.
  const reachShares = [0.18, 0.13, 0.10, 0.08, 0.07];

  return sampled.map((item, i) => {
    const reach = Math.max(50, Math.round(windowReach * reachShares[i]));
    const engagement = Math.round(reach * engagementRate * jitter(rng, 1, 0.2));
    // Pick a publish date inside the window.
    const days = eachDay(opts.from, opts.to);
    const date = days.length > 0
      ? days[Math.floor(rng() * days.length)]
      : opts.to;
    return {
      id: item.id,
      snippet: item.snippet,
      reach,
      engagement,
      publishedAt: toISODate(date),
    };
  });
}

/**
 * Total reach across all social channels with delta vs. prior window and
 * a daily impressions sparkline (summed across channels).
 */
export function fetchSocialReachKpi(opts: FetchOptions): Promise<Delta & { sparkline: Sparkline }> {
  const channels = Object.keys(CHANNEL_SEEDS) as SocialChannel[];

  const dailyReach = (date: Date): number =>
    channels.reduce((sum, ch) => {
      const base = CHANNEL_SEEDS[ch].reachPerDay;
      const dow = date.getDay();
      const dowFactor = dow === 0 || dow === 6 ? 0.85 : 1.0;
      const rng = seededRng(anchorSeed(`social:${ch}:reach:${toISODate(date)}`));
      return sum + Math.max(0, Math.round(jitter(rng, base * dowFactor, 0.18)));
    }, 0);

  const points = buildDailySeries(opts, dailyReach);
  const current = points.reduce((a, p) => a + p.value, 0);

  const prevOpts = previousWindow(opts);
  const prevPoints = buildDailySeries(prevOpts, dailyReach);
  const previous = prevPoints.reduce((a, p) => a + p.value, 0);

  return ok({ ...makeDelta(current, previous), sparkline: { points } });
}

// Returning a daily sparkline of impressions for the channel — handy for
// page-level mini charts when we wire Phase 6.
export function fetchChannelImpressionSparkline(
  opts: FetchOptions,
  channel: SocialChannel,
): Promise<ReturnType<typeof buildDailySeries>> {
  const base = CHANNEL_SEEDS[channel].impressionsPerDay;
  return ok(
    buildDailySeries(opts, date => {
      const rng = seededRng(anchorSeed(`social:${channel}:imp:${toISODate(date)}`));
      const dow = date.getDay();
      const dowFactor = dow === 0 || dow === 6 ? 0.85 : 1.0;
      return Math.max(0, Math.round(jitter(rng, base * dowFactor, 0.18)));
    }),
  );
}
