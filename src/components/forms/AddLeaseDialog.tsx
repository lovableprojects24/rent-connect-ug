import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatUGX } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;
type Unit = Tables<'units'>;
type Tenant = Tables<'tenants'>;

interface AddLeaseDialogProps {
  onSuccess: () => void;
  preselectedTenantId?: string;
  trigger?: React.ReactNode;
}

export default function AddLeaseDialog({ onSuccess, preselectedTenantId, trigger }: AddLeaseDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [propertyId, setPropertyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [tenantId, setTenantId] = useState(preselectedTenantId || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [deposit, setDeposit] = useState('');

  useEffect(() => {
    if (!open) return;
    fetchOptions();
  }, [open]);

  useEffect(() => {
    if (preselectedTenantId) setTenantId(preselectedTenantId);
  }, [preselectedTenantId]);

  // When property changes, fetch its units
  useEffect(() => {
    if (!propertyId) { setUnits([]); setUnitId(''); return; }
    supabase.from('units').select('*').eq('property_id', propertyId).eq('status', 'vacant').order('name')
      .then(({ data }) => {
        setUnits(data || []);
        setUnitId('');
      });
  }, [propertyId]);

  // When unit is selected, prefill rent amount
  useEffect(() => {
    const unit = units.find(u => u.id === unitId);
    if (unit && unit.rent_amount > 0) {
      setRentAmount(String(unit.rent_amount));
    }
  }, [unitId, units]);

  const fetchOptions = async () => {
    const [propRes, tenantRes] = await Promise.all([
      supabase.from('properties').select('*').order('name'),
      supabase.from('tenants').select('*').order('full_name'),
    ]);
    if (propRes.data) setProperties(propRes.data);
    if (tenantRes.data) setTenants(tenantRes.data);
  };

  const resetForm = () => {
    setPropertyId('');
    setUnitId('');
    if (!preselectedTenantId) setTenantId('');
    setStartDate('');
    setEndDate('');
    setRentAmount('');
    setDeposit('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!propertyId) { toast.error('Select a property'); return; }
    if (!unitId) { toast.error('Select a unit'); return; }
    if (!tenantId) { toast.error('Select a tenant'); return; }
    if (!startDate || !endDate) { toast.error('Start and end dates are required'); return; }
    if (startDate >= endDate) { toast.error('End date must be after start date'); return; }

    const rent = parseInt(rentAmount, 10);
    const dep = parseInt(deposit || '0', 10);
    if (isNaN(rent) || rent < 1) { toast.error('Valid rent amount is required'); return; }
    if (isNaN(dep) || dep < 0) { toast.error('Deposit must be 0 or more'); return; }

    setSubmitting(true);
    try {
      // Create lease
      const { error: leaseError } = await supabase.from('leases').insert({
        property_id: propertyId,
        unit_id: unitId,
        tenant_id: tenantId,
        start_date: startDate,
        end_date: endDate,
        rent_amount: rent,
        deposit: dep,
        status: 'active',
      });
      if (leaseError) throw leaseError;

      // Mark unit as occupied
      const { error: unitError } = await supabase.from('units').update({ status: 'occupied' as const }).eq('id', unitId);
      if (unitError) throw unitError;

      toast.success('Lease created successfully!');
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create lease');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">New Lease</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Create New Lease</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Property */}
          <div className="space-y-2">
            <Label>Property *</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} — {p.location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label>Unit *</Label>
            <Select value={unitId} onValueChange={setUnitId} disabled={!propertyId}>
              <SelectTrigger><SelectValue placeholder={propertyId ? (units.length ? 'Select unit' : 'No vacant units') : 'Select property first'} /></SelectTrigger>
              <SelectContent>
                {units.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.type}) — {formatUGX(u.rent_amount)}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tenant */}
          <div className="space-y-2">
            <Label>Tenant *</Label>
            {preselectedTenantId ? (
              <Input value={tenants.find(t => t.id === preselectedTenantId)?.full_name || 'Loading...'} disabled />
            ) : (
              <Select value={tenantId} onValueChange={setTenantId}>
                <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name} — {t.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lease-start">Start Date *</Label>
              <Input id="lease-start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lease-end">End Date *</Label>
              <Input id="lease-end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
          </div>

          {/* Rent & Deposit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lease-rent">Monthly Rent (UGX) *</Label>
              <Input id="lease-rent" type="number" min={1} placeholder="e.g. 500000" value={rentAmount} onChange={e => setRentAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lease-deposit">Deposit (UGX)</Label>
              <Input id="lease-deposit" type="number" min={0} placeholder="e.g. 500000" value={deposit} onChange={e => setDeposit(e.target.value)} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Lease'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
