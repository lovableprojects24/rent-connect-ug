---
name: Role-based dashboards
description: 3-tier hierarchy dashboards — Admin (control center), Manager (property ops), Tenant (portal)
type: feature
---
- Admin → AdminDashboardPage: system-wide stats, staff onboarding, property performance, all transactions
- Manager (landlord/agent) → ManagerDashboardPage: occupancy, rent collection, maintenance requests
- Tenant → TenantPortalPage: financial, maintenance, lease tabs
- Finance-only → redirects to FinanceDashboardPage
- DashboardPage is a smart router that renders the correct dashboard based on user roles
- Sidebar shows role-specific navigation items (adminNavItems, managerNavItems, financeNavItems, tenantNavItems)
