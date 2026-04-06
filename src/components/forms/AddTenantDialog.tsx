import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddTenantDialogProps {
  onSuccess: () => void;
}

export default function AddTenantDialog({ onSuccess }: AddTenantDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setEmergencyContact('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length > 100) {
      toast.error('Full name is required (max 100 characters)');
      return;
    }
    if (!trimmedPhone || !/^\+?\d[\d\s-]{6,20}$/.test(trimmedPhone)) {
      toast.error('Valid phone number is required');
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Invalid email format');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('tenants').insert({
        full_name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || null,
        emergency_contact: emergencyContact.trim() || null,
        created_by: user.id,
      });
      if (error) throw error;
      toast.success('Tenant added successfully!');
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add tenant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Tenant</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New Tenant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="tenant-name">Full Name *</Label>
            <Input id="tenant-name" placeholder="e.g. Sarah Namukasa" value={fullName} onChange={e => setFullName(e.target.value)} maxLength={100} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-phone">Phone Number *</Label>
            <Input id="tenant-phone" placeholder="+256 770 123 456" value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-email">Email (optional)</Label>
            <Input id="tenant-email" type="email" placeholder="tenant@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-emergency">Emergency Contact (optional)</Label>
            <Input id="tenant-emergency" placeholder="+256 700 000 000" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Tenant'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
