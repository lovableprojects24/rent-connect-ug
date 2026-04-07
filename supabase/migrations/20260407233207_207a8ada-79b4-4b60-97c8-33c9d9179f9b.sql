
-- Unit transfers audit log
CREATE TABLE public.unit_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id),
  property_id UUID NOT NULL REFERENCES public.properties(id),
  from_tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  to_tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  old_lease_id UUID NOT NULL REFERENCES public.leases(id),
  new_lease_id UUID REFERENCES public.leases(id),
  old_deposit_amount BIGINT NOT NULL DEFAULT 0,
  reason TEXT,
  transferred_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unit_transfers ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins can manage all transfers"
  ON public.unit_transfers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Property staff can manage
CREATE POLICY "Staff can manage transfers on assigned properties"
  ON public.unit_transfers FOR ALL TO authenticated
  USING (is_property_staff(auth.uid(), property_id))
  WITH CHECK (is_property_staff(auth.uid(), property_id));

-- Property owners can view
CREATE POLICY "Owners can view transfers"
  ON public.unit_transfers FOR SELECT
  USING (is_property_owner(auth.uid(), property_id));

-- Tenants can view transfers involving them
CREATE POLICY "Tenants can view own transfers"
  ON public.unit_transfers FOR SELECT TO authenticated
  USING (
    is_lease_tenant(auth.uid(), from_tenant_id)
    OR is_lease_tenant(auth.uid(), to_tenant_id)
  );
