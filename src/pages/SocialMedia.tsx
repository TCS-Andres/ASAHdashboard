import { useDateRange, PRESET_LABELS } from '@/lib/dateRange';

const SocialMedia = () => {
  const { range } = useDateRange();
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Social Media</h1>
        <p className="text-sm text-muted-foreground">{PRESET_LABELS[range.preset]}</p>
      </header>
      <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
        <p className="text-muted-foreground">
          Phase 6 will fill this with per-channel reach, follower growth, engagement, and top posts (no user identifiers).
        </p>
      </div>
    </div>
  );
};

export default SocialMedia;
