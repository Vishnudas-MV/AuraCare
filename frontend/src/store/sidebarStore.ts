import { create } from 'zustand';
import { STORAGE_KEYS } from '@/config/constants';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
}

function getInitialCollapse(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    return saved === 'true';
  } catch {
    return false;
  }
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isCollapsed: getInitialCollapse(),
  isMobileOpen: false,

  toggleCollapse: () => {
    const next = !get().isCollapsed;
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
    } catch {
      // LocalStorage fallback
    }
    set({ isCollapsed: next });
  },

  setCollapsed: (collapsed: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
    } catch {
      // LocalStorage fallback
    }
    set({ isCollapsed: collapsed });
  },

  toggleMobile: () => {
    set({ isMobileOpen: !get().isMobileOpen });
  },

  setMobileOpen: (open: boolean) => {
    set({ isMobileOpen: open });
  },
}));
