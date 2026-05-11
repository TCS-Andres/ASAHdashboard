import { deltaColorClass, fmtDeltaPct, fmtInt, fmtPct } from '@/lib/format';
import type { SocialChannel, SocialKpis } from '@/lib/data';

interface Row {
  channel: SocialChannel;
  kpis: SocialKpis;
}

interface Props {
  rows: Row[];
  subtitle?: string;
}

const SocialComparisonTable = ({ rows, subtitle }: Props) => (
  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
    <div className="px-4 pt-4 pb-2 flex items-baseline justify-between">
      <h2 className="text-sm font-semibold text-foreground">Channel comparison</h2>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-border bg-muted/30">
            <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channel</th>
            <Th>Followers</Th>
            <Th>Reach</Th>
            <Th>Impressions</Th>
            <Th>Engagement rate</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.channel} className="border-b border-border/40 last:border-b-0">
              <td className="px-4 py-2.5 text-foreground">{r.channel}</td>
              <Cell value={fmtInt(r.kpis.followers.current)} delta={r.kpis.followers.deltaPct} />
              <Cell value={fmtInt(r.kpis.reach.current)} delta={r.kpis.reach.deltaPct} />
              <Cell value={fmtInt(r.kpis.impressions.current)} delta={r.kpis.impressions.deltaPct} />
              <Cell value={fmtPct(r.kpis.engagementRate.current, 1)} delta={r.kpis.engagementRate.deltaPct} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{children}</th>
);

const Cell = ({ value, delta }: { value: string; delta: number | null }) => (
  <td className="px-4 py-2.5 text-right">
    <div className="flex items-baseline justify-end gap-2 tabular-nums">
      <span className="text-foreground">{value}</span>
      <span className={`text-[11px] ${deltaColorClass(delta)}`}>{fmtDeltaPct(delta)}</span>
    </div>
  </td>
);

export default SocialComparisonTable;
