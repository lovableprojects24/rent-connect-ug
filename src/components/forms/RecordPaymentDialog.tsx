import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type PaymentMethod = Database['public']['Enums']['payment_method'];
type PaymentType = Database['public']['Enums']['payment_type'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'mtn_momo', label: 'MTN MoMo' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

interface RecordPaymentDialogProps {
  onSuccess: () => void;
  defaultMethod?: PaymentMethod;
}

export default function RecordPaymentDialog({ onSuccess, defaultMethod }: RecordPaymentDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [tenants, setTenants] = useState<{ id: string; full_name: string }[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  const [tenantId, setTenantId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>(defaultMethod || 'mtn_momo');
  const [paymentType, setPaymentType] = useState<PaymentType>('rent');
  const [status, setStatus] = useState<PaymentStatus>('completed');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (open) {
      supabase.from('tenants').select('id, full_name').then(({ data }) => {
        if (data) setTenants(data);
      });
      supabase.from('properties').select('id, name').then(({ data }) => {
        if (data) setProperties(data);
      });
      if (defaultMethod) setMethod(defaultMethod);
    }
  }, [open, defaultMethod]);

  const resetForm = () => {
    setTenantId('');
    setPropertyId('');
    setAmount('');
    setMethod(defaultMethod || 'mtn_momo');
    setPaymentType('rent');
    setStatus('completed');
    setReference('');
    setNotes('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error('Amount must be at least 1 UGX');
      return;
    }
    if (amountNum > 999999999) {
      toast.error('Amount is too large');
      return;
    }
    if (reference.length > 100) {
      toast.error('Reference must be under 100 characters');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('payments').insert({
        amount: amountNum,
        method,
        type: paymentType,
        status,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
        payment_date: paymentDate,
        tenant_id: tenantId || null,
        property_id: propertyId || null,
        recorded_by: user.id,
      });
      if (error) throw error;
      toast.success('Payment recorded successfully!');
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Record Payment</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Select value={tenantId} onValueChange={setTenantId}>
                <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
                <SelectContent>
                  {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pay-amount">Amount (UGX) *</Label>
              <Input id="pay-amount" type="number" min={1} placeholder="e.g. 500000" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-date">Date</Label>
              <Input id="pay-date" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-ref">Reference (optional)</Label>
            <Input id="pay-ref" placeholder="e.g. MOMO-TXN-12345" value={reference} onChange={e => setReference(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-notes">Notes (optional)</Label>
            <Textarea id="pay-notes" placeholder="Any additional notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={500} />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Recording…' : 'Record Payment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
