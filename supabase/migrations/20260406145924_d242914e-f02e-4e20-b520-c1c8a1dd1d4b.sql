
-- Tenants can view their own tenant record
CREATE POLICY "Tenants can view own record"
ON public.tenants FOR SELECT
USING (auth.uid() = user_id);

-- Tenants can view their own leases
CREATE POLICY "Tenants can view own leases"
ON public.leases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenants
    WHERE tenants.id = leases.tenant_id
    AND tenants.user_id = auth.uid()
  )
);

-- Tenants can view their own payments
CREATE POLICY "Tenants can view own payments"
ON public.payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenants
    WHERE tenants.id = payments.tenant_id
    AND tenants.user_id = auth.uid()
  )
);

-- Tenants can create maintenance requests
CREATE POLICY "Tenants can create maintenance requests"
ON public.maintenance_requests FOR INSERT
WITH CHECK (auth.uid() = submitted_by);

-- Tenants can view own maintenance requests
CREATE POLICY "Tenants can view own maintenance requests"
ON public.maintenance_requests FOR SELECT
USING (auth.uid() = submitted_by);

-- Tenants can view properties they have leases in (for displaying property info)
CREATE POLICY "Tenants can view leased properties"
ON public.properties FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leases
    JOIN public.tenants ON tenants.id = leases.tenant_id
    WHERE leases.property_id = properties.id
    AND tenants.user_id = auth.uid()
  )
);

-- Tenants can view their units
CREATE POLICY "Tenants can view leased units"
ON public.units FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leases
    JOIN public.tenants ON tenants.id = leases.tenant_id
    WHERE leases.unit_id = units.id
    AND tenants.user_id = auth.uid()
  )
);
