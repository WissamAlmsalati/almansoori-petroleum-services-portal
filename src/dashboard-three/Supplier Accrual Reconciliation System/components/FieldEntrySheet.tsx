import React, { useState, useMemo, useEffect } from 'react';
import type { Supplier, FieldEntry, User } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from './icons/Icons';

interface FieldEntrySheetProps {
  suppliers: Supplier[];
  fieldEntries: FieldEntry[];
  onAddEntry: (entry: Omit<FieldEntry, 'id'>) => void;
  onUpdateEntry: (entry: FieldEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  supplierNameMap: Record<string, string>;
  serviceNameMap: Record<string, string>;
  currentUser: User;
}

const FieldEntrySheet: React.FC<FieldEntrySheetProps> = ({ suppliers, fieldEntries, onAddEntry, onUpdateEntry, onDeleteEntry, supplierNameMap, serviceNameMap, currentUser }) => {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editedEntry, setEditedEntry] = useState<Partial<FieldEntry>>({});
  const isSupervisor = currentUser.role === 'field_supervisor';
  const formInputClass = "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm";


  const assignedSuppliers = useMemo(() => {
    if (!isSupervisor) return suppliers;
    const assignedSupplierIds = [...new Set(currentUser.assignments.map(a => a.supplierId))];
    return suppliers.filter(s => assignedSupplierIds.includes(s.id));
  }, [suppliers, currentUser, isSupervisor]);

  const [supplierId, setSupplierId] = useState(assignedSuppliers[0]?.id || '');
  const [location, setLocation] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const availableLocationsForSupplier = useMemo(() => {
    if (!isSupervisor || !supplierId) return [];
    return [...new Set(currentUser.assignments.filter(a => a.supplierId === supplierId).map(a => a.location))];
  }, [currentUser, isSupervisor, supplierId]);
  
  const getAvailableServices = (supId: string, loc: string) => {
    const selectedSupplier = suppliers.find(s => s.id === supId);
    if (!selectedSupplier || !supId || !loc) return [];
    if (!isSupervisor) return selectedSupplier.services;
    
    const assignment = currentUser.assignments.find(a => a.supplierId === supId && a.location === loc);
    if (!assignment) return [];
    return selectedSupplier.services.filter(service => assignment.serviceIds.includes(service.id));
  };
  
  const locationsForEditedSupplier = useMemo(() => {
    if (!isSupervisor || !editedEntry?.supplierId) return [];
    return [...new Set(currentUser.assignments.filter(a => a.supplierId === editedEntry.supplierId).map(a => a.location))];
  }, [isSupervisor, editedEntry.supplierId, currentUser.assignments]);

  const formAvailableServices = useMemo(() => getAvailableServices(supplierId, location), [supplierId, location, suppliers, currentUser.assignments, isSupervisor]);
  
  useEffect(() => {
    if (isSupervisor) {
      const firstAssignedSupplier = assignedSuppliers[0]?.id || '';
      setSupplierId(firstAssignedSupplier);
      const firstLocation = currentUser.assignments.find(a => a.supplierId === firstAssignedSupplier)?.location || '';
      setLocation(firstLocation);
    }
  }, [currentUser.id, isSupervisor, assignedSuppliers]);
  
  useEffect(() => {
    if (serviceId && !formAvailableServices.find(s => s.id === serviceId)) {
      setServiceId('');
    }
  }, [formAvailableServices, serviceId]);
  
  const handleStartEdit = (entry: FieldEntry) => {
    setEditingEntryId(entry.id);
    setEditedEntry({ ...entry });
  };
  
  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditedEntry({});
  };
  
  const handleSaveEdit = () => {
    if (editingEntryId && editedEntry) {
      onUpdateEntry(editedEntry as FieldEntry);
      handleCancelEdit();
    }
  };
  
  const handleDelete = (entryId: string) => {
    if(window.confirm('Are you sure you want to delete this entry?')) {
        onDeleteEntry(entryId);
    }
  };

  const handleEditChange = (field: keyof FieldEntry, value: any) => {
    setEditedEntry(prev => {
        const newState = { ...prev, [field]: value } as FieldEntry;

        if (isSupervisor) {
            if (field === 'supplierId') {
                const newLocations = [...new Set(currentUser.assignments.filter(a => a.supplierId === value).map(a => a.location))];
                newState.location = newLocations[0] || '';
                newState.serviceId = ''; 
            } else if (field === 'location') {
                const validServices = getAvailableServices(newState.supplierId, value);
                if (!validServices.find(s => s.id === newState.serviceId)) {
                    newState.serviceId = '';
                }
            }
        }
        
        return newState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !serviceId || !date || !location) {
        alert("Please fill all fields");
        return;
    }
    onAddEntry({ supplierId, serviceId, quantity, date, location });
    setServiceId('');
    setQuantity(1);
    if (!isSupervisor) setLocation('');
  };

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Daily Field Entry</h2>
        <p className="mt-1 text-sm text-gray-600">Log services provided by suppliers on a daily basis.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">New Entry Form</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier</label>
            <select id="supplier" value={supplierId} onChange={e => { setSupplierId(e.target.value); setServiceId(''); if(isSupervisor) { setLocation(currentUser.assignments.find(a => a.supplierId === e.target.value)?.location || '') } }} required className={`mt-1 ${formInputClass}`}>
              <option value="">Select a supplier</option>
              {assignedSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Field / Location</label>
            {isSupervisor ? (
                <select id="location" value={location} onChange={e => { setLocation(e.target.value); setServiceId(''); }} required className={`mt-1 ${formInputClass}`} disabled={!supplierId}>
                  <option value="">Select a location</option>
                  {availableLocationsForSupplier.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
            ) : ( <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required className={`mt-1 ${formInputClass}`} /> )}
          </div>
          <div className="sm:col-span-6">
            <label htmlFor="service" className="block text-sm font-medium text-gray-700">Service</label>
            <select id="service" value={serviceId} onChange={e => setServiceId(e.target.value)} required disabled={!supplierId || (isSupervisor && !location)} className={`mt-1 ${formInputClass} disabled:bg-gray-100`}>
              <option value="">Select a service</option>
              {formAvailableServices.map(s => <option key={s.id} value={s.id}>{s.name} ({s.serviceCode})</option>)}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="0.01" step="0.01" required className={`mt-1 ${formInputClass}`} />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className={`mt-1 ${formInputClass}`} />
          </div>
          <div className="sm:col-span-6 flex justify-end">
             <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-primary-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                <PlusIcon /> Add Entry
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Entries</h3>
         <div className="mt-4 overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...fieldEntries].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 10).map(entry => (
                  editingEntryId === entry.id ? (
                    <tr key={entry.id} className="bg-primary-50/70">
                        <td className="px-3 py-2 align-middle"><input type="date" value={editedEntry.date || ''} onChange={e => handleEditChange('date', e.target.value)} className={formInputClass}/></td>
                        <td className="px-3 py-2 align-middle">
                            <select value={editedEntry.supplierId || ''} onChange={e => handleEditChange('supplierId', e.target.value)} className={formInputClass}>
                                {(isSupervisor ? assignedSuppliers : suppliers).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </td>
                        <td className="px-3 py-2 align-middle">
                            <select value={editedEntry.serviceId || ''} onChange={e => handleEditChange('serviceId', e.target.value)} className={formInputClass} disabled={!editedEntry.supplierId || !editedEntry.location}>
                                <option value="">Select a service</option>
                                {getAvailableServices(editedEntry.supplierId!, editedEntry.location!).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </td>
                        <td className="px-3 py-2 align-middle"><input type="number" value={editedEntry.quantity || 0} onChange={e => handleEditChange('quantity', Number(e.target.value))} className={`${formInputClass} text-right`} step="0.01"/></td>
                        <td className="px-3 py-2 align-middle">
                            {isSupervisor ? (
                                <select value={editedEntry.location || ''} onChange={e => handleEditChange('location', e.target.value)} className={formInputClass} disabled={!editedEntry.supplierId}>
                                    <option value="">Select location</option>
                                    {locationsForEditedSupplier.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            ) : (
                                <input type="text" value={editedEntry.location || ''} onChange={e => handleEditChange('location', e.target.value)} className={formInputClass}/>
                            )}
                        </td>
                        <td className="px-3 py-2 align-middle whitespace-nowrap text-right text-sm font-medium space-x-2">
                           <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100" title="Save Changes" aria-label="Save Changes"><CheckIcon /></button>
                           <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100" title="Cancel Edit" aria-label="Cancel Edit"><XMarkIcon /></button>
                        </td>
                    </tr>
                  ) : (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplierNameMap[entry.supplierId] || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{serviceNameMap[entry.serviceId] || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{entry.quantity.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button onClick={() => handleStartEdit(entry)} className="text-gray-500 hover:text-primary-700 p-1 rounded-full hover:bg-gray-100" title="Edit Entry" aria-label="Edit Entry"><PencilIcon /></button>
                        <button onClick={() => handleDelete(entry.id)} className="text-gray-500 hover:text-red-700 p-1 rounded-full hover:bg-gray-100" title="Delete Entry" aria-label="Delete Entry"><TrashIcon /></button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center">Showing the 10 most recent entries.</p>
      </div>
    </div>
  );
};

export default FieldEntrySheet;