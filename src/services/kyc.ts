import { supabase } from '@/integrations/supabase/client';

export type KycStatus = 'pending' | 'verified' | 'rejected' | 'expired';
export type IdDocumentType = 'national_id' | 'passport' | 'drivers_license' | 'voter_id' | 'work_permit';

export interface KycVerification {
  id: string;
  user_id: string;
  id_type: IdDocumentType;
  id_number: string;
  id_front_url: string | null;
  id_back_url: string | null;
  selfie_url: string | null;
  status: KycStatus;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const ID_TYPE_LABELS: Record<IdDocumentType, string> = {
  national_id: 'National ID',
  passport: 'Passport',
  drivers_license: "Driver's License",
  voter_id: 'Voter ID',
  work_permit: 'Work Permit',
};

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  pending: 'Pending Review',
  verified: 'Verified',
  rejected: 'Rejected',
  expired: 'Expired',
};

export const kycService = {
  async getByUserId(userId: string): Promise<KycVerification | null> {
    const { data } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return data as unknown as KycVerification | null;
  },

  async uploadDocument(userId: string, file: File, docType: 'front' | 'back' | 'selfie'): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${docType}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('kyc-documents').upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  },

  async getSignedUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage.from('kyc-documents').createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  },

  async submit(params: {
    user_id: string;
    id_type: IdDocumentType;
    id_number: string;
    id_front_url?: string;
    id_back_url?: string;
    selfie_url?: string;
    expiry_date?: string;
  }): Promise<KycVerification> {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .upsert(
        { ...params, status: 'pending' as const } as any,
        { onConflict: 'user_id' }
      )
      .select()
      .single();
    if (error) throw error;
    return data as unknown as KycVerification;
  },

  async verify(id: string, verifiedBy: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'verified' as any,
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
        notes: notes || null,
      } as any)
      .eq('id', id);
    if (error) throw error;
  },

  async reject(id: string, verifiedBy: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'rejected' as any,
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
        rejection_reason: reason,
      } as any)
      .eq('id', id);
    if (error) throw error;
  },
};
