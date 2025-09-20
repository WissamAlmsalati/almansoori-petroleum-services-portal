import { create } from 'zustand';
import serviceTicketService, { ServiceTicketCreateRequest, FrontendServiceTicket } from '@/features/serviceTickets/service';

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface ServiceTicketState {
  items: FrontendServiceTicket[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

interface ServiceTicketActions {
  fetchTickets: (page?: number) => Promise<void>;
  createTicket: (payload: ServiceTicketCreateRequest) => Promise<FrontendServiceTicket>;
  clearError: () => void;
}

type Store = ServiceTicketState & ServiceTicketActions;

export const useServiceTicketStore = create<Store>((set, get) => ({
  items: [],
  pagination: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchTickets: async (page: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { items, pagination } = await serviceTicketService.list(page);
      set({
        items,
        pagination: {
          current_page: pagination.current_page,
          per_page: pagination.per_page as unknown as number,
          total: pagination.total,
          last_page: pagination.last_page,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error?.message || 'Failed to load service tickets' });
      throw error;
    }
  },

  createTicket: async (payload: ServiceTicketCreateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const created = await serviceTicketService.create(payload);
      // Prepend to list
      set({ items: [created, ...get().items], isLoading: false });
      return created;
    } catch (error: any) {
      set({ isLoading: false, error: error?.message || 'Failed to create service ticket' });
      throw error;
    }
  },
}));

export default useServiceTicketStore;


