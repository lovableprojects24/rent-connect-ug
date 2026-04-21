import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Copy, Check, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import KycSubmitForm from '@/components/kyc/KycSubmitForm';

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

  // Flow step: 'form' -> 'kyc' -> 'credentials'
  const [step, setStep] = useState<'form' | 'kyc' | 'credentials'>('form');
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setEmergencyContact('');
    setCredentials(null);
    setCopied(false);
    setStep('form');
    setCreatedUserId(null);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    setOpen(isOpen);
  };

  const handleCopy = async () => {
    if (!credentials) return;
    const text = `Email: ${credentials.email}\nTemporary Password: ${credentials.password}\n\nPlease change your password after first login.`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
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
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('A valid email is required to create the tenant login account');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-tenant', {
        body: {
          full_name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          emergency_contact: emergencyContact.trim() || null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setCreatedUserId(data.user_id);
      setCredentials({
        email: data.email,
        password: data.temporary_password,
      });

      // Go to KYC step
      setStep('kyc');
      toast.success('Tenant account created! Now add KYC documents.');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tenant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Tenant</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {step === 'form' ? 'Add New Tenant' : step === 'kyc' ? 'KYC Verification' : 'Tenant Created!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'credentials' && credentials ? (
          <div className="space-y-4 mt-2">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <KeyRound className="w-5 h-5" />
                <p className="text-sm font-semibold">Tenant Login Credentials</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Share these credentials with the tenant. They will be asked to change their password on first login.
              </p>
              <div className="space-y-2 bg-background rounded-md p-3 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-mono font-medium">{credentials.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temporary Password</p>
                  <p className="text-sm font-mono font-medium tracking-wider">{credentials.password}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Credentials'}
              </Button>
              <Button onClick={() => handleClose(false)} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        ) : step === 'kyc' && createdUserId ? (
          <div className="space-y-4 mt-2">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <p className="text-xs text-muted-foreground">
                Upload the tenant's ID documents for identity verification.
              </p>
            </div>
            <KycSubmitForm
              userId={createdUserId}
              onSuccess={() => setStep('credentials')}
              onCancel={() => setStep('credentials')}
            />
          </div>
        ) : (
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
              <Label htmlFor="tenant-email">Email * <span className="text-xs text-muted-foreground font-normal">(used for login)</span></Label>
              <Input id="tenant-email" type="email" placeholder="tenant@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-emergency">Emergency Contact (optional)</Label>
              <Input id="tenant-emergency" placeholder="+256 700 000 000" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
              A login account will be created automatically. You'll then be asked to submit KYC documents.
            </p>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create Tenant Account'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
