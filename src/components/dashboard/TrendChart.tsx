import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fmtCurrency, fmtInt, fmtMonthShort } from '@/lib/format';
import type { MonthlyPatientPoint, MonthlyRevenuePoint } from '@/lib/data';

interface Props {
  patients: MonthlyPatientPoint[];
  revenue: MonthlyRevenuePoint[];
}

interface Row {
  month: string;
  monthLabel: string;
  newPatients: number;
  revenue: number;
}

const TrendChart = ({ patients, revenue }: Props) => {
  const data: Row[] = patients.map(p => {
    const rev = revenue.find(r => r.month === p.month);
    return {
      month: p.month,
      monthLabel: fmtMonthShort(p.month),
      newPatients: p.newPatients,
      revenue: rev?.revenue ?? 0,
    };
  });

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground">New patients &amp; revenue</h2>
        <p className="text-xs text-muted-foreground">Trailing 12 months</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis
              yAxisId="patients"
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={fmtInt}
              width={36}
            />
            <YAxis
              yAxisId="revenue"
              orientation="right"
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={v => fmtCurrency(v, { compact: true })}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Revenue') return [fmtCurrency(value), name];
                return [fmtInt(value), name];
              }}
              labelFormatter={(label: string, payload) => {
                const month = payload?.[0]?.payload?.month as string | undefined;
                return month ? `${fmtMonthShort(month)} ${month.split('-')[0]}` : label;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Bar
              yAxisId="patients"
              dataKey="newPatients"
              name="New patients"
              fill="hsl(var(--sage))"
              fillOpacity={0.85}
              radius={[3, 3, 0, 0]}
              maxBarSize={26}
            />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="hsl(var(--terracotta))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
