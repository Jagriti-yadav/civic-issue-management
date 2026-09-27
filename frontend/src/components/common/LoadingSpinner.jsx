export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  };
  return (
    <span
      className={`inline-block animate-spin rounded-full border-civic-border border-t-civic-blue ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
