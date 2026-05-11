// Data layer barrel. Pages import from here, never from `./mock/*` directly,
// so swapping mock → real API is a one-line change per source.
//
// HIPAA reminder: every function here returns aggregated metrics. If you ever
// add an export from a real API module, audit the response shape — it must
// not contain names, contact info, addresses, or identifiers.

export type * from './types';

export {
  fetchPatientKpis,
  fetchMonthlyPatients,
  fetchSourceMix,
  fetchSourceMixOverTime,
} from './mock/mockPatients';

export {
  fetchRevenueKpis,
  fetchMonthlyRevenue,
  fetchRevenueBySource,
  fetchChannelRoas,
  fetchPacing,
} from './mock/mockRevenue';

export {
  fetchAdCampaigns,
  fetchAdSpendKpi,
  fetchAdSpendOverTime,
} from './mock/mockAds';

export {
  fetchSocialChannel,
  fetchSocialComparison,
  fetchSocialReachKpi,
  fetchChannelImpressionSparkline,
} from './mock/mockSocial';

export {
  fetchAcquisitionFunnel,
  fetchQuizFunnel,
} from './mock/mockFunnel';
