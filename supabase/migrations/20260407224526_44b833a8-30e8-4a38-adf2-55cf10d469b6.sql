
-- Properties: managers can manage properties they're staff on
CREATE POLICY "Managers can manage assigned properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (is_property_staff(auth.uid(), id))
  WITH CHECK (is_property_staff(auth.uid(), id));

-- Units: managers can manage units in assigned properties
DROP POLICY IF EXISTS "Property staff can view units" ON public.units;
CREATE POLICY "Property staff can manage units"
  ON public.units FOR ALL
  TO authenticated
  USING (is_property_staff(auth.uid(), property_id))
  WITH CHECK (is_property_staff(auth.uid(), property_id));

-- Tenants: managers can manage tenants they created
CREATE POLICY "Managers can manage created tenants"
  ON public.tenants FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Leases: managers can manage leases for assigned properties
DROP POLICY IF EXISTS "Property staff can view leases" ON public.leases;
CREATE POLICY "Property staff can manage leases"
  ON public.leases FOR ALL
  TO authenticated
  USING (is_property_staff(auth.uid(), property_id))
  WITH CHECK (is_property_staff(auth.uid(), property_id));

-- Payments: managers can manage payments for assigned properties
DROP POLICY IF EXISTS "Property staff can view payments" ON public.payments;
CREATE POLICY "Property staff can manage payments"
  ON public.payments FOR ALL
  TO authenticated
  USING (is_property_staff(auth.uid(), property_id))
  WITH CHECK (is_property_staff(auth.uid(), property_id));

-- Maintenance: managers can manage maintenance for assigned properties
DROP POLICY IF EXISTS "Property staff can view maintenance" ON public.maintenance_requests;
CREATE POLICY "Property staff can manage maintenance"
  ON public.maintenance_requests FOR ALL
  TO authenticated
  USING (is_property_staff(auth.uid(), property_id))
  WITH CHECK (is_property_staff(auth.uid(), property_id));
