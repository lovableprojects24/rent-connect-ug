import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { monthlyRevenueData, formatUGX, properties } from '@/data/mock-data';
import { motion } from 'framer-motion';

const occupancyTrend = [
  { month: 'Jul', rate: 82 },
  { month: 'Aug', rate: 85 },
  { month: 'Sep', rate: 88 },
  { month: 'Oct', rate: 84 },
  { month: 'Nov', rate: 87 },
  { month: 'Dec', rate: 85 },
];

export default function ReportsPage() {
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
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
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
              <YAxis domain={[70, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Occupancy" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Per-property summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold mb-4">Property Summary</h3>
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
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="py-3 text-sm font-medium">{p.name}</td>
                  <td className="py-3 text-sm text-muted-foreground">{p.location}</td>
                  <td className="py-3 text-sm text-center">{p.occupiedUnits}/{p.totalUnits}</td>
                  <td className="py-3 text-sm text-center">{Math.round((p.occupiedUnits / p.totalUnits) * 100)}%</td>
                  <td className="py-3 text-sm font-semibold text-right">{formatUGX(p.monthlyRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
