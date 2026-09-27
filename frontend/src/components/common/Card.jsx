export function Card({ children, className = '', padding = 'md', hover = false, onClick }) {
  const padMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  return (
    <div
      onClick={onClick}
      className={`card-base ${padMap[padding]} ${
        hover ? 'transition-all duration-200 hover:shadow-card-hover hover:border-slate-300 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
