import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type Tenant = Tables<'tenants'>;

export const tenantsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getNamesList() {
    const { data, error } = await supabase.from('tenants').select('id, full_name').order('full_name');
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'tenants'>) {
    const { data, error } = await supabase.from('tenants').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) throw error;
  },

  async createViaEdgeFunction(body: { full_name: string; email: string; phone: string; emergency_contact?: string | null }) {
    const { data, error } = await supabase.functions.invoke('create-tenant', { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data as { tenant_id: string; user_id: string; email: string; temporary_password: string };
  },
};
