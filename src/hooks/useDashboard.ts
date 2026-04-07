import { useQuery } from '@tanstack/react-query';
import { propertiesService } from '@/services/properties';
import { unitsService } from '@/services/units';
import { tenantsService } from '@/services/tenants';
import { paymentsService } from '@/services/payments';
import { maintenanceService } from '@/services/maintenance';
import { staffService } from '@/services/staff';

/**
 * Fetches all data needed for the Admin or Manager dashboard in a single hook.
 */
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard', 'all'],
    queryFn: async () => {
      const [properties, units, tenants, payments, maintenance] = await Promise.all([
        propertiesService.getAll(),
        unitsService.getAll(),
        tenantsService.getAll(),
        paymentsService.getAll(),
        maintenanceService.getAll(),
      ]);
      return { properties, units, tenants, payments, maintenance };
    },
  });
}

/**
 * Fetches admin-specific data (includes roles + profiles).
 */
export function useAdminDashboardData() {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const [properties, units, tenants, payments, maintenance, roles, profiles] = await Promise.all([
        propertiesService.getAll(),
        unitsService.getAll(),
        tenantsService.getAll(),
        paymentsService.getAll(),
        maintenanceService.getAll(),
        staffService.getAllRoles(),
        staffService.getAllProfiles(),
      ]);
      return { properties, units, tenants, payments, maintenance, roles, profiles };
    },
  });
}
