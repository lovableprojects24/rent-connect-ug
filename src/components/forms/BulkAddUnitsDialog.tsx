import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatUGX } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type UnitType = Database['public']['Enums']['unit_type'];

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Room' },
  { value: 'bed', label: 'Bed' },
];

interface UnitRow {
  name: string;
  type: UnitType;
  rentAmount: string;
}

const emptyRow = (): UnitRow => ({ name: '', type: 'apartment', rentAmount: '' });

interface BulkAddUnitsDialogProps {
  propertyId: string;
  onSuccess: () => void;
}

export default function BulkAddUnitsDialog({ propertyId, onSuccess }: BulkAddUnitsDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<UnitRow[]>([emptyRow(), emptyRow(), emptyRow()]);

  // Quick-fill state
  const [prefix, setPrefix] = useState('Unit');
  const [startNum, setStartNum] = useState('1');
  const [count, setCount] = useState('5');
  const [quickType, setQuickType] = useState<UnitType>('apartment');
  const [quickRent, setQuickRent] = useState('');

  const updateRow = (i: number, patch: Partial<UnitRow>) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  };

  const removeRow = (i: number) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter((_, idx) => idx !== i));
  };

  const addRow = () => setRows(prev => [...prev, emptyRow()]);

  const generateRows = () => {
    const n = Math.min(parseInt(count, 10) || 1, 100);
    const start = parseInt(startNum, 10) || 1;
    const generated: UnitRow[] = Array.from({ length: n }, (_, i) => ({
      name: `${prefix} ${start + i}`,
      type: quickType,
      rentAmount: quickRent,
    }));
    setRows(generated);
  };

  const resetForm = () => {
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    setPrefix('Unit');
    setStartNum('1');
    setCount('5');
    setQuickType('apartment');
    setQuickRent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valid = rows.filter(r => r.name.trim());
    if (valid.length === 0) { toast.error('Add at least one unit'); return; }

    for (const r of valid) {
      if (r.name.trim().length > 50) { toast.error(`"${r.name}" exceeds 50 chars`); return; }
      const rent = parseInt(r.rentAmount, 10);
      if (isNaN(rent) || rent < 0) { toast.error(`Invalid rent for "${r.name}"`); return; }
    }

    setSubmitting(true);
    try {
      const inserts = valid.map(r => ({
        property_id: propertyId,
        name: r.name.trim(),
        type: r.type,
        rent_amount: parseInt(r.rentAmount, 10),
        status: 'vacant' as const,
      }));
      const { error } = await supabase.from('units').insert(inserts);
      if (error) throw error;
      toast.success(`${inserts.length} unit${inserts.length > 1 ? 's' : ''} added!`);
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add units');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Layers className="w-4 h-4" /> Bulk Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Bulk Add Units</DialogTitle>
        </DialogHeader>

        {/* Quick generate */}
        <div className="bg-muted/50 rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Quick Generate</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Prefix</Label>
              <Input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="Unit" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Start #</Label>
              <Input type="number" min={1} value={startNum} onChange={e => setStartNum(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Count</Label>
              <Input type="number" min={1} max={100} value={count} onChange={e => setCount(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={quickType} onValueChange={v => setQuickType(v as UnitType)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNIT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Rent (UGX)</Label>
              <Input type="number" min={0} value={quickRent} onChange={e => setQuickRent(e.target.value)} placeholder="500000" className="h-9 text-sm" />
            </div>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={generateRows} className="w-full">
            Generate {count || 0} Units
          </Button>
        </div>

        {/* Unit rows */}
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {rows.map((row, i) => (
              <div key={i} className="flex items-end gap-2 bg-card rounded-lg border border-border p-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input value={row.name} onChange={e => updateRow(i, { name: e.target.value })} placeholder={`Unit ${i + 1}`} className="h-9 text-sm" maxLength={50} />
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select value={row.type} onValueChange={v => updateRow(i, { type: v as UnitType })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs">Rent</Label>
                  <Input type="number" min={0} value={row.rentAmount} onChange={e => updateRow(i, { rentAmount: e.target.value })} placeholder="500000" className="h-9 text-sm" />
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0" onClick={() => removeRow(i)} disabled={rows.length <= 1}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={addRow} className="w-full gap-1.5">
            <Plus className="w-4 h-4" /> Add Row
          </Button>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Adding…' : `Add ${rows.filter(r => r.name.trim()).length} Unit${rows.filter(r => r.name.trim()).length !== 1 ? 's' : ''}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
