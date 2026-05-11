import { fmtCurrency, fmtInt, fmtPct } from '@/lib/format';
import type { CampaignRow } from '@/lib/data';

interface Props {
  rows: CampaignRow[];
  subtitle?: string;
}

const STATUS_STYLE: Record<CampaignRow['status'], string> = {
  Active: 'bg-primary/10 text-primary',
  Paused: 'bg-amber-100 text-amber-700',
  Ended: 'bg-muted text-muted-foreground',
};

const CampaignTable = ({ rows, subtitle }: Props) => (
  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
    <div className="px-4 pt-4 pb-2 flex items-baseline justify-between">
      <h2 className="text-sm font-semibold text-foreground">Campaigns</h2>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-border bg-muted/30">
            <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campaign</th>
            <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            <Th>Spend</Th>
            <Th>Impressions</Th>
            <Th>CTR</Th>
            <Th>Leads</Th>
            <Th>CPL</Th>
            <Th>CPA</Th>
            <Th>ROAS</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                No campaigns in this window.
              </td>
            </tr>
          ) : (
            rows.map(c => (
              <tr key={c.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/30">
                <td className="px-4 py-2.5">
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-[11px] text-muted-foreground ml-2">{c.channel}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <Cell>{fmtCurrency(c.spend, { compact: true })}</Cell>
                <Cell>{fmtInt(c.impressions)}</Cell>
                <Cell>{fmtPct(c.ctr, 2)}</Cell>
                <Cell>{fmtInt(c.leads)}</Cell>
                <Cell>{fmtCurrency(c.cpl)}</Cell>
                <Cell>{c.cpa > 0 ? fmtCurrency(c.cpa) : '—'}</Cell>
                <Cell strong>{c.roas.toFixed(2)}×</Cell>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{children}</th>
);

const Cell = ({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) => (
  <td
    className={`px-4 py-2.5 text-right tabular-nums ${
      strong ? 'font-medium text-primary' : 'text-foreground'
    }`}
  >
    {children}
  </td>
);

export default CampaignTable;
