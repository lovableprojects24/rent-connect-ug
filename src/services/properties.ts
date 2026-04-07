import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Property = Tables<'properties'>;

export const propertiesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(property: TablesInsert<'properties'>) {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'properties'>) {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
  },
};
