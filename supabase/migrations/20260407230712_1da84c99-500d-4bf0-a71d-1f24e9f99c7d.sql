
-- Create a security definer function to check if a tenant is on a manager's assigned property
-- This avoids the recursive RLS check between tenants and leases
CREATE OR REPLACE FUNCTION public.is_tenant_on_staff_property(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM leases l
    JOIN property_staff ps ON ps.property_id = l.property_id AND ps.user_id = _user_id
    WHERE l.tenant_id = _tenant_id
  )
$$;

-- Create a security definer function to check if a user is a tenant on a lease
CREATE OR REPLACE FUNCTION public.is_lease_tenant(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenants t
    WHERE t.id = _tenant_id AND t.user_id = _user_id
  )
$$;

-- Fix tenants policy: replace recursive subquery with security definer function
DROP POLICY IF EXISTS "Managers can manage their tenants" ON public.tenants;
CREATE POLICY "Managers can manage their tenants"
  ON public.tenants FOR ALL
  TO authenticated
  USING (
    auth.uid() = created_by
    OR is_tenant_on_staff_property(auth.uid(), id)
  )
  WITH CHECK (
    auth.uid() = created_by
    OR is_tenant_on_staff_property(auth.uid(), id)
  );

-- Fix leases policy: replace recursive subquery with security definer function
DROP POLICY IF EXISTS "Tenants can view own leases" ON public.leases;
CREATE POLICY "Tenants can view own leases"
  ON public.leases FOR SELECT
  TO authenticated
  USING (is_lease_tenant(auth.uid(), tenant_id));

-- Also fix payments tenant policy which has the same recursion issue
DROP POLICY IF EXISTS "Tenants can view own payments" ON public.payments;
CREATE POLICY "Tenants can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (is_lease_tenant(auth.uid(), tenant_id));

-- Fix tenants can view leased properties (also references tenants from leases)
DROP POLICY IF EXISTS "Tenants can view leased properties" ON public.properties;
CREATE POLICY "Tenants can view leased properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leases l
      WHERE l.property_id = properties.id
        AND is_lease_tenant(auth.uid(), l.tenant_id)
    )
  );

-- Fix tenants can view leased units
DROP POLICY IF EXISTS "Tenants can view leased units" ON public.units;
CREATE POLICY "Tenants can view leased units"
  ON public.units FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leases l
      WHERE l.unit_id = units.id
        AND is_lease_tenant(auth.uid(), l.tenant_id)
    )
  );
