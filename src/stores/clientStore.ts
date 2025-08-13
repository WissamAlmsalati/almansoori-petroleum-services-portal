import { create } from 'zustand';
import { Client } from '../types';

interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;
  error: string | null;
}

interface ClientActions {
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  selectClient: (client: Client | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getClientById: (id: string) => Client | undefined;
}

type ClientStore = ClientState & ClientActions;

export const useClientStore = create<ClientStore>((set, get) => ({
  // State
  clients: [],
  selectedClient: null,
  isLoading: false,
  error: null,

  // Actions
  setClients: (clients) => set({ clients }),
  
  addClient: (client) => set((state) => ({
    clients: [...state.clients, client],
  })),
  
  updateClient: (id, updates) => set((state) => ({
    clients: state.clients.map((client) =>
      client.id === id ? { ...client, ...updates } : client
    ),
  })),
  
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter((client) => client.id !== id),
    selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
  })),
  
  selectClient: (client) => set({ selectedClient: client }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  getClientById: (id) => {
    return get().clients.find((client) => client.id === id);
  },
})); 