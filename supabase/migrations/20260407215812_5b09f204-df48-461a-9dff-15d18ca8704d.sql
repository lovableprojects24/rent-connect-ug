-- Migrate existing roles to manager
UPDATE public.user_roles SET role = 'manager' WHERE role IN ('landlord', 'agent', 'finance');

-- Update property_staff to use manager role
UPDATE public.property_staff SET role = 'manager' WHERE role IN ('landlord', 'agent', 'finance');

-- Update the default role trigger to assign 'tenant' instead of 'landlord'
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'tenant');
  RETURN NEW;
END;
$$;