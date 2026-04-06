
-- App-wide settings key-value store
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view settings"
ON public.app_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.app_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Landlords can manage settings"
ON public.app_settings FOR ALL
USING (public.has_role(auth.uid(), 'landlord'));

-- Trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default settings
INSERT INTO public.app_settings (setting_key, setting_value, category) VALUES
  ('currency', '"UGX"', 'financial'),
  ('secondary_currency', '"USD"', 'financial'),
  ('vat_rate', '18', 'financial'),
  ('grace_period_days', '5', 'communication'),
  ('late_penalty_percent', '5', 'financial'),
  ('lease_expiry_alert_months', '3', 'legal'),
  ('sms_enabled', 'false', 'communication'),
  ('email_reminders_enabled', 'true', 'communication'),
  ('tenant_portal_enabled', 'true', 'property'),
  ('tin_number', '""', 'financial');
