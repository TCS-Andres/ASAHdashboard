import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fmtInt } from '@/lib/format';
import type { FollowerPoint } from '@/lib/data';

interface Props {
  data: FollowerPoint[];
  channel: string;
}

const FollowerChart = ({ data, channel }: Props) => {
  const rows = data.map(d => ({
    ...d,
    short: d.date.slice(5),
  }));
  const start = data[0]?.followers ?? 0;
  const end = data[data.length - 1]?.followers ?? 0;
  const net = end - start;
  const netLabel = net >= 0 ? `+${fmtInt(net)}` : fmtInt(net);

  return (
    <div
      className="bg-card rounded-xl p-4 shadow-sm border border-border"
      role="region"
      aria-label={`Follower growth — ${channel}`}
    >
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground">Follower growth</h2>
        <p className="text-xs text-muted-foreground">
          {channel} · {netLabel} in window
        </p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="followerFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--sage))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--sage))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
              tickFormatter={fmtInt}
              width={50}
              domain={['dataMin - 20', 'dataMax + 20']}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => [fmtInt(v), 'Followers']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
            />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="hsl(var(--sage))"
              strokeWidth={2}
              fill="url(#followerFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FollowerChart;
