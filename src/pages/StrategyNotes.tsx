import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoteEditor from '@/components/dashboard/NoteEditor';
import { useNotes, type NoteEntry } from '@/lib/notes';

const TAG_STYLE: Record<string, string> = {
  campaign: 'bg-primary/10 text-primary',
  channel: 'bg-blue-100 text-blue-700',
  decision: 'bg-amber-100 text-amber-700',
  experiment: 'bg-purple-100 text-purple-700',
};

const tagClass = (tag: string) => TAG_STYLE[tag] ?? 'bg-muted text-muted-foreground';

const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const StrategyNotes = () => {
  const { notes, save, remove } = useNotes();
  const [editing, setEditing] = useState<NoteEntry | null>(null);
  const [open, setOpen] = useState(false);

  const sorted = useMemo(
    () => [...notes].sort((a, b) => b.date.localeCompare(a.date)),
    [notes],
  );

  const handleSave = (entry: NoteEntry) => save(entry);
  const handleDelete = (id: string) => remove(id);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Strategy &amp; Notes</h1>
          <p className="text-sm text-muted-foreground">
            Fractional CMO journal — decisions, experiments, and campaign context.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="gap-1.5"
        >
          <Plus size={16} />
          New entry
        </Button>
      </header>

      <p className="text-[11px] text-muted-foreground/80">
        Notes are operational and marketing-focused. Do not include patient names or any health
        information.
      </p>

      {sorted.length === 0 ? (
        <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
          <p className="text-sm text-muted-foreground">No entries yet.</p>
          <Button
            variant="outline"
            className="mt-4 gap-1.5"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus size={16} />
            Add your first entry
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map(entry => (
            <li
              key={entry.id}
              className="bg-card rounded-xl p-5 shadow-sm border border-border"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground tabular-nums">{formatDate(entry.date)}</p>
                  <h2 className="text-base font-semibold text-foreground mt-0.5">{entry.title}</h2>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${tagClass(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-1.5 shrink-0"
                  onClick={() => {
                    setEditing(entry);
                    setOpen(true);
                  }}
                  aria-label={`Edit ${entry.title}`}
                >
                  <Pencil size={14} />
                  Edit
                </Button>
              </div>

              {entry.body && (
                <div className="prose prose-sm dark:prose-invert max-w-none mt-3 prose-p:my-2 prose-ul:my-2 prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
                  <ReactMarkdown>{entry.body}</ReactMarkdown>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <NoteEditor
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
      />
    </div>
  );
};

export default StrategyNotes;
