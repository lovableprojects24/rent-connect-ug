import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getAll,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const markAsRead = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteNotification = useMutation({
    mutationFn: notificationsService.deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const generateReminders = useMutation({
    mutationFn: async () => {
      const rent = await notificationsService.generateRentReminders();
      const late = await notificationsService.generateLatePaymentAlerts();
      const expiry = await notificationsService.generateLeaseExpiryAlerts();
      return { rent, late, expiry };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      const total = data.rent + data.late + data.expiry;
      if (total > 0) {
        toast.success(`Generated ${total} notification(s): ${data.rent} rent reminders, ${data.late} late alerts, ${data.expiry} expiry alerts`);
      } else {
        toast.info('No new notifications to generate');
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    generateReminders,
  };
}
