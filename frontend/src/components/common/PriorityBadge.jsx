import { ArrowUp, ArrowRight, ArrowDown, AlertTriangle } from 'lucide-react';

const priorityConfig = {
  Low: { color: 'bg-slate-100 text-civic-text-secondary border-slate-200', icon: ArrowDown, bar: 'bg-civic-text-secondary' },
  Medium: { color: 'bg-blue-100 text-status-assigned border-blue-200', icon: ArrowRight, bar: 'bg-status-assigned' },
  High: { color: 'bg-orange-100 text-status-pending border-orange-200', icon: ArrowUp, bar: 'bg-status-pending' },
  Critical: { color: 'bg-red-100 text-status-critical border-red-200', icon: AlertTriangle, bar: 'bg-status-critical' },
};

export function PriorityBadge({ priority, size = 'md', showIcon = true }) {
  const config = priorityConfig[priority] || priorityConfig.Low;
  const Icon = config.icon;
  const sizeMap = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
  };
  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${config.color} ${sizeMap[size]}`}
    >
      {showIcon && <Icon size={size === 'sm' ? 12 : 14} />}
      {priority}
    </span>
  );
}
