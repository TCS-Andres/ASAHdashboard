import type { ClientConfig } from './types';
import logo from '@/assets/logo.png';

export const austinSleep: ClientConfig = {
  id: 'austin-sleep',
  name: 'Austin Sleep and Airway Health',
  shortName: 'ASAH',
  logo,
  primaryColorHsl: '153 16% 49%',
  timezone: 'America/Chicago',
  fiscalYearStart: 'January',
  locations: ['Austin, TX'],

  externalLinks: {
    // Placeholder — replace with the real CRM / lead tool URL once decided.
    leadTool: { label: 'View leads in CRM', url: 'https://example.com/leads' },
  },

  targets: {
    // Placeholders — confirm with practice before Phase 4.
    monthlyRevenue: 120_000,
    monthlyNewPatients: 60,
  },

  dataSources: {
    // Identifiers for future server-side data pulls. Empty for MVP (mocked).
    metaAdsAccountId: null,
    googleAdsAccountId: null,
    googleAnalyticsPropertyId: null,
    quizCrmId: null,
    practiceManagementId: null,
  },
};
