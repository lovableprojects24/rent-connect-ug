import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type UnitType = Database['public']['Enums']['unit_type'];
const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Room' },
  { value: 'bed', label: 'Bed' },
];

interface AddUnitDialogProps {
  propertyId: string;
  onSuccess: () => void;
}

export default function AddUnitDialog({ propertyId, onSuccess }: AddUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<UnitType>('apartment');
  const [rentAmount, setRentAmount] = useState('');

  const resetForm = () => { setName(''); setType('apartment'); setRentAmount(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 50) { toast.error('Unit name is required (max 50 chars)'); return; }
    const rent = parseInt(rentAmount, 10);
    if (isNaN(rent) || rent < 0) { toast.error('Valid rent amount is required'); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('units').insert({
        property_id: propertyId,
        name: trimmed,
        type,
        rent_amount: rent,
        status: 'vacant',
      });
      if (error) throw error;
      toast.success('Unit added!');
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add unit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Unit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New Unit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="unit-name">Unit Name *</Label>
            <Input id="unit-name" placeholder="e.g. Apt 3A" value={name} onChange={e => setName(e.target.value)} maxLength={50} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="unit-rent">Rent (UGX) *</Label>
              <Input id="unit-rent" type="number" min={0} placeholder="e.g. 500000" value={rentAmount} onChange={e => setRentAmount(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Unit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
