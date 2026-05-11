import { Eye, Megaphone, Percent, Users } from 'lucide-react';
import KpiCard from './KpiCard';
import { fmtInt, fmtPct } from '@/lib/format';
import type { SocialKpis } from '@/lib/data';

interface Props {
  kpis: SocialKpis;
  vsLabel?: string;
}

const SocialKpiStrip = ({ kpis, vsLabel }: Props) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <KpiCard
      label="Followers"
      value={fmtInt(kpis.followers.current)}
      deltaPct={kpis.followers.deltaPct}
      icon={Users}
      vsLabel={vsLabel}
    />
    <KpiCard
      label="Reach"
      value={fmtInt(kpis.reach.current)}
      deltaPct={kpis.reach.deltaPct}
      icon={Eye}
      vsLabel={vsLabel}
    />
    <KpiCard
      label="Impressions"
      value={fmtInt(kpis.impressions.current)}
      deltaPct={kpis.impressions.deltaPct}
      icon={Megaphone}
      vsLabel={vsLabel}
    />
    <KpiCard
      label="Engagement rate"
      value={fmtPct(kpis.engagementRate.current, 1)}
      deltaPct={kpis.engagementRate.deltaPct}
      icon={Percent}
      vsLabel={vsLabel}
    />
  </div>
);

export default SocialKpiStrip;
