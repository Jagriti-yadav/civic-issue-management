import { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    id,
    rows = 4,
    className = '',
    required = false,
    ...props
  },
  ref
) {
  const textareaId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-civic-text-primary mb-1.5"
        >
          {label}
          {required && <span className="text-status-rejected ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`input-base resize-y ${error ? 'border-status-rejected ring-1 ring-status-rejected/20' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-status-rejected">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-civic-text-secondary">{hint}</p>
      )}
    </div>
  );
});
