import { useEffect, useState } from 'react';
import { Users, Building2, Trash2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const fetchData = async () => {
    setLoading(true);
    const [propertiesRes, staffRes] = await Promise.all([
      supabase.from('properties').select('*').order('name'),
      supabase.from('property_staff').select('*, properties(name)').order('created_at', { ascending: false }),
    ]);

    if (propertiesRes.data) setProperties(propertiesRes.data);

    if (staffRes.data) {
      // For each staff member, look up their profile
      const userIds = [...new Set(staffRes.data.map((s: any) => s.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      const mapped: StaffMember[] = staffRes.data.map((s: any) => ({
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
      case 'agent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'finance': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const roleLabel = (role: AppRole) => {
    switch (role) {
      case 'agent': return 'Agent';
      case 'finance': return 'Finance';
      case 'admin': return 'Admin';
      case 'landlord': return 'Landlord';
      case 'tenant': return 'Tenant';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Staff Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {staff.length} staff member{staff.length !== 1 ? 's' : ''} assigned across your properties
          </p>
        </div>
        <AddStaffDialog properties={properties} onSuccess={fetchData} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No staff assigned yet</p>
          <p className="text-sm mt-1">Assign agents or finance officers to manage your properties</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {staff.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{member.staff_name || 'Unknown User'}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {member.property_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor(member.role)}`}>
                      {roleLabel(member.role)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteStaff(member)}>
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
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Staff Member</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Property</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Assigned</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{member.staff_name || 'Unknown User'}</td>
                    <td className="px-4 py-3 text-sm">{member.property_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor(member.role)}`}>
                        {roleLabel(member.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(member.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteStaff(member)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </>
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
