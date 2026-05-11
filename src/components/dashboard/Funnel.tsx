import { fmtInt, fmtPct } from '@/lib/format';
import type { FunnelStep } from '@/lib/data';

interface Props {
  title: string;
  subtitle?: string;
  steps: FunnelStep[];
}

const Funnel = ({ title, subtitle, steps }: Props) => {
  if (steps.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-3 text-xs text-muted-foreground">No data in this window.</p>
      </div>
    );
  }
  const maxCount = steps[0].count || 1;

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-1.5">
        {steps.map((s, i) => {
          const widthPct = Math.max(8, (s.count / maxCount) * 100);
          return (
            <div key={s.label} className="space-y-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium text-foreground">{fmtInt(s.count)}</span>
              </div>
              <div className="relative h-7 bg-muted/40 rounded-md overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-primary/70 rounded-md transition-[width]"
                  style={{ width: `${widthPct}%` }}
                />
                {i > 0 && s.conversionFromPrev !== null && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-foreground/80">
                    {fmtPct(s.conversionFromPrev, 1)} of prev
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Funnel;
