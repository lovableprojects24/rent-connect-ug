import { useEffect, useState } from 'react';
import { Phone, Mail, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import AddTenantDialog from '@/components/forms/AddTenantDialog';
import type { Tables } from '@/integrations/supabase/types';

type Tenant = Tables<'tenants'>;

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (data) setTenants(data);
    setLoading(false);
  };

  useEffect(() => { fetchTenants(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Tenants</h1>
          <p className="text-muted-foreground text-sm mt-1">{tenants.length} tenants across all properties</p>
        </div>
        <AddTenantDialog onSuccess={fetchTenants} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No tenants yet</p>
          <p className="text-sm mt-1">Add your first tenant to get started</p>
        </div>
      ) : (
        <>
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
                <div>
                  <h3 className="font-medium">{tenant.full_name}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{tenant.phone}</span>
                  {tenant.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{tenant.email}</span>}
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
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Phone</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Emergency Contact</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Added</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-sm font-medium">{tenant.full_name}</td>
                    <td className="px-4 py-3 text-sm">{tenant.phone}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{tenant.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{tenant.emergency_contact || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(tenant.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </>
      )}
    </div>
  );
}
