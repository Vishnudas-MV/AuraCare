import React, { createContext, useContext, useEffect } from 'react';
import { useThemeStore, type ThemeMode, type ResolvedTheme } from '@/store/themeStore';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();

  useEffect(() => {
    // Initial mount hook to ensure html class is aligned with stored preference
    setTheme(theme);
  }, [setTheme, theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
