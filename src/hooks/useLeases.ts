import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leasesService } from '@/services/leases';
import type { TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

const LEASES_KEY = ['leases'];

export function useLeases() {
  return useQuery({
    queryKey: LEASES_KEY,
    queryFn: leasesService.getAll,
  });
}

export function useLeasesByTenant(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['leases', 'tenant', tenantId],
    queryFn: () => leasesService.getByTenantId(tenantId!),
    enabled: !!tenantId,
  });
}

export function useActiveLeasesByProperty(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['leases', 'active', propertyId],
    queryFn: () => leasesService.getActiveByProperty(propertyId!),
    enabled: !!propertyId,
  });
}

export function useCreateLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lease: TablesInsert<'leases'>) => leasesService.create(lease),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEASES_KEY });
      toast.success('Lease created');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to create lease'),
  });
}
