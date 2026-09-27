import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Home, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-civic-bg flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-6">
          <AlertCircle size={32} className="text-status-pending" />
        </div>
        <p className="text-6xl font-bold text-civic-blue mb-2">404</p>
        <h1 className="text-xl font-semibold text-civic-text-primary mb-2">Page not found</h1>
        <p className="text-civic-text-secondary mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button leftIcon={<Home size={18} />}>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
