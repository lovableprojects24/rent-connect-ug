import { Building2, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { useMyApplications, useCancelApplication } from '@/hooks/useRentalApplications';
import { formatUGX } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Pending' },
  approved: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Rejected' },
  cancelled: { icon: Ban, color: 'text-muted-foreground bg-muted', label: 'Cancelled' },
};

export default function MyApplicationsPage() {
  const { data: apps = [], isLoading } = useMyApplications();
  const cancelMutation = useCancelApplication();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-2xl mb-2">My Applications</h1>
        <p className="text-muted-foreground">Track your rental applications</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground">Browse available properties and apply for a unit</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app: any) => {
            const cfg = statusConfig[app.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <div key={app.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-1">
                  <h3 className="font-heading font-semibold">
                    {app.units?.name} — {app.properties?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{app.properties?.location}</p>
                  <p className="text-sm font-medium text-primary">{formatUGX(app.units?.rent_amount || 0)}/mo</p>
                  <p className="text-xs text-muted-foreground">Applied {format(new Date(app.created_at), 'MMM d, yyyy')}</p>
                  {app.reviewer_notes && (
                    <p className="text-sm mt-1 italic text-muted-foreground">"{app.reviewer_notes}"</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </span>
                  {app.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelMutation.mutate(app.id)}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
