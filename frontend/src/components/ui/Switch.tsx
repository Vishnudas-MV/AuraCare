import React from 'react';
import { cn } from '@/utils/cn';

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  className,
}) => {
  const switchId = id || `switch-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      {(label || description) && (
        <label htmlFor={switchId} className="flex flex-col cursor-pointer select-none">
          {label && <span className="text-sm font-medium text-ink">{label}</span>}
          {description && <span className="text-xs text-ink-muted">{description}</span>}
        </label>
      )}

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-brand' : 'bg-line'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
