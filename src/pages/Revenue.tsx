import { useQuery } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import { useDateRange, PRESET_LABELS } from '@/lib/dateRange';
import { useTargets } from '@/lib/targets';
import {
  fetchChannelRoas,
  fetchMonthlyRevenue,
  fetchOutstandingAR,
  fetchPacing,
  fetchRevenueBySource,
} from '@/lib/data';
import MonthlyTrend from '@/components/dashboard/MonthlyTrend';
import PacingChart from '@/components/dashboard/PacingChart';
import RoasTable from '@/components/dashboard/RoasTable';
import SourceTable from '@/components/dashboard/SourceTable';
import { Skeleton } from '@/components/ui/skeleton';
import { deltaColorClass, fmtCurrency, fmtDeltaPct } from '@/lib/format';

const Revenue = () => {
  const { range } = useDateRange();
  const opts = { from: range.from, to: range.to };
  const keyBase = [range.preset, range.from.toISOString(), range.to.toISOString()];
  const [targets] = useTargets();

  const monthly = useQuery({
    queryKey: ['monthly-revenue', ...keyBase],
    queryFn: () => fetchMonthlyRevenue(opts),
  });
  const bySource = useQuery({
    queryKey: ['revenue-by-source', ...keyBase],
    queryFn: () => fetchRevenueBySource(opts),
  });
  const roas = useQuery({
    queryKey: ['channel-roas', ...keyBase],
    queryFn: () => fetchChannelRoas(opts),
  });
  const pacing = useQuery({
    queryKey: ['pacing', targets.monthlyRevenue],
    queryFn: () => fetchPacing(opts, targets.monthlyRevenue),
  });
  const ar = useQuery({
    queryKey: ['outstanding-ar', ...keyBase],
    queryFn: () => fetchOutstandingAR(opts),
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Revenue &amp; Financials</h1>
        <p className="text-sm text-muted-foreground">{PRESET_LABELS[range.preset]}</p>
      </header>

      {/* Pacing — top of the tab so the answer to "are we on track?" is immediate. */}
      {pacing.data ? (
        <PacingChart pacing={pacing.data} />
      ) : (
        <Skeleton className="h-80 w-full rounded-xl" />
      )}

      {/* Monthly revenue + ACV trend */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {monthly.data ? (
          <MonthlyTrend
            title="Monthly revenue"
            subtitle="Trailing 12 months"
            data={monthly.data.map(d => ({ month: d.month, value: d.revenue }))}
            format={v => fmtCurrency(v, { compact: true })}
            color="hsl(var(--sage))"
          />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
        {monthly.data ? (
          <MonthlyTrend
            title="Average case value"
            subtitle="Trailing 12 months"
            kind="line"
            data={monthly.data.map(d => ({ month: d.month, value: d.averageCaseValue }))}
            format={v => fmtCurrency(v)}
            color="hsl(var(--terracotta))"
          />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
      </section>

      {/* Revenue by source + ROAS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {bySource.data ? (
          <SourceTable
            title="Revenue by source"
            subtitle={PRESET_LABELS[range.preset]}
            kind="revenue"
            data={bySource.data}
          />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
        {roas.data ? (
          <RoasTable data={roas.data} subtitle={PRESET_LABELS[range.preset]} />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
      </section>

      {/* Outstanding AR */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {ar.data ? (
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <Receipt size={14} className="text-primary" />
              <span>Outstanding A/R</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{fmtCurrency(ar.data.current)}</p>
            <p className={`text-xs font-medium mt-1 ${deltaColorClass(ar.data.deltaPct, true)}`}>
              {fmtDeltaPct(ar.data.deltaPct)} vs. prior period
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground/80">
              Mocked. Will sync from the practice management software once connected.
            </p>
          </div>
        ) : (
          <Skeleton className="h-32 w-full rounded-xl" />
        )}
      </section>
    </div>
  );
};

export default Revenue;
