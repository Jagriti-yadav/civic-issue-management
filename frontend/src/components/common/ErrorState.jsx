import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
        <AlertCircle size={28} className="text-status-rejected" />
      </div>
      <h3 className="text-lg font-semibold text-civic-text-primary">{title}</h3>
      <p className="mt-1.5 text-sm text-civic-text-secondary max-w-md">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RefreshCw size={16} />} className="mt-5">
          Try again
        </Button>
      )}
    </div>
  );
}
