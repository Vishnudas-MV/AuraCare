import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Search,
  Sparkles,
} from 'lucide-react';
import { useSidebarStore } from '@/store/sidebarStore';
import { useThemeStore } from '@/store/themeStore';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { env } from '@/config/env.config';

export const Header: React.FC = () => {
  const { toggleMobile } = useSidebarStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-20 h-16 w-full border-b border-line bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left Section: Mobile Hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle md:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Patient / EHR Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search patients (MRN, Name, DOB) or charts..."
            className="w-full h-9 pl-9 pr-4 text-xs rounded-lg bg-surface-subtle border border-line text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-line rounded text-ink-muted hidden lg:inline-block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section: Ambient AI Status, HIPAA Badge, Theme Toggle, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Gemini Ambient AI Status Indicator */}
        {env.VITE_ENABLE_GEMINI_AMBIENT && (
          <Tooltip content="Gemini Ambient Clinical Intelligence is active" position="bottom">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Ambient AI Ready</span>
            </div>
          </Tooltip>
        )}

        {/* HIPAA Security Indicator */}
        <Tooltip content="EHR encryption active - Audit session logged" position="bottom">
          <Badge variant="success" size="sm" dot className="hidden md:inline-flex">
            HIPAA Vault
          </Badge>
        </Tooltip>

        {/* Theme Mode Toggle */}
        <Tooltip content={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`} position="bottom">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-warning" />
            ) : (
              <Moon className="h-4 w-4 text-ink-muted" />
            )}
          </button>
        </Tooltip>

        {/* Clinical User Avatar / Identity */}
        <div className="flex items-center gap-2 pl-2 border-l border-line">
          <div className="h-8 w-8 rounded-full bg-brand/15 text-brand flex items-center justify-center font-semibold text-xs border border-brand/20">
            DR
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-ink leading-tight">Dr. Sarah Jenkins</span>
            <span className="text-[10px] text-ink-muted leading-tight">Attending Physician</span>
          </div>
        </div>
      </div>
    </header>
  );
};
