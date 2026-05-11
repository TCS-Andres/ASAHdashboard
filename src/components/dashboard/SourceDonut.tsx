import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { fmtInt, fmtPct } from '@/lib/format';
import type { SourceShare } from '@/lib/data';
import { SOURCE_COLOR } from './sourcePalette';
import EmptyState from './EmptyState';

interface Props {
  title?: string;
  data: SourceShare[];
}

const SourceDonut = ({ title = 'Traffic source mix', data }: Props) => {
  const total = data.reduce((a, r) => a + r.count, 0);

  if (total === 0) {
    return (
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <EmptyState message="No new patients in this window." />
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-xl p-4 shadow-sm border border-border"
      role="region"
      aria-label={title}
    >
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{fmtInt(total)} patients</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="source"
                innerRadius={42}
                outerRadius={72}
                paddingAngle={1.5}
                strokeWidth={0}
                isAnimationActive={false}
              >
                {data.map(d => (
                  <Cell key={d.source} fill={SOURCE_COLOR[d.source] ?? 'hsl(0 0% 70%)'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, _name, item) => [
                  `${fmtInt(value)} (${fmtPct(item.payload.share)})`,
                  item.payload.source,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex-1 space-y-1.5 text-xs w-full">
          {data.map(row => (
            <li key={row.source} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: SOURCE_COLOR[row.source] ?? 'hsl(0 0% 70%)' }}
              />
              <span className="text-foreground flex-1 truncate">{row.source}</span>
              <span className="text-muted-foreground tabular-nums">
                {fmtInt(row.count)} · {fmtPct(row.share)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SourceDonut;
