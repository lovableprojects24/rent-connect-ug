import { Plus } from 'lucide-react';
import { maintenanceRequests } from '@/data/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Maintenance</h1>
          <p className="text-muted-foreground text-sm mt-1">{maintenanceRequests.filter(m => m.status !== 'closed' && m.status !== 'resolved').length} open requests</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Request</span>
        </Button>
      </div>

      <div className="space-y-3">
        {maintenanceRequests.map((req, i) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium">{req.issue}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{req.tenantName} · {req.propertyName} · {req.unitName}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={req.priority} />
                <StatusBadge status={req.status} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>Submitted: {req.dateSubmitted}</span>
              {req.dateResolved && <span>Resolved: {req.dateResolved}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
