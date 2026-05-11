import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDateRange, PRESET_LABELS } from '@/lib/dateRange';
import {
  fetchMonthlyPatients,
  fetchQuizFunnel,
  fetchSourceMix,
  fetchSourceMixOverTime,
} from '@/lib/data';
import { usePracticeData } from '@/lib/practice';
import MonthlyTrend from '@/components/dashboard/MonthlyTrend';
import NewVsReturningChart from '@/components/dashboard/NewVsReturningChart';
import SourceStackedBar from '@/components/dashboard/SourceStackedBar';
import SourceTable from '@/components/dashboard/SourceTable';
import Funnel from '@/components/dashboard/Funnel';
import { Skeleton } from '@/components/ui/skeleton';
import { fmtInt } from '@/lib/format';

const PatientAcquisition = () => {
  const { range } = useDateRange();
  const opts = { from: range.from, to: range.to };
  const keyBase = [range.preset, range.from.toISOString(), range.to.toISOString()];

  const monthlyPatients = useQuery({
    queryKey: ['monthly-patients', ...keyBase],
    queryFn: () => fetchMonthlyPatients(opts),
  });
  const sourceMix = useQuery({
    queryKey: ['source-mix', ...keyBase],
    queryFn: () => fetchSourceMix(opts),
  });
  const sourceOverTime = useQuery({
    queryKey: ['source-mix-time', ...keyBase],
    queryFn: () => fetchSourceMixOverTime(opts),
  });
  const quizFunnel = useQuery({
    queryKey: ['quiz-funnel-all', ...keyBase],
    queryFn: () => fetchQuizFunnel(opts, 'All'),
  });

  // The Patient Acquisition tab uses the post-click portion of the quiz
  // funnel; the ad-click step lives on the Paid Ads tab.
  const inClinicFunnelSteps = quizFunnel.data?.steps.slice(1) ?? [];

  // Overlay user-entered actuals on the mock monthly series so charts show
  // real numbers as the practice enters them.
  const { data: practice } = usePracticeData();
  const monthlyMerged = useMemo(() => {
    if (!monthlyPatients.data) return undefined;
    return monthlyPatients.data.map(d => {
      const a = practice.actualsByMonth[d.month];
      return {
        ...d,
        newPatients: a?.newPatients ?? d.newPatients,
        returning: a?.returningPatients ?? d.returning,
      };
    });
  }, [monthlyPatients.data, practice.actualsByMonth]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Patient Acquisition</h1>
        <p className="text-sm text-muted-foreground">{PRESET_LABELS[range.preset]}</p>
      </header>

      {/* Monthly new patients — full width */}
      {monthlyMerged ? (
        <MonthlyTrend
          title="New patients per month"
          subtitle="Trailing 12 months"
          data={monthlyMerged.map(d => ({ month: d.month, value: d.newPatients }))}
          format={fmtInt}
        />
      ) : (
        <Skeleton className="h-72 w-full rounded-xl" />
      )}

      {/* New vs Returning | Source over time */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {monthlyMerged ? (
          <NewVsReturningChart data={monthlyMerged} />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
        {sourceOverTime.data ? (
          <SourceStackedBar data={sourceOverTime.data} />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
      </section>

      {/* Source breakdown + Quiz funnel */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sourceMix.data ? (
          <SourceTable
            title="Patient sources"
            subtitle={PRESET_LABELS[range.preset]}
            kind="count"
            data={sourceMix.data}
          />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
        {quizFunnel.data ? (
          <Funnel
            title="Quiz funnel"
            subtitle="Quiz starts → treatment plans accepted"
            steps={inClinicFunnelSteps}
          />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )}
      </section>
    </div>
  );
};

export default PatientAcquisition;
