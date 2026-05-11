import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface Props {
  /** Optional icon override. Defaults to Inbox. */
  icon?: LucideIcon;
  /** Headline shown beneath the icon. */
  title?: string;
  /** Sub-line. Use to explain why there's nothing to show. */
  message?: string;
  /** Compact mode: smaller padding for inline use inside chart cards. */
  compact?: boolean;
}

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data',
  message = 'Nothing to show in this window.',
  compact = false,
}: Props) => (
  <div
    className={`flex flex-col items-center justify-center text-center ${
      compact ? 'py-8' : 'py-16'
    }`}
    role="status"
  >
    <Icon size={compact ? 24 : 32} className="text-muted-foreground/40 mb-2" aria-hidden />
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-xs">{message}</p>
  </div>
);

export default EmptyState;
