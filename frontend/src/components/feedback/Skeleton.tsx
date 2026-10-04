import React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-line/80 dark:bg-line/60',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      {...props}
    />
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-6 bg-surface rounded-xl border border-line animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-1/3 h-6" />
        <Skeleton variant="text" className="w-20 h-5" />
      </div>
      <div className="grid grid-cols-4 gap-4 py-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
};
