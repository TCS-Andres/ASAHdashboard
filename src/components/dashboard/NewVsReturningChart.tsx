import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fmtInt, fmtMonthShort } from '@/lib/format';
import type { MonthlyPatientPoint } from '@/lib/data';

interface Props {
  data: MonthlyPatientPoint[];
}

const NewVsReturningChart = ({ data }: Props) => {
  const rows = data.map(d => ({ ...d, monthLabel: fmtMonthShort(d.month) }));

  return (
    <div
      className="bg-card rounded-xl p-4 shadow-sm border border-border"
      role="region"
      aria-label="New vs. returning patients"
    >
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground">New vs. returning patients</h2>
        <p className="text-xs text-muted-foreground">Trailing 12 months</p>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={fmtInt} width={36} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number, name: string) => [fmtInt(v), name]}
              labelFormatter={(label, payload) => {
                const m = payload?.[0]?.payload?.month;
                return m ? `${label} ${m.split('-')[0]}` : label;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Bar dataKey="newPatients" name="New" stackId="patients" fill="hsl(var(--sage))" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="returning" name="Returning" stackId="patients" fill="hsl(var(--mustard))" radius={[0, 0, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NewVsReturningChart;
