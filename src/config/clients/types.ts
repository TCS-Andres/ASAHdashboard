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
    leadTool: { label: string; url: string };
  };
  targets: {
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
