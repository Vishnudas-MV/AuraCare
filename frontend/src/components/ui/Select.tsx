import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
  helperText?: string;
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, helperText, label, id, disabled, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 7)}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={cn(
              'w-full h-10 pl-3 pr-9 py-2 text-sm rounded-lg bg-surface text-ink border border-line appearance-none cursor-pointer transition-all duration-200 ease-out focus-visible:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-danger focus:border-danger focus:ring-danger/30',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 h-4 w-4 text-ink-muted pointer-events-none" />
        </div>

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

Select.displayName = 'Select';
