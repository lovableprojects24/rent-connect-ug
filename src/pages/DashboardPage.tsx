import { Building2, Users, CreditCard, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { properties, tenants, payments, maintenanceRequests, monthlyRevenueData, paymentMethodData, formatUGX } from '@/data/mock-data';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const totalUnits = properties.reduce((a, p) => a + p.totalUnits, 0);
  const occupiedUnits = properties.reduce((a, p) => a + p.occupiedUnits, 0);
  const totalRevenue = properties.reduce((a, p) => a + p.monthlyRevenue, 0);
  const totalArrears = tenants.reduce((a, t) => a + t.balance, 0);
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const openMaintenance = maintenanceRequests.filter(m => m.status === 'open' || m.status === 'in_progress').length;

  const recentPayments = payments.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, John. Here's your portfolio overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Properties" value={properties.length.toString()} subtitle={`${occupiedUnits}/${totalUnits} units occupied`} icon={Building2} variant="primary" delay={0} />
        <StatCard title="Active Tenants" value={activeTenants.toString()} subtitle={`${tenants.length - activeTenants} inactive`} icon={Users} variant="info" delay={0.1} />
        <StatCard title="Monthly Revenue" value={formatUGX(totalRevenue)} subtitle="This month" icon={CreditCard} variant="secondary" delay={0.2} />
        <StatCard title="Outstanding" value={formatUGX(totalArrears)} subtitle={`${openMaintenance} maintenance open`} icon={AlertTriangle} variant="warning" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => formatUGX(v)} />
              <Bar dataKey="collected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Collected" />
              <Bar dataKey="expected" fill="hsl(var(--border))" radius={[4, 4, 0, 0]} name="Expected" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {paymentMethodData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {paymentMethodData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Payments & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{p.tenantName}</p>
                  <p className="text-xs text-muted-foreground">{p.method} · {p.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatUGX(p.amount)}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Maintenance Requests</h3>
          <div className="space-y-3">
            {maintenanceRequests.slice(0, 5).map((m) => (
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
        </motion.div>
      </div>
    </div>
  );
}
