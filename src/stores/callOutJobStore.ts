import { create } from 'zustand';
import { CallOutJob } from '../types';

interface CallOutJobState {
  jobs: CallOutJob[];
  selectedJob: CallOutJob | null;
  filters: {
    clientId: string;
    status: string;
    searchTerm: string;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface CallOutJobActions {
  setJobs: (jobs: CallOutJob[]) => void;
  addJob: (job: CallOutJob) => void;
  updateJob: (id: string, updates: Partial<CallOutJob>) => void;
  deleteJob: (id: string) => void;
  selectJob: (job: CallOutJob | null) => void;
  
  // Filters
  setClientFilter: (clientId: string) => void;
  setStatusFilter: (status: string) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // Pagination
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  
  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getFilteredJobs: () => CallOutJob[];
  getTotalItems: () => number;
  getTotalPages: () => number;
  getPaginatedJobs: () => CallOutJob[];
  getJobById: (id: string) => CallOutJob | undefined;
}

type CallOutJobStore = CallOutJobState & CallOutJobActions;

export const useCallOutJobStore = create<CallOutJobStore>((set, get) => ({
  // State
  jobs: [],
  selectedJob: null,
  filters: {
    clientId: '',
    status: '',
    searchTerm: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  isLoading: false,
  error: null,

  // Actions
  setJobs: (jobs) => set({ jobs }),
  
  addJob: (job) => set((state) => ({
    jobs: [...state.jobs, job],
  })),
  
  updateJob: (id, updates) => set((state) => ({
    jobs: state.jobs.map((job) =>
      job.id === id ? { ...job, ...updates } : job
    ),
  })),
  
  deleteJob: (id) => set((state) => ({
    jobs: state.jobs.filter((job) => job.id !== id),
    selectedJob: state.selectedJob?.id === id ? null : state.selectedJob,
  })),
  
  selectJob: (job) => set({ selectedJob: job }),

  // Filters
  setClientFilter: (clientId) => set((state) => ({
    filters: { ...state.filters, clientId },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setStatusFilter: (status) => set((state) => ({
    filters: { ...state.filters, status },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setSearchTerm: (searchTerm) => set((state) => ({
    filters: { ...state.filters, searchTerm },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  clearFilters: () => set((state) => ({
    filters: {
      clientId: '',
      status: '',
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
  getFilteredJobs: () => {
    const { jobs, filters } = get();
    return jobs.filter((job) => {
      const matchesClient = !filters.clientId || job.clientId === filters.clientId;
      const matchesStatus = !filters.status || job.status === filters.status;
      const matchesSearch = !filters.searchTerm || 
        job.jobName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.workOrderNumber.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      return matchesClient && matchesStatus && matchesSearch;
    });
  },
  
  getTotalItems: () => {
    return get().getFilteredJobs().length;
  },
  
  getTotalPages: () => {
    const { getTotalItems, pagination } = get();
    return Math.ceil(getTotalItems() / pagination.itemsPerPage);
  },
  
  getPaginatedJobs: () => {
    const { getFilteredJobs, pagination } = get();
    const filteredJobs = getFilteredJobs();
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  },
  
  getJobById: (id) => {
    return get().jobs.find((job) => job.id === id);
  },
})); 