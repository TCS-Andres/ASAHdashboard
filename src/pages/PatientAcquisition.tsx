import { useDateRange, PRESET_LABELS } from '@/lib/dateRange';

const PatientAcquisition = () => {
  const { range } = useDateRange();
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Patient Acquisition</h1>
        <p className="text-sm text-muted-foreground">{PRESET_LABELS[range.preset]}</p>
      </header>
      <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
        <p className="text-muted-foreground">
          Phase 5 will fill this with monthly new patients, new vs. returning, source mix, and the quiz-to-treatment funnel.
        </p>
      </div>
    </div>
  );
};

export default PatientAcquisition;
