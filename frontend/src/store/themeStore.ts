import { create } from 'zustand';
import { STORAGE_KEYS } from '@/config/constants';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDocument(theme: ThemeMode): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';

  const resolved: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }

  // Set color-scheme meta tag and root style for native UI (scrollbars, form controls)
  root.style.colorScheme = resolved;
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaColorScheme) {
    metaColorScheme.setAttribute('content', resolved);
  }

  return resolved;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // LocalStorage fallback
  }
  return 'system';
}

const initialTheme = getInitialTheme();
const initialResolved = applyThemeToDocument(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => {
  // Listen for system theme changes if mode is 'system'
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (get().theme === 'system') {
        const newResolved = applyThemeToDocument('system');
        set({ resolvedTheme: newResolved });
      }
    });
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,

    setTheme: (theme: ThemeMode) => {
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
      } catch {
        // LocalStorage fallback
      }
      const resolved = applyThemeToDocument(theme);
      set({ theme, resolvedTheme: resolved });
    },

    toggleTheme: () => {
      const current = get().resolvedTheme;
      const nextTheme: ThemeMode = current === 'dark' ? 'light' : 'dark';
      get().setTheme(nextTheme);
    },
  };
});
