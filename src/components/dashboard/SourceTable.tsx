import { fmtCurrency, fmtInt, fmtPct } from '@/lib/format';
import type { PatientSource, RevenueBySource, SourceShare } from '@/lib/data';
import { SOURCE_COLOR } from './sourcePalette';

type Row =
  | (SourceShare & { kind: 'count' })
  | (RevenueBySource & { kind: 'revenue' });

interface Props {
  title: string;
  subtitle?: string;
  kind: 'count' | 'revenue';
  data: SourceShare[] | RevenueBySource[];
}

const SourceTable = ({ title, subtitle, kind, data }: Props) => {
  const rows: Row[] = (data as Array<SourceShare | RevenueBySource>).map(d =>
    kind === 'count'
      ? { ...(d as SourceShare), kind: 'count' as const }
      : { ...(d as RevenueBySource), kind: 'revenue' as const },
  );

  const valueLabel = kind === 'count' ? 'Patients' : 'Revenue';
  const fmtValue = (row: Row): string =>
    row.kind === 'count' ? fmtInt(row.count) : fmtCurrency(row.revenue, { compact: true });

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-border bg-muted/30">
            <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
            <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{valueLabel}</th>
            <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.source} className="border-b border-border/40 last:border-b-0">
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: SOURCE_COLOR[row.source as PatientSource] }}
                  />
                  <span className="text-foreground">{row.source}</span>
                </span>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{fmtValue(row)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                {fmtPct(row.share)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SourceTable;
