import React, { useState, useCallback, useMemo } from 'react';
import type { View, Supplier, Service, FieldEntry, Invoice, User, Toast } from './types';
import { initialSuppliers, initialFieldEntries, initialUsers } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SupplierManager from './components/SupplierManager';
import FieldEntrySheet from './components/FieldEntrySheet';
import Reconciliation from './components/Reconciliation';
import AccrualReport from './components/AccrualReport';
import UserManagement from './components/UserManagement';
import ToastContainer from './components/Toast';

const App: React.FC = () => {
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
    <div className="min-h-screen bg-gray-100">
      <ToastContainer toasts={toasts} setToasts={setToasts} />
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser}
        users={users}
        onSetCurrentUser={handleSetCurrentUser}
      />
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;