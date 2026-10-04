import React from 'react';
import { cn } from '@/utils/cn';

export interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  actions,
  children,
  className,
}) => {
  return (
    <div className={cn('w-full flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in', className)}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-line/60">
          <div>
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
};
