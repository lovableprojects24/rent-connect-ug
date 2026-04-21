---
name: KYC verification module
description: ID document verification for landlords (during onboarding approval) and tenants (during creation)
type: feature
---
- `kyc_verifications` table: user_id (unique), id_type, id_number, front/back/selfie URLs, status (pending/verified/rejected/expired)
- `kyc-documents` private storage bucket with user-folder isolation
- KycSubmitForm: upload ID front/back + selfie, used by landlords when creating tenants
- KycReviewPanel: view docs + verify/reject, used by super admin on OnboardingRequestsPage
- AddTenantDialog flow: form → KYC submission → credentials display
- OnboardingRequestsPage: KYC button opens review panel for each applicant
