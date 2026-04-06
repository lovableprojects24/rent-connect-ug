import { Bell, MessageSquare, CreditCard, AlertTriangle, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const notifications = [
  { id: '1', type: 'payment', title: 'Payment received', message: 'Sarah Nakamya paid UGX 1,800,000 via MTN MoMo', time: '2 hours ago', read: false },
  { id: '2', type: 'overdue', title: 'Rent overdue', message: 'Fatuma Nabbanja has outstanding balance of UGX 400,000', time: '5 hours ago', read: false },
  { id: '3', type: 'maintenance', title: 'New maintenance request', message: 'Peter Mugisha reported: No hot water in Villa 2', time: '1 day ago', read: false },
  { id: '4', type: 'payment', title: 'Partial payment', message: 'James Okello paid UGX 750,000 (partial) via Airtel Money', time: '2 days ago', read: true },
  { id: '5', type: 'sms', title: 'SMS reminder sent', message: 'Rent reminders sent to 5 tenants with upcoming due dates', time: '3 days ago', read: true },
  { id: '6', type: 'maintenance', title: 'Maintenance resolved', message: 'Ceiling paint issue at Jinja Road Flats resolved', time: '5 days ago', read: true },
];

const iconMap: Record<string, React.ReactNode> = {
  payment: <CreditCard className="w-4 h-4" />,
  overdue: <AlertTriangle className="w-4 h-4" />,
  maintenance: <Bell className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
};

const colorMap: Record<string, string> = {
  payment: 'bg-success/10 text-success',
  overdue: 'bg-destructive/10 text-destructive',
  maintenance: 'bg-info/10 text-info',
  sms: 'bg-accent/10 text-accent',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">{notifications.filter(n => !n.read).length} unread</p>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">Mark all read</button>
      </div>

      <div className="space-y-2">
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`bg-card rounded-xl border border-border p-4 flex items-start gap-3 ${!n.read ? 'border-l-4 border-l-primary' : ''}`}
          >
            <div className={`p-2 rounded-lg ${colorMap[n.type]}`}>
              {iconMap[n.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{n.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
            </div>
            {!n.read && (
              <button className="p-1 rounded hover:bg-muted shrink-0">
                <Check className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
