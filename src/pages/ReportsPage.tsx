import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatUGX } from '@/lib/utils';
import { usePayments } from '@/hooks/usePayments';
import { useProperties } from '@/hooks/useProperties';
import { useUnits } from '@/hooks/useUnits';
import { useLeases } from '@/hooks/useLeases';
import { motion } from 'framer-motion';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export default function ReportsPage() {
  const { data: payments = [], isLoading: pLoading } = usePayments();
  const { data: properties = [], isLoading: prLoading } = useProperties();
  const { data: units = [], isLoading: uLoading } = useUnits();
  const { data: leases = [], isLoading: lLoading } = useLeases();
  const loading = pLoading || prLoading || uLoading || lLoading;

  const monthlyRevenueData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthPayments = payments.filter(p => {
        const d = parseISO(p.payment_date);
        return d >= start && d <= end;
      });
      const collected = monthPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
      const expected = leases.filter(l => l.status === 'active').reduce((s, l) => s + l.rent_amount, 0);
      return { month: format(date, 'MMM'), collected, expected };
    });
  }, [payments, leases]);

  const occupancyTrend = useMemo(() => {
    // Calculate current occupancy since we don't have historical data
    const totalUnits = units.length;
    const occupied = units.filter(u => u.status === 'occupied').length;
    const rate = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => ({
      month: format(subMonths(now, 5 - i), 'MMM'),
      rate,
    }));
  }, [units]);

  const propertyStats = useMemo(() => {
    return properties.map(p => {
      const propUnits = units.filter(u => u.property_id === p.id);
      const occupied = propUnits.filter(u => u.status === 'occupied').length;
      const propLeases = leases.filter(l => l.property_id === p.id && l.status === 'active');
      const monthlyRevenue = propLeases.reduce((s, l) => s + l.rent_amount, 0);
      return {
        id: p.id,
        name: p.name,
        location: p.location,
        totalUnits: propUnits.length,
        occupiedUnits: occupied,
        monthlyRevenue,
      };
    });
  }, [properties, units, leases]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Financial insights and analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => formatUGX(v)} />
              <Bar dataKey="collected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Collected" />
              <Bar dataKey="expected" fill="hsl(var(--border))" radius={[4, 4, 0, 0]} name="Expected" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Occupancy Rate Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={occupancyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Occupancy" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold mb-4">Property Summary</h3>
        {propertyStats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No properties yet. Add properties to see reports.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-2">Property</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-2">Location</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-2">Units</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-2">Occupancy</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2">Revenue/mo</th>
                </tr>
              </thead>
              <tbody>
                {propertyStats.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="py-3 text-sm font-medium">{p.name}</td>
                    <td className="py-3 text-sm text-muted-foreground">{p.location}</td>
                    <td className="py-3 text-sm text-center">{p.occupiedUnits}/{p.totalUnits}</td>
                    <td className="py-3 text-sm text-center">{p.totalUnits > 0 ? Math.round((p.occupiedUnits / p.totalUnits) * 100) : 0}%</td>
                    <td className="py-3 text-sm font-semibold text-right">{formatUGX(p.monthlyRevenue)}</td>
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
