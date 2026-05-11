// Number / currency / percent formatters used across dashboard components.

const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fullCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

export const fmtCurrency = (n: number, opts: { compact?: boolean } = {}): string =>
  opts.compact ? compactCurrency.format(n) : fullCurrency.format(n);

export const fmtInt = (n: number): string => integer.format(n);

export const fmtPct = (fraction: number, fractionDigits = 1): string =>
  `${(fraction * 100).toFixed(fractionDigits)}%`;

/** Format a delta percentage (e.g., 0.124) with sign and 1 decimal: "+12.4%". */
export const fmtDeltaPct = (delta: number | null): string => {
  if (delta === null) return '—';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${oneDecimal.format(delta * 100)}%`;
};

/** Format an ISO month like "2026-04" to "Apr". */
export const fmtMonthShort = (isoMonth: string): string => {
  const [y, m] = isoMonth.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, 1).toLocaleString('en-US', { month: 'short' });
};

/** Tailwind text color class for a delta value, where positive = good. */
export const deltaColorClass = (delta: number | null, invert = false): string => {
  if (delta === null || delta === 0) return 'text-muted-foreground';
  const positive = invert ? delta < 0 : delta > 0;
  return positive ? 'text-primary' : 'text-destructive';
};
