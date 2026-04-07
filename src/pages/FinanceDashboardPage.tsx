import { useMemo } from 'react';
import { usePayments } from '@/hooks/usePayments';
import { useLeases } from '@/hooks/useLeases';
import { useTenantNames } from '@/hooks/useTenants';
import { formatUGX } from '@/lib/utils';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';

const METHOD_LABELS: Record<string, string> = {
  mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', cash: 'Cash', bank_transfer: 'Bank Transfer',
};
const METHOD_COLORS: Record<string, string> = {
  mtn_momo: 'hsl(48, 96%, 53%)', airtel_money: 'hsl(0, 72%, 51%)', cash: 'hsl(142, 52%, 36%)', bank_transfer: 'hsl(210, 80%, 52%)',
};
const STATUS_COLORS: Record<string, string> = {
  completed: 'hsl(142, 52%, 36%)', pending: 'hsl(48, 96%, 53%)', failed: 'hsl(0, 72%, 51%)',
};

export default function FinanceDashboardPage() {
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const { data: leases = [], isLoading: leasesLoading } = useLeases();
  const { data: tenants = [], isLoading: tenantsLoading } = useTenantNames();
  const loading = paymentsLoading || leasesLoading || tenantsLoading;

  const totalCompleted = useMemo(() => payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0), [payments]);
  const totalPending = useMemo(() => payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0), [payments]);
  const totalFailed = useMemo(() => payments.filter(p => p.status === 'failed').reduce((s, p) => s + p.amount, 0), [payments]);
  const totalAll = totalCompleted + totalPending + totalFailed;
  const collectionRate = totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0;
  const expectedMonthlyRent = useMemo(() => leases.filter(l => l.status === 'active').reduce((s, l) => s + l.rent_amount, 0), [leases]);

  const reconciliationData = useMemo(() => [
    { name: 'Completed', value: totalCompleted, color: STATUS_COLORS.completed, count: payments.filter(p => p.status === 'completed').length },
    { name: 'Pending', value: totalPending, color: STATUS_COLORS.pending, count: payments.filter(p => p.status === 'pending').length },
    { name: 'Failed', value: totalFailed, color: STATUS_COLORS.failed, count: payments.filter(p => p.status === 'failed').length },
  ], [totalCompleted, totalPending, totalFailed, payments]);

  const methodData = useMemo(() => {
    const map: Record<string, number> = {};
    payments.filter(p => p.status === 'completed').forEach(p => { map[p.method] = (map[p.method] || 0) + p.amount; });
    return Object.entries(map).map(([k, v]) => ({ name: METHOD_LABELS[k] || k, value: v, color: METHOD_COLORS[k] || 'hsl(var(--muted))' }));
  }, [payments]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthPayments = payments.filter(p => { const d = parseISO(p.payment_date); return d >= start && d <= end; });
      const collected = monthPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
      const pending = monthPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
      return { month: format(date, 'MMM'), collected, pending, expected: expectedMonthlyRent };
    });
  }, [payments, expectedMonthlyRent]);

  const typeData = useMemo(() => {
    const types = ['rent', 'deposit', 'maintenance'];
    return types.map(t => {
      const typePayments = payments.filter(p => p.type === t);
      const completed = typePayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
      const all = typePayments.reduce((s, p) => s + p.amount, 0);
      return { name: t.charAt(0).toUpperCase() + t.slice(1), rate: all > 0 ? Math.round((completed / all) * 100) : 0, total: all, collected: completed };
    });
  }, [payments]);

  const pendingPayments = useMemo(() => {
    return payments.filter(p => p.status === 'pending').slice(0, 8).map(p => ({
      ...p,
      tenantName: tenants.find(t => t.id === p.tenant_id)?.full_name || 'Unknown',
      methodLabel: METHOD_LABELS[p.method] || p.method,
    }));
  }, [payments, tenants]);

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
        <h1 className="text-2xl font-heading font-bold">Finance Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Payment reconciliation, collection rates & revenue analysis</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Collected" value={formatUGX(totalCompleted)} subtitle={`${payments.filter(p => p.status === 'completed').length} payments`} icon={CheckCircle2} variant="primary" delay={0} />
        <StatCard title="Pending" value={formatUGX(totalPending)} subtitle={`${payments.filter(p => p.status === 'pending').length} awaiting`} icon={Clock} variant="warning" delay={0.1} />
        <StatCard title="Collection Rate" value={`${collectionRate}%`} subtitle={`of ${formatUGX(totalAll)}`} icon={TrendingUp} variant="info" delay={0.2} />
        <StatCard title="Expected Monthly" value={formatUGX(expectedMonthlyRent)} subtitle={`${leases.filter(l => l.status === 'active').length} active leases`} icon={CreditCard} variant="secondary" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Revenue Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => formatUGX(v)} />
              <Legend />
              <Bar dataKey="collected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Collected" />
              <Bar dataKey="pending" fill="hsl(48, 96%, 53%)" radius={[4, 4, 0, 0]} name="Pending" />
              <Bar dataKey="expected" fill="hsl(var(--border))" radius={[4, 4, 0, 0]} name="Expected" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Payment Reconciliation</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={reconciliationData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {reconciliationData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatUGX(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {reconciliationData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{formatUGX(d.value)}</span>
                  <span className="text-xs text-muted-foreground ml-1">({d.count})</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Collection Rate by Type</h3>
          <div className="space-y-4">
            {typeData.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">{t.rate}% · {formatUGX(t.collected)} / {formatUGX(t.total)}</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${t.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Revenue by Payment Method</h3>
          {methodData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No completed payments yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={methodData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                    {methodData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatUGX(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {methodData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium">{formatUGX(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {pendingPayments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" /> Pending Reconciliation
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-2">Tenant</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-2">Method</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-2">Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-2">Reference</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2">Amount</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="py-3 text-sm font-medium">{p.tenantName}</td>
                    <td className="py-3 text-sm text-muted-foreground">{p.methodLabel}</td>
                    <td className="py-3 text-sm text-muted-foreground">{p.payment_date}</td>
                    <td className="py-3 text-xs font-mono text-muted-foreground">{p.reference || '—'}</td>
                    <td className="py-3 text-sm font-semibold text-right">{formatUGX(p.amount)}</td>
                    <td className="py-3 text-right"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
