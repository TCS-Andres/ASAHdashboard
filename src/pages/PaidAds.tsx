import { ExternalLink } from 'lucide-react';
import { useDateRange, PRESET_LABELS } from '@/lib/dateRange';
import { activeClient } from '@/config/clients';

const PaidAds = () => {
  const { range } = useDateRange();
  const leadTool = activeClient.externalLinks.leadTool;
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paid Ads</h1>
          <p className="text-sm text-muted-foreground">{PRESET_LABELS[range.preset]}</p>
        </div>
        <a
          href={leadTool.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:brightness-110"
        >
          {leadTool.label}
          <ExternalLink size={14} />
        </a>
      </header>
      <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
        <p className="text-muted-foreground">
          Phase 6 will fill this with Meta campaign metrics, spend trends, and the quiz funnel. Individual lead data lives in the CRM, not here.
        </p>
      </div>
    </div>
  );
};

export default PaidAds;
