import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesService } from '@/services/properties';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

const PROPERTIES_KEY = ['properties'];

export function useProperties() {
  return useQuery({
    queryKey: PROPERTIES_KEY,
    queryFn: propertiesService.getAll,
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => propertiesService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (property: TablesInsert<'properties'>) => propertiesService.create(property),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY });
      toast.success('Property added successfully!');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to add property'),
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'properties'> }) =>
      propertiesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY });
      toast.success('Property updated');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to update property'),
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY });
      toast.success('Property deleted');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to delete property'),
  });
}
