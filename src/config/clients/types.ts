export interface ClientConfig {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  primaryColorHsl: string;
  timezone: string;
  fiscalYearStart: string;
  locations: string[];
  externalLinks: {
    /**
     * Where individual contacts and quiz leads live. ASAH uses Brevo for
     * email marketing; the dashboard never holds PII, so this deep-link
     * is how the team accesses contact detail.
     */
    contactsTool: { label: string; url: string };
  };
  /**
   * Default monthly targets, used as the seed value for the editable
   * targets store. The live values that drive pacing visualizations
   * come from src/lib/practice.ts and may be overridden by the user.
   */
  defaultTargets: {
    monthlyRevenue: number;
    monthlyNewPatients: number;
  };
  dataSources: {
    metaAdsAccountId: string | null;
    googleAdsAccountId: string | null;
    googleAnalyticsPropertyId: string | null;
    quizCrmId: string | null;
    practiceManagementId: string | null;
  };
}
