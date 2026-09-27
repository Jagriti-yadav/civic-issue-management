import { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    id,
    options = [],
    placeholder = 'Select an option',
    className = '',
    required = false,
    children,
    ...props
  },
  ref
) {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-civic-text-primary mb-1.5"
        >
          {label}
          {required && <span className="text-status-rejected ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`input-base appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_0.875rem_center] bg-no-repeat pr-9 ${
          error ? 'border-status-rejected ring-1 ring-status-rejected/20' : ''
        } ${className}`}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-status-rejected">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-civic-text-secondary">{hint}</p>
      )}
    </div>
  );
});
