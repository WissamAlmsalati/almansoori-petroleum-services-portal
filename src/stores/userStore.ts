import { create } from 'zustand';
import { User, UserRole } from '../types';

interface UserState {
  users: User[];
  selectedUser: User | null;
  filters: {
    role: UserRole | '';
    status: 'active' | 'inactive' | 'pending' | '';
    searchTerm: string;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  selectUser: (user: User | null) => void;
  
  // Filters
  setRoleFilter: (role: UserRole | '') => void;
  setStatusFilter: (status: 'active' | 'inactive' | 'pending' | '') => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // Pagination
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  
  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getFilteredUsers: () => User[];
  getTotalItems: () => number;
  getTotalPages: () => number;
  getPaginatedUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
  getActiveUsers: () => User[];
  getInactiveUsers: () => User[];
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>((set, get) => ({
  // State
  users: [],
  selectedUser: null,
  filters: {
    role: '',
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
  setUsers: (users) => set({ users }),
  
  addUser: (user) => set((state) => ({
    users: [...state.users, user],
  })),
  
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map((user) =>
      user.id === id ? { ...user, ...updates } : user
    ),
  })),
  
  deleteUser: (id) => set((state) => ({
    users: state.users.filter((user) => user.id !== id),
    selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
  })),
  
  selectUser: (user) => set({ selectedUser: user }),

  // Filters
  setRoleFilter: (role) => set((state) => ({
    filters: { ...state.filters, role },
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
      role: '',
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
  getFilteredUsers: () => {
    const { users, filters } = get();
    return users.filter((user) => {
      const matchesRole = !filters.role || user.role === filters.role;
      const matchesStatus = !filters.status || user.status === filters.status;
      const matchesSearch = !filters.searchTerm || 
        user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      return matchesRole && matchesStatus && matchesSearch;
    });
  },
  
  getTotalItems: () => {
    return get().getFilteredUsers().length;
  },
  
  getTotalPages: () => {
    const { getTotalItems, pagination } = get();
    return Math.ceil(getTotalItems() / pagination.itemsPerPage);
  },
  
  getPaginatedUsers: () => {
    const { getFilteredUsers, pagination } = get();
    const filteredUsers = getFilteredUsers();
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  },
  
  getUserById: (id) => {
    return get().users.find((user) => user.id === id);
  },
  
  getUsersByRole: (role) => {
    return get().users.filter((user) => user.role === role);
  },
  
  getActiveUsers: () => {
    return get().users.filter((user) => user.status === 'active');
  },
  
  getInactiveUsers: () => {
    return get().users.filter((user) => user.status === 'inactive');
  },
})); 