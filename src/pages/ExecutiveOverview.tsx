import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  Eye,
  Megaphone,
  Percent,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { activeClient } from '@/config/clients';
import { useDateRange, PRESET_LABELS } from '@/lib/dateRange';
import {
  fetchAcquisitionFunnel,
  fetchAdSpendKpi,
  fetchMonthlyPatients,
  fetchMonthlyRevenue,
  fetchPatientKpis,
  fetchRevenueKpis,
  fetchSocialReachKpi,
  fetchSourceMix,
  type Insight,
} from '@/lib/data';
import KpiCard from '@/components/dashboard/KpiCard';
import TrendChart from '@/components/dashboard/TrendChart';
import Funnel from '@/components/dashboard/Funnel';
import SourceDonut from '@/components/dashboard/SourceDonut';
import SignalsPanel from '@/components/dashboard/SignalsPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { fmtCurrency, fmtInt, fmtPct } from '@/lib/format';

// MVP: hardcoded signals. Phase 7+ can derive these from the mock data.
const SAMPLE_INSIGHTS: Insight[] = [
  { id: '1', text: 'Facebook ad CPL trending down 14% vs. last 30 days — current creative is outperforming.', severity: 'positive' },
  { id: '2', text: 'Google organic share at a 30-day high — SEO content updates from September are landing.', severity: 'positive' },
  { id: '3', text: 'Lead-to-patient conversion dipped to 18%. Worth auditing the consult-booking step.', severity: 'attention' },
  { id: '4', text: 'TikTok engagement rate (6.7%) is the highest of any channel — consider increasing post cadence.', severity: 'positive' },
  { id: '5', text: 'No physician referrals last week, the lowest in the trailing 12 months.', severity: 'attention' },
];

const ExecutiveOverview = () => {
  const { range } = useDateRange();
  const opts = { from: range.from, to: range.to };
  const keyBase = [range.preset, range.from.toISOString(), range.to.toISOString()];

  const patientKpis = useQuery({ queryKey: ['patients-kpi', ...keyBase], queryFn: () => fetchPatientKpis(opts) });
  const revenueKpis = useQuery({ queryKey: ['revenue-kpi', ...keyBase], queryFn: () => fetchRevenueKpis(opts) });
  const adSpend = useQuery({ queryKey: ['ad-spend-kpi', ...keyBase], queryFn: () => fetchAdSpendKpi(opts) });
  const socialReach = useQuery({ queryKey: ['social-reach-kpi', ...keyBase], queryFn: () => fetchSocialReachKpi(opts) });
  const monthlyPatients = useQuery({ queryKey: ['monthly-patients', ...keyBase], queryFn: () => fetchMonthlyPatients(opts) });
  const monthlyRevenue = useQuery({ queryKey: ['monthly-revenue', ...keyBase], queryFn: () => fetchMonthlyRevenue(opts) });
  const sourceMix = useQuery({ queryKey: ['source-mix', ...keyBase], queryFn: () => fetchSourceMix(opts) });
  const funnel = useQuery({ queryKey: ['acq-funnel', ...keyBase], queryFn: () => fetchAcquisitionFunnel(opts) });

  const vsLabel = `vs. previous ${PRESET_LABELS[range.preset].toLowerCase()}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Executive Overview</h1>
        <p className="text-sm text-muted-foreground">
          {activeClient.name} · {PRESET_LABELS[range.preset]}
        </p>
      </header>

      {/* KPI strip */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {patientKpis.data ? (
          <KpiCard
            label="New patients"
            value={fmtInt(patientKpis.data.newPatients.current)}
            deltaPct={patientKpis.data.newPatients.deltaPct}
            icon={UserPlus}
            sparkline={patientKpis.data.newPatients.sparkline.points}
            vsLabel={vsLabel}
          />
        ) : (
          <KpiSkeleton />
        )}
        {revenueKpis.data ? (
          <KpiCard
            label="Revenue"
            value={fmtCurrency(revenueKpis.data.revenue.current, { compact: true })}
            deltaPct={revenueKpis.data.revenue.deltaPct}
            icon={DollarSign}
            sparkline={revenueKpis.data.revenue.sparkline.points}
            vsLabel={vsLabel}
          />
        ) : (
          <KpiSkeleton />
        )}
        {revenueKpis.data ? (
          <KpiCard
            label="Cost per acquisition"
            value={fmtCurrency(revenueKpis.data.costPerAcquisition.current)}
            deltaPct={revenueKpis.data.costPerAcquisition.deltaPct}
            deltaInverted
            icon={Wallet}
            vsLabel={vsLabel}
          />
        ) : (
          <KpiSkeleton />
        )}
        {patientKpis.data ? (
          <KpiCard
            label="Lead → patient"
            value={fmtPct(patientKpis.data.leadToPatientPct.current / 100)}
            deltaPct={patientKpis.data.leadToPatientPct.deltaPct}
            icon={Percent}
            vsLabel={vsLabel}
          />
        ) : (
          <KpiSkeleton />
        )}
        {adSpend.data ? (
          <KpiCard
            label="Total ad spend"
            value={fmtCurrency(adSpend.data.current, { compact: true })}
            deltaPct={adSpend.data.deltaPct}
            icon={Megaphone}
            sparkline={adSpend.data.sparkline.points}
            vsLabel={vsLabel}
          />
        ) : (
          <KpiSkeleton />
        )}
        {socialReach.data ? (
          <KpiCard
            label="Social reach"
            value={fmtInt(socialReach.data.current)}
            deltaPct={socialReach.data.deltaPct}
            icon={Eye}
            sparkline={socialReach.data.sparkline.points}
            vsLabel={vsLabel}
          />
        ) : (
          <KpiSkeleton />
        )}
      </section>

      {/* Trend + Signals */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {monthlyPatients.data && monthlyRevenue.data ? (
            <TrendChart patients={monthlyPatients.data} revenue={monthlyRevenue.data} />
          ) : (
            <Skeleton className="h-80 w-full rounded-xl" />
          )}
        </div>
        <SignalsPanel insights={SAMPLE_INSIGHTS} />
      </section>

      {/* Source mix + Funnel */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sourceMix.data ? (
          <SourceDonut data={sourceMix.data} />
        ) : (
          <Skeleton className="h-64 w-full rounded-xl" />
        )}
        {funnel.data ? (
          <Funnel
            title="Marketing funnel"
            subtitle={PRESET_LABELS[range.preset]}
            steps={funnel.data.steps}
          />
        ) : (
          <Skeleton className="h-64 w-full rounded-xl" />
        )}
      </section>
    </div>
  );
};

const KpiSkeleton = () => (
  <div className="bg-card rounded-xl p-4 shadow-sm border-t-2 border-primary/20 flex flex-col gap-2">
    <Skeleton className="h-3 w-20" />
    <Skeleton className="h-7 w-16" />
    <Skeleton className="h-9 w-full" />
  </div>
);

export default ExecutiveOverview;
