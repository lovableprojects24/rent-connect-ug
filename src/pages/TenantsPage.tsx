import { Plus, Phone, Mail } from 'lucide-react';
import { tenants, formatUGX } from '@/data/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Tenants</h1>
          <p className="text-muted-foreground text-sm mt-1">{tenants.length} tenants across all properties</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Tenant</span>
        </Button>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {tenants.map((tenant, i) => (
          <motion.div
            key={tenant.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{tenant.name}</h3>
                <p className="text-xs text-muted-foreground">{tenant.propertyName} · {tenant.unitName}</p>
              </div>
              <StatusBadge status={tenant.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{tenant.phone}</span>
              {tenant.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{tenant.email}</span>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rent: {formatUGX(tenant.rentAmount)}</span>
              <span className={`font-semibold ${tenant.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                {tenant.balance > 0 ? `Owes ${formatUGX(tenant.balance)}` : 'Paid up'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tenant</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Property / Unit</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Phone</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Rent</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Balance</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{tenant.name}</p>
                  {tenant.email && <p className="text-xs text-muted-foreground">{tenant.email}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{tenant.propertyName} · {tenant.unitName}</td>
                <td className="px-4 py-3 text-sm">{tenant.phone}</td>
                <td className="px-4 py-3 text-sm font-medium">{formatUGX(tenant.rentAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-semibold ${tenant.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                    {tenant.balance > 0 ? formatUGX(tenant.balance) : 'Cleared'}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={tenant.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
