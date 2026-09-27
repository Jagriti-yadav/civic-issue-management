import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const config = {
  success: { icon: CheckCircle2, color: 'text-status-resolved', bg: 'bg-green-50', border: 'border-green-200' },
  error: { icon: XCircle, color: 'text-status-rejected', bg: 'bg-red-50', border: 'border-red-200' },
  warning: { icon: AlertCircle, color: 'text-status-pending', bg: 'bg-amber-50', border: 'border-amber-200' },
  info: { icon: Info, color: 'text-civic-blue', bg: 'bg-blue-50', border: 'border-blue-200' },
};

export function Toast({ toast, onDismiss }) {
  const c = config[toast.type] || config.info;
  const Icon = c.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${c.bg} ${c.border} shadow-card-hover animate-slide-down`}
      role="alert"
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${c.color}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-civic-text-primary">{toast.title}</p>
        )}
        {toast.message && (
          <p className="text-sm text-civic-text-secondary mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-0.5 rounded text-civic-text-secondary hover:text-civic-text-primary transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
