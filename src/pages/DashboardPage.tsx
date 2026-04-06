import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, Users, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatUGX } from '@/data/mock-data';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { roles } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    propertyCount: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    activeTenants: 0,
    totalTenants: 0,
    totalCollected: 0,
    totalPending: 0,
    openMaintenance: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentMaintenance, setRecentMaintenance] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);

  const isTenantOnly = roles.includes('tenant') && roles.length === 1;

  useEffect(() => {
    if (!isTenantOnly) fetchDashboardData();
  }, [isTenantOnly]);

  const fetchDashboardData = async () => {
    const [
      { data: properties },
      { data: units },
      { data: tenants },
      { data: payments },
      { data: maintenance },
    ] = await Promise.all([
      supabase.from('properties').select('*'),
      supabase.from('units').select('*'),
      supabase.from('tenants').select('*'),
      supabase.from('payments').select('*').order('payment_date', { ascending: false }),
      supabase.from('maintenance_requests').select('*, properties(name), units(name)').order('created_at', { ascending: false }),
    ]);

    const propertyCount = properties?.length || 0;
    const totalUnits = properties?.reduce((a, p) => a + (p.total_units || 0), 0) || 0;
    const occupiedUnits = units?.filter(u => u.status === 'occupied').length || 0;
    const activeTenants = tenants?.length || 0;
    const totalCollected = payments?.filter(p => p.status === 'completed').reduce((a, p) => a + p.amount, 0) || 0;
    const totalPending = payments?.filter(p => p.status === 'pending').reduce((a, p) => a + p.amount, 0) || 0;
    const openMaintenance = maintenance?.filter(m => m.status === 'open' || m.status === 'in_progress').length || 0;

    setStats({ propertyCount, totalUnits, occupiedUnits, activeTenants, totalTenants: activeTenants, totalCollected, totalPending, openMaintenance });

    // Recent payments with tenant info
    const recentPays = (payments || []).slice(0, 5).map(p => {
      const tenant = tenants?.find(t => t.id === p.tenant_id);
      const methodLabels: Record<string, string> = { mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', cash: 'Cash', bank_transfer: 'Bank Transfer' };
      return { ...p, tenantName: tenant?.full_name || 'Unknown', methodLabel: methodLabels[p.method] || p.method };
    });
    setRecentPayments(recentPays);

    // Recent maintenance
    setRecentMaintenance((maintenance || []).slice(0, 5).map(m => ({
      ...m,
      propertyName: (m as any).properties?.name || 'Unknown',
      unitName: (m as any).units?.name || '-',
    })));

    // Payment method breakdown
    const methodCounts: Record<string, number> = {};
    (payments || []).forEach(p => { methodCounts[p.method] = (methodCounts[p.method] || 0) + 1; });
    const total = payments?.length || 1;
    const colors: Record<string, string> = { mtn_momo: 'hsl(48, 96%, 53%)', airtel_money: 'hsl(0, 72%, 51%)', cash: 'hsl(142, 52%, 36%)', bank_transfer: 'hsl(210, 80%, 52%)' };
    const labels: Record<string, string> = { mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', cash: 'Cash', bank_transfer: 'Bank Transfer' };
    setPaymentMethodData(Object.entries(methodCounts).map(([k, v]) => ({ name: labels[k] || k, value: Math.round((v / total) * 100), color: colors[k] || 'hsl(var(--muted))' })));

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your portfolio overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Properties" value={stats.propertyCount.toString()} subtitle={`${stats.occupiedUnits}/${stats.totalUnits} units occupied`} icon={Building2} variant="primary" delay={0} />
        <StatCard title="Active Tenants" value={stats.activeTenants.toString()} subtitle={`${stats.totalTenants} total`} icon={Users} variant="info" delay={0.1} />
        <StatCard title="Total Collected" value={formatUGX(stats.totalCollected)} subtitle="All time" icon={CreditCard} variant="secondary" delay={0.2} />
        <StatCard title="Pending" value={formatUGX(stats.totalPending)} subtitle={`${stats.openMaintenance} maintenance open`} icon={AlertTriangle} variant="warning" delay={0.3} />
      </div>

      {/* Payment Methods Chart */}
      {paymentMethodData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Payment Methods</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {paymentMethodData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {paymentMethodData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Payments & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Recent Payments</h3>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No payments recorded yet</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.tenantName}</p>
                    <p className="text-xs text-muted-foreground">{p.methodLabel} · {p.payment_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatUGX(p.amount)}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Maintenance Requests</h3>
          {recentMaintenance.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No maintenance requests yet</p>
          ) : (
            <div className="space-y-3">
              {recentMaintenance.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{m.issue}</p>
                    <p className="text-xs text-muted-foreground">{m.propertyName} · {m.unitName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={m.priority} />
                    <StatusBadge status={m.status} />
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
