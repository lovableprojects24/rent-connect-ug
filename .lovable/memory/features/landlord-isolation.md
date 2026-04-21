---
name: Landlord data isolation
description: Landlords only see their own properties, tenants, payments, leases, units — super admins see everything
type: feature
---
- `is_super_admin(_user_id)` function: true if user has admin role WITHOUT landlord role
- All "Admins can manage all X" RLS policies replaced with "Super admins can manage all X" using `is_super_admin()`
- Landlord-specific policies added for: tenants (via created_by or lease→property→owner), payments (via property owner), KYC (via tenant→lease→property→owner), unit_transfers (via property owner)
- Properties, leases, units, maintenance already had "Property owners can manage" policies covering landlords
- Onboarding requests restricted to super admins only
