import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Activity,
  X,
} from 'lucide-react';
import { useSidebarStore } from '@/store/sidebarStore';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Patients & Charts',
    path: '/patients',
    icon: Users,
  },
  {
    label: 'Clinical Scheduler',
    path: '/scheduler',
    icon: Calendar,
  },
  {
    label: 'System Settings',
    path: '/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useSidebarStore();

  const renderNavLinks = (inMobileDrawer: boolean = false) => {
    return (
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const showTooltips = isCollapsed && !inMobileDrawer;

          const linkContent = (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => inMobileDrawer && setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 select-none group',
                  isActive
                    ? 'bg-brand/10 text-brand font-semibold shadow-2xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-subtle',
                  showTooltips && 'justify-center px-2'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-105" />
              {(!isCollapsed || inMobileDrawer) && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {(!isCollapsed || inMobileDrawer) && item.badge && (
                <Badge variant="brand" size="sm" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          );

          if (showTooltips) {
            return (
              <div key={item.path} className="flex justify-center">
                <Tooltip content={item.label} position="right">
                  {linkContent}
                </Tooltip>
              </div>
            );
          }

          return linkContent;
        })}
      </nav>
    );
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-line shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-brand-foreground font-bold shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-ink tracking-tight">AuraCare</span>
              <span className="text-xs text-brand ml-1 font-mono font-semibold">EHR</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle"
            aria-label="Close navigation drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {renderNavLinks(true)}

        {/* Mobile Footer */}
        <div className="p-4 border-t border-line bg-surface-subtle/50">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <ShieldCheck className="h-4 w-4 text-success shrink-0" />
            <span>HIPAA Tier-3 Compliant Session</span>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar (Collapses between w-64 and w-20) */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-surface border-r border-line transition-all duration-300 ease-out select-none',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Desktop Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-line shrink-0">
          <div className={cn('flex items-center gap-2.5 overflow-hidden', isCollapsed && 'justify-center w-full')}>
            <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center text-brand-foreground font-bold shadow-xs shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-ink tracking-tight">AuraCare</span>
                  <Badge variant="brand" size="sm">2026</Badge>
                </div>
                <span className="text-[11px] text-ink-muted truncate font-medium">Enterprise Health Record</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Links */}
        {renderNavLinks(false)}

        {/* Desktop Footer with Collapse Button */}
        <div className="p-3 border-t border-line shrink-0 flex flex-col gap-2">
          {!isCollapsed && (
            <div className="px-2 py-1.5 rounded-lg bg-surface-subtle text-[11px] text-ink-muted flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
              <span className="truncate">HIPAA Compliant Vault</span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors w-full cursor-pointer',
              isCollapsed && 'justify-center px-0'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
