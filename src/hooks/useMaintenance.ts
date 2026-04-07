import { useQuery } from '@tanstack/react-query';
import { maintenanceService } from '@/services/maintenance';

export function useMaintenanceRequests() {
  return useQuery({
    queryKey: ['maintenance'],
    queryFn: maintenanceService.getAll,
  });
}

export function useMaintenanceBySubmitter(userId: string | undefined) {
  return useQuery({
    queryKey: ['maintenance', 'submitter', userId],
    queryFn: () => maintenanceService.getBySubmitter(userId!),
    enabled: !!userId,
  });
}
