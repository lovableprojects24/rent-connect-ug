import { useEffect, useState } from 'react';
import { Users, Building2, Trash2, Shield } from 'lucide-react';
import ResetPasswordButton from '@/components/shared/ResetPasswordButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AddStaffDialog from '@/components/forms/AddStaffDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;
type AppRole = Database['public']['Enums']['app_role'];

interface StaffMember {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  property_id: string;
  property_name: string;
  staff_name: string | null;
  staff_email: string | null;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteStaff, setDeleteStaff] = useState<StaffMember | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user, roles } = useAuth();

  const isSuperAdmin = roles.includes('admin') && !roles.includes('landlord');
  const isLandlordAdmin = roles.includes('admin') && roles.includes('landlord');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Landlord admins only see their own properties; super admins see all
    const propertiesQuery = supabase.from('properties').select('*').order('name');
    if (isLandlordAdmin) {
      propertiesQuery.eq('owner_id', user.id);
    }

    const [propertiesRes, staffRes] = await Promise.all([
      propertiesQuery,
      supabase.from('property_staff').select('*, properties(name)').order('created_at', { ascending: false }),
    ]);

    if (propertiesRes.data) setProperties(propertiesRes.data);

    if (staffRes.data) {
      // For landlord admins, filter staff to only their properties
      const ownPropertyIds = new Set(propertiesRes.data?.map(p => p.id) || []);
      const filteredStaff = isLandlordAdmin
        ? staffRes.data.filter((s: any) => ownPropertyIds.has(s.property_id))
        : staffRes.data;

      const userIds = [...new Set(filteredStaff.map((s: any) => s.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from('profiles').select('user_id, full_name').in('user_id', userIds)
        : { data: [] };

      const profileMap = new Map<string, string | null>(
        (profiles || []).map(p => [p.user_id, p.full_name] as [string, string | null])
      );

      const mapped: StaffMember[] = filteredStaff.map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        role: s.role,
        created_at: s.created_at,
        property_id: s.property_id,
        property_name: s.properties?.name || 'Unknown',
        staff_name: profileMap.get(s.user_id) || null,
        staff_email: null,
      }));

      setStaff(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteStaff) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('property_staff').delete().eq('id', deleteStaff.id);
      if (error) throw error;
      toast.success('Staff member removed');
      setDeleteStaff(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove staff');
    } finally {
      setDeleting(false);
    }
  };

  const roleBadgeColor = (role: AppRole) => {
    switch (role) {
      case 'manager': return 'bg-blue-50 text-blue-700';
      case 'admin': return 'bg-red-50 text-red-700';
      case 'tenant': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const roleLabel = (role: AppRole) => {
    switch (role) {
      case 'manager': return 'Manager';
      case 'admin': return 'Admin';
      case 'tenant': return 'Tenant';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl mb-2">Property Managers</h1>
          <p className="text-muted-foreground">Manage your property managers and their assignments</p>
        </div>
        <AddStaffDialog properties={properties} onSuccess={fetchData} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Total Managers</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-heading font-semibold">{staff.length}</p>
          <p className="text-sm text-green-600 mt-1">All active</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Total Properties</span>
            <Building2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-heading font-semibold">{properties.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Under management</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Unique Staff</span>
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-heading font-semibold">{new Set(staff.map(s => s.user_id)).size}</p>
          <p className="text-sm text-muted-foreground mt-1">Being managed</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No Staff Assigned</h3>
          <p className="text-muted-foreground">Assign managers to oversee your properties</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Manager</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Property</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm">
                          {(member.staff_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <p className="font-medium text-sm">{member.staff_name || 'Unknown User'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{member.property_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleBadgeColor(member.role)}`}>
                        {roleLabel(member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <ResetPasswordButton targetUserId={member.user_id} targetName={member.staff_name || 'User'} size="sm" />
                      <button onClick={() => setDeleteStaff(member)} className="text-destructive hover:underline text-sm">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteStaff}
        onOpenChange={(o) => !o && setDeleteStaff(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Staff"
        description={`Are you sure you want to remove "${deleteStaff?.staff_name || 'this user'}" from "${deleteStaff?.property_name}"?`}
      />
    </div>
  );
}
