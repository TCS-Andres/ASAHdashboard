import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TAG_PRESETS, type NoteEntry } from '@/lib/notes';

interface Props {
  open: boolean;
  initial: NoteEntry | null;
  onClose: () => void;
  onSave: (entry: NoteEntry) => void;
  onDelete?: (id: string) => void;
}

const blankEntry = (): NoteEntry => ({
  id: '',
  date: new Date().toISOString().slice(0, 10),
  title: '',
  body: '',
  tags: [],
});

const NoteEditor = ({ open, initial, onClose, onSave, onDelete }: Props) => {
  const [draft, setDraft] = useState<NoteEntry>(initial ?? blankEntry());

  useEffect(() => {
    if (open) setDraft(initial ?? blankEntry());
  }, [open, initial]);

  const toggleTag = (tag: string) => {
    setDraft(d => ({
      ...d,
      tags: d.tags.includes(tag) ? d.tags.filter(t => t !== tag) : [...d.tags, tag],
    }));
  };

  const handleSave = () => {
    if (!draft.title.trim()) return;
    onSave({
      ...draft,
      id: draft.id || `note-${Date.now()}`,
      title: draft.title.trim(),
      body: draft.body,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!initial || !onDelete) return;
    onDelete(initial.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit entry' : 'New entry'}</DialogTitle>
          <DialogDescription>
            Marketing operations only. Do not include patient names or any health information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="note-date">Date</Label>
              <Input
                id="note-date"
                type="date"
                value={draft.date}
                onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={draft.title}
                onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                placeholder="e.g. Increased Facebook spend on Sleep Apnea Quiz"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-body">Body (markdown supported)</Label>
            <Textarea
              id="note-body"
              rows={10}
              value={draft.body}
              onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
              placeholder={'**Why:** what changed and why\n\n**Watch:** what would flip this decision'}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_PRESETS.map(tag => {
                const active = draft.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
          {initial && onDelete ? (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!draft.title.trim()}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditor;
