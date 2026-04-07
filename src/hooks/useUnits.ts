import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitsService } from '@/services/units';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: unitsService.getAll,
  });
}

export function useUnitsByProperty(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['units', 'property', propertyId],
    queryFn: () => unitsService.getByPropertyId(propertyId!),
    enabled: !!propertyId,
  });
}

export function useVacantUnits(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['units', 'vacant', propertyId],
    queryFn: () => unitsService.getVacantByProperty(propertyId!),
    enabled: !!propertyId,
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit deleted');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to delete unit'),
  });
}
