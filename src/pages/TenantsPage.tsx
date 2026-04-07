import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Phone, Mail, Users } from 'lucide-react';
import AddTenantDialog from '@/components/forms/AddTenantDialog';
import AddLeaseDialog from '@/components/forms/AddLeaseDialog';
import EditTenantDialog from '@/components/forms/EditTenantDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { useTenants, useDeleteTenant } from '@/hooks/useTenants';
import type { Tables } from '@/integrations/supabase/types';

type Tenant = Tables<'tenants'>;

export default function TenantsPage() {
  const navigate = useNavigate();
  const { data: tenants = [], isLoading: loading } = useTenants();
  const deleteTenantMutation = useDeleteTenant();
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<Tenant | null>(null);
  const [search, setSearch] = useState('');

  const handleDelete = async () => {
    if (!deleteTenant) return;
    await deleteTenantMutation.mutateAsync(deleteTenant.id);
    setDeleteTenant(null);
  };

  const filtered = tenants.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.phone.includes(search) ||
    (t.email && t.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl mb-2">Tenants</h1>
          <p className="text-muted-foreground">Manage tenant information and status</p>
        </div>
        <div className="flex gap-2">
          <AddLeaseDialog onSuccess={() => {}} />
          <AddTenantDialog onSuccess={() => {}} />
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No Tenants Found</h3>
          <p className="text-muted-foreground">Add your first tenant to get started</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Tenant</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Emergency</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Added</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/tenants/${tenant.id}`)}>
                        {tenant.full_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{tenant.phone}</span>
                        </div>
                        {tenant.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{tenant.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{tenant.emergency_contact || '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(tenant.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/tenants/${tenant.id}`)} className="text-primary hover:underline text-sm">View</button>
                        <button onClick={() => setEditTenant(tenant)} className="text-primary hover:underline text-sm">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditTenantDialog tenant={editTenant} open={!!editTenant} onOpenChange={(o) => !o && setEditTenant(null)} onSuccess={() => {}} />
      <DeleteConfirmDialog open={!!deleteTenant} onOpenChange={(o) => !o && setDeleteTenant(null)} onConfirm={handleDelete} loading={deleteTenantMutation.isPending} title="Delete Tenant" description={`Are you sure you want to delete "${deleteTenant?.full_name}"? This cannot be undone.`} />
    </div>
  );
}
