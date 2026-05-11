import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { fmtCurrency } from '@/lib/format';
import type { Pacing } from '@/lib/data';

interface Props {
  pacing: Pacing;
}

const PacingChart = ({ pacing }: Props) => {
  const rows = pacing.points.map(p => ({
    day: Number(p.date.split('-')[2]),
    actual: p.actual,
    target: p.target,
    // Render the projection as a continuation line from the last actual point
    // through end-of-month. We do this by placing the projection value only
    // on the last actual day and on the final point.
    projection: null as number | null,
  }));

  // Add projection line: from last actual day to end of month, straight to projection total.
  const lastActualIdx = rows.findLastIndex(r => r.actual !== null);
  if (lastActualIdx >= 0) {
    rows[lastActualIdx].projection = rows[lastActualIdx].actual;
    rows[rows.length - 1].projection = pacing.projection;
  }

  const onPace = pacing.projection >= pacing.target;
  const variance = (pacing.projection - pacing.target) / pacing.target;

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <header className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Revenue pacing — month to date</h2>
          <p className="text-xs text-muted-foreground">Day {pacing.actualThroughDay} of {rows.length}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Stat label="Target" value={fmtCurrency(pacing.target)} />
          <Stat label="Projection" value={fmtCurrency(pacing.projection)} />
          <Stat
            label="vs. target"
            value={`${variance >= 0 ? '+' : ''}${(variance * 100).toFixed(1)}%`}
            tone={onPace ? 'positive' : 'attention'}
            Icon={onPace ? TrendingUp : TrendingDown}
          />
        </div>
      </header>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              interval="preserveStartEnd"
              tickFormatter={d => `Day ${d}`}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={v => fmtCurrency(v, { compact: true })}
              width={60}
              domain={[0, Math.max(pacing.target, pacing.projection) * 1.08]}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number | null, name: string) =>
                value === null ? ['—', name] : [fmtCurrency(value), name]
              }
              labelFormatter={(d: number) => `Day ${d}`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <ReferenceLine y={pacing.target} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="target"
              name="Target pace"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted))"
              fillOpacity={0.5}
              strokeDasharray="4 4"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="hsl(var(--sage))"
              strokeWidth={2.5}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="projection"
              name="Projection"
              stroke="hsl(var(--terracotta))"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3 }}
              isAnimationActive={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Stat = ({
  label,
  value,
  tone = 'neutral',
  Icon,
}: {
  label: string;
  value: string;
  tone?: 'positive' | 'attention' | 'neutral';
  Icon?: typeof TrendingUp;
}) => {
  const toneClass =
    tone === 'positive' ? 'text-primary' : tone === 'attention' ? 'text-destructive' : 'text-foreground';
  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums inline-flex items-center gap-1 ${toneClass}`}>
        {Icon && <Icon size={13} />}
        {value}
      </span>
    </div>
  );
};

export default PacingChart;
