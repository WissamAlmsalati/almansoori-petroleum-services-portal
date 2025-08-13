import { create } from 'zustand';
import { ServiceTicket, TicketStatus } from '../types';

interface ServiceTicketState {
  tickets: ServiceTicket[];
  selectedTicket: ServiceTicket | null;
  filters: {
    status: TicketStatus | '';
    clientId: string;
    searchTerm: string;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface ServiceTicketActions {
  // Ticket operations
  setTickets: (tickets: ServiceTicket[]) => void;
  addTicket: (ticket: ServiceTicket) => void;
  updateTicket: (id: string, updates: Partial<ServiceTicket>) => void;
  deleteTicket: (id: string) => void;
  
  // Selection
  selectTicket: (ticket: ServiceTicket | null) => void;
  
  // Filters
  setStatusFilter: (status: TicketStatus | '') => void;
  setClientFilter: (clientId: string) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // Pagination
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  
  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getFilteredTickets: () => ServiceTicket[];
  getTotalItems: () => number;
  getTotalPages: () => number;
  getPaginatedTickets: () => ServiceTicket[];
  getTicketById: (id: string) => ServiceTicket | undefined;
}

type ServiceTicketStore = ServiceTicketState & ServiceTicketActions;

export const useServiceTicketStore = create<ServiceTicketStore>((set, get) => ({
  // State
  tickets: [],
  selectedTicket: null,
  filters: {
    status: '',
    clientId: '',
    searchTerm: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  isLoading: false,
  error: null,

  // Ticket operations
  setTickets: (tickets) => set({ tickets }),
  
  addTicket: (ticket) => set((state) => ({
    tickets: [...state.tickets, ticket],
  })),
  
  updateTicket: (id, updates) => set((state) => ({
    tickets: state.tickets.map((ticket) =>
      ticket.id === id ? { ...ticket, ...updates } : ticket
    ),
  })),
  
  deleteTicket: (id) => set((state) => ({
    tickets: state.tickets.filter((ticket) => ticket.id !== id),
    selectedTicket: state.selectedTicket?.id === id ? null : state.selectedTicket,
  })),

  // Selection
  selectTicket: (ticket) => set({ selectedTicket: ticket }),

  // Filters
  setStatusFilter: (status) => set((state) => ({
    filters: { ...state.filters, status },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setClientFilter: (clientId) => set((state) => ({
    filters: { ...state.filters, clientId },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setSearchTerm: (searchTerm) => set((state) => ({
    filters: { ...state.filters, searchTerm },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  clearFilters: () => set((state) => ({
    filters: {
      status: '',
      clientId: '',
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
  getFilteredTickets: () => {
    const { tickets, filters } = get();
    return tickets.filter((ticket) => {
      const matchesStatus = !filters.status || ticket.status === filters.status;
      const matchesClient = !filters.clientId || ticket.clientId === filters.clientId;
      const matchesSearch = !filters.searchTerm || 
        ticket.ticketNumber.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      return matchesStatus && matchesClient && matchesSearch;
    });
  },
  
  getTotalItems: () => {
    return get().getFilteredTickets().length;
  },
  
  getTotalPages: () => {
    const { getTotalItems, pagination } = get();
    return Math.ceil(getTotalItems() / pagination.itemsPerPage);
  },
  
  getPaginatedTickets: () => {
    const { getFilteredTickets, pagination } = get();
    const filteredTickets = getFilteredTickets();
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredTickets.slice(startIndex, endIndex);
  },
  
  getTicketById: (id) => {
    return get().tickets.find((ticket) => ticket.id === id);
  },
})); 