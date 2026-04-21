-- 1. Create is_super_admin function (admin WITHOUT landlord role)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'landlord'
  )
$$;

-- 2. Properties: restrict admin policy to super admins only
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
CREATE POLICY "Super admins can manage all properties"
  ON public.properties FOR ALL
  USING (is_super_admin(auth.uid()));

-- 3. Tenants: restrict admin policy + add landlord-scoped policy
DROP POLICY IF EXISTS "Admins can manage all tenants" ON public.tenants;
CREATE POLICY "Super admins can manage all tenants"
  ON public.tenants FOR ALL
  USING (is_super_admin(auth.uid()));

-- Landlords can manage tenants on their properties (via leases)
CREATE POLICY "Landlords can manage own tenants"
  ON public.tenants FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'landlord'::app_role)
    AND (
      auth.uid() = created_by
      OR EXISTS (
        SELECT 1 FROM leases l
        JOIN properties p ON p.id = l.property_id
        WHERE l.tenant_id = tenants.id AND p.owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'landlord'::app_role)
    AND (
      auth.uid() = created_by
      OR EXISTS (
        SELECT 1 FROM leases l
        JOIN properties p ON p.id = l.property_id
        WHERE l.tenant_id = tenants.id AND p.owner_id = auth.uid()
      )
    )
  );

-- 4. Payments: restrict admin policy + add landlord-scoped policy
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
CREATE POLICY "Super admins can manage all payments"
  ON public.payments FOR ALL
  USING (is_super_admin(auth.uid()));

-- Landlords can manage payments on their properties
CREATE POLICY "Landlords can manage own payments"
  ON public.payments FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'landlord'::app_role)
    AND is_property_owner(auth.uid(), property_id)
  )
  WITH CHECK (
    has_role(auth.uid(), 'landlord'::app_role)
    AND is_property_owner(auth.uid(), property_id)
  );

-- 5. Leases: restrict admin policy (owners already covered)
DROP POLICY IF EXISTS "Admins can manage all leases" ON public.leases;
CREATE POLICY "Super admins can manage all leases"
  ON public.leases FOR ALL
  USING (is_super_admin(auth.uid()));

-- 6. Units: restrict admin policy (owners already covered)
DROP POLICY IF EXISTS "Admins can manage all units" ON public.units;
CREATE POLICY "Super admins can manage all units"
  ON public.units FOR ALL
  USING (is_super_admin(auth.uid()));

-- 7. Maintenance: restrict admin policy (owners already covered)
DROP POLICY IF EXISTS "Admins can manage all maintenance" ON public.maintenance_requests;
CREATE POLICY "Super admins can manage all maintenance"
  ON public.maintenance_requests FOR ALL
  USING (is_super_admin(auth.uid()));

-- 8. Notifications: restrict admin policy
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Super admins can manage all notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- 9. User roles: restrict admin policy
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  USING (is_super_admin(auth.uid()));

-- 10. Profiles: restrict admin policy
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Super admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- 11. KYC: restrict admin policy
DROP POLICY IF EXISTS "Admins can manage all kyc" ON public.kyc_verifications;
CREATE POLICY "Super admins can manage all kyc"
  ON public.kyc_verifications FOR ALL
  USING (is_super_admin(auth.uid()));

-- Landlords can manage KYC for their tenants
CREATE POLICY "Landlords can manage tenant kyc"
  ON public.kyc_verifications FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'landlord'::app_role)
    AND EXISTS (
      SELECT 1 FROM tenants t
      JOIN leases l ON l.tenant_id = t.id
      JOIN properties p ON p.id = l.property_id
      WHERE t.user_id = kyc_verifications.user_id AND p.owner_id = auth.uid()
    )
  );

-- 12. Property staff: restrict admin policy
DROP POLICY IF EXISTS "Admins can manage all staff" ON public.property_staff;
CREATE POLICY "Super admins can manage all staff"
  ON public.property_staff FOR ALL
  USING (is_super_admin(auth.uid()));

-- 13. App settings: restrict admin policy
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
CREATE POLICY "Super admins can manage settings"
  ON public.app_settings FOR ALL
  USING (is_super_admin(auth.uid()));

-- 14. Unit transfers: restrict admin policy
DROP POLICY IF EXISTS "Admins can manage all transfers" ON public.unit_transfers;
CREATE POLICY "Super admins can manage all transfers"
  ON public.unit_transfers FOR ALL
  USING (is_super_admin(auth.uid()));

-- Landlords can manage transfers on their properties
CREATE POLICY "Landlords can manage own transfers"
  ON public.unit_transfers FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'landlord'::app_role)
    AND is_property_owner(auth.uid(), property_id)
  )
  WITH CHECK (
    has_role(auth.uid(), 'landlord'::app_role)
    AND is_property_owner(auth.uid(), property_id)
  );

-- 15. Rental applications: restrict admin policy
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.rental_applications;
CREATE POLICY "Super admins can manage all applications"
  ON public.rental_applications FOR ALL
  USING (is_super_admin(auth.uid()));

-- 16. Onboarding requests: restrict admin policies
DROP POLICY IF EXISTS "Admins can update onboarding requests" ON public.onboarding_requests;
CREATE POLICY "Super admins can update onboarding requests"
  ON public.onboarding_requests FOR UPDATE
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view onboarding requests" ON public.onboarding_requests;
CREATE POLICY "Super admins can view onboarding requests"
  ON public.onboarding_requests FOR SELECT
  TO authenticated
  USING (is_super_admin(auth.uid()));