interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const styles: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  paid: 'bg-green-100 text-green-700 border-green-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  reserved: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  late: 'bg-red-100 text-red-700 border-red-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  terminated: 'bg-red-100 text-red-700 border-red-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-red-100 text-red-700 border-red-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
  open: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-orange-100 text-orange-700 border-orange-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  occupied: 'bg-blue-100 text-blue-700 border-blue-200',
  vacant: 'bg-gray-100 text-gray-700 border-gray-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

const labels: Record<string, string> = {
  completed: 'Paid',
  paid: 'Paid',
  active: 'Active',
  resolved: 'Resolved',
  closed: 'Closed',
  pending: 'Pending',
  reserved: 'Reserved',
  late: 'Late',
  failed: 'Failed',
  terminated: 'Terminated',
  overdue: 'Overdue',
  high: 'High',
  urgent: 'Urgent',
  open: 'Open',
  medium: 'Medium',
  in_progress: 'In Progress',
  'in-progress': 'In Progress',
  occupied: 'Occupied',
  vacant: 'Vacant',
  inactive: 'Inactive',
  low: 'Low',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const style = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  const label = labels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full border font-medium ${style}`}>
      {label}
    </span>
  );
}
