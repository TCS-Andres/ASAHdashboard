// Practice operational data store: per-month TARGETS (goals) and per-month
// ACTUALS (what really happened), persisted in localStorage per client.
//
// This replaces the older targets-only store. Supersedes src/lib/targets.ts;
// the legacy `useTargets` export is preserved for the topbar quick-edit dialog.
//
// HIPAA: targets and actuals are operational aggregates (dollars, counts,
// rates). They are NOT PHI. Storing them in localStorage is safe.

import { useEffect, useState } from 'react';
import { activeClient } from '@/config/clients';

// ─── Schema ────────────────────────────────────────────────────────────────

/** Goals for a given month. Any field is optional — undefined inherits the default. */
export interface MonthlyTargets {
  /** Monthly revenue goal in USD. */
  revenue?: number;
  /** Monthly new-patient goal. */
  newPatients?: number;
  /** Lead-to-patient conversion goal as a percentage value (e.g. 22 = 22%). */
  leadToPatientPct?: number;
  /** Cost-per-acquisition goal in USD (lower = better). */
  costPerAcquisition?: number;
  /** Total monthly ad spend goal in USD. */
  adSpend?: number;
}

export const TARGET_FIELDS: Array<{
  key: keyof MonthlyTargets;
  label: string;
  unit: 'usd' | 'count' | 'pct';
  /** True when "lower is better" (e.g. CPA). Drives delta coloring. */
  invertDelta?: boolean;
}> = [
  { key: 'revenue', label: 'Revenue', unit: 'usd' },
  { key: 'newPatients', label: 'New patients', unit: 'count' },
  { key: 'adSpend', label: 'Ad spend', unit: 'usd' },
  { key: 'leadToPatientPct', label: 'Lead → patient', unit: 'pct' },
  { key: 'costPerAcquisition', label: 'Cost per acquisition', unit: 'usd', invertDelta: true },
];

/** What actually happened in a given month, as the practice records it. */
export interface MonthlyActuals {
  revenue?: number;
  newPatients?: number;
  returningPatients?: number;
  leads?: number;
  adSpend?: number;
}

export const ACTUAL_FIELDS: Array<{
  key: keyof MonthlyActuals;
  label: string;
  unit: 'usd' | 'count';
}> = [
  { key: 'revenue', label: 'Revenue', unit: 'usd' },
  { key: 'newPatients', label: 'New patients', unit: 'count' },
  { key: 'returningPatients', label: 'Returning patients', unit: 'count' },
  { key: 'leads', label: 'Leads', unit: 'count' },
  { key: 'adSpend', label: 'Ad spend', unit: 'usd' },
];

interface PracticeData {
  /** Defaults applied to any month with no specific override. */
  defaults: MonthlyTargets;
  /** Per-month target overrides. Key = "YYYY-MM". */
  targetsByMonth: Record<string, MonthlyTargets>;
  /** Per-month actuals. Key = "YYYY-MM". */
  actualsByMonth: Record<string, MonthlyActuals>;
}

// ─── Backwards-compat shim for the old useTargets() shape ──────────────────
// Older code (TargetsDialog, fetchPacing) treats targets as a flat object
// with two named fields. Adapt it through this Targets type.

export interface Targets {
  monthlyRevenue: number;
  monthlyNewPatients: number;
}

// ─── Storage ───────────────────────────────────────────────────────────────

const KEY = (clientId: string) => `asah:practice:${clientId}`;
const LEGACY_TARGETS_KEY = (clientId: string) => `asah:targets:${clientId}`;
const CHANGE_EVENT = 'asah:practice-changed';

function emptyData(): PracticeData {
  return {
    defaults: {
      revenue: activeClient.defaultTargets.monthlyRevenue,
      newPatients: activeClient.defaultTargets.monthlyNewPatients,
    },
    targetsByMonth: {},
    actualsByMonth: {},
  };
}

function readData(clientId: string): PracticeData {
  if (typeof window === 'undefined') return emptyData();
  try {
    const raw = localStorage.getItem(KEY(clientId));
    if (raw) return mergeWithEmpty(JSON.parse(raw) as Partial<PracticeData>);
    // Migrate the old single-object targets store if present.
    const legacyRaw = localStorage.getItem(LEGACY_TARGETS_KEY(clientId));
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as Partial<Targets>;
      return {
        ...emptyData(),
        defaults: {
          revenue: typeof legacy.monthlyRevenue === 'number' ? legacy.monthlyRevenue : activeClient.defaultTargets.monthlyRevenue,
          newPatients: typeof legacy.monthlyNewPatients === 'number' ? legacy.monthlyNewPatients : activeClient.defaultTargets.monthlyNewPatients,
        },
      };
    }
    return emptyData();
  } catch {
    return emptyData();
  }
}

function mergeWithEmpty(partial: Partial<PracticeData>): PracticeData {
  const base = emptyData();
  return {
    defaults: { ...base.defaults, ...(partial.defaults ?? {}) },
    targetsByMonth: partial.targetsByMonth ?? {},
    actualsByMonth: partial.actualsByMonth ?? {},
  };
}

function writeData(clientId: string, data: PracticeData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY(clientId), JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { clientId } }));
}

// ─── Pure getters (resolve effective values for a month) ───────────────────

export function effectiveTargets(data: PracticeData, month: string): MonthlyTargets {
  return { ...data.defaults, ...(data.targetsByMonth[month] ?? {}) };
}

export function effectiveActuals(data: PracticeData, month: string): MonthlyActuals {
  return data.actualsByMonth[month] ?? {};
}

export function isoMonth(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// ─── React hook: subscribes to all practice data ───────────────────────────

export function usePracticeData(): {
  data: PracticeData;
  setDefaults: (next: MonthlyTargets) => void;
  setTargets: (month: string, next: MonthlyTargets) => void;
  clearTargets: (month: string) => void;
  setActuals: (month: string, next: MonthlyActuals) => void;
  clearActuals: (month: string) => void;
  /** Wipe the entire practice store. Useful during demos. */
  reset: () => void;
} {
  const [data, set] = useState<PracticeData>(() => readData(activeClient.id));

  useEffect(() => {
    const onChange = () => set(readData(activeClient.id));
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const update = (mut: (d: PracticeData) => PracticeData) => {
    const next = mut(readData(activeClient.id));
    writeData(activeClient.id, next);
    set(next);
  };

  return {
    data,
    setDefaults: next => update(d => ({ ...d, defaults: { ...d.defaults, ...sanitize(next) } })),
    setTargets: (month, next) =>
      update(d => ({
        ...d,
        targetsByMonth: { ...d.targetsByMonth, [month]: { ...(d.targetsByMonth[month] ?? {}), ...sanitize(next) } },
      })),
    clearTargets: month =>
      update(d => {
        const { [month]: _drop, ...rest } = d.targetsByMonth;
        void _drop;
        return { ...d, targetsByMonth: rest };
      }),
    setActuals: (month, next) =>
      update(d => ({
        ...d,
        actualsByMonth: { ...d.actualsByMonth, [month]: { ...(d.actualsByMonth[month] ?? {}), ...sanitize(next) } },
      })),
    clearActuals: month =>
      update(d => {
        const { [month]: _drop, ...rest } = d.actualsByMonth;
        void _drop;
        return { ...d, actualsByMonth: rest };
      }),
    reset: () => update(() => emptyData()),
  };
}

function sanitize<T extends Record<string, number | undefined>>(input: T): T {
  const out = {} as T;
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null || (typeof v === 'string' && (v as string).trim() === '')) continue;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n) && n >= 0) (out as Record<string, number>)[k] = n;
  }
  return out;
}

// ─── Backwards-compat: useTargets() against the new store ──────────────────
// Returns the *current month's* effective Revenue/Patients targets, plus a
// setter that writes to defaults (the old behavior).

export function useTargets(): [Targets, (patch: Partial<Targets>) => void] {
  const { data, setDefaults } = usePracticeData();
  const eff = effectiveTargets(data, isoMonth());
  const targets: Targets = {
    monthlyRevenue: eff.revenue ?? activeClient.defaultTargets.monthlyRevenue,
    monthlyNewPatients: eff.newPatients ?? activeClient.defaultTargets.monthlyNewPatients,
  };

  const update = (patch: Partial<Targets>) =>
    setDefaults({
      ...(patch.monthlyRevenue !== undefined ? { revenue: patch.monthlyRevenue } : {}),
      ...(patch.monthlyNewPatients !== undefined ? { newPatients: patch.monthlyNewPatients } : {}),
    });

  return [targets, update];
}
