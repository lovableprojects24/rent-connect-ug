import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';

type Unit = Tables<'units'>;
type UnitType = Database['public']['Enums']['unit_type'];
type UnitStatus = Database['public']['Enums']['unit_status'];

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Room' },
  { value: 'bed', label: 'Bed' },
];
const UNIT_STATUSES: { value: UnitStatus; label: string }[] = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
];

interface EditUnitDialogProps {
  unit: Unit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditUnitDialog({ unit, open, onOpenChange, onSuccess }: EditUnitDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<UnitType>('apartment');
  const [status, setStatus] = useState<UnitStatus>('vacant');
  const [rentAmount, setRentAmount] = useState('');

  useEffect(() => {
    if (unit) {
      setName(unit.name);
      setType(unit.type);
      setStatus(unit.status);
      setRentAmount(String(unit.rent_amount));
    }
  }, [unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 50) { toast.error('Unit name is required (max 50 chars)'); return; }
    const rent = parseInt(rentAmount, 10);
    if (isNaN(rent) || rent < 0) { toast.error('Valid rent amount is required'); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('units').update({
        name: trimmed,
        type,
        status,
        rent_amount: rent,
      }).eq('id', unit.id);
      if (error) throw error;
      toast.success('Unit updated!');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update unit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Unit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-unit-name">Unit Name *</Label>
            <Input id="edit-unit-name" value={name} onChange={e => setName(e.target.value)} maxLength={50} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as UnitType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNIT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as UnitStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNIT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit-rent">Rent (UGX)</Label>
              <Input id="edit-unit-rent" type="number" min={0} value={rentAmount} onChange={e => setRentAmount(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
