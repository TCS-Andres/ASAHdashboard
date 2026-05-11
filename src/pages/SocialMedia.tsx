import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDateRange, PRESET_LABELS } from '@/lib/dateRange';
import { fetchSocialChannel, fetchSocialComparison, type SocialChannel } from '@/lib/data';
import SocialKpiStrip from '@/components/dashboard/SocialKpiStrip';
import FollowerChart from '@/components/dashboard/FollowerChart';
import TopPostsList from '@/components/dashboard/TopPostsList';
import SocialComparisonTable from '@/components/dashboard/SocialComparisonTable';
import { Skeleton } from '@/components/ui/skeleton';

type View = SocialChannel | 'Compare';

const VIEWS: View[] = ['Compare', 'Facebook', 'Instagram', 'TikTok', 'YouTube', 'Google Business Profile'];

const SocialMedia = () => {
  const { range } = useDateRange();
  const [view, setView] = useState<View>('Compare');
  const opts = { from: range.from, to: range.to };
  const keyBase = [range.preset, range.from.toISOString(), range.to.toISOString()];
  const vsLabel = 'vs. prior period';

  const comparison = useQuery({
    queryKey: ['social-comparison', ...keyBase],
    queryFn: () => fetchSocialComparison(opts),
    enabled: view === 'Compare',
  });

  const channelData = useQuery({
    queryKey: ['social-channel', view, ...keyBase],
    queryFn: () => fetchSocialChannel(opts, view as SocialChannel),
    enabled: view !== 'Compare',
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Social Media</h1>
        <p className="text-sm text-muted-foreground">{PRESET_LABELS[range.preset]}</p>
      </header>

      <div className="flex gap-1.5 flex-wrap">
        {VIEWS.map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              view === v
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'Compare' ? (
        comparison.data ? (
          <SocialComparisonTable rows={comparison.data} subtitle={PRESET_LABELS[range.preset]} />
        ) : (
          <Skeleton className="h-72 w-full rounded-xl" />
        )
      ) : channelData.data ? (
        <div className="space-y-4">
          <SocialKpiStrip kpis={channelData.data.kpis} vsLabel={vsLabel} />
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FollowerChart data={channelData.data.followerSeries} channel={channelData.data.channel} />
            <TopPostsList posts={channelData.data.topPosts} />
          </section>
        </div>
      ) : (
        <Skeleton className="h-96 w-full rounded-xl" />
      )}
    </div>
  );
};

export default SocialMedia;
