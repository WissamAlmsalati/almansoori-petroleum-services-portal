import { create } from 'zustand';
import { View } from '../types';

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  currentView: View;
  
  // Modal states
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };
  
  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  
  // Loading states
  globalLoading: boolean;
  loadingStates: {
    [key: string]: boolean;
  };
  
  // Theme and preferences
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
}

interface UIActions {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: View) => void;
  toggleSidebarCollapsed: () => void;
  
  // Modal actions
  openModal: (modalId: string, data?: any) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  
  // Toast actions
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  clearLoadingStates: () => void;
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
  // State
  sidebarOpen: true,
  currentView: 'Dashboard',
  modals: {},
  toasts: [],
  globalLoading: false,
  loadingStates: {},
  theme: 'light',
  sidebarCollapsed: false,

  // Sidebar actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setCurrentView: (view) => set({ currentView: view }),
  
  toggleSidebarCollapsed: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),

  // Modal actions
  openModal: (modalId, data) => set((state) => ({
    modals: {
      ...state.modals,
      [modalId]: {
        isOpen: true,
        data,
      },
    },
  })),
  
  closeModal: (modalId) => set((state) => ({
    modals: {
      ...state.modals,
      [modalId]: {
        isOpen: false,
        data: undefined,
      },
    },
  })),
  
  closeAllModals: () => set({ modals: {} }),

  // Toast actions
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-remove toast after duration (default: 5000ms)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((toast) => toast.id !== id),
  })),
  
  clearToasts: () => set({ toasts: [] }),

  // Loading actions
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  
  setLoadingState: (key, loading) => set((state) => ({
    loadingStates: {
      ...state.loadingStates,
      [key]: loading,
    },
  })),
  
  clearLoadingStates: () => set({ loadingStates: {} }),

  // Theme actions
  setTheme: (theme) => set({ theme }),
  
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light',
  })),
})); 