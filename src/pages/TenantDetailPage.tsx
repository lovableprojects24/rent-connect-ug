import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, AlertCircle, Calendar, Building2, CreditCard, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatUGX } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/shared/StatusBadge';
import AddLeaseDialog from '@/components/forms/AddLeaseDialog';
import { motion } from 'framer-motion';
import type { Tables, Database } from '@/integrations/supabase/types';

type Tenant = Tables<'tenants'>;
type Lease = Tables<'leases'>;
type Payment = Tables<'payments'>;
type PaymentMethod = Database['public']['Enums']['payment_method'];

const methodLabels: Record<PaymentMethod, string> = {
  mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', cash: 'Cash', bank_transfer: 'Bank Transfer', pesapal: 'Pesapal',
};
const methodIcons: Record<PaymentMethod, string> = {
  mtn_momo: '🟡', airtel_money: '🔴', cash: '💵', bank_transfer: '🏦', pesapal: '🌐',
};

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [leases, setLeases] = useState<(Lease & { property_name?: string; unit_name?: string })[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const [tenantRes, leasesRes, paymentsRes] = await Promise.all([
      supabase.from('tenants').select('*').eq('id', id!).single(),
      supabase.from('leases').select('*, properties(name), units(name)').eq('tenant_id', id!).order('start_date', { ascending: false }),
      supabase.from('payments').select('*').eq('tenant_id', id!).order('payment_date', { ascending: false }),
    ]);

    if (tenantRes.data) setTenant(tenantRes.data);
    if (leasesRes.data) {
      setLeases(leasesRes.data.map((l: any) => ({
        ...l,
        property_name: l.properties?.name || 'Unknown',
        unit_name: l.units?.name || '—',
      })));
    }
    if (paymentsRes.data) setPayments(paymentsRes.data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-medium">Tenant not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/tenants')}>Back to Tenants</Button>
      </div>
    );
  }

  const activeLease = leases.find(l => l.status === 'active');
  const totalPaid = payments.filter(p => p.status === 'completed').reduce((a, p) => a + p.amount, 0);
  const totalExpected = activeLease ? activeLease.rent_amount * monthsBetween(activeLease.start_date, new Date().toISOString().split('T')[0]) : 0;
  const balance = totalExpected - totalPaid;
  const paymentPercent = totalExpected > 0 ? Math.min(100, Math.round((totalPaid / totalExpected) * 100)) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="mt-0.5" onClick={() => navigate('/tenants')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold">{tenant.full_name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{tenant.phone}</span>
            {tenant.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{tenant.email}</span>}
            {tenant.emergency_contact && <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />Emergency: {tenant.emergency_contact}</span>}
          </div>
        </div>
      </div>

      {/* Balance Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card-gradient rounded-xl p-5 text-primary-foreground shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80">Total Paid</p>
              <p className="text-2xl font-heading font-bold mt-1">{formatUGX(totalPaid)}</p>
              <p className="text-xs opacity-70 mt-1">{payments.filter(p => p.status === 'completed').length} payments</p>
            </div>
            <div className="p-2 rounded-lg bg-primary-foreground/15"><TrendingUp className="w-5 h-5" /></div>
          </div>
        </div>

        <div className={`rounded-xl p-5 text-primary-foreground shadow-lg ${balance > 0 ? 'stat-card-warning' : 'stat-card-info'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80">{balance > 0 ? 'Outstanding Balance' : 'Balance'}</p>
              <p className="text-2xl font-heading font-bold mt-1">{formatUGX(Math.abs(balance))}</p>
              <p className="text-xs opacity-70 mt-1">{balance > 0 ? 'Arrears' : balance < 0 ? 'Overpaid' : 'Fully paid'}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary-foreground/15"><TrendingDown className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="stat-card-secondary rounded-xl p-5 text-primary-foreground shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80">Monthly Rent</p>
              <p className="text-2xl font-heading font-bold mt-1">{activeLease ? formatUGX(activeLease.rent_amount) : '—'}</p>
              <p className="text-xs opacity-70 mt-1">{activeLease ? 'Active lease' : 'No active lease'}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary-foreground/15"><CreditCard className="w-5 h-5" /></div>
          </div>
        </div>
      </motion.div>

      {/* Payment progress */}
      {activeLease && totalExpected > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-sm">Payment Progress</h3>
            <span className="text-sm font-medium">{paymentPercent}%</span>
          </div>
          <Progress value={paymentPercent} className="h-2.5" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Paid: {formatUGX(totalPaid)}</span>
            <span>Expected: {formatUGX(totalExpected)}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leases */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Lease History
            </h3>
            <AddLeaseDialog
              preselectedTenantId={tenant.id}
              onSuccess={fetchData}
              trigger={
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> New Lease
                </Button>
              }
            />
          </div>
          {leases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No leases found</p>
          ) : (
            <div className="space-y-3">
              {leases.map((lease) => (
                <div key={lease.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{lease.property_name}</p>
                      <p className="text-xs text-muted-foreground">{lease.unit_name}</p>
                    </div>
                    <StatusBadge status={lease.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {lease.start_date} → {lease.end_date}
                    </div>
                    <div className="text-right font-medium text-foreground">
                      {formatUGX(lease.rent_amount)}/mo
                    </div>
                  </div>
                  {lease.deposit > 0 && (
                    <p className="text-xs text-muted-foreground">Deposit: {formatUGX(lease.deposit)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Payment History */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Payment History
          </h3>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No payments found</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{methodIcons[p.method]}</span>
                    <div>
                      <p className="text-sm font-medium">{formatUGX(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">{methodLabels[p.method]} · {p.payment_date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={p.status} />
                    {p.reference && <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{p.reference}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function monthsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  return Math.max(1, months);
}
