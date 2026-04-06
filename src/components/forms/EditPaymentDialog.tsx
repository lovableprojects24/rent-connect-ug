import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';

type PaymentMethod = Database['public']['Enums']['payment_method'];
type PaymentType = Database['public']['Enums']['payment_type'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'mtn_momo', label: 'MTN MoMo' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

interface EditPaymentDialogProps {
  payment: Tables<'payments'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditPaymentDialog({ payment, open, onOpenChange, onSuccess }: EditPaymentDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('mtn_momo');
  const [paymentType, setPaymentType] = useState<PaymentType>('rent');
  const [status, setStatus] = useState<PaymentStatus>('completed');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount.toString());
      setMethod(payment.method);
      setPaymentType(payment.type);
      setStatus(payment.status);
      setReference(payment.reference || '');
      setNotes(payment.notes || '');
      setPaymentDate(payment.payment_date);
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum < 1) { toast.error('Amount must be at least 1 UGX'); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('payments').update({
        amount: amountNum,
        method,
        type: paymentType,
        status,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
        payment_date: paymentDate,
      }).eq('id', payment.id);
      if (error) throw error;
      toast.success('Payment updated!');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (UGX) *</Label>
              <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <select className={selectClass} value={method} onChange={e => setMethod(e.target.value as PaymentMethod)}>
                {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <select className={selectClass} value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType)}>
                <option value="rent">Rent</option>
                <option value="deposit">Deposit</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select className={selectClass} value={status} onChange={e => setStatus(e.target.value as PaymentStatus)}>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reference (optional)</Label>
            <Input value={reference} onChange={e => setReference(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={500} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
