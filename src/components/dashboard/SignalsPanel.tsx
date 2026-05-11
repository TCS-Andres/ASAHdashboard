import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { Insight } from '@/lib/data';

interface Props {
  insights: Insight[];
}

const ICON_BY_SEVERITY = {
  positive: { Icon: ArrowUpRight, className: 'text-primary' },
  attention: { Icon: ArrowDownRight, className: 'text-destructive' },
  neutral: { Icon: Minus, className: 'text-muted-foreground' },
} as const;

const SignalsPanel = ({ insights }: Props) => (
  <div className="bg-card rounded-xl p-4 shadow-sm border border-border h-full">
    <h2 className="text-sm font-semibold text-foreground mb-3">This week's signals</h2>
    {insights.length === 0 ? (
      <p className="text-xs text-muted-foreground">Nothing notable to flag this week.</p>
    ) : (
      <ul className="space-y-2.5">
        {insights.map(s => {
          const { Icon, className } = ICON_BY_SEVERITY[s.severity];
          return (
            <li key={s.id} className="flex gap-2 items-start">
              <Icon size={14} className={`mt-0.5 shrink-0 ${className}`} />
              <span className="text-xs leading-snug text-foreground">{s.text}</span>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

export default SignalsPanel;
