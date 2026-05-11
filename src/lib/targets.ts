// Editable monthly targets, persisted per-client in localStorage.
//
// Targets are NOT PHI — they're aggregate operational goals (monthly revenue
// and monthly new-patient count) set by the practice owner or CMO. They
// drive pacing visualizations on the Revenue and Patient Acquisition tabs.
//
// Storage is keyed by client id so multi-tenancy works without code changes.

import { useEffect, useState } from 'react';
import { activeClient } from '@/config/clients';

export interface Targets {
  monthlyRevenue: number;
  monthlyNewPatients: number;
}

const storageKey = (clientId: string) => `asah:targets:${clientId}`;

function readTargets(clientId: string): Targets {
  if (typeof window === 'undefined') return activeClient.defaultTargets;
  try {
    const raw = localStorage.getItem(storageKey(clientId));
    if (!raw) return activeClient.defaultTargets;
    const parsed = JSON.parse(raw) as Partial<Targets>;
    return {
      monthlyRevenue:
        typeof parsed.monthlyRevenue === 'number' && parsed.monthlyRevenue >= 0
          ? parsed.monthlyRevenue
          : activeClient.defaultTargets.monthlyRevenue,
      monthlyNewPatients:
        typeof parsed.monthlyNewPatients === 'number' && parsed.monthlyNewPatients >= 0
          ? parsed.monthlyNewPatients
          : activeClient.defaultTargets.monthlyNewPatients,
    };
  } catch {
    return activeClient.defaultTargets;
  }
}

function writeTargets(clientId: string, targets: Targets): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(clientId), JSON.stringify(targets));
  // Notify other components in this tab; storage events only fire across tabs.
  window.dispatchEvent(new CustomEvent('asah:targets-changed', { detail: { clientId } }));
}

export function getTargets(): Targets {
  return readTargets(activeClient.id);
}

export function setTargets(patch: Partial<Targets>): Targets {
  const next = { ...readTargets(activeClient.id), ...patch };
  writeTargets(activeClient.id, next);
  return next;
}

/** Subscribe a component to the current targets. Re-renders on changes. */
export function useTargets(): [Targets, (patch: Partial<Targets>) => void] {
  const [targets, set] = useState<Targets>(() => readTargets(activeClient.id));

  useEffect(() => {
    const onChange = () => set(readTargets(activeClient.id));
    window.addEventListener('asah:targets-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('asah:targets-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const update = (patch: Partial<Targets>) => set(setTargets(patch));
  return [targets, update];
}
