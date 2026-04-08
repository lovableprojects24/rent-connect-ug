
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.onboarding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'landlord',
  description TEXT,
  unit_count INTEGER DEFAULT 0,
  experience TEXT,
  message TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a request (no auth required)
CREATE POLICY "Anyone can submit onboarding request"
  ON public.onboarding_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins/landlords can view requests
CREATE POLICY "Admins can view onboarding requests"
  ON public.onboarding_requests
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'landlord'));

-- Only admins can update request status
CREATE POLICY "Admins can update onboarding requests"
  ON public.onboarding_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
