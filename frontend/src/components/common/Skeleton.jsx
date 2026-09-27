export function Skeleton({ className = '', rounded = 'md' }) {
  const roundedMap = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };
  return (
    <div
      className={`animate-pulse bg-slate-200/70 ${roundedMap[rounded]} ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card-base p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton rounded="full" className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}
