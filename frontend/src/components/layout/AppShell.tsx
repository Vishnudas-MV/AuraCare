import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useSidebarStore } from '@/store/sidebarStore';
import { cn } from '@/utils/cn';

export interface AppShellProps {
  children?: React.ReactNode;
}

/**
 * AuraCare Enterprise AppShell
 * Coordinates responsive layout margins (md:ml-20 vs md:ml-64), header bar, and content viewport.
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <div className="min-h-screen bg-canvas text-ink flex">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Layout Area - responsive margin adjusts with sidebar collapse */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-out',
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        )}
      >
        {/* Sticky Header */}
        <Header />

        {/* Content Viewport */}
        <main className="flex-1 flex flex-col bg-canvas">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
