import React from 'react';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  helperText,
  required,
  className,
  children,
}) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 w-full', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-xs font-semibold text-ink uppercase tracking-wider">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p className="text-xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-ink-muted">{helperText}</p>
      ) : null}
    </div>
  );
};
