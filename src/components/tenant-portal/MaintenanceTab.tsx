import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import ReportMaintenanceDialog from '@/components/forms/ReportMaintenanceDialog';
import { Plus, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

interface MaintenanceTabProps {
  activeLease: any;
  maintenanceRequests: any[];
  onRefresh: () => void;
}

export default function MaintenanceTab({ activeLease, maintenanceRequests, onRefresh }: MaintenanceTabProps) {
  const openCount = maintenanceRequests.filter((m) => m.status !== 'closed' && m.status !== 'resolved').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{openCount} open request{openCount !== 1 ? 's' : ''}</p>
        {activeLease && (
          <ReportMaintenanceDialog
            propertyId={activeLease.property_id}
            unitId={activeLease.unit_id}
            onSuccess={onRefresh}
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Report Issue
              </Button>
            }
          />
        )}
      </div>

      {maintenanceRequests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Wrench className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No maintenance requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {maintenanceRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium">{req.issue}</h4>
                  {req.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{req.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={req.priority} />
                  <StatusBadge status={req.status} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Submitted: {new Date(req.created_at).toLocaleDateString()}
                {req.resolved_at && ` · Resolved: ${new Date(req.resolved_at).toLocaleDateString()}`}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
