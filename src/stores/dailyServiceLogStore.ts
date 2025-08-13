import { create } from 'zustand';
import { DailyServiceLog } from '../types';

interface DailyServiceLogState {
  logs: DailyServiceLog[];
  selectedLog: DailyServiceLog | null;
  filters: {
    clientId: string;
    field: string;
    well: string;
    dateRange: {
      start: string;
      end: string;
    };
    searchTerm: string;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface DailyServiceLogActions {
  setLogs: (logs: DailyServiceLog[]) => void;
  addLog: (log: DailyServiceLog) => void;
  updateLog: (id: string, updates: Partial<DailyServiceLog>) => void;
  deleteLog: (id: string) => void;
  selectLog: (log: DailyServiceLog | null) => void;
  
  // Filters
  setClientFilter: (clientId: string) => void;
  setFieldFilter: (field: string) => void;
  setWellFilter: (well: string) => void;
  setDateRange: (start: string, end: string) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // Pagination
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  
  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getFilteredLogs: () => DailyServiceLog[];
  getTotalItems: () => number;
  getTotalPages: () => number;
  getPaginatedLogs: () => DailyServiceLog[];
  getLogById: (id: string) => DailyServiceLog | undefined;
  getFields: () => string[];
  getWells: () => string[];
}

type DailyServiceLogStore = DailyServiceLogState & DailyServiceLogActions;

export const useDailyServiceLogStore = create<DailyServiceLogStore>((set, get) => ({
  // State
  logs: [],
  selectedLog: null,
  filters: {
    clientId: '',
    field: '',
    well: '',
    dateRange: {
      start: '',
      end: '',
    },
    searchTerm: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  isLoading: false,
  error: null,

  // Actions
  setLogs: (logs) => set({ logs }),
  
  addLog: (log) => set((state) => ({
    logs: [...state.logs, log],
  })),
  
  updateLog: (id, updates) => set((state) => ({
    logs: state.logs.map((log) =>
      log.id === id ? { ...log, ...updates } : log
    ),
  })),
  
  deleteLog: (id) => set((state) => ({
    logs: state.logs.filter((log) => log.id !== id),
    selectedLog: state.selectedLog?.id === id ? null : state.selectedLog,
  })),
  
  selectLog: (log) => set({ selectedLog: log }),

  // Filters
  setClientFilter: (clientId) => set((state) => ({
    filters: { ...state.filters, clientId },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setFieldFilter: (field) => set((state) => ({
    filters: { ...state.filters, field },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setWellFilter: (well) => set((state) => ({
    filters: { ...state.filters, well },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setDateRange: (start, end) => set((state) => ({
    filters: { 
      ...state.filters, 
      dateRange: { start, end } 
    },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setSearchTerm: (searchTerm) => set((state) => ({
    filters: { ...state.filters, searchTerm },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  clearFilters: () => set((state) => ({
    filters: {
      clientId: '',
      field: '',
      well: '',
      dateRange: {
        start: '',
        end: '',
      },
      searchTerm: '',
    },
    pagination: { ...state.pagination, currentPage: 1 },
  })),

  // Pagination
  setCurrentPage: (currentPage) => set((state) => ({
    pagination: { ...state.pagination, currentPage },
  })),
  
  setItemsPerPage: (itemsPerPage) => set((state) => ({
    pagination: { ...state.pagination, itemsPerPage, currentPage: 1 },
  })),

  // Loading and error states
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Computed values
  getFilteredLogs: () => {
    const { logs, filters } = get();
    return logs.filter((log) => {
      const matchesClient = !filters.clientId || log.clientId === filters.clientId;
      const matchesField = !filters.field || log.field === filters.field;
      const matchesWell = !filters.well || log.well === filters.well;
      const matchesSearch = !filters.searchTerm || 
        log.logNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        log.field.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        log.well.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // Date range filtering
      let matchesDateRange = true;
      if (filters.dateRange.start && filters.dateRange.end) {
        const logDate = new Date(log.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        matchesDateRange = logDate >= startDate && logDate <= endDate;
      }
      
      return matchesClient && matchesField && matchesWell && matchesSearch && matchesDateRange;
    });
  },
  
  getTotalItems: () => {
    return get().getFilteredLogs().length;
  },
  
  getTotalPages: () => {
    const { getTotalItems, pagination } = get();
    return Math.ceil(getTotalItems() / pagination.itemsPerPage);
  },
  
  getPaginatedLogs: () => {
    const { getFilteredLogs, pagination } = get();
    const filteredLogs = getFilteredLogs();
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  },
  
  getLogById: (id) => {
    return get().logs.find((log) => log.id === id);
  },
  
  getFields: () => {
    const { logs } = get();
    return Array.from(new Set(logs.map((log) => log.field))).sort();
  },
  
  getWells: () => {
    const { logs } = get();
    return Array.from(new Set(logs.map((log) => log.well))).sort();
  },
})); 