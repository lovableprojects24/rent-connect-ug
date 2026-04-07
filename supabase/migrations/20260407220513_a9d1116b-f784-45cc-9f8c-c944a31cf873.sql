-- Create a SECURITY DEFINER function to check property ownership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_property_owner(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties
    WHERE id = _property_id AND owner_id = _user_id
  )
$$;

-- Fix leases policies that cause recursion
DROP POLICY IF EXISTS "Property owners can manage leases" ON public.leases;
CREATE POLICY "Property owners can manage leases"
ON public.leases FOR ALL
USING (is_property_owner(auth.uid(), property_id));

-- Fix units policies
DROP POLICY IF EXISTS "Property owners can manage units" ON public.units;
CREATE POLICY "Property owners can manage units"
ON public.units FOR ALL
USING (is_property_owner(auth.uid(), property_id));

-- Fix payments policies
DROP POLICY IF EXISTS "Property owners can view payments" ON public.payments;
CREATE POLICY "Property owners can view payments"
ON public.payments FOR SELECT
USING (is_property_owner(auth.uid(), property_id));

-- Fix maintenance_requests policies
DROP POLICY IF EXISTS "Property owners can manage maintenance" ON public.maintenance_requests;
CREATE POLICY "Property owners can manage maintenance"
ON public.maintenance_requests FOR ALL
USING (is_property_owner(auth.uid(), property_id));

-- Also add a manager-level policy for properties so managers can view their assigned properties
DROP POLICY IF EXISTS "Staff can view assigned properties" ON public.properties;
CREATE POLICY "Staff can view assigned properties"
ON public.properties FOR SELECT
USING (is_property_staff(auth.uid(), id));