import { useEffect, useState } from 'react';
import { Phone, Mail, Users, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import AddTenantDialog from '@/components/forms/AddTenantDialog';
import EditTenantDialog from '@/components/forms/EditTenantDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Tenant = Tables<'tenants'>;

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<Tenant | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTenants = async () => {
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (data) setTenants(data);
    setLoading(false);
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleDelete = async () => {
    if (!deleteTenant) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('tenants').delete().eq('id', deleteTenant.id);
      if (error) throw error;
      toast.success('Tenant deleted');
      setDeleteTenant(null);
      fetchTenants();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tenant');
    } finally {
      setDeleting(false);
    }
  };

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
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{tenant.full_name}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{tenant.phone}</span>
                      {tenant.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{tenant.email}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditTenant(tenant)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTenant(tenant)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
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
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{tenant.full_name}</td>
                    <td className="px-4 py-3 text-sm">{tenant.phone}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{tenant.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{tenant.emergency_contact || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(tenant.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditTenant(tenant)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTenant(tenant)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </>
      )}

      <EditTenantDialog tenant={editTenant} open={!!editTenant} onOpenChange={(o) => !o && setEditTenant(null)} onSuccess={fetchTenants} />
      <DeleteConfirmDialog open={!!deleteTenant} onOpenChange={(o) => !o && setDeleteTenant(null)} onConfirm={handleDelete} loading={deleting} title="Delete Tenant" description={`Are you sure you want to delete "${deleteTenant?.full_name}"? This cannot be undone.`} />
    </div>
  );
}
