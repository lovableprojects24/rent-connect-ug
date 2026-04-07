## Role-Based Dashboard Architecture

### Hierarchy (from image reference):
1. **Tenant** → Already has `TenantPortalPage` (Financial, Maintenance, Lease & Docs)
2. **Manager** (landlord/agent) → New `ManagerDashboardPage` — property operations, rent collection, tenant handling
3. **Admin** (super admin) → New `AdminDashboardPage` — system-wide control, user/manager onboarding, system settings

### Changes:

**1. Create `src/pages/ManagerDashboardPage.tsx`**
- Properties overview with occupancy rates
- Rent collection summary (MTN MoMo, Airtel, Cash breakdown)
- Active maintenance requests
- Tenant list with payment status
- Quick actions: Record Payment, Add Tenant, Report Maintenance

**2. Create `src/pages/AdminDashboardPage.tsx`**
- System-wide stats (total users, managers, tenants, properties)
- User onboarding section (recent staff added)
- Manager performance overview
- Revenue across all properties
- Quick actions: Add Staff, System Settings
- Audit trail preview

**3. Update `src/pages/DashboardPage.tsx`**
- Smart router: redirect to correct dashboard based on role
  - `tenant` → `/portal`
  - `landlord`/`agent` → Manager dashboard
  - `admin` → Admin dashboard
  - `finance` → Finance dashboard

**4. Update `src/components/layout/AppSidebar.tsx`**
- Manager sees: Dashboard, Properties, Tenants, Payments, Maintenance, Notifications
- Admin sees: Dashboard, Properties, Tenants, Payments, Maintenance, Reports, Finance, Staff, Notifications, Settings
- Tenant stays as-is (Financial, Maintenance, Lease & Docs)
