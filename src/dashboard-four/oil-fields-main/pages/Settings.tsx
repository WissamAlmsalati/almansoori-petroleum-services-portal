
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api, { allFeatures } from '../data';
import type { AppSettings, PermissionSettings, FieldLocation, Employee, User } from '../types';
import { UserRole, ContractType } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { XCircleIcon } from '../components/Icons';

const CreateUserModal: React.FC<{
    allUsers: User[],
    allEmployees: Employee[],
    onClose: () => void,
    onSave: () => void
}> = ({ allUsers, allEmployees, onClose, onSave }) => {
    
    const unassignedEmployees = useMemo(() => {
        const assignedEmployeeIds = new Set(allUsers.map(u => u.employeeProfileId));
        return allEmployees.filter(e => !assignedEmployeeIds.has(e.id) && e.status === 'Active');
    }, [allUsers, allEmployees]);

    const [formData, setFormData] = useState<{
        employeeId: string;
        role: UserRole;
        password?: string;
    }>({ employeeId: unassignedEmployees[0]?.id || '', role: UserRole.EMPLOYEE, password: '' });
    
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if(unassignedEmployees.length > 0) {
            setFormData(prev => ({...prev, employeeId: unassignedEmployees[0].id}));
        }
    }, [unassignedEmployees]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.employeeId) {
            addToast("No employee selected or available to create a user for.", "warning");
            return;
        }
        setIsSaving(true);
        try {
            await api.createUserForEmployee(formData.employeeId, formData.role, formData.password);
            addToast("User account created successfully!", "success");
            onSave();
            onClose();
        } catch(err) {
            addToast((err as Error).message || "Failed to create user account.", "error");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-brand-nav p-8 rounded-lg shadow-2xl w-full max-w-md relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XCircleIcon className="w-8 h-8"/></button>
                 <h2 className="text-2xl font-bold text-white mb-6">Create New User Account</h2>
                 {unassignedEmployees.length === 0 ? (
                     <p className="text-center text-gray-400 p-4">All active employees already have user accounts.</p>
                 ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-light mb-1">Select Employee</label>
                            <select value={formData.employeeId} onChange={e => setFormData(p => ({...p, employeeId: e.target.value}))} className="w-full bg-brand-bg border border-brand-dark text-white p-2.5 rounded-md">
                                {unassignedEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-light mb-1">Assign Role</label>
                            <select value={formData.role} onChange={e => setFormData(p => ({...p, role: e.target.value as UserRole}))} className="w-full bg-brand-bg border border-brand-dark text-white p-2.5 rounded-md">
                                {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-light mb-1">Initial Password (Optional)</label>
                            <input type="password" value={formData.password} onChange={e => setFormData(p => ({...p, password: e.target.value}))} className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md" placeholder="Default: Employee ID reversed"/>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={isSaving} className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500">
                                {isSaving ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                 )}
            </div>
        </div>
    );
};

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [permissions, setPermissions] = useState<PermissionSettings | null>(null);
    const [locations, setLocations] = useState<FieldLocation[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    
    // Form state
    const [bonusRates, setBonusRates] = useState<{[key in ContractType]?: number}>({});
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationType, setNewLocationType] = useState<'Drilling Site' | 'Production Site' | 'Service Center'>('Drilling Site');

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ onConfirm: () => void, message: string } | null>(null);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [settingsData, permsData, locsData, usersData, employeesData] = await Promise.all([
            api.getSettings(),
            api.getPermissions(),
            api.getFieldLocations(),
            api.getUsers(),
            api.getEmployees(),
        ]);
        setSettings(settingsData);
        setPermissions(permsData);
        setLocations(locsData);
        setAllUsers(usersData);
        setAllEmployees(employeesData);
        if (settingsData.bonusRates) {
            setBonusRates(settingsData.bonusRates);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePermissionChange = (role: UserRole, feature: string, isChecked: boolean) => {
        if (!permissions) return;
        
        const newPermissions = JSON.parse(JSON.stringify(permissions));
        const rolePermissions = newPermissions[role] as string[];
        
        if (isChecked && !rolePermissions.includes(feature)) {
            rolePermissions.push(feature);
        } else if (!isChecked && rolePermissions.includes(feature)) {
            newPermissions[role] = rolePermissions.filter(f => f !== feature);
        }
        
        setPermissions(newPermissions);
    };

    const handleSavePermissions = async () => {
        if (!permissions) return;
        setIsSaving(true);
        try {
            await api.updatePermissions(permissions);
            addToast('Permissions updated successfully!', 'success');
        } catch {
            addToast('Failed to update permissions.', 'error');
        } finally {
            setIsSaving(false);
            setIsConfirmModalOpen(false);
        }
    };
    
    const handleSaveBonuses = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            await api.updateSettings({ ...settings, bonusRates });
            addToast('Bonus rates updated successfully!', 'success');
        } catch {
            addToast('Failed to update bonus rates.', 'error');
        } finally {
            setIsSaving(false);
            setIsConfirmModalOpen(false);
        }
    };

    const handleAddLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLocationName.trim()) return;
        setIsSaving(true);
        try {
            await api.addLocation({ name: newLocationName, type: newLocationType });
            addToast('New location added successfully!', 'success');
            setNewLocationName('');
            await fetchData(); // Refetch to show new location
        } catch {
            addToast('Failed to add new location.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const openConfirmModal = (action: 'permissions' | 'bonuses') => {
        if (action === 'permissions') {
            setConfirmAction({
                onConfirm: handleSavePermissions,
                message: "Are you sure you want to save these permission changes? This may affect all users of this role immediately."
            });
        } else {
            setConfirmAction({
                onConfirm: handleSaveBonuses,
                message: "Are you sure you want to save the new bonus rates? This will affect future timesheet calculations."
            });
        }
        setIsConfirmModalOpen(true);
    };

    const employeeMap = useMemo(() => new Map(allEmployees.map(e => [e.id, e])), [allEmployees]);


    if (isLoading) {
        return <Spinner text="Loading settings..." />;
    }

    return (
        <div className="space-y-8">
            {isCreateUserModalOpen && <CreateUserModal allUsers={allUsers} allEmployees={allEmployees} onClose={() => setIsCreateUserModalOpen(false)} onSave={fetchData} />}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={() => confirmAction?.onConfirm()}
                title="Confirm Save"
                message={confirmAction?.message || ""}
                confirmText="Yes, Save"
            />
            {/* Role Permissions */}
            <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Role Permissions</h2>
                     <button onClick={() => openConfirmModal('permissions')} disabled={isSaving} className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">
                        {isSaving ? 'Saving...' : 'Save Permissions'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-left text-gray-400">
                            <tr>
                                <th className="p-3">Feature</th>
                                {Object.values(UserRole).map(role => <th key={role} className="p-3 text-center">{role}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {allFeatures.map(feature => (
                                <tr key={feature} className="border-b border-brand-dark/50">
                                    <td className="p-3 font-medium capitalize">{feature.replace(/-/g, ' ')}</td>
                                    {Object.values(UserRole).map(role => (
                                        <td key={`${feature}-${role}`} className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded bg-brand-dark border-brand-dark text-brand-primary focus:ring-brand-primary"
                                                checked={permissions?.[role]?.includes(feature) ?? false}
                                                onChange={(e) => handlePermissionChange(role, feature, e.target.checked)}
                                                disabled={role === UserRole.ADMIN}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bonus System & Location Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Bonus System</h2>
                        <button onClick={() => openConfirmModal('bonuses')} disabled={isSaving} className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">
                            {isSaving ? 'Saving...' : 'Save Bonuses'}
                        </button>
                    </div>
                    <div className="space-y-4">
                        {Object.values(ContractType).map(type => (
                            <div key={type}>
                                <label htmlFor={`bonus-${type}`} className="block text-sm font-medium text-brand-light mb-1">{type} Contract Bonus ($/day)</label>
                                <input
                                    type="number"
                                    id={`bonus-${type}`}
                                    step="0.01"
                                    value={bonusRates[type] || ''}
                                    onChange={e => setBonusRates(prev => ({ ...prev, [type]: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Location Management</h2>
                    <form onSubmit={handleAddLocation} className="space-y-4 mb-6">
                        <div>
                            <label htmlFor="locName" className="block text-sm font-medium text-brand-light mb-1">New Location Name</label>
                            <input
                                id="locName"
                                type="text"
                                value={newLocationName}
                                onChange={e => setNewLocationName(e.target.value)}
                                className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                placeholder="e.g., West Rig 7"
                            />
                        </div>
                        <div>
                             <label htmlFor="locType" className="block text-sm font-medium text-brand-light mb-1">Location Type</label>
                            <select id="locType" value={newLocationType} onChange={e => setNewLocationType(e.target.value as any)} className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none">
                                <option>Drilling Site</option>
                                <option>Production Site</option>
                                <option>Service Center</option>
                            </select>
                        </div>
                        <button type="submit" disabled={isSaving || !newLocationName.trim()} className="w-full bg-brand-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">
                            {isSaving ? 'Adding...' : 'Add New Location'}
                        </button>
                    </form>
                    <h3 className="text-lg font-semibold text-white mb-2">Current Locations ({locations.length})</h3>
                    <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {locations.map(loc => <li key={loc.id} className="bg-brand-dark/50 p-2 rounded-md text-brand-light">{loc.name}</li>)}
                    </ul>
                </div>
            </div>

            {/* User Account Management */}
            <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">User Accounts</h2>
                     <button onClick={() => setIsCreateUserModalOpen(true)} className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Create New User
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-left text-gray-400">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Employee ID</th>
                                <th className="p-3">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map(user => (
                                <tr key={user.id} className="border-b border-brand-dark/50">
                                    <td className="p-3 font-medium">{user.name}</td>
                                    <td className="p-3 text-brand-light">{employeeMap.get(user.employeeProfileId)?.employeeId || 'N/A'}</td>
                                    <td className="p-3 text-brand-light">{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Settings;
