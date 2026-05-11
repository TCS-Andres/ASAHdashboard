import type { LucideIcon } from 'lucide-react';
import MiniSparkline from './MiniSparkline';
import { deltaColorClass, fmtDeltaPct } from '@/lib/format';
import type { DailyPoint } from '@/lib/data';

interface Props {
  label: string;
  /** Already-formatted value, e.g. "$124K" or "62". */
  value: string;
  /** Delta vs. prior period, as a fraction (0.12 = +12%). */
  deltaPct: number | null;
  /**
   * If true, a *negative* delta is treated as a *good* change (used for
   * cost metrics like CPA where down is good).
   */
  deltaInverted?: boolean;
  icon?: LucideIcon;
  sparkline?: DailyPoint[];
  /** Compared-to label, e.g. "vs. last 30 days". */
  vsLabel?: string;
}

const KpiCard = ({ label, value, deltaPct, deltaInverted, icon: Icon, sparkline, vsLabel }: Props) => (
  <div className="bg-card rounded-xl p-4 shadow-sm border-t-2 border-primary/20 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon size={14} className="text-primary" />}
        <span>{label}</span>
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
      <span className={`text-xs font-medium ${deltaColorClass(deltaPct, deltaInverted)}`}>
        {fmtDeltaPct(deltaPct)}
      </span>
    </div>
    {sparkline && sparkline.length > 0 ? (
      <MiniSparkline points={sparkline} />
    ) : (
      <div className="h-9" aria-hidden />
    )}
    {vsLabel && <p className="text-[10px] text-muted-foreground/70">{vsLabel}</p>}
  </div>
);

export default KpiCard;
