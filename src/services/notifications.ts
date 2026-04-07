import { supabase } from "@/integrations/supabase/client";

export const notificationsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
  },

  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    if (error) throw error;
  },

  async deleteNotification(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async generateRentReminders() {
    const { data, error } = await supabase.rpc('generate_rent_reminders');
    if (error) throw error;
    return data as number;
  },

  async generateLatePaymentAlerts() {
    const { data, error } = await supabase.rpc('generate_late_payment_alerts');
    if (error) throw error;
    return data as number;
  },

  async generateLeaseExpiryAlerts() {
    const { data, error } = await supabase.rpc('generate_lease_expiry_alerts');
    if (error) throw error;
    return data as number;
  },
};
