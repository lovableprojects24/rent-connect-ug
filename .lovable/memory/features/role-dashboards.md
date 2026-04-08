---
name: Role-based dashboards
description: Two-tier admin system — Super Admin (system-wide), Landlord Admin (own properties), Manager, Tenant
type: feature
---
- Super Admin (admin role only) → AdminDashboardPage: system-wide stats, staff onboarding, all transactions, onboarding requests
- Landlord Admin (admin + landlord roles) → LandlordAdminDashboardPage: own properties, tenants, payments, can assign own managers
- Manager → ManagerDashboardPage: occupancy, rent collection, maintenance
- Tenant → TenantPortalPage: financial, maintenance, lease tabs
- Approved landlord applicants receive both `admin` and `landlord` roles
- DashboardPage routes based on role combination
- Sidebar: superAdminNavItems (includes Requests), landlordAdminNavItems (includes My Staff), managerNavItems, tenantNavItems
