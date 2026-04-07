import { Link } from 'react-router-dom';
import { Building2, Users, Shield, CreditCard, UserPlus, Settings, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDashboardData } from '@/hooks/useDashboard';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatUGX } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const { data, isLoading: loading } = useAdminDashboardData();

  const computed = useMemo(() => {
    if (!data) return null;
    const { properties, units, tenants, payments, maintenance, roles, profiles } = data;

    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const staffRoles = roles.filter(r => r.role !== 'tenant');
    const uniqueStaffIds = [...new Set(staffRoles.map(r => r.user_id))];
    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((a, p) => a + p.amount, 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((a, p) => a + p.amount, 0);
    const openMaintenance = maintenance.filter(m => m.status === 'open' || m.status === 'in_progress').length;

    const staffMembers = uniqueStaffIds.slice(0, 8).map(uid => {
      const prof = profiles.find(p => p.user_id === uid);
      const userRoles = staffRoles.filter(r => r.user_id === uid).map(r => r.role);
      return { userId: uid, name: prof?.full_name || 'Unnamed', phone: prof?.phone || '-', roles: userRoles };
    });

    const propertyOverview = properties.slice(0, 6).map(p => {
      const propUnits = units.filter(u => u.property_id === p.id);
      const occupied = propUnits.filter(u => u.status === 'occupied').length;
      const revenue = payments.filter(pay => pay.property_id === p.id && pay.status === 'completed').reduce((a, pay) => a + pay.amount, 0);
      return { id: p.id, name: p.name, location: p.location, totalUnits: propUnits.length, occupied, revenue };
    });

    const recentPayments = payments.slice(0, 5).map(p => {
      const tenant = tenants.find(t => t.id === p.tenant_id);
      const prop = properties.find(pr => pr.id === p.property_id);
      return { ...p, tenantName: tenant?.full_name || 'Unknown', propertyName: prop?.name || '-' };
    });

    return {
      stats: { totalProperties: properties.length, totalUnits, occupiedUnits, totalTenants: tenants.length, totalStaff: uniqueStaffIds.length, totalRevenue, pendingAmount, openMaintenance },
      staffMembers,
      propertyOverview,
      recentPayments,
    };
  }, [data]);

  if (loading || !computed) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const { stats, staffMembers, propertyOverview, recentPayments } = computed;
  const occupancyRate = stats.totalUnits > 0 ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">Admin Control Center</h1>
          <p className="text-muted-foreground text-sm mt-1">System-wide overview · {profile?.full_name || 'Super Admin'}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/staff">
            <Button size="sm" className="gap-1.5 text-xs">
              <UserPlus className="w-3.5 h-3.5" /> Onboard Staff
            </Button>
          </Link>
          <Link to="/settings">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" /> Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Properties" value={stats.totalProperties.toString()} subtitle={`${occupancyRate}% occupancy`} icon={Building2} variant="primary" delay={0} />
        <StatCard title="Tenants" value={stats.totalTenants.toString()} subtitle={`${stats.totalUnits} total units`} icon={Users} variant="info" delay={0.1} />
        <StatCard title="Staff Members" value={stats.totalStaff.toString()} subtitle="Managers & agents" icon={Shield} variant="secondary" delay={0.2} />
        <StatCard title="Total Revenue" value={formatUGX(stats.totalRevenue)} subtitle={formatUGX(stats.pendingAmount) + ' pending'} icon={CreditCard} variant="warning" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" /> Team Members
            </h3>
            <Link to="/staff" className="text-xs text-primary hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {staffMembers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No staff onboarded yet</p>
              <Link to="/staff">
                <Button size="sm" variant="outline" className="mt-3 gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" /> Add First Manager
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {staffMembers.map(s => (
                <div key={s.userId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {s.roles.map((r: string) => (
                      <span key={r} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" /> Property Performance
            </h3>
            <Link to="/properties" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {propertyOverview.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No properties yet</p>
          ) : (
            <div className="space-y-2.5">
              {propertyOverview.map(p => {
                const rate = p.totalUnits > 0 ? Math.round((p.occupied / p.totalUnits) * 100) : 0;
                return (
                  <Link key={p.id} to={`/properties/${p.id}`} className="block">
                    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/50 rounded px-1 -mx-1 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{rate}% occupied</p>
                        <p className="text-xs text-muted-foreground">{formatUGX(p.revenue)} revenue</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" /> Recent Transactions
          </h3>
          <Link to="/payments" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-2">Tenant</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-2">Property</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-2">Date</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2">Amount</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 text-sm font-medium">{p.tenantName}</td>
                    <td className="py-2.5 text-sm text-muted-foreground">{p.propertyName}</td>
                    <td className="py-2.5 text-sm text-muted-foreground">{p.payment_date}</td>
                    <td className="py-2.5 text-sm font-semibold text-right">{formatUGX(p.amount)}</td>
                    <td className="py-2.5 text-right"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
