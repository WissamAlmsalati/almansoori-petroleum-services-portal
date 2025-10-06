import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { View, Supplier, Service, FieldEntry, Invoice, User, Toast } from '../dashboard-three/Supplier Accrual Reconciliation System/types';
import { initialSuppliers, initialFieldEntries, initialUsers } from '../dashboard-three/Supplier Accrual Reconciliation System/constants';
import { useLocalStorage } from '../dashboard-three/Supplier Accrual Reconciliation System/hooks/useLocalStorage';
import Dashboard from '../dashboard-three/Supplier Accrual Reconciliation System/components/Dashboard';
import SupplierManager from '../dashboard-three/Supplier Accrual Reconciliation System/components/SupplierManager';
import FieldEntrySheet from '../dashboard-three/Supplier Accrual Reconciliation System/components/FieldEntrySheet';
import Reconciliation from '../dashboard-three/Supplier Accrual Reconciliation System/components/Reconciliation';
import AccrualReport from '../dashboard-three/Supplier Accrual Reconciliation System/components/AccrualReport';
import UserManagement from '../dashboard-three/Supplier Accrual Reconciliation System/components/UserManagement';
import ToastContainer from '../dashboard-three/Supplier Accrual Reconciliation System/components/Toast';

// Custom Sidebar Component for Dashboard Three
interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  currentUser: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, currentUser, onLogout }) => {
  const menuItems = [
    { name: 'dashboard' as View, label: 'Dashboard', icon: '📊' },
    { name: 'entries' as View, label: 'Field Entries', icon: '📝' },
    ...(currentUser.role === 'coordinator' ? [
      { name: 'suppliers' as View, label: 'Suppliers', icon: '🏢' },
      { name: 'reconciliation' as View, label: 'Reconciliation', icon: '⚖️' },
      { name: 'reports' as View, label: 'Reports', icon: '📈' },
      { name: 'users' as View, label: 'Users', icon: '👥' },
    ] : [])
  ];

  return (
    <aside className="w-64 bg-white text-brand-navy-900 flex flex-col border-r border-slate-200 fixed h-full">
      <div className="h-16 flex items-center justify-center border-b border-slate-200">
        <h1 className="text-xl font-bold text-brand-blue-600">Almansoori</h1>
      </div>
      <nav className="flex-1 px-4 py-4">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Supplier Accrual</p>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-1">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView(item.name);
                }}
                className={`flex items-center p-2 rounded-md transition-colors duration-200 ${
                  activeView === item.name
                    ? 'bg-brand-blue-50 text-brand-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 py-4 border-t border-slate-200">
         <button
            onClick={onLogout}
            className="w-full flex items-center p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-200"
          >
            <span className="mr-3 text-lg">🚪</span>
            Logout
          </button>
      </div>
    </aside>
  );
};

// Custom Header Component for Dashboard Three
interface HeaderProps {
  activeView: View;
  currentUser: User;
  users: User[];
  onSetCurrentUser: (user: User) => void;
  authUser: any;
}

const Header: React.FC<HeaderProps> = ({ activeView, currentUser, users, onSetCurrentUser, authUser }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const viewDescriptions: Record<View, string> = {
    'dashboard': 'Overview of supplier accrual operations',
    'suppliers': 'Manage suppliers and their services',
    'entries': 'Record and manage field entries',
    'reconciliation': 'Reconcile accruals with invoices',
    'reports': 'Generate accrual reports',
    'users': 'Manage system users and permissions',
  };

  const getViewTitle = (view: View): string => {
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'suppliers': return 'Suppliers';
      case 'entries': return 'Field Entries';
      case 'reconciliation': return 'Reconciliation';
      case 'reports': return 'Reports';
      case 'users': return 'Users';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="bg-white h-16 flex items-center justify-between px-8 border-b border-slate-200 flex-shrink-0">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{getViewTitle(activeView)}</h2>
        <p className="text-sm text-slate-500">{viewDescriptions[activeView] || 'Welcome to the supplier accrual system'}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-slate-500">Role:</span>
          <select 
            value={currentUser.id} 
            onChange={(e) => {
              const selectedUser = users.find(u => u.id === e.target.value);
              if (selectedUser) onSetCurrentUser(selectedUser);
            }}
            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role === 'coordinator' ? 'Coordinator' : 'Field Supervisor'})
              </option>
            ))}
          </select>
        </div>
        
        {/* User Menu */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <img 
              className="h-10 w-10 rounded-full" 
              src={`https://picsum.photos/seed/${authUser?.name || 'admin'}/40/40`} 
              alt={authUser?.name || 'User'} 
            />
            <div>
              <p className="font-semibold text-slate-700 text-sm">{authUser?.name || 'User'}</p>
              <p className="text-xs text-slate-500">{currentUser.role === 'coordinator' ? 'Coordinator' : 'Field Supervisor'}</p>
            </div>
            <button 
              className="text-slate-500 hover:text-slate-700"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-200">
              <div className="px-4 py-2 text-sm text-slate-700 border-b border-slate-100">
                <p className="font-medium">{authUser?.name}</p>
                <p className="text-slate-500">{authUser?.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

const DashboardThree: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', initialSuppliers);
  const [fieldEntries, setFieldEntries] = useLocalStorage<FieldEntry[]>('fieldEntries', initialFieldEntries);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);
  
  const [currentUser, setCurrentUser] = useState<User>(users[0] || initialUsers[0]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const newToast: Toast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  }, []);
  
  const handleSetCurrentUser = useCallback((user: User) => {
    setCurrentUser(user);
    if (user.role === 'field_supervisor' && (activeView === 'suppliers' || activeView === 'reconciliation' || activeView === 'reports' || activeView === 'users')) {
      setActiveView('dashboard');
    }
  }, [activeView]);

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, { ...user, id: `usr_${Date.now()}` }]);
    showToast('User added successfully.');
  }, [setUsers, showToast]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
    showToast('User updated successfully.');
  }, [setUsers, currentUser.id, showToast]);

  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...supplier, id: `sup_${Date.now()}` }]);
    showToast('Supplier added successfully.');
  }, [setSuppliers, showToast]);

  const updateSupplier = useCallback((updatedSupplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    showToast('Supplier updated successfully.');
  }, [setSuppliers, showToast]);

  const addService = useCallback((supplierId: string, service: Omit<Service, 'id'>) => {
    const newService = { ...service, id: `srv_${Date.now()}` };
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, services: [...s.services, newService] } : s));
    showToast('Service added successfully.');
  }, [setSuppliers, showToast]);

  const updateService = useCallback((supplierId: string, updatedService: Service) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return { ...s, services: s.services.map(srv => srv.id === updatedService.id ? updatedService : srv) };
      }
      return s;
    }));
    showToast('Service updated successfully.');
  }, [setSuppliers, showToast]);

  const deleteService = useCallback((supplierId: string, serviceId: string) => {
    setSuppliers(prev => prev.map(s => {
        if (s.id === supplierId) {
            return { ...s, services: s.services.filter(srv => srv.id !== serviceId) };
        }
        return s;
    }));
    showToast('Service deleted.', 'info');
  }, [setSuppliers, showToast]);

  const addFieldEntry = useCallback((entry: Omit<FieldEntry, 'id'>) => {
    setFieldEntries(prev => [...prev, { ...entry, id: `fe_${Date.now()}` }]);
    showToast('Field entry added successfully.');
  }, [setFieldEntries, showToast]);
  
  const updateFieldEntry = useCallback((updatedEntry: FieldEntry) => {
    setFieldEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    showToast('Field entry updated successfully.');
  }, [setFieldEntries, showToast]);
  
  const deleteFieldEntry = useCallback((entryId: string) => {
    setFieldEntries(prev => prev.filter(e => e.id !== entryId));
    showToast('Field entry deleted.', 'info');
  }, [setFieldEntries, showToast]);

  const addOrUpdateInvoice = useCallback((invoice: Invoice) => {
    setInvoices(prev => {
      const existingIndex = prev.findIndex(inv => inv.id === invoice.id);
      if (existingIndex > -1) {
        const newInvoices = [...prev];
        newInvoices[existingIndex] = invoice;
        return newInvoices;
      }
      return [...prev, invoice];
    });
    showToast('Invoice data saved successfully.');
  }, [setInvoices, showToast]);

  const supplierNameMap = useMemo(() => {
    return suppliers.reduce((acc, supplier) => {
      acc[supplier.id] = supplier.name;
      return acc;
    }, {} as Record<string, string>);
  }, [suppliers]);

  const serviceNameMap = useMemo(() => {
    return suppliers.flatMap(s => s.services).reduce((acc, service) => {
        acc[service.id] = service.name;
        return acc;
    }, {} as Record<string, string>);
  }, [suppliers]);
  
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard 
                  supplierCount={suppliers.length} 
                  entryCount={fieldEntries.length} 
                  invoiceCount={invoices.length}
                  setActiveView={setActiveView} 
                  currentUser={currentUser}
                />;
      case 'suppliers':
        return currentUser.role === 'coordinator' ? <SupplierManager 
                  suppliers={suppliers} 
                  onAddSupplier={addSupplier}
                  onUpdateSupplier={updateSupplier}
                  onAddService={addService}
                  onUpdateService={updateService}
                  onDeleteService={deleteService}
                  showToast={showToast}
                /> : null;
      case 'entries':
        return <FieldEntrySheet 
                  suppliers={suppliers}
                  fieldEntries={fieldEntries}
                  onAddEntry={addFieldEntry}
                  onUpdateEntry={updateFieldEntry}
                  onDeleteEntry={deleteFieldEntry}
                  supplierNameMap={supplierNameMap}
                  serviceNameMap={serviceNameMap}
                  currentUser={currentUser}
                />;
      case 'reports':
        return currentUser.role === 'coordinator' ? <AccrualReport
                  suppliers={suppliers}
                  fieldEntries={fieldEntries}
                /> : null;
      case 'reconciliation':
        return currentUser.role === 'coordinator' ? <Reconciliation 
                  suppliers={suppliers}
                  fieldEntries={fieldEntries}
                  invoices={invoices}
                  onSaveInvoice={addOrUpdateInvoice}
                /> : null;
      case 'users':
        return currentUser.role === 'coordinator' ? <UserManagement
                  users={users}
                  suppliers={suppliers}
                  onAddUser={addUser}
                  onUpdateUser={updateUser}
                /> : null;
      default:
        return <Dashboard 
                  supplierCount={suppliers.length} 
                  entryCount={fieldEntries.length} 
                  invoiceCount={invoices.length}
                  setActiveView={setActiveView}
                  currentUser={currentUser}
                />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <ToastContainer toasts={toasts} setToasts={setToasts} />
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col ml-64">
        <Header 
          activeView={activeView} 
          currentUser={currentUser}
          users={users}
          onSetCurrentUser={handleSetCurrentUser}
          authUser={authUser}
        />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default DashboardThree;
