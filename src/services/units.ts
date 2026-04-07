import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Unit = Tables<'units'>;

export const unitsService = {
  async getAll() {
    const { data, error } = await supabase.from('units').select('*');
    if (error) throw error;
    return data;
  },

  async getByPropertyId(propertyId: string) {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('property_id', propertyId)
      .order('name');
    if (error) throw error;
    return data;
  },

  async getVacantByProperty(propertyId: string) {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('property_id', propertyId)
      .eq('status', 'vacant')
      .order('name');
    if (error) throw error;
    return data;
  },

  async create(unit: TablesInsert<'units'>) {
    const { data, error } = await supabase.from('units').insert(unit).select().single();
    if (error) throw error;
    return data;
  },

  async bulkCreate(units: TablesInsert<'units'>[]) {
    const { data, error } = await supabase.from('units').insert(units).select();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'units'>) {
    const { data, error } = await supabase.from('units').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('units').delete().eq('id', id);
    if (error) throw error;
  },

  async markOccupied(id: string) {
    const { error } = await supabase.from('units').update({ status: 'occupied' as const }).eq('id', id);
    if (error) throw error;
  },
};
