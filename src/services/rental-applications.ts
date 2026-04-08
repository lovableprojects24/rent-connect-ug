import { supabase } from '@/integrations/supabase/client';

export interface RentalApplication {
  id: string;
  applicant_user_id: string;
  property_id: string;
  unit_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const rentalApplicationsService = {
  async getAvailableListings() {
    const { data, error } = await supabase
      .from('units')
      .select('*, properties(id, name, location, type, image_url)')
      .eq('status', 'vacant')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMyApplications(userId: string) {
    const { data, error } = await supabase
      .from('rental_applications')
      .select('*, properties(name, location), units(name, type, rent_amount)')
      .eq('applicant_user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as any[];
  },

  async getApplicationsForManager() {
    const { data, error } = await supabase
      .from('rental_applications')
      .select('*, properties(name, location), units(name, type, rent_amount)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as any[];
  },

  async apply(application: {
    applicant_user_id: string;
    property_id: string;
    unit_id: string;
    full_name: string;
    phone: string;
    email?: string;
    message?: string;
  }) {
    const { data, error } = await supabase
      .from('rental_applications')
      .insert(application)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'approved' | 'rejected', reviewedBy: string, notes?: string) {
    const { data, error } = await supabase
      .from('rental_applications')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: notes || null,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async cancel(id: string) {
    const { data, error } = await supabase
      .from('rental_applications')
      .update({ status: 'cancelled' as any })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
