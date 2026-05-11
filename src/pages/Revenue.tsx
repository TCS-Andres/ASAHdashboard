import { useDateRange, PRESET_LABELS } from '@/lib/dateRange';

const Revenue = () => {
  const { range } = useDateRange();
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Revenue &amp; Financials</h1>
        <p className="text-sm text-muted-foreground">{PRESET_LABELS[range.preset]}</p>
      </header>
      <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
        <p className="text-muted-foreground">
          Phase 5 will fill this with monthly revenue, average case value, revenue by channel, ROAS, and MTD pacing vs. target.
        </p>
      </div>
    </div>
  );
};

export default Revenue;
