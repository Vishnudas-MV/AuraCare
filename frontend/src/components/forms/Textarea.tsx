import React from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, disabled, id, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg bg-surface text-ink border border-line placeholder:text-ink-muted/60 transition-all duration-200 ease-out focus-visible:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-xs text-danger font-medium">{error}</p>
        )}

        {!error && helperText && (
          <p className="text-xs text-ink-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
