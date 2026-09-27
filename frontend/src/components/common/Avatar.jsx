export function Avatar({ name = '', role = 'citizen', size = 'md' }) {
  const roleColors = {
    citizen: 'bg-blue-100 text-civic-blue',
    officer: 'bg-teal-100 text-civic-teal',
    department_head: 'bg-purple-100 text-status-progress',
    super_admin: 'bg-orange-100 text-status-pending',
  };
  const sizeMap = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold flex-shrink-0 ${roleColors[role] || roleColors.citizen} ${sizeMap[size]}`}
    >
      {initials}
    </div>
  );
}
