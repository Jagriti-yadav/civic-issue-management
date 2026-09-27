import { Search, X } from 'lucide-react';

export function SearchBar({ value, onChange, placeholder = 'Search...', onClear, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-civic-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-10 pr-9"
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-civic-text-secondary hover:text-civic-text-primary hover:bg-civic-hover transition-colors"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
