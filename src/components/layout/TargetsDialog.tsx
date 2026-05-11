import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
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
import { useTargets } from '@/lib/targets';

const TargetsDialog = () => {
  const [targets, update] = useTargets();
  const [open, setOpen] = useState(false);
  const [revenueDraft, setRevenueDraft] = useState(String(targets.monthlyRevenue));
  const [patientsDraft, setPatientsDraft] = useState(String(targets.monthlyNewPatients));

  // Re-seed drafts whenever the dialog opens with the latest stored values.
  useEffect(() => {
    if (open) {
      setRevenueDraft(String(targets.monthlyRevenue));
      setPatientsDraft(String(targets.monthlyNewPatients));
    }
  }, [open, targets.monthlyRevenue, targets.monthlyNewPatients]);

  const handleSave = () => {
    const revenue = Number(revenueDraft.replace(/[^0-9.]/g, ''));
    const patients = Number(patientsDraft.replace(/[^0-9.]/g, ''));
    update({
      monthlyRevenue: Number.isFinite(revenue) && revenue >= 0 ? Math.round(revenue) : targets.monthlyRevenue,
      monthlyNewPatients:
        Number.isFinite(patients) && patients >= 0 ? Math.round(patients) : targets.monthlyNewPatients,
    });
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Monthly targets</DialogTitle>
          <DialogDescription>
            Drive the pacing visualizations on the Revenue and Patient Acquisition tabs. Saved
            locally on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="target-revenue">Monthly revenue ($)</Label>
            <Input
              id="target-revenue"
              inputMode="numeric"
              value={revenueDraft}
              onChange={e => setRevenueDraft(e.target.value)}
              placeholder="120000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target-patients">Monthly new patients</Label>
            <Input
              id="target-patients"
              inputMode="numeric"
              value={patientsDraft}
              onChange={e => setPatientsDraft(e.target.value)}
              placeholder="60"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TargetsDialog;
