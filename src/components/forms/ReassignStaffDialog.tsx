import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;

interface ReassignStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
  staffName: string;
  currentPropertyId: string;
  properties: Property[];
  onSuccess: () => void;
}

export default function ReassignStaffDialog({
  open,
  onOpenChange,
  staffId,
  staffName,
  currentPropertyId,
  properties,
  onSuccess,
}: ReassignStaffDialogProps) {
  const [newPropertyId, setNewPropertyId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setNewPropertyId('');
  }, [open]);

  const availableProperties = properties.filter(p => p.id !== currentPropertyId);

  const handleReassign = async () => {
    if (!newPropertyId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('property_staff')
        .update({ property_id: newPropertyId } as any)
        .eq('id', staffId);
      if (error) throw error;
      toast.success('Manager reassigned successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reassign manager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign {staffName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Select a new property to assign this manager to.
          </p>
          <div className="space-y-2">
            <Label>New Property</Label>
            <Select value={newPropertyId} onValueChange={setNewPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {availableProperties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {availableProperties.length === 0 && (
            <p className="text-sm text-muted-foreground">No other properties available.</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleReassign} disabled={loading || !newPropertyId}>
              {loading ? 'Reassigning...' : 'Reassign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
