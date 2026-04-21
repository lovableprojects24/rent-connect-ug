-- Create KYC status enum
CREATE TYPE public.kyc_status AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- Create ID type enum
CREATE TYPE public.id_document_type AS ENUM ('national_id', 'passport', 'drivers_license', 'voter_id', 'work_permit');

-- Create kyc_verifications table
CREATE TABLE public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  id_type id_document_type NOT NULL,
  id_number TEXT NOT NULL,
  id_front_url TEXT,
  id_back_url TEXT,
  selfie_url TEXT,
  status kyc_status NOT NULL DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Admins can manage all KYC records
CREATE POLICY "Admins can manage all kyc"
  ON public.kyc_verifications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Landlords can view KYC for tenants they created
CREATE POLICY "Landlords can view tenant kyc"
  ON public.kyc_verifications FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'landlord'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

-- Users can view own KYC
CREATE POLICY "Users can view own kyc"
  ON public.kyc_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own KYC
CREATE POLICY "Users can insert own kyc"
  ON public.kyc_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own pending KYC
CREATE POLICY "Users can update own pending kyc"
  ON public.kyc_verifications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Timestamp trigger
CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);

-- Storage policies: users upload to own folder
CREATE POLICY "Users can upload own kyc docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view own kyc docs
CREATE POLICY "Users can view own kyc docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can view all kyc docs
CREATE POLICY "Admins can view all kyc docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'kyc-documents' AND has_role(auth.uid(), 'admin'::app_role));

-- Landlords/managers can view kyc docs
CREATE POLICY "Landlords can view kyc docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'kyc-documents' AND (has_role(auth.uid(), 'landlord'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));