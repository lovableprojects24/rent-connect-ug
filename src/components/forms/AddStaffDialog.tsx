import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;

interface AddStaffDialogProps {
  properties: Property[];
  onSuccess: () => void;
}

export default function AddStaffDialog({ properties, onSuccess }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [result, setResult] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setFullName('');
      setEmail('');
      setPhone('');
      setSelectedPropertyIds([]);
      setResult(null);
      setCopied(false);
    }
  }, [open]);

  const toggleProperty = (id: string) => {
    setSelectedPropertyIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || selectedPropertyIds.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-tenant', {
        body: {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          is_manager: true,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newUserId = data.user_id;

      // Assign manager to all selected properties
      const { error: staffError } = await supabase
        .from('property_staff')
        .insert(
          selectedPropertyIds.map(pid => ({
            property_id: pid,
            user_id: newUserId,
            role: 'manager' as any,
          }))
        );

      if (staffError) throw staffError;

      setResult({
        email: data.email,
        password: data.temporary_password,
      });

      toast.success('Manager account created and assigned to property');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create manager');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Email: ${result.email}\nTemporary Password: ${result.password}`);
    setCopied(true);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Create Manager
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{result ? 'Manager Created' : 'Create New Manager'}</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 pt-2">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Account created successfully!</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <span className="font-mono font-medium">{result.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Temporary Password:</span>{' '}
                  <span className="font-mono font-medium">{result.password}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Share these credentials with the manager. They will be prompted to change their password on first login.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyCredentials} variant="outline" className="flex-1 gap-2">
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Credentials'}
              </Button>
              <Button onClick={() => setOpen(false)} className="flex-1">Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="manager@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                type="tel"
                placeholder="+256 7XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label>Assign to Property</Label>
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

            <Button type="submit" className="w-full" disabled={loading || !fullName || !email || !phone || !propertyId}>
              {loading ? 'Creating Account...' : 'Create Manager Account'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
