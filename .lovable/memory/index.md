# Project Memory

## Core
RentFlow: Uganda tenant management system. Mobile-first, UGX currency.
Design: warm green (#2d8f4e) primary, gold secondary, Plus Jakarta Sans headings, Inter body.
All dashboards use real Supabase data. formatUGX lives in src/lib/utils.ts.
Manager creation: uses create-tenant edge function with is_manager=true, no pre-registration needed.

## Memories
- [Design tokens](mem://design/tokens) — Green/gold Uganda palette, stat card gradients, font system
- [Role dashboards](mem://features/role-dashboards) — Admin/Manager/Finance/Tenant portal routing
- [Onboarding](mem://features/onboarding) — 6-step admin onboarding wizard
- [Pesapal](mem://features/pesapal) — Payment integration config
