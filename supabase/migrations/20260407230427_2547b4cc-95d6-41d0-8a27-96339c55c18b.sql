
-- Drop the existing narrow policy
DROP POLICY IF EXISTS "Managers can manage created tenants" ON public.tenants;

-- Create expanded policy: managers can manage tenants they created OR tenants linked to their assigned properties via leases
CREATE POLICY "Managers can manage their tenants"
  ON public.tenants FOR ALL
  TO authenticated
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM leases l
      WHERE l.tenant_id = tenants.id
        AND is_property_staff(auth.uid(), l.property_id)
    )
  )
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM leases l
      WHERE l.tenant_id = tenants.id
        AND is_property_staff(auth.uid(), l.property_id)
    )
  );
