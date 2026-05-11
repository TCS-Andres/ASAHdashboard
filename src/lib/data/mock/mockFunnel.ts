// Mock funnel data — both the broad acquisition funnel and the quiz funnel.
// Steps are counts only.
//
// The shape from the spec for the quiz funnel:
//   1,000 clicks → 600 starts → 380 completes → 180 leads → 60 consults → 35 treatment plans
// We use it as the baseline and scale to the requested window.

import {
  anchorSeed,
  clamp,
  dayCount,
  jitter,
  ok,
  round,
  seededRng,
} from '../helpers';
import type {
  AcquisitionFunnel,
  FetchOptions,
  FunnelStep,
  QuizFunnel,
} from '../types';

// Per-day baselines, derived from the spec's monthly example (~30 days):
//   1000/30 ≈ 33 ad clicks → 20 starts → ~13 completes → 6 leads → 2 consults → 1.2 plans
// We anchor on these and let the window length drive totals.
const PER_DAY = {
  adClicks: 33,
  quizStarts: 20,
  quizCompletes: 13,
  leads: 6,
  consults: 2,
  treatmentPlans: 1.2,
};

// Acquisition funnel uses broader top-of-funnel: impressions across all
// channels, click-throughs to the site, leads, booked consults, accepted plans.
const ACQ_PER_DAY = {
  impressions: 6_400,
  clicks: 260,
  leads: 6,
  consults: 2,
  treatmentsAccepted: 1.2,
};

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Top-of-marketing funnel: impressions → clicks → leads → consults → accepted plans.
 * Counts in the window.
 */
export function fetchAcquisitionFunnel(opts: FetchOptions): Promise<AcquisitionFunnel> {
  const days = dayCount(opts.from, opts.to);
  const rng = seededRng(anchorSeed(`funnel:acq:${opts.from.toDateString()}-${days}`));

  const impressions = Math.round(ACQ_PER_DAY.impressions * days * jitter(rng, 1, 0.08));
  const clicks = Math.round(ACQ_PER_DAY.clicks * days * jitter(rng, 1, 0.1));
  const leads = Math.round(ACQ_PER_DAY.leads * days * jitter(rng, 1, 0.12));
  const consults = Math.round(ACQ_PER_DAY.consults * days * jitter(rng, 1, 0.14));
  const treatmentsAccepted = Math.round(ACQ_PER_DAY.treatmentsAccepted * days * jitter(rng, 1, 0.16));

  const raw = [
    { label: 'Impressions', count: impressions },
    { label: 'Clicks', count: clicks },
    { label: 'Leads', count: leads },
    { label: 'Consults Booked', count: consults },
    { label: 'Treatment Plans Accepted', count: treatmentsAccepted },
  ];

  return ok({ steps: withConversionRates(raw) });
}

/**
 * Quiz funnel: ad clicks → quiz starts → completes → leads → booked consults → showed up → accepted plan.
 * If a channel is provided, scales total counts proportionally.
 */
export function fetchQuizFunnel(
  opts: FetchOptions,
  channel: 'Facebook Ads' | 'Google Ads' | 'Google Organic' | 'All' = 'All',
): Promise<QuizFunnel> {
  const days = dayCount(opts.from, opts.to);
  const rng = seededRng(anchorSeed(`funnel:quiz:${channel}:${opts.from.toDateString()}-${days}`));

  // Channel multipliers. Facebook is the primary quiz driver.
  const channelShare = (
    channel === 'All' ? 1
    : channel === 'Facebook Ads' ? 0.62
    : channel === 'Google Ads' ? 0.18
    : 0.20 // Google Organic
  );

  const adClicks = Math.round(PER_DAY.adClicks * days * channelShare * jitter(rng, 1, 0.08));
  const quizStarts = Math.round(adClicks * clamp(jitter(rng, 0.60, 0.05), 0.45, 0.75));
  const quizCompletes = Math.round(quizStarts * clamp(jitter(rng, 0.63, 0.05), 0.5, 0.8));
  const leads = Math.round(quizCompletes * clamp(jitter(rng, 0.47, 0.06), 0.3, 0.65));
  const consultsBooked = Math.round(leads * clamp(jitter(rng, 0.33, 0.08), 0.2, 0.5));
  const showedUp = Math.round(consultsBooked * clamp(jitter(rng, 0.78, 0.05), 0.6, 0.95));
  const treatmentsAccepted = Math.round(showedUp * clamp(jitter(rng, 0.58, 0.06), 0.4, 0.8));

  const raw = [
    { label: 'Ad Clicks', count: adClicks },
    { label: 'Quiz Starts', count: quizStarts },
    { label: 'Quiz Completes', count: quizCompletes },
    { label: 'Leads Generated', count: leads },
    { label: 'Consults Booked', count: consultsBooked },
    { label: 'Showed Up', count: showedUp },
    { label: 'Treatment Plans Accepted', count: treatmentsAccepted },
  ];

  return ok({ steps: withConversionRates(raw), channel });
}

// ─── Internals ─────────────────────────────────────────────────────────────

function withConversionRates(steps: Array<Omit<FunnelStep, 'conversionFromPrev'>>): FunnelStep[] {
  return steps.map((s, i) => ({
    ...s,
    conversionFromPrev:
      i === 0 ? null
      : steps[i - 1].count === 0 ? null
      : round(s.count / steps[i - 1].count, 4),
  }));
}
