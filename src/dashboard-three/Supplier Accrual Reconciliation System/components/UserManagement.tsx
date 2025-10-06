import React, { useState, useEffect } from 'react';
import type { User, Role, UserAssignment, Supplier } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon } from './icons/Icons';

interface UserFormProps {
    user?: User;
    suppliers: Supplier[];
    onSubmit: (user: Omit<User, 'id'> | User) => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, suppliers, onSubmit, onCancel }) => {
    const [name, setName] = useState(user?.name || '');
    const [role, setRole] = useState<Role>(user?.role || 'field_supervisor');
    const [assignments, setAssignments] = useState<UserAssignment[]>(user?.assignments || []);

    useEffect(() => {
        if (role === 'coordinator') {
            setAssignments([]);
        }
    }, [role]);

    const handleAssignmentChange = (index: number, field: keyof Omit<UserAssignment, 'serviceIds'>, value: string) => {
        const newAssignments = [...assignments];
        const currentAssignment = { ...newAssignments[index], [field]: value };
        if (field === 'supplierId') {
            currentAssignment.serviceIds = [];
        }
        newAssignments[index] = currentAssignment;
        setAssignments(newAssignments);
    };

    const handleServiceToggle = (assignmentIndex: number, serviceId: string) => {
        const newAssignments = [...assignments];
        const assignment = { ...newAssignments[assignmentIndex] };
        const serviceIdIndex = assignment.serviceIds.indexOf(serviceId);
    
        if (serviceIdIndex > -1) {
            assignment.serviceIds = assignment.serviceIds.filter(id => id !== serviceId);
        } else {
            assignment.serviceIds.push(serviceId);
        }
        newAssignments[assignmentIndex] = assignment;
        setAssignments(newAssignments);
    };

    const addAssignment = () => {
        setAssignments([...assignments, { supplierId: '', location: '', serviceIds: [] }]);
    };
    
    const removeAssignment = (index: number) => {
        setAssignments(assignments.filter((_, i) => i !== index));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...user, name, role, assignments });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <select id="role" value={role} onChange={e => setRole(e.target.value as Role)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="coordinator">Coordinator</option>
                    <option value="field_supervisor">Field Supervisor</option>
                </select>
            </div>
            {role === 'field_supervisor' && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700">Assignments</h4>
                    <div className="mt-2 space-y-3 max-h-64 overflow-y-auto pr-2">
                        {assignments.map((assignment, index) => {
                             const selectedSupplier = suppliers.find(s => s.id === assignment.supplierId);
                             return (
                                <div key={index} className="flex flex-col gap-3 p-3 border rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-grow space-y-2">
                                            <select aria-label="Supplier" value={assignment.supplierId} onChange={e => handleAssignmentChange(index, 'supplierId', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
                                                <option value="">Select Supplier</option>
                                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <input aria-label="Location" type="text" value={assignment.location} onChange={e => handleAssignmentChange(index, 'location', e.target.value)} placeholder="Location Name" required className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                                        </div>
                                        <button type="button" onClick={() => removeAssignment(index)} className="text-red-500 hover:text-red-700 p-1 flex-shrink-0 mt-1 rounded-full hover:bg-red-100" title="Remove Assignment"><TrashIcon /></button>
                                    </div>
                                    {selectedSupplier && (
                                        <div className="pl-2 border-l-2 border-primary-200">
                                            <h5 className="text-xs font-semibold text-gray-600 mb-2">Services for this location:</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                                {selectedSupplier.services.map(service => (
                                                    <label key={service.id} className="flex items-center text-sm cursor-pointer">
                                                        <input type="checkbox" checked={assignment.serviceIds.includes(service.id)} onChange={() => handleServiceToggle(index, service.id)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                                        <span className="ml-2 text-gray-700">{service.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                     <button type="button" onClick={addAssignment} className="mt-3 text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1 font-semibold">
                        <PlusIcon className="h-4 w-4" /> Add Assignment
                    </button>
                </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">Cancel</button>
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">{user ? 'Update' : 'Add'} User</button>
            </div>
        </form>
    );
};

interface UserManagementProps {
    users: User[];
    suppliers: Supplier[];
    onAddUser: (user: Omit<User, 'id'>) => void;
    onUpdateUser: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, suppliers, onAddUser, onUpdateUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

    const openModalForNew = () => {
        setEditingUser(undefined);
        setIsModalOpen(true);
    };

    const openModalForEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (userData: Omit<User, 'id'> | User) => {
        if ('id' in userData) {
            onUpdateUser(userData);
        } else {
            onAddUser(userData);
        }
        setIsModalOpen(false);
    };
    
    const supplierMap = React.useMemo(() => 
        suppliers.reduce((acc, s) => {
            acc[s.id] = s.name;
            return acc;
        }, {} as Record<string, string>), [suppliers]);

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">User Management</h2>
                    <p className="mt-1 text-sm text-gray-600">Add, edit, and manage user roles and permissions.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button onClick={openModalForNew} type="button" className="inline-flex items-center gap-2 rounded-md bg-primary-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                        <PlusIcon />
                        Add User
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'coordinator' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {user.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.assignments.length > 0 
                                      ? <div className="flex flex-col gap-1">
                                          {user.assignments.map((a, i) => (
                                              <div key={i} title={`${a.serviceIds.length} services`}>
                                                <span className="font-semibold">{supplierMap[a.supplierId] || 'Unknown'}:</span> {a.location}
                                              </div>
                                          ))}
                                        </div>
                                      : 'N/A'
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openModalForEdit(user)} className="text-gray-500 hover:text-primary-700 p-1 rounded-full hover:bg-gray-100" title="Edit User" aria-label="Edit User"><PencilIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <Modal maxWidth="2xl" title={editingUser ? 'Edit User' : 'Add New User'} onClose={() => setIsModalOpen(false)}>
                    <UserForm
                        user={editingUser}
                        suppliers={suppliers}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default UserManagement;