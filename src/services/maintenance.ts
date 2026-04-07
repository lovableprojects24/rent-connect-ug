import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type MaintenanceRequest = Tables<'maintenance_requests'>;

export const maintenanceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*, properties(name), units(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getBySubmitter(userId: string) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*, properties(name), units(name)')
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(request: TablesInsert<'maintenance_requests'>) {
    const { data, error } = await supabase.from('maintenance_requests').insert(request).select().single();
    if (error) throw error;
    return data;
  },
};
