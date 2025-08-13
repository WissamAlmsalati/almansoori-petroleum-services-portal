# Zustand State Management

This project uses Zustand for state management across all components. Zustand is a lightweight, fast, and scalable state management solution.

## Store Structure

The application is organized into multiple stores, each handling a specific domain:

### 1. Auth Store (`authStore.ts`)
Manages authentication state including user data, tokens, and login/logout functionality.

**Key Features:**
- User authentication state
- Token management
- Login/logout actions
- Persistent storage (localStorage)

**Usage:**
```typescript
import { useAuthStore } from '../stores';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

### 2. Document Archive Store (`documentArchiveStore.ts`)
Manages document archive data with filtering, pagination, and CRUD operations.

**Key Features:**
- Document CRUD operations
- Advanced filtering (search, client, category)
- Pagination
- Bulk selection and operations
- Computed values for filtered data

**Usage:**
```typescript
import { useDocumentArchiveStore } from '../stores';

const {
  documents,
  selectedDocuments,
  filters,
  pagination,
  setSearchTerm,
  setClientFilter,
  selectDocument,
  deleteDocument,
  getFilteredDocuments,
  getPaginatedDocuments,
} = useDocumentArchiveStore();
```

### 3. Client Store (`clientStore.ts`)
Manages client data and operations.

**Key Features:**
- Client CRUD operations
- Client selection
- Client lookup by ID

**Usage:**
```typescript
import { useClientStore } from '../stores';

const { clients, selectedClient, addClient, updateClient, getClientById } = useClientStore();
```

### 4. Service Ticket Store (`serviceTicketStore.ts`)
Manages service ticket data with filtering and pagination.

**Key Features:**
- Ticket CRUD operations
- Status-based filtering
- Client filtering
- Search functionality
- Pagination

**Usage:**
```typescript
import { useServiceTicketStore } from '../stores';

const {
  tickets,
  filters,
  setStatusFilter,
  setClientFilter,
  getFilteredTickets,
  getPaginatedTickets,
} = useServiceTicketStore();
```

### 5. Call Out Job Store (`callOutJobStore.ts`)
Manages call out job data and operations.

**Key Features:**
- Job CRUD operations
- Status and client filtering
- Search functionality
- Pagination

### 6. Daily Service Log Store (`dailyServiceLogStore.ts`)
Manages daily service log data with advanced filtering.

**Key Features:**
- Log CRUD operations
- Field and well filtering
- Date range filtering
- Client filtering
- Computed values for fields and wells

### 7. Sub Agreement Store (`subAgreementStore.ts`)
Manages sub agreement data with financial calculations.

**Key Features:**
- Agreement CRUD operations
- Date range filtering
- Client filtering
- Total amount and balance calculations

### 8. Ticket Issue Store (`ticketIssueStore.ts`)
Manages ticket issue data and operations.

**Key Features:**
- Issue CRUD operations
- Status-based filtering
- Ticket-based filtering
- Date range filtering
- Computed values for issues by ticket or status

### 9. User Store (`userStore.ts`)
Manages user data and operations.

**Key Features:**
- User CRUD operations
- Role and status filtering
- Search functionality
- Computed values for users by role or status

### 10. UI Store (`uiStore.ts`)
Manages global UI state including modals, toasts, and sidebar.

**Key Features:**
- Sidebar state management
- Modal management
- Toast notifications
- Loading states
- Theme management

**Usage:**
```typescript
import { useUIStore } from '../stores';

const {
  sidebarOpen,
  currentView,
  toasts,
  openModal,
  closeModal,
  addToast,
  setGlobalLoading,
} = useUIStore();
```

## Common Patterns

### 1. Filtering and Pagination
Most stores follow a consistent pattern for filtering and pagination:

```typescript
const {
  filters,
  pagination,
  setSearchTerm,
  setClientFilter,
  setCurrentPage,
  getFilteredItems,
  getPaginatedItems,
  getTotalItems,
  getTotalPages,
} = useStore();
```

### 2. Loading and Error States
All stores include loading and error state management:

```typescript
const { isLoading, error, setLoading, setError } = useStore();
```

### 3. Computed Values
Stores provide computed values for filtered and paginated data:

```typescript
const filteredItems = getFilteredItems();
const paginatedItems = getPaginatedItems();
const totalItems = getTotalItems();
const totalPages = getTotalPages();
```

### 4. Toast Notifications
Use the UI store for showing notifications:

```typescript
const { addToast } = useUIStore();

// Success notification
addToast({
  type: 'success',
  message: 'Operation completed successfully',
});

// Error notification
addToast({
  type: 'error',
  message: 'Operation failed',
});
```

## Best Practices

1. **Use Selectors**: When you only need specific parts of the state, use selectors to avoid unnecessary re-renders.

2. **Computed Values**: Use the provided computed values instead of calculating them in components.

3. **Error Handling**: Always handle errors and show appropriate toast notifications.

4. **Loading States**: Show loading indicators during async operations.

5. **Persistence**: The auth store is automatically persisted to localStorage. Other stores can be persisted if needed.

## Migration from Props to Stores

The DocumentArchive component has been migrated from using props to using Zustand stores. This provides several benefits:

- **No prop drilling**: Components can access state directly
- **Centralized state**: All related state is in one place
- **Better performance**: Only components that use specific state re-render
- **Easier testing**: Stores can be tested independently
- **Better developer experience**: TypeScript support and better debugging

## Example: Using Multiple Stores

```typescript
import React from 'react';
import { useDocumentArchiveStore, useClientStore, useUIStore } from '../stores';

const MyComponent: React.FC = () => {
  const { documents, setSearchTerm, deleteDocument } = useDocumentArchiveStore();
  const { clients } = useClientStore();
  const { addToast, openModal } = useUIStore();

  const handleDelete = async (id: string) => {
    try {
      deleteDocument(id);
      addToast({
        type: 'success',
        message: 'Document deleted successfully',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to delete document',
      });
    }
  };

  return (
    // Component JSX
  );
};
```

This architecture provides a clean, scalable, and maintainable state management solution for the entire application. 