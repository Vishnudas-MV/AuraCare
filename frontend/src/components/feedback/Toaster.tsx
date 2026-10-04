import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { useThemeStore } from '@/store/themeStore';

/**
 * AuraCare Sonner Toaster integrated with semantic light/dark theme.
 */
export const Toaster: React.FC = () => {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className:
          '!bg-surface !text-ink !border !border-line !shadow-lg !rounded-xl !text-sm !font-sans',
        descriptionClassName: '!text-ink-muted !text-xs',
      }}
    />
  );
};
