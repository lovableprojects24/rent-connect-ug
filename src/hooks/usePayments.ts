import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '@/services/payments';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

const PAYMENTS_KEY = ['payments'];

export function usePayments() {
  return useQuery({
    queryKey: PAYMENTS_KEY,
    queryFn: paymentsService.getAll,
  });
}

export function usePaymentsByTenant(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['payments', 'tenant', tenantId],
    queryFn: () => paymentsService.getByTenantId(tenantId!),
    enabled: !!tenantId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payment: TablesInsert<'payments'>) => paymentsService.create(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      toast.success('Payment recorded');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to record payment'),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      toast.success('Payment deleted');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to delete payment'),
  });
}
