import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsService } from '@/services/tenants';
import type { TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

const TENANTS_KEY = ['tenants'];

export function useTenants() {
  return useQuery({
    queryKey: TENANTS_KEY,
    queryFn: tenantsService.getAll,
  });
}

export function useTenant(id: string | undefined) {
  return useQuery({
    queryKey: ['tenants', id],
    queryFn: () => tenantsService.getById(id!),
    enabled: !!id,
  });
}

export function useTenantByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ['tenants', 'user', userId],
    queryFn: () => tenantsService.getByUserId(userId!),
    enabled: !!userId,
  });
}

export function useTenantNames() {
  return useQuery({
    queryKey: ['tenants', 'names'],
    queryFn: tenantsService.getNamesList,
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANTS_KEY });
      toast.success('Tenant deleted');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to delete tenant'),
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tenantsService.createViaEdgeFunction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANTS_KEY });
      toast.success('Tenant account created successfully!');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to create tenant'),
  });
}
