import { Bell, DollarSign, Wrench, Users, CheckCircle, Check, Trash2, RefreshCw, Clock, FileWarning } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, React.ReactNode> = {
  rent_reminder: <DollarSign className="w-5 h-5" />,
  late_payment: <DollarSign className="w-5 h-5" />,
  maintenance: <Wrench className="w-5 h-5" />,
  lease_expiry: <FileWarning className="w-5 h-5" />,
  general: <Bell className="w-5 h-5" />,
};

const colorMap: Record<string, string> = {
  rent_reminder: 'bg-green-100 text-green-600',
  late_payment: 'bg-red-100 text-red-600',
  maintenance: 'bg-orange-100 text-orange-600',
  lease_expiry: 'bg-blue-100 text-blue-600',
  general: 'bg-gray-100 text-gray-600',
};

export default function NotificationsPage() {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, deleteNotification, generateReminders } = useNotifications();
  const { roles } = useAuth();
  const isManager = roles.includes('landlord') || roles.includes('agent') || roles.includes('admin');

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important alerts</p>
        </div>
        <div className="flex gap-2">
          {isManager && (
            <button
              onClick={() => generateReminders.mutate()}
              disabled={generateReminders.isPending}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${generateReminders.isPending ? 'animate-spin' : ''}`} />
              Generate Alerts
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No Notifications</h3>
          <p className="text-muted-foreground">You're all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-6 hover:bg-muted/30 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`${colorMap[n.type] || colorMap.general} p-3 rounded-lg flex-shrink-0`}>
                  {iconMap[n.type] || iconMap.general}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className={`font-medium text-sm ${!n.is_read ? 'text-primary font-semibold' : ''}`}>
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.is_read && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{n.message}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                    <div className="flex gap-1">
                      {!n.is_read && (
                        <button
                          onClick={() => markAsRead.mutate(n.id)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification.mutate(n.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
