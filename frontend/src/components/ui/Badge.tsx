import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center font-medium rounded-full transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-surface-subtle text-ink border border-line',
        brand: 'bg-brand/15 text-brand border border-brand/30',
        success: 'bg-success/15 text-success border border-success/30',
        warning: 'bg-warning/15 text-warning border border-warning/30',
        danger: 'bg-danger/15 text-danger border border-danger/30',
        outline: 'border border-line text-ink-muted',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-2.5 py-1 text-xs gap-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'danger' && 'bg-danger',
            variant === 'brand' && 'bg-brand',
            (!variant || variant === 'default' || variant === 'outline') && 'bg-ink-muted'
          )}
        />
      )}
      {children}
    </span>
  );
};
