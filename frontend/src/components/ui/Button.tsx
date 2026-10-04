import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * AuraCare Button Atom
 * Built with class-variance-authority, active scale micro-interactions, and accessible states.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-lg text-sm select-none transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm hover:shadow active:shadow-none',
        secondary:
          'bg-surface-subtle text-ink hover:bg-line border border-line shadow-2xs',
        outline:
          'bg-transparent border border-line text-ink hover:bg-surface-subtle hover:border-brand/40',
        ghost:
          'bg-transparent text-ink hover:bg-surface-subtle hover:text-brand',
        danger:
          'bg-danger text-white hover:bg-danger/90 shadow-sm hover:shadow',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-11 px-5 text-base gap-2.5',
        icon: 'h-10 w-10 p-0 shrink-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
