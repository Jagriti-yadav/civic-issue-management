import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-civic-hover mb-4">
        <Icon size={28} className="text-civic-muted" />
      </div>
      <h3 className="text-lg font-semibold text-civic-text-primary">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-civic-text-secondary max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
