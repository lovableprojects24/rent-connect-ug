import { formatUGX } from '@/data/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import { Building2, FileText } from 'lucide-react';

interface LeaseTabProps {
  leases: any[];
}

export default function LeaseTab({ leases }: LeaseTabProps) {
  if (leases.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No lease records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leases.map((lease) => (
        <div key={lease.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{lease.properties?.name}</p>
                <p className="text-xs text-muted-foreground">{lease.units?.name}</p>
              </div>
            </div>
            <StatusBadge status={lease.status} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            <span>Period: {lease.start_date} → {lease.end_date}</span>
            <span className="text-right font-medium text-foreground">{formatUGX(lease.rent_amount)}/mo</span>
            <span>Deposit: {formatUGX(lease.deposit)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
