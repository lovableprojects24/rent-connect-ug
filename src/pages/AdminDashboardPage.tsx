import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, DollarSign, UserCheck, TrendingUp, ArrowUpRight,
  Home, Wrench, Bell, ChevronRight, BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDashboardData } from '@/hooks/useDashboard';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUGX } from '@/data/mock-data';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const anim = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.08 },
});

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const { data, isLoading: loading } = useAdminDashboardData();

  const computed = useMemo(() => {
    if (!data) return null;
    const { properties, units, tenants, payments, maintenance, roles } = data;

    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const vacantUnits = totalUnits - occupiedUnits;
    const staffRoles = roles.filter(r => r.role !== 'tenant');
    const uniqueStaffIds = [...new Set(staffRoles.map(r => r.user_id))];
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalRevenue = completedPayments.reduce((a, p) => a + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const pendingAmount = pendingPayments.reduce((a, p) => a + p.amount, 0);
    const openMaintenance = maintenance.filter(m => m.status === 'open' || m.status === 'in_progress').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    // Monthly revenue data (last 6 months simulated from payments)
    const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
    const monthlyData = months.map((month, i) => ({
      month,
      collected: Math.round(totalRevenue * (0.7 + Math.random() * 0.3) / 6),
      pending: Math.round(pendingAmount * (0.5 + Math.random() * 0.5) / 6),
    }));

    const recentPayments = payments.slice(0, 6).map(p => {
      const tenant = tenants.find(t => t.id === p.tenant_id);
      const prop = properties.find(pr => pr.id === p.property_id);
      return { ...p, tenantName: tenant?.full_name || 'Unknown', propertyName: prop?.name || '-' };
    });

    // Property breakdown
    const propertyStats = properties.slice(0, 4).map(prop => {
      const propUnits = units.filter(u => u.property_id === prop.id);
      const propOccupied = propUnits.filter(u => u.status === 'occupied').length;
      return {
        id: prop.id,
        name: prop.name,
        location: prop.location,
        totalUnits: propUnits.length,
        occupied: propOccupied,
        rate: propUnits.length > 0 ? Math.round((propOccupied / propUnits.length) * 100) : 0,
      };
    });

    return {
      totalProperties: properties.length,
      totalManagers: uniqueStaffIds.length,
      totalTenants: tenants.length,
      totalRevenue,
      pendingAmount,
      occupancyRate,
      occupiedUnits,
      vacantUnits,
      totalUnits,
      openMaintenance,
      recentPayments,
      monthlyData,
      propertyStats,
    };
  }, [data]);

  if (loading || !computed) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--border))'];
  const pieData = [
    { name: 'Occupied', value: computed.occupiedUnits },
    { name: 'Vacant', value: computed.vacantUnits },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...anim(0)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening across your properties today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports" className="gap-1.5">
              <BarChart3 className="w-4 h-4" /> Reports
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/properties" className="gap-1.5">
              <Building2 className="w-4 h-4" /> Properties
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div {...anim(1)}>
          <StatCard title="Total Properties" value={computed.totalProperties} icon={Building2} trend={{ value: `${computed.totalUnits} units`, isPositive: true }} variant="primary" />
        </motion.div>
        <motion.div {...anim(2)}>
          <StatCard title="Active Tenants" value={computed.totalTenants} icon={Users} trend={{ value: `${computed.occupancyRate}% occupancy`, isPositive: true }} variant="info" />
        </motion.div>
        <motion.div {...anim(3)}>
          <StatCard title="Revenue Collected" value={formatUGX(computed.totalRevenue)} icon={DollarSign} trend={{ value: `${formatUGX(computed.pendingAmount)} pending`, isPositive: true }} variant="secondary" />
        </motion.div>
        <motion.div {...anim(4)}>
          <StatCard title="Staff Members" value={computed.totalManagers} icon={UserCheck} trend={{ value: `${computed.openMaintenance} open tickets`, isPositive: false }} variant="warning" />
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart - 2 cols */}
        <motion.div {...anim(5)} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Revenue Overview</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Monthly rent collection vs pending</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary" /> Collected</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-warning" /> Pending</span>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={computed.monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatUGX(value)}
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                  />
                  <Bar dataKey="collected" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pending" fill="hsl(var(--warning))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Occupancy Donut */}
        <motion.div {...anim(6)}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Occupancy Rate</CardTitle>
              <p className="text-sm text-muted-foreground">{computed.totalUnits} total units</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-44 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-heading font-bold">{computed.occupancyRate}%</span>
                  <span className="text-xs text-muted-foreground">Occupied</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mt-4 w-full text-center">
                <div className="space-y-1">
                  <p className="text-xl font-heading font-bold text-primary">{computed.occupiedUnits}</p>
                  <p className="text-xs text-muted-foreground">Occupied</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-heading font-bold text-muted-foreground">{computed.vacantUnits}</p>
                  <p className="text-xs text-muted-foreground">Vacant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row: Properties + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Property Performance */}
        <motion.div {...anim(7)} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Property Performance</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-primary">
                <Link to="/properties" className="gap-1 text-xs">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {computed.propertyStats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No properties yet</p>
              ) : (
                computed.propertyStats.map((prop) => (
                  <Link
                    key={prop.id}
                    to={`/properties/${prop.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Home className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{prop.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{prop.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{prop.rate}%</p>
                      <p className="text-xs text-muted-foreground">{prop.occupied}/{prop.totalUnits}</p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Payments */}
        <motion.div {...anim(8)} className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Payments</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-primary">
                <Link to="/payments" className="gap-1 text-xs">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {computed.recentPayments.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No payments yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {computed.recentPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                {payment.tenantName.charAt(0)}
                              </div>
                              <span className="text-sm font-medium">{payment.tenantName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-sm text-muted-foreground">{payment.propertyName}</td>
                          <td className="px-6 py-3.5 text-sm font-semibold">{formatUGX(payment.amount)}</td>
                          <td className="px-6 py-3.5 text-sm text-muted-foreground">{payment.payment_date}</td>
                          <td className="px-6 py-3.5"><StatusBadge status={payment.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div {...anim(9)}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/tenants" className="gap-1.5"><Users className="w-4 h-4" /> Manage Tenants</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/maintenance" className="gap-1.5"><Wrench className="w-4 h-4" /> Maintenance</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/notifications" className="gap-1.5"><Bell className="w-4 h-4" /> Notifications</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/staff" className="gap-1.5"><UserCheck className="w-4 h-4" /> Staff</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
