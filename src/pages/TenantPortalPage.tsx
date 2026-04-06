import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatUGX } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import ReportMaintenanceDialog from '@/components/forms/ReportMaintenanceDialog';
import { motion } from 'framer-motion';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wrench,
  Building2,
  Receipt,
  AlertCircle,
  Plus,
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PaymentMethod = Database['public']['Enums']['payment_method'];

const methodLabels: Record<PaymentMethod, string> = {
  mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', cash: 'Cash', bank_transfer: 'Bank Transfer', pesapal: 'Pesapal',
};
const methodIcons: Record<PaymentMethod, string> = {
  mtn_momo: '🟡', airtel_money: '🔴', cash: '💵', bank_transfer: '🏦', pesapal: '🌐',
};

export default function TenantPortalPage() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<any>(null);
  const [leases, setLeases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);

    // Get tenant record linked to this user
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', user!.id)
      .single();

    if (!tenantData) {
      setLoading(false);
      return;
    }

    setTenant(tenantData);

    const [leasesRes, paymentsRes, maintenanceRes] = await Promise.all([
      supabase
        .from('leases')
        .select('*, properties(name), units(name)')
        .eq('tenant_id', tenantData.id)
        .order('start_date', { ascending: false }),
      supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('payment_date', { ascending: false }),
      supabase
        .from('maintenance_requests')
        .select('*, properties(name), units(name)')
        .eq('submitted_by', user!.id)
        .order('created_at', { ascending: false }),
    ]);

    if (leasesRes.data) setLeases(leasesRes.data);
    if (paymentsRes.data) setPayments(paymentsRes.data);
    if (maintenanceRes.data) setMaintenanceRequests(maintenanceRes.data);
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
        <p className="font-medium">No tenant profile linked to your account</p>
        <p className="text-sm mt-1">Contact your landlord or property manager to link your account.</p>
      </div>
    );
  }

  const activeLease = leases.find((l: any) => l.status === 'active');
  const totalPaid = payments.filter((p: any) => p.status === 'completed').reduce((a: number, p: any) => a + p.amount, 0);
  const totalExpected = activeLease
    ? activeLease.rent_amount * monthsBetween(activeLease.start_date, new Date().toISOString().split('T')[0])
    : 0;
  const balance = totalExpected - totalPaid;
  const paymentPercent = totalExpected > 0 ? Math.min(100, Math.round((totalPaid / totalExpected) * 100)) : 100;
  const openMaintenance = maintenanceRequests.filter((m: any) => m.status !== 'closed' && m.status !== 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold">Welcome, {tenant.full_name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {activeLease
            ? `${(activeLease as any).properties?.name} · ${(activeLease as any).units?.name}`
            : 'No active lease'}
        </p>
      </div>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Rent"
          value={activeLease ? formatUGX(activeLease.rent_amount) : '—'}
          icon={CreditCard}
          variant="primary"
        />
        <StatCard
          title="Total Paid"
          value={formatUGX(totalPaid)}
          subtitle={`${payments.filter((p: any) => p.status === 'completed').length} payments`}
          icon={TrendingUp}
          variant="info"
        />
        <StatCard
          title={balance > 0 ? 'Outstanding' : 'Balance'}
          value={formatUGX(Math.abs(balance))}
          subtitle={balance > 0 ? 'Arrears' : balance < 0 ? 'Overpaid' : 'Fully paid'}
          icon={TrendingDown}
          variant={balance > 0 ? 'warning' : 'secondary'}
        />
        <StatCard
          title="Open Requests"
          value={String(openMaintenance)}
          subtitle="Maintenance"
          icon={Wrench}
          variant="secondary"
        />
      </motion.div>

      {/* Payment Progress */}
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
        {/* Receipts / Payment History */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" /> Receipts
          </h3>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No payments found</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {payments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{methodIcons[p.method as PaymentMethod]}</span>
                    <div>
                      <p className="text-sm font-medium">{formatUGX(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">{methodLabels[p.method as PaymentMethod]} · {p.payment_date}</p>
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

        {/* Maintenance Requests */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" /> Maintenance Requests
            </h3>
            {activeLease && (
              <ReportMaintenanceDialog
                propertyId={activeLease.property_id}
                unitId={activeLease.unit_id}
                onSuccess={fetchAll}
                trigger={
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Report Issue
                  </Button>
                }
              />
            )}
          </div>
          {maintenanceRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No requests submitted</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {maintenanceRequests.map((req: any) => (
                <div key={req.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{req.issue}</h4>
                      {req.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{req.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted: {new Date(req.created_at).toLocaleDateString()}
                    {req.resolved_at && ` · Resolved: ${new Date(req.resolved_at).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Lease Info */}
      {leases.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Lease Information
          </h3>
          <div className="space-y-3">
            {leases.map((lease: any) => (
              <div key={lease.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{lease.properties?.name}</p>
                    <p className="text-xs text-muted-foreground">{lease.units?.name}</p>
                  </div>
                  <StatusBadge status={lease.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                  <span>{lease.start_date} → {lease.end_date}</span>
                  <span className="text-right font-medium text-foreground">{formatUGX(lease.rent_amount)}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function monthsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  return Math.max(1, months);
}
