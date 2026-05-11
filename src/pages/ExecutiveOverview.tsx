import { useDateRange, PRESET_LABELS } from '@/lib/dateRange';
import { activeClient } from '@/config/clients';

const ExecutiveOverview = () => {
  const { range } = useDateRange();
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Executive Overview</h1>
        <p className="text-sm text-muted-foreground">
          {activeClient.name} · {PRESET_LABELS[range.preset]}
        </p>
      </header>
      <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
        <p className="text-muted-foreground">
          Phase 4 will fill this with KPI cards, the 12-month trend chart, weekly signals, and the funnel.
        </p>
      </div>
    </div>
  );
};

export default ExecutiveOverview;
