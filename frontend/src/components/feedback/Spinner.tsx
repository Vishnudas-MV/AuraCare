import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="inline-flex items-center gap-2 text-brand">
      <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
      {label && <span className="text-xs text-ink-muted">{label}</span>}
    </div>
  );
};
