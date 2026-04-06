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
type StaffRole = Extract<Database['public']['Enums']['app_role'], 'agent' | 'finance'>;

interface AddStaffDialogProps {
  properties: Property[];
  onSuccess: () => void;
}

export default function AddStaffDialog({ properties, onSuccess }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [role, setRole] = useState<StaffRole>('agent');

  useEffect(() => {
    if (!open) {
      setEmail('');
      setPropertyId('');
      setRole('agent');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !propertyId || !role) return;

    setLoading(true);
    try {
      // Look up user by email in profiles (we need to find their user_id)
      // First check if there's a profile with this email via auth metadata
      // We'll look up by checking the auth users through a simpler approach:
      // Query profiles joined concept - since we can't query auth.users directly,
      // we need an edge function or a different approach.
      // For now, let's search by email in the tenants or use a lookup approach.
      
      // Simpler approach: use supabase admin to find user by email
      // But we don't have admin access from client. Let's use an RPC or 
      // just ask for user_id directly. Better UX: search by email.
      
      // We'll use a practical approach - the owner enters the staff member's email,
      // and we look them up. Since we can't query auth.users from client,
      // we'll look up profiles table. But profiles don't have email...
      // 
      // Best approach: Look up via supabase auth admin API through edge function.
      // For MVP: let the owner enter the user ID or use email-based invitation.
      //
      // Actually, let's query via the Supabase auth.users using an RPC function.
      // For now, let's use a simpler flow: search profiles by name.
      
      // Practical MVP: We'll create an edge function later. For now,
      // let's add staff by looking up profiles that match.
      // Since profiles don't have email, we need another approach.
      
      // Simplest working approach: create an RPC that finds user by email
      // For now, we'll try to find the user via the supabase client
      
      // Let's use a direct insert with a lookup - we'll create an edge function
      // But for MVP, let's allow entering user_id or use email lookup via RPC
      
      // Actually the cleanest approach without an edge function:
      // The staff member must already have an account. We look them up by email
      // through a database function.
      
      const { data: lookupData, error: lookupError } = await supabase
        .rpc('find_user_by_email' as any, { _email: email.trim().toLowerCase() });
      
      if (lookupError || !lookupData) {
        toast.error('No user found with that email. They must create an account first.');
        setLoading(false);
        return;
      }

      const userId = (lookupData as any as string);

      // Check if already assigned
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

      // Insert staff assignment
      const { error: insertError } = await supabase
        .from('property_staff')
        .insert({
          property_id: propertyId,
          user_id: userId,
          role: role,
        });

      if (insertError) throw insertError;

      // Also ensure the user has the role in user_roles
      await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: role }, { onConflict: 'user_id,role' })
        .select();

      toast.success('Staff member assigned successfully');
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Assign Staff
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Staff to Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Staff Member Email</Label>
            <Input
              type="email"
              placeholder="agent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">The staff member must already have a RentFlow account.</p>
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

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent / Property Manager</SelectItem>
                <SelectItem value="finance">Finance / Accounts Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !email || !propertyId}>
            {loading ? 'Assigning...' : 'Assign Staff'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
