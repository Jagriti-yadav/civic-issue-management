import { Clock, UserPlus, Zap, CheckCircle2, XCircle } from 'lucide-react';

const statusConfig = {
  Pending: { color: 'bg-amber-100 text-status-pending border-amber-200', icon: Clock, dot: 'bg-status-pending' },
  Assigned: { color: 'bg-blue-100 text-status-assigned border-blue-200', icon: UserPlus, dot: 'bg-status-assigned' },
  'In Progress': { color: 'bg-purple-100 text-status-progress border-purple-200', icon: Zap, dot: 'bg-status-progress' },
  Resolved: { color: 'bg-green-100 text-status-resolved border-green-200', icon: CheckCircle2, dot: 'bg-status-resolved' },
  Rejected: { color: 'bg-red-100 text-status-rejected border-red-200', icon: XCircle, dot: 'bg-status-rejected' },
};

export function StatusBadge({ status, size = 'md', showIcon = true }) {
  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;
  const sizeMap = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-1.5',
  };
  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${config.color} ${sizeMap[size]}`}
    >
      {showIcon && <Icon size={size === 'sm' ? 12 : 14} />}
      {status}
    </span>
  );
}
