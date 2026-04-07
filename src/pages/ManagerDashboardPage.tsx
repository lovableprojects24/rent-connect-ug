import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, CreditCard, Wrench, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboard';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatUGX } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ManagerDashboardPage() {
  const { profile } = useAuth();
  const { data, isLoading: loading } = useDashboardData();

  const computed = useMemo(() => {
    if (!data) return null;
    const { properties, units, tenants, payments, maintenance } = data;

    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const vacantUnits = units.filter(u => u.status === 'vacant').length;
    const totalCollected = payments.filter(p => p.status === 'completed').reduce((a, p) => a + p.amount, 0);
    const totalPending = payments.filter(p => p.status === 'pending').reduce((a, p) => a + p.amount, 0);
    const openMaintenance = maintenance.filter(m => m.status === 'open' || m.status === 'in_progress').length;

    const occupancyData = [
      { name: 'Occupied', value: occupiedUnits, color: 'hsl(var(--primary))' },
      { name: 'Vacant', value: vacantUnits, color: 'hsl(var(--destructive))' },
      { name: 'Reserved', value: totalUnits - occupiedUnits - vacantUnits, color: 'hsl(var(--muted-foreground))' },
    ].filter(d => d.value > 0);

    const labels: Record<string, string> = { mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', cash: 'Cash', bank_transfer: 'Bank', pesapal: 'Pesapal' };
    const recentPayments = payments.slice(0, 6).map(p => {
      const tenant = tenants.find(t => t.id === p.tenant_id);
      return { ...p, tenantName: tenant?.full_name || 'Unknown', methodLabel: labels[p.method] || p.method };
    });

    const openRequests = maintenance.filter(m => m.status === 'open' || m.status === 'in_progress').slice(0, 5).map(m => ({
      ...m,
      propertyName: (m as any).properties?.name || 'Unknown',
      unitName: (m as any).units?.name || '-',
    }));

    return {
      stats: { propertyCount: properties.length, totalUnits, occupiedUnits, vacantUnits, activeTenants: tenants.length, totalCollected, totalPending, openMaintenance },
      occupancyData,
      recentPayments,
      openRequests,
    };
  }, [data]);

  if (loading || !computed) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const { stats, occupancyData, recentPayments, openRequests } = computed;
  const occupancyRate = stats.totalUnits > 0 ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, {profile?.full_name || 'Manager'}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/payments">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Record Payment
            </Button>
          </Link>
          <Link to="/maintenance">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Wrench className="w-3.5 h-3.5" /> Maintenance
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Properties" value={stats.propertyCount.toString()} subtitle={`${occupancyRate}% occupancy`} icon={Building2} variant="primary" delay={0} />
        <StatCard title="Active Tenants" value={stats.activeTenants.toString()} subtitle={`${stats.vacantUnits} vacant units`} icon={Users} variant="info" delay={0.1} />
        <StatCard title="Collected" value={formatUGX(stats.totalCollected)} subtitle="All time" icon={CreditCard} variant="secondary" delay={0.2} />
        <StatCard title="Open Issues" value={stats.openMaintenance.toString()} subtitle={formatUGX(stats.totalPending) + ' pending'} icon={AlertTriangle} variant="warning" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-3">Unit Occupancy</h3>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {occupancyData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <p className="text-2xl font-bold">{occupancyRate}%</p>
              <p className="text-xs text-muted-foreground">{stats.occupiedUnits}/{stats.totalUnits} units</p>
            </div>
            <div className="flex gap-4 mt-3">
              {occupancyData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Recent Payments</h3>
            <Link to="/payments" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No payments recorded yet</p>
          ) : (
            <div className="space-y-2.5">
              {recentPayments.map(p => (
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
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold flex items-center gap-2">
            <Wrench className="w-4 h-4 text-muted-foreground" /> Open Maintenance Requests
          </h3>
          <Link to="/maintenance" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {openRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No open maintenance requests 🎉</p>
        ) : (
          <div className="space-y-2.5">
            {openRequests.map(m => (
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
  );
}
