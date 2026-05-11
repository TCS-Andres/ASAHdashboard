import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fmtMonthShort } from '@/lib/format';

interface Props {
  title: string;
  subtitle?: string;
  data: Array<{ month: string; value: number }>;
  /** Render as bars (default) or a line. */
  kind?: 'bar' | 'line';
  /** Tick + tooltip formatter for the Y-axis values. */
  format: (n: number) => string;
  color?: string;
  height?: number;
}

const MonthlyTrend = ({
  title,
  subtitle,
  data,
  kind = 'bar',
  format,
  color = 'hsl(var(--sage))',
  height = 240,
}: Props) => {
  const rows = data.map(d => ({ ...d, monthLabel: fmtMonthShort(d.month) }));

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {kind === 'bar' ? (
            <BarChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={format}
                width={56}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [format(v), title]}
                labelFormatter={(label, payload) => labelWithYear(label, payload)}
              />
              <Bar dataKey="value" fill={color} fillOpacity={0.85} radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          ) : (
            <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={format}
                width={56}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [format(v), title]}
                labelFormatter={(label, payload) => labelWithYear(label, payload)}
              />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const tooltipStyle = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 12,
};

const labelWithYear = (label: string, payload: ReadonlyArray<{ payload: { month: string } }> | undefined): string => {
  const m = payload?.[0]?.payload?.month;
  return m ? `${label} ${m.split('-')[0]}` : label;
};

export default MonthlyTrend;
