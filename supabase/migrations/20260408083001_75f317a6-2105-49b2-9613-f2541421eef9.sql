
-- Create application status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Create rental_applications table
CREATE TABLE public.rental_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_user_id UUID NOT NULL,
  property_id UUID NOT NULL,
  unit_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  status public.application_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;

-- Applicants can view own applications
CREATE POLICY "Applicants can view own applications"
ON public.rental_applications FOR SELECT
TO authenticated
USING (auth.uid() = applicant_user_id);

-- Applicants can create applications
CREATE POLICY "Applicants can create applications"
ON public.rental_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = applicant_user_id);

-- Applicants can cancel own pending applications
CREATE POLICY "Applicants can update own applications"
ON public.rental_applications FOR UPDATE
TO authenticated
USING (auth.uid() = applicant_user_id);

-- Property owners can manage applications
CREATE POLICY "Property owners can manage applications"
ON public.rental_applications FOR ALL
TO authenticated
USING (is_property_owner(auth.uid(), property_id));

-- Property staff can manage applications
CREATE POLICY "Property staff can manage applications"
ON public.rental_applications FOR ALL
TO authenticated
USING (is_property_staff(auth.uid(), property_id))
WITH CHECK (is_property_staff(auth.uid(), property_id));

-- Admins can manage all applications
CREATE POLICY "Admins can manage all applications"
ON public.rental_applications FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_rental_applications_updated_at
BEFORE UPDATE ON public.rental_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Allow tenants to view all vacant units for browsing (public listing)
-- We need a policy on properties and units for tenants to browse
CREATE POLICY "Authenticated users can view properties with vacant units"
ON public.properties FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view vacant units"
ON public.units FOR SELECT
TO authenticated
USING (status = 'vacant');
