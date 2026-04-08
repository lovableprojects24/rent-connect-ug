
ALTER TABLE public.profiles ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;

-- Auto-approve existing users who already have roles
UPDATE public.profiles SET is_approved = true
WHERE user_id IN (SELECT user_id FROM public.user_roles);

-- Create a function to auto-approve users created by admin (via create-tenant edge function)
CREATE OR REPLACE FUNCTION public.auto_approve_if_has_role()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id) THEN
    NEW.is_approved := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_auto_approve_profile
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_if_has_role();
