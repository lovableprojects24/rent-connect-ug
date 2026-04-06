import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

interface EditTenantDialogProps {
  tenant: Tables<'tenants'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditTenantDialog({ tenant, open, onOpenChange, onSuccess }: EditTenantDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  useEffect(() => {
    if (tenant) {
      setFullName(tenant.full_name);
      setPhone(tenant.phone);
      setEmail(tenant.email || '');
      setEmergencyContact(tenant.emergency_contact || '');
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) { toast.error('Full name is required'); return; }
    if (!trimmedPhone || !/^\+?\d[\d\s-]{6,20}$/.test(trimmedPhone)) { toast.error('Valid phone number is required'); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('tenants').update({
        full_name: trimmedName,
        phone: trimmedPhone,
        email: email.trim() || null,
        emergency_contact: emergencyContact.trim() || null,
      }).eq('id', tenant.id);
      if (error) throw error;
      toast.success('Tenant updated!');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tenant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Tenant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} maxLength={100} required />
          </div>
          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email (optional)</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Emergency Contact (optional)</Label>
            <Input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
