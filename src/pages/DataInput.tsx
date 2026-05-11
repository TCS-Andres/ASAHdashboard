import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ACTUAL_FIELDS,
  TARGET_FIELDS,
  effectiveTargets,
  isoMonth,
  usePracticeData,
  type MonthlyActuals,
  type MonthlyTargets,
} from '@/lib/practice';
import { fmtMonthShort } from '@/lib/format';

const MONTHS_TO_SHOW = 18;

function trailingMonths(count: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(isoMonth(d));
  }
  return out;
}

const DataInput = () => {
  const { data, setTargets, setActuals, clearActuals, clearTargets, setDefaults, reset } =
    usePracticeData();
  const [view, setView] = useState<'targets' | 'actuals'>('actuals');
  const [windowEnd, setWindowEnd] = useState(0); // 0 = "current month is last"

  const months = useMemo(() => {
    const all = trailingMonths(MONTHS_TO_SHOW);
    if (windowEnd === 0) return all;
    // Allow scrolling further back; cap at 36 months total.
    const extra: string[] = [];
    const now = new Date();
    for (let i = MONTHS_TO_SHOW + windowEnd * 6 - 1; i >= windowEnd * 6; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      extra.push(isoMonth(d));
    }
    return extra;
  }, [windowEnd]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data</h1>
          <p className="text-sm text-muted-foreground">
            Enter monthly actuals and per-month target overrides. Anything left blank uses the
            default target or the mock fallback.
          </p>
        </div>
        <div role="tablist" className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30 text-xs">
          <button
            role="tab"
            aria-selected={view === 'actuals'}
            onClick={() => setView('actuals')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              view === 'actuals' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Actuals
          </button>
          <button
            role="tab"
            aria-selected={view === 'targets'}
            onClick={() => setView('targets')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              view === 'targets' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Targets
          </button>
        </div>
      </header>

      <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Default targets</h2>
        <p className="text-xs text-muted-foreground">
          These apply to every month unless overridden in the Targets table below.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {TARGET_FIELDS.map(f => (
            <DefaultField
              key={f.key}
              fieldKey={f.key}
              label={f.label}
              unit={f.unit}
              value={data.defaults[f.key]}
              onCommit={n => setDefaults({ [f.key]: n } as MonthlyTargets)}
            />
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {view === 'actuals' ? 'Monthly actuals' : 'Per-month target overrides'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {view === 'actuals'
                ? 'What really happened. Cells you fill in replace the mock data on every chart.'
                : 'Override the default target for a specific month. Blank cells use the default.'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWindowEnd(w => w + 1)}
              aria-label="Older months"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWindowEnd(w => Math.max(0, w - 1))}
              disabled={windowEnd === 0}
              aria-label="Newer months"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-0 bg-muted/30">
                  Month
                </th>
                {(view === 'actuals' ? ACTUAL_FIELDS : TARGET_FIELDS).map(f => (
                  <th
                    key={f.key}
                    className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                  >
                    {f.label}
                  </th>
                ))}
                <th className="px-2 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {months.map(month => (
                <MonthRow
                  key={month + view}
                  month={month}
                  view={view}
                  defaults={data.defaults}
                  override={data.targetsByMonth[month] ?? {}}
                  actuals={data.actualsByMonth[month] ?? {}}
                  onActualsCommit={(field, n) =>
                    n === null
                      ? setActuals(month, { [field]: undefined } as MonthlyActuals)
                      : setActuals(month, { [field]: n } as MonthlyActuals)
                  }
                  onTargetsCommit={(field, n) =>
                    n === null
                      ? setTargets(month, { [field]: undefined } as MonthlyTargets)
                      : setTargets(month, { [field]: n } as MonthlyTargets)
                  }
                  onClearRow={() => (view === 'actuals' ? clearActuals(month) : clearTargets(month))}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => {
            if (window.confirm('Reset all entered data? This wipes targets and actuals for this client.')) {
              reset();
            }
          }}
        >
          Reset all entered data
        </Button>
      </div>
    </div>
  );
};

interface MonthRowProps {
  month: string;
  view: 'actuals' | 'targets';
  defaults: MonthlyTargets;
  override: MonthlyTargets;
  actuals: MonthlyActuals;
  onActualsCommit: (field: keyof MonthlyActuals, value: number | null) => void;
  onTargetsCommit: (field: keyof MonthlyTargets, value: number | null) => void;
  onClearRow: () => void;
}

const MonthRow = ({
  month,
  view,
  defaults,
  override,
  actuals,
  onActualsCommit,
  onTargetsCommit,
  onClearRow,
}: MonthRowProps) => {
  const isCurrent = month === isoMonth();
  const fields = view === 'actuals' ? ACTUAL_FIELDS : TARGET_FIELDS;

  return (
    <tr className={`border-b border-border/40 last:border-b-0 ${isCurrent ? 'bg-primary/5' : ''}`}>
      <td className="px-4 py-2 text-foreground font-medium tabular-nums sticky left-0 bg-card">
        <span>{fmtMonthShort(month)}</span>
        <span className="text-muted-foreground ml-1.5 text-xs">{month.split('-')[0]}</span>
        {isCurrent && (
          <span className="ml-2 text-[10px] uppercase tracking-wider text-primary font-semibold">now</span>
        )}
      </td>
      {fields.map(f => {
        const isActuals = view === 'actuals';
        const stored = isActuals
          ? (actuals as Record<string, number | undefined>)[f.key]
          : (override as Record<string, number | undefined>)[f.key];
        const placeholder = isActuals ? '—' : `default ${defaults[f.key as keyof MonthlyTargets] ?? '—'}`;
        return (
          <td key={f.key} className="px-2 py-1.5 text-right">
            <CellInput
              value={stored}
              placeholder={placeholder}
              unit={f.unit}
              onCommit={n =>
                isActuals
                  ? onActualsCommit(f.key as keyof MonthlyActuals, n)
                  : onTargetsCommit(f.key as keyof MonthlyTargets, n)
              }
            />
          </td>
        );
      })}
      <td className="px-2 py-1.5">
        <button
          onClick={onClearRow}
          aria-label={`Clear ${view} for ${month}`}
          className="text-muted-foreground hover:text-destructive p-1 rounded"
          title={`Clear ${view} for this month`}
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
};

interface CellInputProps {
  value: number | undefined;
  placeholder: string;
  unit: 'usd' | 'count' | 'pct';
  onCommit: (value: number | null) => void;
}

const CellInput = ({ value, placeholder, unit, onCommit }: CellInputProps) => {
  const [local, setLocal] = useState(value != null ? String(value) : '');

  const commit = () => {
    const trimmed = local.trim();
    if (trimmed === '') {
      onCommit(null);
      return;
    }
    const n = Number(trimmed.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n) && n >= 0) onCommit(Math.round(n * 100) / 100);
  };

  const symbol = unit === 'usd' ? '$' : unit === 'pct' ? '%' : '';

  return (
    <div className="inline-flex items-center bg-background border border-border rounded-md focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary">
      {unit === 'usd' && <span className="pl-2 text-xs text-muted-foreground">{symbol}</span>}
      <Input
        inputMode="decimal"
        defaultValue={value != null ? String(value) : ''}
        onChange={e => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        placeholder={placeholder}
        className="border-0 shadow-none focus-visible:ring-0 h-8 text-right tabular-nums px-2 w-28"
      />
      {unit === 'pct' && <span className="pr-2 text-xs text-muted-foreground">{symbol}</span>}
    </div>
  );
};

interface DefaultFieldProps {
  fieldKey: string;
  label: string;
  unit: 'usd' | 'count' | 'pct';
  value: number | undefined;
  onCommit: (value: number) => void;
}

const DefaultField = ({ label, unit, value, onCommit }: DefaultFieldProps) => {
  const [local, setLocal] = useState(value != null ? String(value) : '');
  const symbol = unit === 'usd' ? '$' : unit === 'pct' ? '%' : '';

  const commit = () => {
    const trimmed = local.trim();
    if (trimmed === '') return;
    const n = Number(trimmed.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n) && n >= 0) onCommit(Math.round(n * 100) / 100);
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground block">{label}</label>
      <div className="inline-flex items-center bg-background border border-border rounded-md w-full focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary">
        {unit === 'usd' && <span className="pl-2 text-xs text-muted-foreground">{symbol}</span>}
        <Input
          inputMode="decimal"
          defaultValue={value != null ? String(value) : ''}
          onChange={e => setLocal(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          className="border-0 shadow-none focus-visible:ring-0 h-9 text-right tabular-nums"
        />
        {unit === 'pct' && <span className="pr-2 text-xs text-muted-foreground">{symbol}</span>}
      </div>
    </div>
  );
};

export default DataInput;
