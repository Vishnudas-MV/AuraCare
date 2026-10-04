import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, leftIcon, rightIcon, helperText, disabled, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-ink-muted pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            id={id}
            type={type}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={cn(
              'w-full h-10 px-3 py-2 text-sm rounded-lg bg-surface text-ink border border-line placeholder:text-ink-muted/60 transition-all duration-200 ease-out focus-visible:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-danger focus:border-danger focus:ring-danger/30',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-ink-muted flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${id}-error`} className="text-xs text-danger font-medium flex items-center gap-1">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${id}-helper`} className="text-xs text-ink-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
