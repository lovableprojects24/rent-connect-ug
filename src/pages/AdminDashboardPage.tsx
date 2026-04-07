import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, DollarSign, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDashboardData } from '@/hooks/useDashboard';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatUGX } from '@/data/mock-data';

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

    const recentPayments = payments.slice(0, 5).map(p => {
      const tenant = tenants.find(t => t.id === p.tenant_id);
      const prop = properties.find(pr => pr.id === p.property_id);
      return { ...p, tenantName: tenant?.full_name || 'Unknown', propertyName: prop?.name || '-' };
    });

    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    return {
      totalProperties: properties.length,
      totalManagers: uniqueStaffIds.length,
      totalTenants: tenants.length,
      totalRevenue,
      occupancyRate,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-2xl mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your system overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Properties" value={computed.totalProperties.toString()} icon={Building2} trend={{ value: '12% from last month', isPositive: true }} variant="primary" />
        <StatCard title="Total Managers" value={computed.totalManagers.toString()} icon={UserCheck} trend={{ value: '2 new this month', isPositive: true }} variant="secondary" />
        <StatCard title="Total Tenants" value={computed.totalTenants.toString()} icon={Users} trend={{ value: '8% from last month', isPositive: true }} variant="info" />
        <StatCard title="Monthly Income" value={formatUGX(computed.totalRevenue)} icon={DollarSign} trend={{ value: '15% from last month', isPositive: true }} variant="warning" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Rate Chart */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="font-heading font-semibold mb-4">Rent Collection Trends</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[85, 92, 78, 95, 88, 96].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-primary/20 rounded-t-lg relative" style={{ height: `${height}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary to-primary/50 rounded-t-lg" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'][i]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Average Collection Rate: 89%</p>
          </div>
        </div>

        {/* Occupancy Overview */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="font-heading font-semibold mb-4">Occupancy Overview</h3>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="12"
                  strokeDasharray={`${computed.occupancyRate * 2.512} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-heading font-semibold">{computed.occupancyRate}%</span>
                <span className="text-sm text-muted-foreground">Occupied</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-heading font-semibold text-primary">{computed.occupiedUnits}</p>
              <p className="text-sm text-muted-foreground">Occupied Units</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-muted-foreground">{computed.vacantUnits}</p>
              <p className="text-sm text-muted-foreground">Vacant Units</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-heading font-semibold">Recent Payments</h3>
        </div>
        {computed.recentPayments.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No payments yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Tenant</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Property</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {computed.recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{payment.tenantName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{payment.propertyName}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatUGX(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{payment.payment_date}</td>
                    <td className="px-6 py-4"><StatusBadge status={payment.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
