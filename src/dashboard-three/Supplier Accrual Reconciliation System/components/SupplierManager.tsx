import React, { useState } from 'react';
import type { Supplier, Service, Toast } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, DocumentTextIcon } from './icons/Icons';

interface SupplierManagerProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  onAddService: (supplierId: string, service: Omit<Service, 'id'>) => void;
  onUpdateService: (supplierId: string, service: Service) => void;
  onDeleteService: (supplierId: string, serviceId: string) => void;
  showToast: (message: string, type: Toast['type']) => void;
}

const SupplierForm: React.FC<{ supplier?: Supplier, onSubmit: (data: any) => void, onCancel: () => void }> = ({ supplier, onSubmit, onCancel }) => {
    const [name, setName] = useState(supplier?.name || '');
    const [contactPerson, setContactPerson] = useState(supplier?.contactPerson || '');
    const [email, setEmail] = useState(supplier?.email || '');
    const [mobileNumber, setMobileNumber] = useState(supplier?.mobileNumber || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ id: supplier?.id, name, contactPerson, email, mobileNumber, services: supplier?.services || [] });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Supplier Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person</label>
                <input type="text" id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <input type="tel" id="mobileNumber" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">Cancel</button>
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">{supplier ? 'Update' : 'Add'} Supplier</button>
            </div>
        </form>
    );
};

const ServiceForm: React.FC<{ service?: Service, onSubmit: (data: any) => void, onCancel: () => void }> = ({ service, onSubmit, onCancel }) => {
    const [name, setName] = useState(service?.name || '');
    const [serviceCode, setServiceCode] = useState(service?.serviceCode || '');
    const [unitPrice, setUnitPrice] = useState(service?.unitPrice || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ id: service?.id, name, serviceCode, unitPrice: parseFloat(unitPrice as any) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">Service Name</label>
                    <input type="text" id="serviceName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="serviceCode" className="block text-sm font-medium text-gray-700">Service Code</label>
                    <input type="text" id="serviceCode" value={serviceCode} onChange={e => setServiceCode(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
            </div>
            <div>
                <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">Unit Price</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input type="number" id="unitPrice" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} required min="0" step="0.01" className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="0.00" />
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">Cancel</button>
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">{service ? 'Update' : 'Add'} Service</button>
            </div>
        </form>
    );
};

const SupplierRow: React.FC<{
    supplier: Supplier;
    onEdit: (supplier: Supplier) => void;
    onAddService: (supplierId: string, service: Omit<Service, 'id'>) => void;
    onUpdateService: (supplierId: string, service: Service) => void;
    onDeleteService: (supplierId: string, serviceId: string) => void;
}> = ({ supplier, onEdit, onAddService, onUpdateService, onDeleteService }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [editingService, setEditingService] = useState<Service | null | undefined>(null); // undefined for new, null for none
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    
    const handleAddService = (serviceData: Omit<Service, 'id'>) => {
        onAddService(supplier.id, serviceData);
        setIsServiceModalOpen(false);
    }
    
    const handleUpdateService = (serviceData: Service) => {
        onUpdateService(supplier.id, serviceData);
        setIsServiceModalOpen(false);
    }

    return (
        <>
            <tr className="border-b border-gray-200 bg-white hover:bg-gray-50/70 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contactPerson}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.mobileNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{supplier.services.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => onEdit(supplier)} className="text-gray-500 hover:text-primary-700 p-1 rounded-full hover:bg-gray-100 transition-colors" title="Edit Supplier" aria-label="Edit Supplier">
                        <PencilIcon />
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500 hover:text-primary-700 p-1 rounded-full hover:bg-primary-100 transition-all duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <ChevronDownIcon />
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50/50">
                    <td colSpan={6} className="p-4 transition-all duration-300 ease-in-out">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-md font-semibold text-gray-700">Services Price List</h4>
                            <button onClick={() => { setEditingService(undefined); setIsServiceModalOpen(true); }} className="inline-flex items-center gap-2 rounded-md bg-primary-600 py-1.5 px-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                                <PlusIcon className="h-4 w-4"/> Add Service
                            </button>
                        </div>
                        {supplier.services.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Code</th>
                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                            <th scope="col" className="relative px-4 py-2"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {supplier.services.map(service => (
                                            <tr key={service.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 font-mono">{service.serviceCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{service.name}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">${service.unitPrice.toFixed(2)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button onClick={() => { setEditingService(service); setIsServiceModalOpen(true); }} className="text-gray-500 hover:text-primary-700 p-1 rounded-full hover:bg-gray-100" title="Edit Service" aria-label="Edit Service"><PencilIcon /></button>
                                                    <button onClick={() => onDeleteService(supplier.id, service.id)} className="text-gray-500 hover:text-red-700 p-1 rounded-full hover:bg-gray-100" title="Delete Service" aria-label="Delete Service"><TrashIcon /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                             <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No services</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by adding a service for this supplier.</p>
                            </div>
                        )}
                    </td>
                </tr>
            )}
             {isServiceModalOpen && (
                <Modal title={editingService ? 'Edit Service' : 'Add New Service'} onClose={() => setIsServiceModalOpen(false)}>
                    <ServiceForm 
                        service={editingService || undefined}
                        onSubmit={editingService ? handleUpdateService : handleAddService}
                        onCancel={() => setIsServiceModalOpen(false)}
                    />
                </Modal>
            )}
        </>
    );
};


const SupplierManager: React.FC<SupplierManagerProps> = ({ suppliers, onAddSupplier, onUpdateSupplier, onAddService, onUpdateService, onDeleteService, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleFormSubmit = (supplierData: any) => {
    if (supplierData.id) {
        onUpdateSupplier(supplierData as Supplier);
    } else {
        onAddSupplier(supplierData);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Supplier Management</h2>
          <p className="mt-1 text-sm text-gray-600">Manage suppliers and their service price lists.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button onClick={handleOpenAddModal} type="button" className="inline-flex items-center gap-2 rounded-md bg-primary-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
            <PlusIcon />
            Add Supplier
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => (
                <SupplierRow 
                    key={supplier.id} 
                    supplier={supplier} 
                    onEdit={handleOpenEditModal}
                    onAddService={onAddService}
                    onUpdateService={onUpdateService}
                    onDeleteService={onDeleteService}
                />
            ))}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <Modal title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'} onClose={handleCloseModal}>
            <SupplierForm 
                supplier={editingSupplier || undefined} 
                onSubmit={handleFormSubmit} 
                onCancel={handleCloseModal} 
            />
        </Modal>
      )}
    </div>
  );
};

export default SupplierManager;