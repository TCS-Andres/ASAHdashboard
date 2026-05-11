// Shared types for the data layer. Mock and real implementations both
// conform to these shapes — pages depend on the shapes, not the source.
//
// Hard rule: no field in this file ever holds individual patient or lead
// PII. Counts, sums, rates, anonymized post content. That's it.

export interface FetchOptions {
  /** Inclusive start of the window. */
  from: Date;
  /** Inclusive end of the window. */
  to: Date;
}

export interface MonthlyPoint {
  /** ISO month string, e.g. "2026-04". */
  month: string;
  value: number;
}

export interface DailyPoint {
  /** ISO date string, e.g. "2026-05-11". */
  date: string;
  value: number;
}

export interface Delta {
  /** Current-period value. */
  current: number;
  /** Prior-period value of equal length. */
  previous: number;
  /** Signed percentage change vs. previous, e.g. 0.12 for +12%. Null if previous was 0. */
  deltaPct: number | null;
}

export interface Sparkline {
  /** Daily series across the current window, used for KPI sparklines. */
  points: DailyPoint[];
}

// ─── Patients ───────────────────────────────────────────────────────────────

export interface PatientKpis {
  newPatients: Delta & { sparkline: Sparkline };
  returningPatients: Delta;
  leadToPatientPct: Delta;
}

export interface MonthlyPatientPoint {
  month: string;
  newPatients: number;
  returning: number;
}

export type PatientSource =
  | 'Facebook Ads'
  | 'Google Ads'
  | 'Google Organic'
  | 'Direct Referral'
  | 'Physician Referral'
  | 'Walk-In'
  | 'Other';

export interface SourceShare {
  source: PatientSource;
  count: number;
  share: number;
}

export interface SourceMonthlyPoint {
  month: string;
  bySource: Record<PatientSource, number>;
}

// ─── Revenue ────────────────────────────────────────────────────────────────

export interface RevenueKpis {
  revenue: Delta & { sparkline: Sparkline };
  averageCaseValue: Delta;
  costPerAcquisition: Delta;
}

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  averageCaseValue: number;
}

export interface RevenueBySource {
  source: PatientSource;
  revenue: number;
  share: number;
}

export interface ChannelRoas {
  channel: 'Facebook Ads' | 'Google Ads';
  spend: number;
  revenue: number;
  roas: number;
}

export interface PacingPoint {
  /** ISO date string. */
  date: string;
  /** Cumulative actual revenue through this day. Null for future days. */
  actual: number | null;
  /** Cumulative target through this day (linearly proportional to month). */
  target: number;
  /** Projected end-of-month based on run-rate; only set on the final actual day. */
  projection?: number;
}

export interface Pacing {
  /** Month start. */
  monthStart: string;
  /** Monthly target dollars. */
  target: number;
  /** Series, one point per day of the current month. */
  points: PacingPoint[];
  /** Day-of-month through which we have actuals. */
  actualThroughDay: number;
  /** Projected month-end revenue. */
  projection: number;
}

// ─── Paid Ads ───────────────────────────────────────────────────────────────

export type Channel = 'Meta' | 'Google';

export interface CampaignRow {
  id: string;
  name: string;
  channel: Channel;
  status: 'Active' | 'Paused' | 'Ended';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  leads: number;
  cpl: number;
  cpa: number;
  roas: number;
}

export interface AdSpendPoint {
  date: string;
  spend: number;
  channel: Channel;
}

// ─── Social ─────────────────────────────────────────────────────────────────

export type SocialChannel =
  | 'Facebook'
  | 'Instagram'
  | 'TikTok'
  | 'YouTube'
  | 'Google Business Profile';

export interface SocialKpis {
  followers: Delta;
  reach: Delta;
  impressions: Delta;
  engagementRate: Delta;
}

export interface FollowerPoint {
  date: string;
  followers: number;
}

export interface TopPost {
  id: string;
  /** Post body / caption snippet (no user identifiers). */
  snippet: string;
  /** Optional thumbnail URL — for mock, references local placeholder paths. */
  thumbnailUrl?: string;
  reach: number;
  engagement: number;
  publishedAt: string;
}

export interface SocialChannelMetrics {
  channel: SocialChannel;
  kpis: SocialKpis;
  followerSeries: FollowerPoint[];
  topPosts: TopPost[];
}

// ─── Funnels ────────────────────────────────────────────────────────────────

export interface FunnelStep {
  label: string;
  count: number;
  /** Conversion rate from the prior step (0–1). Null for the first step. */
  conversionFromPrev: number | null;
}

export interface AcquisitionFunnel {
  steps: FunnelStep[];
}

export interface QuizFunnel {
  /** Quiz funnel steps in order. */
  steps: FunnelStep[];
  /** When viewed per-channel, the inbound channel name. */
  channel?: 'Facebook Ads' | 'Google Ads' | 'Google Organic' | 'All';
}

// ─── Insights ───────────────────────────────────────────────────────────────

export interface Insight {
  /** Stable id so the UI can dismiss/remember. */
  id: string;
  /** Short headline, e.g. "Facebook CPL up 22% week-over-week". */
  text: string;
  /** Severity drives styling: positive = good news, attention = needs review. */
  severity: 'positive' | 'attention' | 'neutral';
}
