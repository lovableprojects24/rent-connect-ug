
-- Delete data from all tables for non-admin users
DELETE FROM payments WHERE recorded_by != 'fe518644-c686-41ab-a0b8-9936f0eef597';
DELETE FROM maintenance_requests WHERE submitted_by != 'fe518644-c686-41ab-a0b8-9936f0eef597';
DELETE FROM leases;
DELETE FROM notifications WHERE user_id != 'fe518644-c686-41ab-a0b8-9936f0eef597';
DELETE FROM property_staff;
DELETE FROM tenants;
DELETE FROM units;
DELETE FROM properties WHERE owner_id != 'fe518644-c686-41ab-a0b8-9936f0eef597';
DELETE FROM onboarding_progress WHERE user_id != 'fe518644-c686-41ab-a0b8-9936f0eef597';
DELETE FROM user_roles WHERE user_id != 'fe518644-c686-41ab-a0b8-9936f0eef597';
DELETE FROM profiles WHERE user_id != 'fe518644-c686-41ab-a0b8-9936f0eef597';

-- Delete non-admin auth users
DELETE FROM auth.users WHERE id != 'fe518644-c686-41ab-a0b8-9936f0eef597';
