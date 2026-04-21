import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Payment = Tables<'payments'>;

export interface PaymentWithDetails extends Payment {
  property_name: string | null;
  tenant_name: string | null;
}

export const paymentsService = {
  async getAll(): Promise<PaymentWithDetails[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*, properties(name), tenants(full_name)')
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...row,
      property_name: row.properties?.name ?? null,
      tenant_name: row.tenants?.full_name ?? null,
      properties: undefined,
      tenants: undefined,
    }));
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
