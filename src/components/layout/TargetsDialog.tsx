import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TARGET_FIELDS,
  effectiveTargets,
  isoMonth,
  usePracticeData,
  type MonthlyTargets,
} from '@/lib/practice';

const blankDraft = (defaults: MonthlyTargets, override: MonthlyTargets): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const f of TARGET_FIELDS) {
    const v = override[f.key] ?? defaults[f.key];
    out[f.key] = v != null ? String(v) : '';
  }
  return out;
};

const TargetsDialog = () => {
  const { data, setDefaults, setTargets, clearTargets } = usePracticeData();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<'default' | 'month'>('default');
  const month = isoMonth();
  const monthOverride = data.targetsByMonth[month] ?? {};
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    blankDraft(data.defaults, scope === 'month' ? monthOverride : {}),
  );

  useEffect(() => {
    if (open) {
      setDraft(blankDraft(scope === 'default' ? data.defaults : effectiveTargets(data, month), scope === 'month' ? monthOverride : {}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scope, month]);

  const handleSave = () => {
    const cleaned: MonthlyTargets = {};
    for (const f of TARGET_FIELDS) {
      const raw = draft[f.key]?.trim();
      if (!raw) continue;
      const n = Number(raw.replace(/[^0-9.]/g, ''));
      if (Number.isFinite(n) && n >= 0) cleaned[f.key] = Math.round(n * 100) / 100;
    }
    if (scope === 'default') setDefaults(cleaned);
    else setTargets(month, cleaned);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Target size={16} />
          <span className="hidden sm:inline">Targets</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Monthly targets</DialogTitle>
          <DialogDescription>
            Set goals for the practice. Defaults apply to every month; per-month overrides take
            precedence when present.
          </DialogDescription>
        </DialogHeader>

        <div role="tablist" className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30 text-xs">
          <button
            role="tab"
            aria-selected={scope === 'default'}
            onClick={() => setScope('default')}
            className={`px-3 py-1.5 rounded-md font-medium ${scope === 'default' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Default (all months)
          </button>
          <button
            role="tab"
            aria-selected={scope === 'month'}
            onClick={() => setScope('month')}
            className={`px-3 py-1.5 rounded-md font-medium ${scope === 'month' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Override · {month}
          </button>
        </div>

        <div className="space-y-3 py-1">
          {TARGET_FIELDS.map(f => (
            <div key={f.key} className="grid grid-cols-[1fr_140px] items-center gap-3">
              <Label htmlFor={`tgt-${f.key}`}>
                {f.label}
                <span className="text-[10px] text-muted-foreground ml-1.5">
                  {f.unit === 'usd' ? '($)' : f.unit === 'pct' ? '(%)' : '(count)'}
                </span>
              </Label>
              <Input
                id={`tgt-${f.key}`}
                inputMode="numeric"
                value={draft[f.key] ?? ''}
                onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                placeholder={scope === 'month' ? `default ${data.defaults[f.key] ?? '—'}` : ''}
              />
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Need to set a target for a different month or back-fill prior periods?{' '}
          <Link
            to="/data"
            className="text-primary hover:underline"
            onClick={() => setOpen(false)}
          >
            Open the full data editor →
          </Link>
        </p>

        <DialogFooter className="flex flex-row sm:justify-between gap-2">
          {scope === 'month' && Object.keys(monthOverride).length > 0 ? (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                clearTargets(month);
                setOpen(false);
              }}
            >
              Clear override
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TargetsDialog;
