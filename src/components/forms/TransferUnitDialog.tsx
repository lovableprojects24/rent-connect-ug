import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowRightLeft } from 'lucide-react';
import { formatUGX } from '@/lib/utils';

interface TransferUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  unitName: string;
  propertyId: string;
  currentTenant: { id: string; full_name: string };
  currentLeaseId: string;
  currentDeposit: number;
  onSuccess: () => void;
}

export default function TransferUnitDialog({
  open,
  onOpenChange,
  unitId,
  unitName,
  propertyId,
  currentTenant,
  currentLeaseId,
  currentDeposit,
  onSuccess,
}: TransferUnitDialogProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [tenantsList, setTenantsList] = useState<{ id: string; full_name: string }[]>([]);
  const [newTenantId, setNewTenantId] = useState('');
  const [newRent, setNewRent] = useState('');
  const [newDeposit, setNewDeposit] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      supabase
        .from('tenants')
        .select('id, full_name')
        .neq('id', currentTenant.id)
        .then(({ data }) => {
          if (data) setTenantsList(data);
        });
      setNewTenantId('');
      setNewRent('');
      setNewDeposit('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setReason('');
    }
  }, [open, currentTenant.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTenantId) return;

    const rentNum = parseInt(newRent, 10);
    const depositNum = parseInt(newDeposit, 10) || 0;
    if (isNaN(rentNum) || rentNum < 1) {
      toast.error('Enter a valid rent amount');
      return;
    }
    if (!endDate) {
      toast.error('Enter an end date for the new allocation');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Terminate old lease
      const { error: terminateErr } = await supabase
        .from('leases')
        .update({ status: 'terminated' })
        .eq('id', currentLeaseId);
      if (terminateErr) throw terminateErr;

      // 2. Record deposit refund as a payment
      if (currentDeposit > 0) {
        await supabase.from('payments').insert({
          amount: currentDeposit,
          method: 'cash',
          type: 'deposit',
          status: 'completed',
          notes: `Deposit refund on unit transfer from ${currentTenant.full_name}`,
          tenant_id: currentTenant.id,
          property_id: propertyId,
          lease_id: currentLeaseId,
          recorded_by: user.id,
        });
      }

      // 3. Create new lease
      const { data: newLease, error: leaseErr } = await supabase
        .from('leases')
        .insert({
          unit_id: unitId,
          property_id: propertyId,
          tenant_id: newTenantId,
          rent_amount: rentNum,
          deposit: depositNum,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
        })
        .select('id')
        .single();
      if (leaseErr) throw leaseErr;

      // 4. Record deposit payment for new tenant
      if (depositNum > 0) {
        await supabase.from('payments').insert({
          amount: depositNum,
          method: 'cash',
          type: 'deposit',
          status: 'completed',
          notes: `Deposit for unit transfer to ${unitName}`,
          tenant_id: newTenantId,
          property_id: propertyId,
          lease_id: newLease.id,
          recorded_by: user.id,
        });
      }

      // 5. Log transfer
      await supabase.from('unit_transfers').insert({
        unit_id: unitId,
        property_id: propertyId,
        from_tenant_id: currentTenant.id,
        to_tenant_id: newTenantId,
        old_lease_id: currentLeaseId,
        new_lease_id: newLease.id,
        old_deposit_amount: currentDeposit,
        reason: reason.trim() || null,
        transferred_by: user.id,
      });

      toast.success('Unit transferred successfully!');
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('Transfer error:', err);
      toast.error(err.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Transfer Unit: {unitName}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">Current tenant:</span>{' '}
            <strong>{currentTenant.full_name}</strong>
          </p>
          <p>
            <span className="text-muted-foreground">Deposit to refund:</span>{' '}
            <strong>{formatUGX(currentDeposit)}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>New Tenant *</Label>
            <select
              className={selectClass}
              value={newTenantId}
              onChange={(e) => setNewTenantId(e.target.value)}
              required
            >
              <option value="">Select new tenant</option>
              {tenantsList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tf-rent">New Rent (UGX) *</Label>
              <Input
                id="tf-rent"
                type="number"
                min={1}
                placeholder="e.g. 500000"
                value={newRent}
                onChange={(e) => setNewRent(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tf-deposit">New Deposit (UGX)</Label>
              <Input
                id="tf-deposit"
                type="number"
                min={0}
                placeholder="e.g. 500000"
                value={newDeposit}
                onChange={(e) => setNewDeposit(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tf-start">Start Date *</Label>
              <Input
                id="tf-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tf-end">End Date *</Label>
              <Input
                id="tf-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tf-reason">Reason (optional)</Label>
            <Textarea
              id="tf-reason"
              placeholder="Why is this unit being transferred?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Transferring…' : 'Transfer Unit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
