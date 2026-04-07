
# Frontend Rebuild from UI Design Package

## What we keep (unchanged)
- All Supabase backend: tables, RLS, migrations, edge functions
- Auth system (AuthContext, ProtectedRoute)
- Services layer (src/services/*)
- Custom hooks (src/hooks/*)
- Supabase client & types

## What we rebuild

### 1. Design System (theme + CSS)
- Replace green/gold palette with blue primary (#2563eb) from design
- White cards, light background (#f8fafb), clean borders
- Add success/warning/info tokens from design
- Update sidebar tokens

### 2. Layout System
- Rebuild AppLayout with the design's header (role indicator + user avatar)
- Rebuild AppSidebar matching design's clean white sidebar style
- Keep existing role-based nav logic but use new visual treatment

### 3. Page Components (all rebuilt to match design visuals, wired to existing hooks)
- **Auth pages**: LoginScreen, RegisterScreen, ForgotPassword → new gradient blue auth pages
- **Admin Dashboard**: Stat cards, rent collection chart, occupancy donut, recent payments table
- **Manager Dashboard**: Stats, payment alerts banner, unpaid tenants table, quick stats + vacant rooms
- **Tenant Dashboard/Portal**: Rent status hero card, quick actions, lease details, payment history
- **Properties Page**: Card grid with gradient headers, occupancy stats, search/filter
- **Tenants Page**: Table with contact info, status badges, summary cards
- **Payments Page**: Summary cards (collected/pending/overdue/rate), table with method + reference
- **Maintenance Page**: Status stat cards, card grid with priority badges, request modal
- **Notifications Page**: Clean list with icon badges, read/unread states
- **Settings Page**: 3-column layout with nav menu + profile/password/notification preferences
- **Staff/Managers Page**: Table with avatar initials, property/tenant counts

### 4. Shared Components
- Rebuild StatCard matching design (white card, colored icon bg)
- Rebuild StatusBadge matching design (rounded-full, colored borders)

### 5. Branding
- Keep "RentFlow" name throughout (not TenantHub)
- Keep "Uganda Edition" subtitle
