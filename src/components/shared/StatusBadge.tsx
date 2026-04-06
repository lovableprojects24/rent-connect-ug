const statusStyles: Record<string, string> = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  occupied: 'bg-success/10 text-success',
  vacant: 'bg-info/10 text-info',
  reserved: 'bg-warning/10 text-warning',
  open: 'bg-accent/10 text-accent',
  in_progress: 'bg-info/10 text-info',
  resolved: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-accent/10 text-accent',
  urgent: 'bg-destructive/10 text-destructive',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[status] || 'bg-muted text-muted-foreground'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
