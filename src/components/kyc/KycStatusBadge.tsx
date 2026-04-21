import { Shield, ShieldCheck, ShieldX, ShieldAlert } from 'lucide-react';
import type { KycStatus } from '@/services/kyc';
import { KYC_STATUS_LABELS } from '@/services/kyc';

const config: Record<KycStatus, { icon: typeof Shield; className: string }> = {
  pending: { icon: ShieldAlert, className: 'bg-yellow-500/10 text-yellow-600' },
  verified: { icon: ShieldCheck, className: 'bg-primary/10 text-primary' },
  rejected: { icon: ShieldX, className: 'bg-destructive/10 text-destructive' },
  expired: { icon: Shield, className: 'bg-muted text-muted-foreground' },
};

export default function KycStatusBadge({ status }: { status: KycStatus }) {
  const { icon: Icon, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {KYC_STATUS_LABELS[status]}
    </span>
  );
}
