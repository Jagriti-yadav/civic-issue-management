import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    leftIcon = null,
    rightIcon = null,
    id,
    className = '',
    containerClassName = '',
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-civic-text-primary mb-1.5"
        >
          {label}
          {required && <span className="text-status-rejected ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-civic-muted pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input-base ${leftIcon ? 'pl-10' : ''} ${
            rightIcon ? 'pr-10' : ''
          } ${error ? 'border-status-rejected ring-1 ring-status-rejected/20' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-civic-muted">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-status-rejected">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-civic-text-secondary">
          {hint}
        </p>
      )}
    </div>
  );
});
