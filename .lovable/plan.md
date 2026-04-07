
## Onboarding Wizard Plan

### Database
1. **`onboarding_progress` table** — tracks which steps each admin has completed
   - Fields: user_id, current_step (1-6), steps_completed (jsonb), completed_at
   - RLS: admins can manage own progress

### Steps (Wizard UI)
1. **System Setup** — Admin sets system name, contact info, default rent due date
2. **Manager Creation** — Create manager accounts (reuse AddStaffDialog logic)
3. **Property & Unit Setup** — Add properties and rooms (reuse existing forms)
4. **Tenant Registration** — Add tenants and assign to units (reuse AddTenantDialog)
5. **Lease Creation** — Create lease linking tenant → unit → property
6. **Payment Config** — Configure payment methods, initialize payment status

### Frontend
- New `OnboardingPage.tsx` with stepper wizard UI
- Each step validates completion before allowing next
- Progress persisted in database
- Admin dashboard checks if onboarding is complete; redirects if not
- Skip option for steps that already have data

### Security
- Only admins can access onboarding
- JWT auth already in place
- Role-based access already implemented

### No Django
- Project uses React + Supabase (Lovable Cloud), not Django
- All endpoints are already available via Supabase client SDK
