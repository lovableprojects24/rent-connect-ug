import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;

interface AddStaffDialogProps {
  properties: Property[];
  onSuccess: () => void;
}

export default function AddStaffDialog({ properties, onSuccess }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [propertyId, setPropertyId] = useState('');

  useEffect(() => {
    if (!open) {
      setEmail('');
      setPropertyId('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !propertyId) return;

    setLoading(true);
    try {
      const { data: lookupData, error: lookupError } = await supabase
        .rpc('find_user_by_email' as any, { _email: email.trim().toLowerCase() });
      
      if (lookupError || !lookupData) {
        toast.error('No user found with that email. They must create an account first.');
        setLoading(false);
        return;
      }

      const userId = (lookupData as any as string);

      const { data: existing } = await supabase
        .from('property_staff')
        .select('id')
        .eq('property_id', propertyId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        toast.error('This user is already assigned to this property.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('property_staff')
        .insert({
          property_id: propertyId,
          user_id: userId,
          role: 'manager' as any,
        });

      if (insertError) throw insertError;

      // Ensure the user has the manager role
      await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'manager' as any }, { onConflict: 'user_id,role' })
        .select();

      toast.success('Manager assigned successfully');
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign manager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Assign Manager
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Manager to Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Manager Email</Label>
            <Input
              type="email"
              placeholder="manager@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">The manager must already have a RentFlow account.</p>
          </div>

          <div className="space-y-2">
            <Label>Property</Label>
            <Select value={propertyId} onValueChange={setPropertyId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !email || !propertyId}>
            {loading ? 'Assigning...' : 'Assign Manager'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
