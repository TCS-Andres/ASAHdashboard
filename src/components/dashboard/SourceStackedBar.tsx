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
import type { PatientSource, SourceMonthlyPoint } from '@/lib/data';
import { SOURCE_COLOR, SOURCE_ORDER } from './sourcePalette';

interface Props {
  data: SourceMonthlyPoint[];
}

const SourceStackedBar = ({ data }: Props) => {
  const rows = data.map(d => ({
    month: d.month,
    monthLabel: fmtMonthShort(d.month),
    ...d.bySource,
  })) as Array<Record<string, number | string>>;

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground">Source mix over time</h2>
        <p className="text-xs text-muted-foreground">Trailing 12 months</p>
      </div>
      <div className="h-72">
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
                const m = payload?.[0]?.payload?.month as string | undefined;
                return m ? `${label} ${m.split('-')[0]}` : label;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            {SOURCE_ORDER.map((source: PatientSource, i) => (
              <Bar
                key={source}
                dataKey={source}
                name={source}
                stackId="mix"
                fill={SOURCE_COLOR[source]}
                radius={i === SOURCE_ORDER.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={28}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SourceStackedBar;
