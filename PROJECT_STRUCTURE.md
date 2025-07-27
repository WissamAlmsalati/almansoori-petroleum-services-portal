# Project Structure

This document outlines the clean, organized structure of the Almansoori Petroleum Services Portal.

## 📁 Directory Structure

```
almansoori-petroleum-services-portal/
├── public/                     # Static assets
├── src/                        # Source code
│   ├── components/            # React components
│   │   ├── AddForms.tsx       # All form components
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── Header.tsx         # Page header
│   │   ├── Dashboard.tsx      # Dashboard component
│   │   ├── Clients.tsx        # Client management
│   │   ├── SubAgreements.tsx  # Sub-agreement management
│   │   ├── ServiceTickets.tsx # Service ticket management
│   │   ├── CallOutJobs.tsx    # Call-out job management
│   │   ├── DailyServiceLogs.tsx # Daily service logs
│   │   ├── TicketIssues.tsx   # Ticket issue tracking
│   │   ├── DocumentArchive.tsx # Document management
│   │   ├── UserManagement.tsx # User management
│   │   ├── Modal.tsx          # Reusable modal component
│   │   └── ModalDetailViews.tsx # Modal detail components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAppData.ts      # Data management hook
│   │   ├── useModalState.ts   # Modal state management hook
│   │   └── index.ts           # Hook exports
│   ├── utils/                 # Utility functions
│   │   ├── dateUtils.ts       # Date manipulation utilities
│   │   ├── excelUtils.ts      # Excel generation utilities
│   │   └── index.ts           # Utility exports
│   ├── services/              # API services
│   │   ├── api.ts             # Base API configuration
│   │   ├── clientService.ts   # Client API operations
│   │   └── subAgreementService.ts # Sub-agreement API operations
│   ├── contexts/              # React contexts
│   │   └── MessageContext.tsx # Toast message context
│   ├── types.ts               # TypeScript type definitions
│   └── constants.ts           # Application constants
├── MainApp.tsx                # Main application component
├── App.tsx                    # App wrapper component
├── index.tsx                  # Application entry point
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## 🛠️ Key Improvements

### 1. **Separation of Concerns**
- **Components**: All UI components organized in dedicated files
- **Hooks**: Custom hooks for state management and business logic
- **Utils**: Pure utility functions separated from components
- **Services**: API integration logic centralized
- **Types**: TypeScript definitions in dedicated files

### 2. **Custom Hooks**
- **`useAppData`**: Manages all application data, API calls, and loading states
- **`useModalState`**: Handles modal state, form editing states, and modal operations

### 3. **Utility Organization**
- **`dateUtils`**: Date manipulation and formatting functions
- **`excelUtils`**: Excel generation and download functionality
- **`ModalDetailViews`**: Reusable modal detail components

### 4. **Clean Imports**
- Organized imports by category (components, hooks, utils, types)
- Consistent import paths using relative paths
- Index files for cleaner exports

## 🔧 Configuration

### TypeScript Path Mapping
The `tsconfig.json` includes path mappings for cleaner imports:
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@components/*": ["./src/components/*"],
    "@utils": ["./src/utils/index"],
    "@hooks": ["./src/hooks/index"],
    "@services/*": ["./src/services/*"],
    "@types": ["./src/types"]
  }
}
```

### Vite Configuration
The `vite.config.ts` includes alias mappings that match TypeScript paths.

## 📋 Features

### ✅ Working Features
- **Client Management**: Full CRUD operations with Laravel API integration
- **Sub-Agreement Management**: Full CRUD operations with Laravel API integration
- **Service Tickets**: Local CRUD operations (ready for API integration)
- **Call-Out Jobs**: Local CRUD operations
- **Daily Service Logs**: Excel generation and file management
- **Document Archive**: Centralized document management
- **User Management**: User CRUD operations
- **Ticket Issues**: Issue tracking system
- **Toast Messages**: User feedback system

### 🔌 API Integration Status
- ✅ **Clients**: Fully integrated with Laravel backend
- ✅ **Sub-Agreements**: Fully integrated with Laravel backend
- ⏳ **Service Tickets**: Ready for API integration
- ⏳ **Call-Out Jobs**: Ready for API integration
- ⏳ **Daily Service Logs**: Ready for API integration
- ⏳ **Users**: Ready for API integration
- ⏳ **Ticket Issues**: Ready for API integration

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 📝 Development Notes

- **State Management**: Uses React hooks for local state with plans for more complex state management if needed
- **API Integration**: Uses Axios for HTTP requests with centralized error handling
- **Form Handling**: Custom form components with validation
- **File Handling**: Supports file uploads and downloads
- **Excel Generation**: Custom Excel generation for service logs
- **Responsive Design**: Tailwind CSS for responsive UI components

## 🎯 Future Improvements

1. **Complete API Integration**: Finish integrating remaining entities with Laravel backend
2. **Authentication**: Add JWT-based authentication system  
3. **Real-time Updates**: WebSocket integration for live updates
4. **Advanced Filtering**: Enhanced search and filter capabilities
5. **Audit Logging**: Track changes and user activities
6. **Role-based Access**: Implement user roles and permissions
