export function Badge({ children, color = 'slate', size = 'md', icon = null }) {
  const colorMap = {
    blue: 'bg-blue-100 text-civic-blue',
    teal: 'bg-teal-100 text-civic-teal',
    purple: 'bg-purple-100 text-status-progress',
    orange: 'bg-orange-100 text-status-pending',
    green: 'bg-green-100 text-status-resolved',
    red: 'bg-red-100 text-status-rejected',
    slate: 'bg-slate-100 text-civic-text-secondary',
    yellow: 'bg-yellow-100 text-status-pending',
  };
  const sizeMap = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md ${colorMap[color]} ${sizeMap[size]}`}
    >
      {icon}
      {children}
    </span>
  );
}
