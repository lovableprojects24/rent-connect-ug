
-- Create notification type enum
CREATE TYPE public.notification_type AS ENUM (
  'rent_reminder', 'late_payment', 'maintenance', 'general', 'lease_expiry'
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_entity_id UUID,
  related_entity_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System inserts via security definer functions
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow delete own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Helper function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _title TEXT,
  _message TEXT,
  _type public.notification_type DEFAULT 'general',
  _related_entity_id UUID DEFAULT NULL,
  _related_entity_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_entity_id, related_entity_type)
  VALUES (_user_id, _title, _message, _type, _related_entity_id, _related_entity_type)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- Function to generate rent reminders for active leases
CREATE OR REPLACE FUNCTION public.generate_rent_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER := 0;
  _lease RECORD;
  _tenant_user_id UUID;
  _property_name TEXT;
  _unit_name TEXT;
BEGIN
  FOR _lease IN
    SELECT l.id, l.tenant_id, l.rent_amount, l.property_id, l.unit_id
    FROM leases l
    WHERE l.status = 'active'
  LOOP
    -- Get tenant user_id
    SELECT t.user_id INTO _tenant_user_id
    FROM tenants t WHERE t.id = _lease.tenant_id;

    IF _tenant_user_id IS NULL THEN CONTINUE; END IF;

    -- Get property and unit names
    SELECT p.name INTO _property_name FROM properties p WHERE p.id = _lease.property_id;
    SELECT u.name INTO _unit_name FROM units u WHERE u.id = _lease.unit_id;

    -- Check if reminder already sent this month
    IF NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = _tenant_user_id
        AND n.type = 'rent_reminder'
        AND n.related_entity_id = _lease.id
        AND date_trunc('month', n.created_at) = date_trunc('month', now())
    ) THEN
      PERFORM create_notification(
        _tenant_user_id,
        'Rent Payment Reminder',
        format('Your rent of UGX %s for %s (%s) is due. Please make your payment before the end of the month.', _lease.rent_amount, _unit_name, _property_name),
        'rent_reminder',
        _lease.id,
        'lease'
      );
      _count := _count + 1;
    END IF;
  END LOOP;
  RETURN _count;
END;
$$;

-- Function to generate late payment alerts
CREATE OR REPLACE FUNCTION public.generate_late_payment_alerts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER := 0;
  _lease RECORD;
  _tenant_user_id UUID;
  _owner_id UUID;
  _property_name TEXT;
  _unit_name TEXT;
  _tenant_name TEXT;
  _has_payment BOOLEAN;
BEGIN
  FOR _lease IN
    SELECT l.id, l.tenant_id, l.rent_amount, l.property_id, l.unit_id
    FROM leases l
    WHERE l.status = 'active'
  LOOP
    -- Check if payment exists for current month
    SELECT EXISTS (
      SELECT 1 FROM payments p
      WHERE p.lease_id = _lease.id
        AND p.status = 'completed'
        AND date_trunc('month', p.payment_date::timestamp) = date_trunc('month', now())
    ) INTO _has_payment;

    IF _has_payment THEN CONTINUE; END IF;

    -- Get tenant info
    SELECT t.user_id, t.full_name INTO _tenant_user_id, _tenant_name
    FROM tenants t WHERE t.id = _lease.tenant_id;

    SELECT p.name, p.owner_id INTO _property_name, _owner_id
    FROM properties p WHERE p.id = _lease.property_id;
    SELECT u.name INTO _unit_name FROM units u WHERE u.id = _lease.unit_id;

    -- Alert tenant if not already alerted this month
    IF _tenant_user_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = _tenant_user_id
        AND n.type = 'late_payment'
        AND n.related_entity_id = _lease.id
        AND date_trunc('month', n.created_at) = date_trunc('month', now())
    ) THEN
      PERFORM create_notification(
        _tenant_user_id,
        'Late Rent Payment',
        format('Your rent of UGX %s for %s (%s) is overdue. Please pay immediately to avoid penalties.', _lease.rent_amount, _unit_name, _property_name),
        'late_payment',
        _lease.id,
        'lease'
      );
      _count := _count + 1;
    END IF;

    -- Alert property owner
    IF _owner_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = _owner_id
        AND n.type = 'late_payment'
        AND n.related_entity_id = _lease.id
        AND date_trunc('month', n.created_at) = date_trunc('month', now())
    ) THEN
      PERFORM create_notification(
        _owner_id,
        'Tenant Late Payment',
        format('Tenant %s has not paid rent (UGX %s) for %s (%s) this month.', _tenant_name, _lease.rent_amount, _unit_name, _property_name),
        'late_payment',
        _lease.id,
        'lease'
      );
      _count := _count + 1;
    END IF;
  END LOOP;
  RETURN _count;
END;
$$;

-- Trigger: notify on new maintenance request
CREATE OR REPLACE FUNCTION public.notify_maintenance_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner_id UUID;
  _property_name TEXT;
  _unit_name TEXT;
BEGIN
  SELECT p.owner_id, p.name INTO _owner_id, _property_name
  FROM properties p WHERE p.id = NEW.property_id;

  IF NEW.unit_id IS NOT NULL THEN
    SELECT u.name INTO _unit_name FROM units u WHERE u.id = NEW.unit_id;
  END IF;

  IF _owner_id IS NOT NULL THEN
    PERFORM create_notification(
      _owner_id,
      'New Maintenance Request',
      format('New %s priority issue: %s at %s%s', NEW.priority, NEW.issue, _property_name, COALESCE(' - ' || _unit_name, '')),
      'maintenance',
      NEW.id,
      'maintenance_request'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_maintenance_request
AFTER INSERT ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_maintenance_request();

-- Trigger: notify on lease expiring (within 30 days)
CREATE OR REPLACE FUNCTION public.generate_lease_expiry_alerts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER := 0;
  _lease RECORD;
  _tenant_user_id UUID;
  _property_name TEXT;
  _unit_name TEXT;
BEGIN
  FOR _lease IN
    SELECT l.id, l.tenant_id, l.end_date, l.property_id, l.unit_id
    FROM leases l
    WHERE l.status = 'active'
      AND l.end_date BETWEEN now() AND now() + interval '30 days'
  LOOP
    SELECT t.user_id INTO _tenant_user_id FROM tenants t WHERE t.id = _lease.tenant_id;
    SELECT p.name INTO _property_name FROM properties p WHERE p.id = _lease.property_id;
    SELECT u.name INTO _unit_name FROM units u WHERE u.id = _lease.unit_id;

    IF _tenant_user_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = _tenant_user_id
        AND n.type = 'lease_expiry'
        AND n.related_entity_id = _lease.id
        AND n.created_at > now() - interval '7 days'
    ) THEN
      PERFORM create_notification(
        _tenant_user_id,
        'Lease Expiring Soon',
        format('Your lease for %s (%s) expires on %s. Please contact your property manager.', _unit_name, _property_name, _lease.end_date),
        'lease_expiry',
        _lease.id,
        'lease'
      );
      _count := _count + 1;
    END IF;
  END LOOP;
  RETURN _count;
END;
$$;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
