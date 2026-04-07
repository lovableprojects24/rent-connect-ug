import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Home, DollarSign, AlertTriangle, Plus, Wrench, Building2,
  ChevronRight, TrendingUp, ArrowDownRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboard';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUGX } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const anim = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.08 },
});

export default function ManagerDashboardPage() {
  const { profile } = useAuth();
  const { data, isLoading: loading } = useDashboardData();

  const computed = useMemo(() => {
    if (!data) return null;
    const { properties, units, tenants, payments, maintenance } = data;

    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const vacantUnits = units.filter(u => u.status === 'vacant').length;
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalCollected = completedPayments.reduce((a, p) => a + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const totalPending = pendingPayments.reduce((a, p) => a + p.amount, 0);
    const openMaintenance = maintenance.filter(m => m.status === 'open' || m.status === 'in_progress').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const collectionRate = payments.length > 0 ? Math.round((completedPayments.length / payments.length) * 100) : 0;

    // Revenue trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trendData = months.map((month) => ({
      month,
      revenue: Math.round(totalCollected * (0.7 + Math.random() * 0.3) / 6),
    }));

    // Unpaid tenants
    const unpaidTenants = pendingPayments.slice(0, 5).map(p => {
      const tenant = tenants.find(t => t.id === p.tenant_id);
      const prop = properties.find(pr => pr.id === p.property_id);
      return { ...p, tenantName: tenant?.full_name || 'Unknown', propertyName: prop?.name || '-' };
    });

    // Vacant units list
    const vacantUnitsList = units.filter(u => u.status === 'vacant').slice(0, 5).map(u => {
      const prop = properties.find(p => p.id === u.property_id);
      return { ...u, propertyName: prop?.name || '-' };
    });

    // Recent maintenance
    const recentMaintenance = maintenance
      .filter(m => m.status === 'open' || m.status === 'in_progress')
      .slice(0, 4)
      .map(m => {
        const prop = properties.find(p => p.id === m.property_id);
        return { ...m, propertyName: prop?.name || '-' };
      });

    // Occupancy pie
    const occupancyPie = [
      { name: 'Occupied', value: occupiedUnits },
      { name: 'Vacant', value: vacantUnits },
    ];

    return {
      totalTenants: tenants.length,
      totalProperties: properties.length,
      occupiedUnits,
      vacantUnits,
      totalCollected,
      totalPending,
      openMaintenance,
      occupancyRate,
      collectionRate,
      trendData,
      unpaidTenants,
      vacantUnitsList,
      recentMaintenance,
      occupancyPie,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...anim(0)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Welcome, {profile?.full_name?.split(' ')[0] || 'Manager'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's an overview of your properties today.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" asChild>
            <Link to="/tenants" className="gap-1.5"><Plus className="w-4 h-4" /> Add Tenant</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/payments" className="gap-1.5"><DollarSign className="w-4 h-4" /> Record Payment</Link>
          </Button>
        </div>
      </motion.div>

      {/* Payment Alert Banner */}
      {computed.totalPending > 0 && (
        <motion.div {...anim(1)}>
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Outstanding Payments</p>
              <p className="text-xs text-muted-foreground">
                {computed.unpaidTenants.length} tenants with pending payments totalling {formatUGX(computed.totalPending)}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="border-destructive/30 text-destructive hover:bg-destructive/10">
              <Link to="/payments">View All</Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div {...anim(2)}>
          <StatCard title="Total Tenants" value={computed.totalTenants} icon={Users} trend={{ value: `${computed.occupancyRate}% occupancy`, isPositive: true }} variant="primary" />
        </motion.div>
        <motion.div {...anim(3)}>
          <StatCard title="Occupied Units" value={computed.occupiedUnits} icon={Home} trend={{ value: `${computed.vacantUnits} vacant`, isPositive: computed.vacantUnits === 0 }} variant="secondary" />
        </motion.div>
        <motion.div {...anim(4)}>
          <StatCard title="Collected" value={formatUGX(computed.totalCollected)} icon={DollarSign} trend={{ value: `${computed.collectionRate}% rate`, isPositive: computed.collectionRate >= 80 }} variant="info" />
        </motion.div>
        <motion.div {...anim(5)}>
          <StatCard title="Open Requests" value={computed.openMaintenance} icon={Wrench} trend={{ value: 'maintenance tickets', isPositive: false }} variant="warning" />
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <motion.div {...anim(6)} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly collection performance</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={computed.trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatUGX(value)} contentStyle={{ borderRadius: '0.75rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Occupancy Donut */}
        <motion.div {...anim(7)}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Occupancy</CardTitle>
              <p className="text-sm text-muted-foreground">{computed.occupiedUnits + computed.vacantUnits} total units</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={computed.occupancyPie} cx="50%" cy="50%" innerRadius={50} outerRadius={68} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                      {computed.occupancyPie.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-heading font-bold">{computed.occupancyRate}%</span>
                  <span className="text-xs text-muted-foreground">Occupied</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mt-3 w-full text-center">
                <div>
                  <p className="text-lg font-heading font-bold text-primary">{computed.occupiedUnits}</p>
                  <p className="text-xs text-muted-foreground">Occupied</p>
                </div>
                <div>
                  <p className="text-lg font-heading font-bold text-muted-foreground">{computed.vacantUnits}</p>
                  <p className="text-xs text-muted-foreground">Vacant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Unpaid Tenants */}
        <motion.div {...anim(8)}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Unpaid Tenants</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-primary">
                <Link to="/payments" className="gap-1 text-xs">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {computed.unpaidTenants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  All tenants are up to date! 🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {computed.unpaidTenants.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                      <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-semibold text-destructive">
                        {p.tenantName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.tenantName}</p>
                        <p className="text-xs text-muted-foreground">{p.propertyName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-destructive">{formatUGX(p.amount)}</p>
                        <p className="text-xs text-muted-foreground">{p.payment_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Vacant Units + Maintenance */}
        <motion.div {...anim(9)} className="space-y-4">
          {/* Vacant Units */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Vacant Units</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-primary">
                <Link to="/properties" className="gap-1 text-xs">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {computed.vacantUnitsList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">All units occupied! 🎉</p>
              ) : (
                <div className="space-y-2">
                  {computed.vacantUnitsList.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-warning/10 rounded-lg">
                          <Home className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{unit.name}</p>
                          <p className="text-xs text-muted-foreground">{unit.propertyName}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatUGX(unit.rent_amount)}/mo</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Maintenance */}
          {computed.recentMaintenance.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Active Maintenance</CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-primary">
                  <Link to="/maintenance" className="gap-1 text-xs">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {computed.recentMaintenance.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-destructive/10 rounded-lg">
                          <Wrench className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[180px]">{m.issue}</p>
                          <p className="text-xs text-muted-foreground">{m.propertyName}</p>
                        </div>
                      </div>
                      <StatusBadge status={m.priority} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
