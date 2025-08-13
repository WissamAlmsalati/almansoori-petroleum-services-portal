import { create } from 'zustand';
import { TicketIssue, IssueStatus } from '../types';

interface TicketIssueState {
  issues: TicketIssue[];
  selectedIssue: TicketIssue | null;
  filters: {
    status: IssueStatus | '';
    ticketId: string;
    searchTerm: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface TicketIssueActions {
  setIssues: (issues: TicketIssue[]) => void;
  addIssue: (issue: TicketIssue) => void;
  updateIssue: (id: string, updates: Partial<TicketIssue>) => void;
  deleteIssue: (id: string) => void;
  selectIssue: (issue: TicketIssue | null) => void;
  
  // Filters
  setStatusFilter: (status: IssueStatus | '') => void;
  setTicketFilter: (ticketId: string) => void;
  setSearchTerm: (term: string) => void;
  setDateRange: (start: string, end: string) => void;
  clearFilters: () => void;
  
  // Pagination
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  
  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getFilteredIssues: () => TicketIssue[];
  getTotalItems: () => number;
  getTotalPages: () => number;
  getPaginatedIssues: () => TicketIssue[];
  getIssueById: (id: string) => TicketIssue | undefined;
  getIssuesByTicketId: (ticketId: string) => TicketIssue[];
  getIssuesByStatus: (status: IssueStatus) => TicketIssue[];
}

type TicketIssueStore = TicketIssueState & TicketIssueActions;

export const useTicketIssueStore = create<TicketIssueStore>((set, get) => ({
  // State
  issues: [],
  selectedIssue: null,
  filters: {
    status: '',
    ticketId: '',
    searchTerm: '',
    dateRange: {
      start: '',
      end: '',
    },
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  isLoading: false,
  error: null,

  // Actions
  setIssues: (issues) => set({ issues }),
  
  addIssue: (issue) => set((state) => ({
    issues: [...state.issues, issue],
  })),
  
  updateIssue: (id, updates) => set((state) => ({
    issues: state.issues.map((issue) =>
      issue.id === id ? { ...issue, ...updates } : issue
    ),
  })),
  
  deleteIssue: (id) => set((state) => ({
    issues: state.issues.filter((issue) => issue.id !== id),
    selectedIssue: state.selectedIssue?.id === id ? null : state.selectedIssue,
  })),
  
  selectIssue: (issue) => set({ selectedIssue: issue }),

  // Filters
  setStatusFilter: (status) => set((state) => ({
    filters: { ...state.filters, status },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setTicketFilter: (ticketId) => set((state) => ({
    filters: { ...state.filters, ticketId },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setSearchTerm: (searchTerm) => set((state) => ({
    filters: { ...state.filters, searchTerm },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setDateRange: (start, end) => set((state) => ({
    filters: { 
      ...state.filters, 
      dateRange: { start, end } 
    },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  clearFilters: () => set((state) => ({
    filters: {
      status: '',
      ticketId: '',
      searchTerm: '',
      dateRange: {
        start: '',
        end: '',
      },
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
  getFilteredIssues: () => {
    const { issues, filters } = get();
    return issues.filter((issue) => {
      const matchesStatus = !filters.status || issue.status === filters.status;
      const matchesTicket = !filters.ticketId || issue.ticketId === filters.ticketId;
      const matchesSearch = !filters.searchTerm || 
        issue.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        issue.remarks?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // Date range filtering
      let matchesDateRange = true;
      if (filters.dateRange.start && filters.dateRange.end) {
        const issueDate = new Date(issue.dateReported);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        matchesDateRange = issueDate >= startDate && issueDate <= endDate;
      }
      
      return matchesStatus && matchesTicket && matchesSearch && matchesDateRange;
    });
  },
  
  getTotalItems: () => {
    return get().getFilteredIssues().length;
  },
  
  getTotalPages: () => {
    const { getTotalItems, pagination } = get();
    return Math.ceil(getTotalItems() / pagination.itemsPerPage);
  },
  
  getPaginatedIssues: () => {
    const { getFilteredIssues, pagination } = get();
    const filteredIssues = getFilteredIssues();
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredIssues.slice(startIndex, endIndex);
  },
  
  getIssueById: (id) => {
    return get().issues.find((issue) => issue.id === id);
  },
  
  getIssuesByTicketId: (ticketId) => {
    return get().issues.filter((issue) => issue.ticketId === ticketId);
  },
  
  getIssuesByStatus: (status) => {
    return get().issues.filter((issue) => issue.status === status);
  },
})); 