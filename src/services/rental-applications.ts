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
    // Update application status
    const { data: app, error } = await supabase
      .from('rental_applications')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: notes || null,
      })
      .eq('id', id)
      .select('*, units(name, type, rent_amount)')
      .single();
    if (error) throw error;

    // If approved, auto-create tenant + lease + mark unit occupied + notify
    if (status === 'approved' && app) {
      try {
        // 1. Create or find tenant record
        const { data: existingTenant } = await supabase
          .from('tenants')
          .select('id')
          .eq('user_id', app.applicant_user_id)
          .maybeSingle();

        let tenantId: string;
        if (existingTenant) {
          tenantId = existingTenant.id;
        } else {
          const { data: newTenant, error: tErr } = await supabase
            .from('tenants')
            .insert({
              user_id: app.applicant_user_id,
              full_name: app.full_name,
              phone: app.phone,
              email: app.email,
              created_by: reviewedBy,
            })
            .select()
            .single();
          if (tErr) throw tErr;
          tenantId = newTenant.id;
        }

        // 2. Create a 1-year lease
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const rentAmount = (app as any).units?.rent_amount || 0;

        const { error: leaseErr } = await supabase
          .from('leases')
          .insert({
            property_id: app.property_id,
            unit_id: app.unit_id,
            tenant_id: tenantId,
            start_date: startDate,
            end_date: endDate,
            rent_amount: rentAmount,
            deposit: 0,
            status: 'active',
          });
        if (leaseErr) throw leaseErr;

        // 3. Mark unit as occupied
        await supabase
          .from('units')
          .update({ status: 'occupied' as const })
          .eq('id', app.unit_id);

        // 4. Notify the applicant
        await supabase.from('notifications').insert({
          user_id: app.applicant_user_id,
          title: 'Application Approved! 🎉',
          message: `Your application for ${(app as any).units?.name || 'the unit'} has been approved. An allocation has been created for you.`,
          type: 'general',
          related_entity_id: app.id,
          related_entity_type: 'rental_application',
        });
      } catch (postErr) {
        console.error('Post-approval error:', postErr);
        // Application is already approved; don't revert
      }
    }

    return app;
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
