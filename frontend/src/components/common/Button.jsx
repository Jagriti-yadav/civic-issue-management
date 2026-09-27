import { forwardRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

const variants = {
  primary:
    'bg-civic-blue text-white hover:bg-civic-blue-hover shadow-sm hover:shadow-card-hover',
  secondary:
    'bg-white text-civic-text-primary border border-civic-border hover:bg-civic-hover',
  teal: 'bg-civic-teal text-white hover:bg-teal-800 shadow-sm',
  danger: 'bg-status-rejected text-white hover:bg-red-700 shadow-sm',
  ghost: 'text-civic-text-secondary hover:bg-civic-hover hover:text-civic-text-primary',
  outline: 'border border-civic-blue text-civic-blue hover:bg-civic-hover',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-6 py-3',
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon = null,
    rightIcon = null,
    type = 'button',
    className = '',
    onClick,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn-base ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
