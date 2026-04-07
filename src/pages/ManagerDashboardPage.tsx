import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, DollarSign, AlertTriangle, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboard';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatUGX } from '@/data/mock-data';

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
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    // Find unpaid tenants (pending payments)
    const pendingPayments = payments.filter(p => p.status === 'pending').slice(0, 5).map(p => {
      const tenant = tenants.find(t => t.id === p.tenant_id);
      return { ...p, tenantName: tenant?.full_name || 'Unknown' };
    });

    const vacantUnitsList = units.filter(u => u.status === 'vacant').slice(0, 4);

    return {
      totalTenants: tenants.length,
      occupiedUnits,
      vacantUnits,
      totalCollected,
      totalPending,
      openMaintenance,
      occupancyRate,
      pendingPayments,
      vacantUnitsList,
      paidCount: payments.filter(p => p.status === 'completed').length,
      totalPaymentCount: payments.length,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage your properties and tenants.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/tenants">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Tenant
            </button>
          </Link>
          <Link to="/payments">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" /> Record Payment
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tenants" value={computed.totalTenants.toString()} icon={Users} variant="primary" />
        <StatCard title="Occupied Rooms" value={computed.occupiedUnits.toString()} icon={Home} trend={{ value: `${computed.occupancyRate}% occupancy`, isPositive: true }} variant="secondary" />
        <StatCard title="Vacant Rooms" value={computed.vacantUnits.toString()} icon={Home} variant="warning" />
        <StatCard title="Monthly Revenue" value={formatUGX(computed.totalCollected)} icon={DollarSign} variant="info" />
      </div>

      {/* Payment Alerts */}
      {computed.totalPending > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-red-900 mb-1">Payment Alerts</h3>
              <p className="text-red-700 text-sm">
                You have {computed.pendingPayments.length} tenants with pending payments. Total outstanding: {formatUGX(computed.totalPending)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Unpaid Tenants */}
      {computed.pendingPayments.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-heading font-semibold">Unpaid Tenants</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Tenant Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Amount Due</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {computed.pendingPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{p.tenantName}</td>
                    <td className="px-6 py-4 text-sm">{formatUGX(p.amount)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{p.payment_date}</td>
                    <td className="px-6 py-4">
                      <Link to="/notifications" className="text-primary hover:underline text-sm">Send Reminder</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stats + Vacant Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="font-heading font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm">Payments Received</span>
              <span className="text-green-700 font-medium">{computed.paidCount} / {computed.totalPaymentCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm">Collection Rate</span>
              <span className="text-blue-700 font-medium">
                {computed.totalPaymentCount > 0 ? Math.round((computed.paidCount / computed.totalPaymentCount) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm">Pending Maintenance</span>
              <span className="text-orange-700 font-medium">{computed.openMaintenance} requests</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="font-heading font-semibold mb-4">Vacant Rooms</h3>
          {computed.vacantUnitsList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">All units occupied! 🎉</p>
          ) : (
            <div className="space-y-3">
              {computed.vacantUnitsList.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{unit.name}</p>
                    <p className="text-sm text-muted-foreground">Ready for occupancy</p>
                  </div>
                  <Link to="/properties" className="text-primary hover:underline text-sm">View Details</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
