// Internal utilities for the mock data layer.
// PRNG + date helpers + small math helpers shared across mock modules.

import type { DailyPoint, Delta, FetchOptions } from './types';

// ─── PRNG ──────────────────────────────────────────────────────────────────
// Mulberry32 — small, fast, good enough for fake business numbers. Seeded so
// re-renders within the same conceptual window produce the same data.

export function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Anchor seed to a fixed scope so numbers are stable across re-renders. */
export function anchorSeed(scope: string): number {
  return hashString(`asah:${scope}`);
}

// ─── Number helpers ────────────────────────────────────────────────────────

export const round = (n: number, places = 0): number => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

/** Pick a number uniformly in [min, max]. */
export const between = (rng: () => number, min: number, max: number): number =>
  min + rng() * (max - min);

/** Multiplicative jitter: `value * (1 + amplitude * rand)` where rand is in [-1, 1]. */
export const jitter = (rng: () => number, value: number, amplitude: number): number =>
  value * (1 + amplitude * (rng() * 2 - 1));

export const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));

// ─── Date helpers ──────────────────────────────────────────────────────────

const PAD = (n: number) => String(n).padStart(2, '0');

export const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${PAD(d.getMonth() + 1)}-${PAD(d.getDate())}`;

export const toISOMonth = (d: Date): string =>
  `${d.getFullYear()}-${PAD(d.getMonth() + 1)}`;

export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

export function addMonths(d: Date, months: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + months, d.getDate());
}

/** Inclusive day count between two dates. */
export function dayCount(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

/** Iterate every date in [from, to], inclusive. */
export function eachDay(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  const cur = startOfDay(from);
  const end = startOfDay(to);
  while (cur.getTime() <= end.getTime()) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** Iterate the start-of-month for every month covered by [from, to], inclusive. */
export function eachMonth(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  const cur = startOfMonth(from);
  const end = startOfMonth(to);
  while (cur.getTime() <= end.getTime()) {
    out.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
}

/** Returns the last 12 month starts ending at the start of `to`'s month. */
export function lastTwelveMonths(to: Date): Date[] {
  const end = startOfMonth(to);
  const out: Date[] = [];
  for (let i = 11; i >= 0; i--) {
    out.push(new Date(end.getFullYear(), end.getMonth() - i, 1));
  }
  return out;
}

/** Equal-length window immediately before `opts`. Used for delta calcs. */
export function previousWindow(opts: FetchOptions): FetchOptions {
  const days = dayCount(opts.from, opts.to);
  const newTo = addDays(opts.from, -1);
  const newFrom = addDays(newTo, -(days - 1));
  return { from: newFrom, to: newTo };
}

// ─── Series + delta helpers ────────────────────────────────────────────────

/** Build a daily series for [from, to] using a per-day generator. */
export function buildDailySeries(
  opts: FetchOptions,
  gen: (date: Date, dayIndex: number) => number,
): DailyPoint[] {
  return eachDay(opts.from, opts.to).map((date, i) => ({
    date: toISODate(date),
    value: gen(date, i),
  }));
}

/** Compute a Delta from current and prior totals. */
export function makeDelta(current: number, previous: number): Delta {
  const deltaPct = previous === 0 ? null : (current - previous) / previous;
  return { current, previous, deltaPct };
}

/** Sum a numeric series. */
export const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);

/** Mean of a numeric series. Returns 0 for empty input. */
export const mean = (xs: number[]): number => (xs.length === 0 ? 0 : sum(xs) / xs.length);

/** Tiny async wrapper so mock fns are shaped like the real API. */
export const ok = <T>(value: T): Promise<T> => Promise.resolve(value);
