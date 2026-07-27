import React, { useId } from 'react';

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`block text-sm ${className || ''}`}>
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-text-secondary">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-rose/20 ${
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-border-input focus:border-rose'
            } ${leftIcon ? 'pl-12' : ''} ${rightIcon ? 'pr-12' : ''}`}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;