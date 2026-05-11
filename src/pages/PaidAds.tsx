import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Megaphone, Users, Wallet, TrendingUp } from 'lucide-react';
import { activeClient } from '@/config/clients';
import { useDateRange, PRESET_LABELS } from '@/lib/dateRange';
import {
  fetchAdCampaigns,
  fetchAdSpendKpi,
  fetchAdSpendOverTime,
  fetchQuizFunnel,
} from '@/lib/data';
import KpiCard from '@/components/dashboard/KpiCard';
import CampaignTable from '@/components/dashboard/CampaignTable';
import SpendOverTimeChart from '@/components/dashboard/SpendOverTimeChart';
import Funnel from '@/components/dashboard/Funnel';
import { Skeleton } from '@/components/ui/skeleton';
import { fmtCurrency, fmtInt } from '@/lib/format';

const PaidAds = () => {
  const { range } = useDateRange();
  const opts = { from: range.from, to: range.to };
  const keyBase = [range.preset, range.from.toISOString(), range.to.toISOString()];
  const vsLabel = 'vs. prior period';
  const contacts = activeClient.externalLinks.contactsTool;

  // MVP focuses on Meta; structure already supports All/Google when we light those up.
  const campaigns = useQuery({
    queryKey: ['ad-campaigns-meta', ...keyBase],
    queryFn: () => fetchAdCampaigns(opts, 'Meta'),
  });
  const spend = useQuery({
    queryKey: ['ad-spend-kpi', ...keyBase],
    queryFn: () => fetchAdSpendKpi(opts),
  });
  const spendSeries = useQuery({
    queryKey: ['ad-spend-series-all', ...keyBase],
    queryFn: () => fetchAdSpendOverTime(opts, 'All'),
  });
  const quizFunnel = useQuery({
    queryKey: ['quiz-funnel-paid', ...keyBase],
    queryFn: () => fetchQuizFunnel(opts, 'Facebook Ads'),
  });

  // Roll up Meta-only KPIs from the campaign table for the KPI strip.
  const totalLeads = campaigns.data?.reduce((a, c) => a + c.leads, 0) ?? 0;
  const metaSpend = campaigns.data?.reduce((a, c) => a + c.spend, 0) ?? 0;
  const metaImpressions = campaigns.data?.reduce((a, c) => a + c.impressions, 0) ?? 0;
  const blendedCpl = totalLeads > 0 ? Math.round(metaSpend / totalLeads) : 0;
  const blendedRoas =
    metaSpend > 0 && campaigns.data
      ? campaigns.data.reduce((a, c) => a + c.roas * c.spend, 0) / metaSpend
      : 0;

  // Paid quiz funnel = ad clicks → quiz starts → quiz completes → leads (first 4 steps).
  const paidQuizSteps = quizFunnel.data?.steps.slice(0, 4) ?? [];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paid Ads</h1>
          <p className="text-sm text-muted-foreground">
            Meta (Facebook + Instagram) · {PRESET_LABELS[range.preset]}
          </p>
        </div>
        <a
          href={contacts.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:brightness-110"
        >
          {contacts.label}
          <ExternalLink size={14} />
        </a>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {spend.data ? (
          <KpiCard
            label="Total ad spend"
            value={fmtCurrency(spend.data.current, { compact: true })}
            deltaPct={spend.data.deltaPct}
            icon={Wallet}
            sparkline={spend.data.sparkline.points}
            vsLabel={vsLabel}
          />
        ) : (
          <Skeleton className="h-28 w-full rounded-xl" />
        )}
        {campaigns.data ? (
          <KpiCard
            label="Leads (Meta)"
            value={fmtInt(totalLeads)}
            deltaPct={null}
            icon={Users}
            vsLabel="window total"
          />
        ) : (
          <Skeleton className="h-28 w-full rounded-xl" />
        )}
        {campaigns.data ? (
          <KpiCard
            label="Avg cost per lead"
            value={fmtCurrency(blendedCpl)}
            deltaPct={null}
            deltaInverted
            icon={Megaphone}
            vsLabel="window blend"
          />
        ) : (
          <Skeleton className="h-28 w-full rounded-xl" />
        )}
        {campaigns.data ? (
          <KpiCard
            label="Blended ROAS"
            value={`${blendedRoas.toFixed(2)}×`}
            deltaPct={null}
            icon={TrendingUp}
            vsLabel="spend-weighted"
          />
        ) : (
          <Skeleton className="h-28 w-full rounded-xl" />
        )}
      </section>

      {campaigns.data ? (
        <CampaignTable rows={campaigns.data} subtitle={PRESET_LABELS[range.preset]} />
      ) : (
        <Skeleton className="h-72 w-full rounded-xl" />
      )}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {spendSeries.data ? (
          <SpendOverTimeChart points={spendSeries.data} />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
        {quizFunnel.data ? (
          <Funnel
            title="Quiz funnel — ad click to lead"
            subtitle="Facebook Ads · counts only"
            steps={paidQuizSteps}
          />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
      </section>

      <p className="text-[11px] text-muted-foreground/80">
        Lead-level detail (names, contact info, quiz responses) lives in Brevo, not here.
      </p>
    </div>
  );
};

export default PaidAds;
