import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalApplicationsService } from '@/services/rental-applications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const APPS_KEY = ['rental-applications'];

export function useAvailableListings() {
  return useQuery({
    queryKey: ['available-listings'],
    queryFn: rentalApplicationsService.getAvailableListings,
  });
}

export function useMyApplications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...APPS_KEY, 'mine', user?.id],
    queryFn: () => rentalApplicationsService.getMyApplications(user!.id),
    enabled: !!user,
  });
}

export function useManagerApplications() {
  return useQuery({
    queryKey: [...APPS_KEY, 'manager'],
    queryFn: rentalApplicationsService.getApplicationsForManager,
  });
}

export function useApplyForUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rentalApplicationsService.apply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY });
      toast.success('Application submitted successfully!');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to submit application'),
  });
}

export function useReviewApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reviewedBy, notes }: { id: string; status: 'approved' | 'rejected'; reviewedBy: string; notes?: string }) =>
      rentalApplicationsService.updateStatus(id, status, reviewedBy, notes),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY });
      toast.success(`Application ${vars.status}!`);
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to update application'),
  });
}

export function useCancelApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rentalApplicationsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY });
      toast.success('Application cancelled');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to cancel'),
  });
}
