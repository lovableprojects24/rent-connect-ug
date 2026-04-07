import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Payment = Tables<'payments'>;

export const paymentsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByTenantId(tenantId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(payment: TablesInsert<'payments'>) {
    const { data, error } = await supabase.from('payments').insert(payment).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'payments'>) {
    const { data, error } = await supabase.from('payments').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
  },
};
