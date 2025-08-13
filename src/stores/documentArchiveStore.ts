import { create } from 'zustand';
import { DocumentArchive, Client } from '../types';

interface DocumentArchiveState {
  documents: DocumentArchive[];
  clients: Client[];
  selectedDocuments: string[];
  filters: {
    searchTerm: string;
    clientFilter: string;
    categoryFilter: string;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface DocumentArchiveActions {
  // Document operations
  setDocuments: (documents: DocumentArchive[]) => void;
  addDocument: (document: DocumentArchive) => void;
  updateDocument: (id: string, updates: Partial<DocumentArchive>) => void;
  deleteDocument: (id: string) => void;
  deleteMultipleDocuments: (ids: string[]) => void;
  
  // Client operations
  setClients: (clients: Client[]) => void;
  
  // Selection operations
  selectDocument: (id: string) => void;
  deselectDocument: (id: string) => void;
  selectAllDocuments: () => void;
  deselectAllDocuments: () => void;
  setSelectedDocuments: (ids: string[]) => void;
  
  // Filter operations
  setSearchTerm: (term: string) => void;
  setClientFilter: (clientId: string) => void;
  setCategoryFilter: (category: string) => void;
  clearFilters: () => void;
  
  // Pagination operations
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  
  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getFilteredDocuments: () => DocumentArchive[];
  getCategories: () => string[];
  getTotalItems: () => number;
  getTotalPages: () => number;
  getPaginatedDocuments: () => DocumentArchive[];
}

type DocumentArchiveStore = DocumentArchiveState & DocumentArchiveActions;

export const useDocumentArchiveStore = create<DocumentArchiveStore>((set, get) => ({
  // State
  documents: [],
  clients: [],
  selectedDocuments: [],
  filters: {
    searchTerm: '',
    clientFilter: '',
    categoryFilter: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  isLoading: false,
  error: null,

  // Document operations
  setDocuments: (documents) => set({ documents }),
  
  addDocument: (document) => set((state) => ({
    documents: [...state.documents, document],
  })),
  
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === id ? { ...doc, ...updates } : doc
    ),
  })),
  
  deleteDocument: (id) => set((state) => ({
    documents: state.documents.filter((doc) => doc.id !== id),
    selectedDocuments: state.selectedDocuments.filter((docId) => docId !== id),
  })),
  
  deleteMultipleDocuments: (ids) => set((state) => ({
    documents: state.documents.filter((doc) => !ids.includes(doc.id)),
    selectedDocuments: state.selectedDocuments.filter((docId) => !ids.includes(docId)),
  })),

  // Client operations
  setClients: (clients) => set({ clients }),

  // Selection operations
  selectDocument: (id) => set((state) => ({
    selectedDocuments: [...state.selectedDocuments, id],
  })),
  
  deselectDocument: (id) => set((state) => ({
    selectedDocuments: state.selectedDocuments.filter((docId) => docId !== id),
  })),
  
  selectAllDocuments: () => set((state) => ({
    selectedDocuments: state.getFilteredDocuments().map((doc) => doc.id),
  })),
  
  deselectAllDocuments: () => set({ selectedDocuments: [] }),
  
  setSelectedDocuments: (ids) => set({ selectedDocuments: ids }),

  // Filter operations
  setSearchTerm: (searchTerm) => set((state) => ({
    filters: { ...state.filters, searchTerm },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setClientFilter: (clientFilter) => set((state) => ({
    filters: { ...state.filters, clientFilter },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  setCategoryFilter: (categoryFilter) => set((state) => ({
    filters: { ...state.filters, categoryFilter },
    pagination: { ...state.pagination, currentPage: 1 },
  })),
  
  clearFilters: () => set((state) => ({
    filters: {
      searchTerm: '',
      clientFilter: '',
      categoryFilter: '',
    },
    pagination: { ...state.pagination, currentPage: 1 },
  })),

  // Pagination operations
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
  getFilteredDocuments: () => {
    const { documents, filters } = get();
    return documents.filter((doc) => {
      const matchesSearch = 
        doc.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesClient = !filters.clientFilter || doc.clientId === filters.clientFilter;
      const matchesCategory = !filters.categoryFilter || doc.category === filters.categoryFilter;
      
      return matchesSearch && matchesClient && matchesCategory;
    });
  },
  
  getCategories: () => {
    const { documents } = get();
    return Array.from(new Set(documents.map((doc) => doc.category))).sort();
  },
  
  getTotalItems: () => {
    return get().getFilteredDocuments().length;
  },
  
  getTotalPages: () => {
    const { getTotalItems, pagination } = get();
    return Math.ceil(getTotalItems() / pagination.itemsPerPage);
  },
  
  getPaginatedDocuments: () => {
    const { getFilteredDocuments, pagination } = get();
    const filteredDocs = getFilteredDocuments();
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredDocs.slice(startIndex, endIndex);
  },
})); 