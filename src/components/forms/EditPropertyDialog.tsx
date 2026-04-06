import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const PROPERTY_TYPES = ['Apartments', 'Rental Houses', 'Commercial', 'Hostel', 'Mixed Use'];

interface EditPropertyDialogProps {
  property: Tables<'properties'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditPropertyDialog({ property, open, onOpenChange, onSuccess }: EditPropertyDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Apartments');
  const [totalUnits, setTotalUnits] = useState('');

  useEffect(() => {
    if (property) {
      setName(property.name);
      setLocation(property.location);
      setType(property.type);
      setTotalUnits(property.total_units.toString());
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    const units = parseInt(totalUnits, 10);

    if (!trimmedName) { toast.error('Property name is required'); return; }
    if (!trimmedLocation) { toast.error('Location is required'); return; }
    if (isNaN(units) || units < 1) { toast.error('Total units must be at least 1'); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('properties').update({
        name: trimmedName,
        location: trimmedLocation,
        type,
        total_units: units,
      }).eq('id', property.id);
      if (error) throw error;
      toast.success('Property updated!');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Property Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} maxLength={100} required />
          </div>
          <div className="space-y-2">
            <Label>Location *</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} maxLength={200} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Total Units *</Label>
              <Input type="number" min={1} max={9999} value={totalUnits} onChange={e => setTotalUnits(e.target.value)} required />
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
