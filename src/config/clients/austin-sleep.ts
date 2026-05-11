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
    // Brevo is the email/contacts tool for ASAH (they don't run a CRM).
    // The dashboard deep-links here for individual contact detail.
    contactsTool: { label: 'View contacts in Brevo', url: 'https://app.brevo.com/contact/list' },
  },

  // Seeds the editable targets store. Real values are set by the user
  // via the Targets dialog and persisted in localStorage.
  defaultTargets: {
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
