import { supabase } from '@/integrations/supabase/client';

export const settingsService = {
  async getAll() {
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) throw error;
    return data;
  },

  async updateSetting(key: string, value: any) {
    const { error } = await supabase
      .from('app_settings')
      .update({ setting_value: value })
      .eq('setting_key', key);
    if (error) throw error;
  },

  async updateProfile(userId: string, updates: { full_name?: string; phone?: string }) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async changePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};
