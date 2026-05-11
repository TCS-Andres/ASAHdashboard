import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type DateRangePreset = '7d' | '30d' | '90d' | 'mtd' | 'last-month' | 'custom';

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  'mtd': 'This month',
  'last-month': 'Last month',
  'custom': 'Custom',
};

export interface DateRange {
  preset: DateRangePreset;
  from: Date;
  to: Date;
}

interface DateRangeContextValue {
  range: DateRange;
  setPreset: (preset: DateRangePreset) => void;
  setCustom: (from: Date, to: Date) => void;
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

function resolvePreset(preset: DateRangePreset, today = new Date()): DateRange {
  const to = new Date(today);
  to.setHours(23, 59, 59, 999);
  const from = new Date(today);
  from.setHours(0, 0, 0, 0);

  switch (preset) {
    case '7d':
      from.setDate(from.getDate() - 6);
      return { preset, from, to };
    case '30d':
      from.setDate(from.getDate() - 29);
      return { preset, from, to };
    case '90d':
      from.setDate(from.getDate() - 89);
      return { preset, from, to };
    case 'mtd':
      from.setDate(1);
      return { preset, from, to };
    case 'last-month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
      return { preset, from: start, to: end };
    }
    case 'custom':
      return { preset, from, to };
  }
}

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<DateRange>(() => resolvePreset('30d'));

  const value = useMemo<DateRangeContextValue>(
    () => ({
      range,
      setPreset: preset => setRange(resolvePreset(preset)),
      setCustom: (from, to) => setRange({ preset: 'custom', from, to }),
    }),
    [range],
  );

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
}

export function useDateRange() {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error('useDateRange must be used inside <DateRangeProvider>');
  return ctx;
}
