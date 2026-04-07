import { Bell, CreditCard, AlertTriangle, Check, Trash2, RefreshCw, Clock, FileWarning, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, React.ReactNode> = {
  rent_reminder: <CreditCard className="w-4 h-4" />,
  late_payment: <AlertTriangle className="w-4 h-4" />,
  maintenance: <Wrench className="w-4 h-4" />,
  lease_expiry: <FileWarning className="w-4 h-4" />,
  general: <Bell className="w-4 h-4" />,
};

const colorMap: Record<string, string> = {
  rent_reminder: 'bg-primary/10 text-primary',
  late_payment: 'bg-destructive/10 text-destructive',
  maintenance: 'bg-accent/10 text-accent-foreground',
  lease_expiry: 'bg-warning/10 text-warning',
  general: 'bg-muted text-muted-foreground',
};

export default function NotificationsPage() {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, deleteNotification, generateReminders } = useNotifications();
  const { roles } = useAuth();
  const isManager = roles.includes('landlord') || roles.includes('agent') || roles.includes('admin');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {isManager && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateReminders.mutate()}
              disabled={generateReminders.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${generateReminders.isPending ? 'animate-spin' : ''}`} />
              Generate Alerts
            </Button>
          )}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm mt-1">You'll see rent reminders, payment alerts, and maintenance updates here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-card rounded-xl border border-border p-4 flex items-start gap-3 ${!n.is_read ? 'border-l-4 border-l-primary' : ''}`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${colorMap[n.type] || colorMap.general}`}>
                {iconMap[n.type] || iconMap.general}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <p className={`text-sm ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.is_read && (
                  <button
                    onClick={() => markAsRead.mutate(n.id)}
                    className="p-1.5 rounded hover:bg-muted"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification.mutate(n.id)}
                  className="p-1.5 rounded hover:bg-destructive/10"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
