import type { PatientSource } from '@/lib/data';

// Shared color mapping for any visualization that splits by patient source.
// Keeps the donut, stacked bar, and table legend in sync.
export const SOURCE_COLOR: Record<PatientSource, string> = {
  'Facebook Ads': 'hsl(var(--sage))',
  'Physician Referral': 'hsl(var(--terracotta))',
  'Google Organic': 'hsl(var(--mustard))',
  'Google Ads': 'hsl(36 60% 48%)',
  'Direct Referral': 'hsl(153 30% 35%)',
  'Walk-In': 'hsl(14 40% 65%)',
  Other: 'hsl(0 0% 70%)',
};

export const SOURCE_ORDER: PatientSource[] = [
  'Facebook Ads',
  'Physician Referral',
  'Google Organic',
  'Google Ads',
  'Direct Referral',
  'Walk-In',
  'Other',
];
