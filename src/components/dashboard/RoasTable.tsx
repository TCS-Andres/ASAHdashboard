import { fmtCurrency } from '@/lib/format';
import type { ChannelRoas } from '@/lib/data';

interface Props {
  data: ChannelRoas[];
  subtitle?: string;
}

const RoasTable = ({ data, subtitle }: Props) => (
  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">ROAS by channel</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    <table className="w-full text-sm">
      <thead>
        <tr className="border-y border-border bg-muted/30">
          <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channel</th>
          <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spend</th>
          <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
          <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ROAS</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.channel} className="border-b border-border/40 last:border-b-0">
            <td className="px-4 py-2.5 text-foreground">{row.channel}</td>
            <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
              {fmtCurrency(row.spend, { compact: true })}
            </td>
            <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
              {fmtCurrency(row.revenue, { compact: true })}
            </td>
            <td className="px-4 py-2.5 text-right tabular-nums font-medium text-primary">{row.roas.toFixed(2)}×</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RoasTable;
