import { supabase } from '@/integrations/supabase/client';

export const staffService = {
  async getPropertyStaff() {
    const { data, error } = await supabase
      .from('property_staff')
      .select('*, properties(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getProfilesByUserIds(userIds: string[]) {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', userIds);
    if (error) throw error;
    return data;
  },

  async deleteStaff(id: string) {
    const { error } = await supabase.from('property_staff').delete().eq('id', id);
    if (error) throw error;
  },

  async getAllRoles() {
    const { data, error } = await supabase.from('user_roles').select('*');
    if (error) throw error;
    return data;
  },

  async getAllProfiles() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data;
  },
};
