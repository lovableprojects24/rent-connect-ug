-- Add 'finance' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';

-- Create property_staff table to assign agents/finance officers to properties
CREATE TABLE public.property_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, user_id)
);

ALTER TABLE public.property_staff ENABLE ROW LEVEL SECURITY;

-- Property owners can manage staff assignments
CREATE POLICY "Owners can manage property staff"
  ON public.property_staff FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = property_staff.property_id
    AND properties.owner_id = auth.uid()
  ));

-- Admins can manage all staff
CREATE POLICY "Admins can manage all staff"
  ON public.property_staff FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Staff can view their own assignments
CREATE POLICY "Staff can view own assignments"
  ON public.property_staff FOR SELECT
  USING (auth.uid() = user_id);

-- Create a helper function to check if user is staff on a property
CREATE OR REPLACE FUNCTION public.is_property_staff(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.property_staff
    WHERE user_id = _user_id AND property_id = _property_id
  )
$$;

-- Update RLS on units: allow property staff to view
CREATE POLICY "Property staff can view units"
  ON public.units FOR SELECT
  USING (public.is_property_staff(auth.uid(), property_id));

-- Update RLS on leases: allow property staff to view
CREATE POLICY "Property staff can view leases"
  ON public.leases FOR SELECT
  USING (public.is_property_staff(auth.uid(), property_id));

-- Update RLS on payments: allow property staff to view
CREATE POLICY "Property staff can view payments"
  ON public.payments FOR SELECT
  USING (public.is_property_staff(auth.uid(), property_id));

-- Update RLS on maintenance: allow property staff to view
CREATE POLICY "Property staff can view maintenance"
  ON public.maintenance_requests FOR SELECT
  USING (public.is_property_staff(auth.uid(), property_id));

-- Allow agents (staff) to also manage leases and payments they're assigned to
CREATE POLICY "Agent staff can manage leases"
  ON public.leases FOR ALL
  USING (public.is_property_staff(auth.uid(), property_id));

CREATE POLICY "Agent staff can manage payments"
  ON public.payments FOR ALL
  USING (public.is_property_staff(auth.uid(), property_id));

CREATE POLICY "Agent staff can manage maintenance"
  ON public.maintenance_requests FOR ALL
  USING (public.is_property_staff(auth.uid(), property_id));