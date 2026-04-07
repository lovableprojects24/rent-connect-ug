---
name: Onboarding wizard
description: 6-step admin onboarding — System Setup, Manager, Property, Tenant, Lease, Payment Config
type: feature
---
- Tracked in `onboarding_progress` table per user
- Admin auto-redirected from dashboard to /onboarding if not complete
- Steps: system_setup → manager_creation → property_setup → tenant_registration → lease_creation → payment_config
- create-tenant edge function supports `is_manager: true` to create manager accounts
- Steps can be skipped but are tracked; all must complete to finish onboarding
