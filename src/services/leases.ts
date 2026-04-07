import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Lease = Tables<'leases'>;

export const leasesService = {
  async getAll() {
    const { data, error } = await supabase.from('leases').select('*');
    if (error) throw error;
    return data;
  },

  async getByTenantId(tenantId: string) {
    const { data, error } = await supabase
      .from('leases')
      .select('*, properties(name), units(name)')
      .eq('tenant_id', tenantId)
      .order('start_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getActiveByProperty(propertyId: string) {
    const { data, error } = await supabase
      .from('leases')
      .select('unit_id, tenants(id, full_name)')
      .eq('property_id', propertyId)
      .eq('status', 'active');
    if (error) throw error;
    return data;
  },

  async create(lease: TablesInsert<'leases'>) {
    const { data, error } = await supabase.from('leases').insert(lease).select().single();
    if (error) throw error;
    return data;
  },
};
