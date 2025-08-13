import { create } from 'zustand';
import { SubAgreement } from '../types';

interface SubAgreementState {
  agreements: SubAgreement[];
  selectedAgreement: SubAgreement | null;
  filters: {
    clientId: string;
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

interface SubAgreementActions {
  setAgreements: (agreements: SubAgreement[]) => void;
  addAgreement: (agreement: SubAgreement) => void;
  updateAgreement: (id: string, updates: Partial<SubAgreement>) => void;
  deleteAgreement: (id: string) => void;
  selectAgreement: (agreement: SubAgreement | null) => void;
  
  // Filters
  setClientFilter: (clientId: string) => void;
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
  getFilteredAgreements: () => SubAgreement[];
  getTotalItems: () => number;
  getTotalPages: () => number;
  getPaginatedAgreements: () => SubAgreement[];
  getAgreementById: (id: string) => SubAgreement | undefined;
  getTotalAmount: () => number;
  getTotalBalance: () => number;
}

type SubAgreementStore = SubAgreementState & SubAgreementActions;

export const useSubAgreementStore = create<SubAgreementStore>((set, get) => ({
  // State
  agreements: [],
  selectedAgreement: null,
  filters: {
    clientId: '',
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
  setAgreements: (agreements) => set({ agreements }),
  
  addAgreement: (agreement) => set((state) => ({
    agreements: [...state.agreements, agreement],
  })),
  
  updateAgreement: (id, updates) => set((state) => ({
    agreements: state.agreements.map((agreement) =>
      agreement.id === id ? { ...agreement, ...updates } : agreement
    ),
  })),
  
  deleteAgreement: (id) => set((state) => ({
    agreements: state.agreements.filter((agreement) => agreement.id !== id),
    selectedAgreement: state.selectedAgreement?.id === id ? null : state.selectedAgreement,
  })),
  
  selectAgreement: (agreement) => set({ selectedAgreement: agreement }),

  // Filters
  setClientFilter: (clientId) => set((state) => ({
    filters: { ...state.filters, clientId },
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
      clientId: '',
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
  getFilteredAgreements: () => {
    const { agreements, filters } = get();
    return agreements.filter((agreement) => {
      const matchesClient = !filters.clientId || agreement.clientId === filters.clientId;
      const matchesSearch = !filters.searchTerm || 
        agreement.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // Date range filtering
      let matchesDateRange = true;
      if (filters.dateRange.start && filters.dateRange.end) {
        const startDate = new Date(agreement.startDate);
        const endDate = new Date(agreement.endDate);
        const filterStart = new Date(filters.dateRange.start);
        const filterEnd = new Date(filters.dateRange.end);
        matchesDateRange = startDate <= filterEnd && endDate >= filterStart;
      }
      
      return matchesClient && matchesSearch && matchesDateRange;
    });
  },
  
  getTotalItems: () => {
    return get().getFilteredAgreements().length;
  },
  
  getTotalPages: () => {
    const { getTotalItems, pagination } = get();
    return Math.ceil(getTotalItems() / pagination.itemsPerPage);
  },
  
  getPaginatedAgreements: () => {
    const { getFilteredAgreements, pagination } = get();
    const filteredAgreements = getFilteredAgreements();
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredAgreements.slice(startIndex, endIndex);
  },
  
  getAgreementById: (id) => {
    return get().agreements.find((agreement) => agreement.id === id);
  },
  
  getTotalAmount: () => {
    const { agreements } = get();
    return agreements.reduce((total, agreement) => total + agreement.amount, 0);
  },
  
  getTotalBalance: () => {
    const { agreements } = get();
    return agreements.reduce((total, agreement) => total + agreement.balance, 0);
  },
})); 