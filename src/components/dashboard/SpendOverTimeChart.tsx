import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fmtCurrency } from '@/lib/format';
import type { AdSpendPoint, Channel } from '@/lib/data';

interface Props {
  points: AdSpendPoint[];
}

const CHANNEL_COLOR: Record<Channel, string> = {
  Meta: 'hsl(var(--sage))',
  Google: 'hsl(var(--terracotta))',
};

const SpendOverTimeChart = ({ points }: Props) => {
  // Pivot from rows-per-channel-per-day to one row per day with one column per channel.
  const byDate = new Map<string, Record<string, number | string>>();
  for (const p of points) {
    const row = byDate.get(p.date) ?? { date: p.date, short: p.date.slice(5) };
    row[p.channel] = ((row[p.channel] as number | undefined) ?? 0) + p.spend;
    byDate.set(p.date, row);
  }
  const rows = Array.from(byDate.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const channels = Array.from(new Set(points.map(p => p.channel)));

  const total = points.reduce((a, p) => a + p.spend, 0);

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground">Ad spend over time</h2>
        <p className="text-xs text-muted-foreground">{fmtCurrency(total)} total</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="short"
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={v => fmtCurrency(v, { compact: true })}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number, name: string) => [fmtCurrency(v), name]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            {channels.map(ch => (
              <Area
                key={ch}
                type="monotone"
                dataKey={ch}
                name={ch}
                stackId="spend"
                stroke={CHANNEL_COLOR[ch]}
                fill={CHANNEL_COLOR[ch]}
                fillOpacity={0.45}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendOverTimeChart;
