
-- Onboarding progress tracking table
CREATE TABLE public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_step integer NOT NULL DEFAULT 1,
  steps_completed jsonb NOT NULL DEFAULT '{"system_setup": false, "manager_creation": false, "property_setup": false, "tenant_registration": false, "lease_creation": false, "payment_config": false}'::jsonb,
  system_name text,
  system_contact text,
  default_rent_due_day integer DEFAULT 1,
  payment_methods jsonb DEFAULT '["cash"]'::jsonb,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding" ON public.onboarding_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding" ON public.onboarding_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding" ON public.onboarding_progress
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all onboarding" ON public.onboarding_progress
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_onboarding_progress_updated_at
BEFORE UPDATE ON public.onboarding_progress
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
