
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../data';
import { getCourseStatus, exportToCsv } from '../utils';
import type { Employee, Course, Document, ChecklistItem } from '../types';
import { CourseStatus, ContractType, MaritalStatus, BloodType, UserRole } from '../types';
import { useAuth } from '../../../components/DashboardFour';
import { DownloadIcon, XCircleIcon, DocumentIcon } from '../components/Icons';
import { ConfirmModal } from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';

const StatusBadge: React.FC<{ status: CourseStatus }> = ({ status }) => {
    const styles = {
        [CourseStatus.VALID]: 'bg-green-500/20 text-green-300',
        [CourseStatus.EXPIRING_SOON]: 'bg-yellow-500/20 text-yellow-300',
        [CourseStatus.EXPIRED]: 'bg-red-500/20 text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
}

const EmployeeProfile: React.FC<{ initialEmployee: Employee, onUpdate: () => void }> = ({ initialEmployee, onUpdate }) => {
    const [employee, setEmployee] = useState(initialEmployee);
    const [editableEmployee, setEditableEmployee] = useState<Employee>(initialEmployee);
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: '', type: 'pdf' as 'pdf'|'jpg'|'png' });
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ onConfirm: () => void, message: string, title: string, confirmText: string } | null>(null);
    
    const canEdit = user?.role === UserRole.ADMIN || user?.role === UserRole.COORDINATOR;

    useEffect(() => {
        setEmployee(initialEmployee);
        setEditableEmployee(initialEmployee);
    }, [initialEmployee]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Employee, subField?: keyof Employee['address'] | keyof Employee['emergencyContact']) => {
        const { value } = e.target;
        setEditableEmployee(prev => {
            if (subField && (field === 'address' || field === 'emergencyContact')) {
                return { ...prev, [field]: { ...prev[field], [subField]: value } };
            }
            return { ...prev, [field]: value };
        });
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedEmployee = await api.updateEmployeeProfile(employee.id, editableEmployee);
            setEmployee(updatedEmployee);
            setIsEditMode(false);
            onUpdate(); // Notify parent to refetch all employees
            addToast('Profile saved successfully!', 'success');
        } catch (error) {
            console.error("Failed to save profile:", error);
            addToast('Error saving profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleCancel = () => {
        setEditableEmployee(employee);
        setIsEditMode(false);
    };

    const handleAddDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDoc.name.trim()) return;
        setIsSaving(true);
        try {
            await api.addDocumentToEmployee(employee.id, newDoc);
            const updatedEmployee = await api.getEmployeeById(employee.id);
            if (updatedEmployee) {
                setEmployee(updatedEmployee);
                setEditableEmployee(updatedEmployee);
            }
            setNewDoc({ name: '', type: 'pdf' });
            addToast('Document added!', 'success');
        } catch (error) {
            addToast('Failed to add document.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAddChecklistItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChecklistItem.trim()) return;
        setIsSaving(true);
        try {
            const updated = await api.addChecklistItem(employee.id, newChecklistItem);
            setEmployee(updated);
            setEditableEmployee(updated);
            setNewChecklistItem('');
            addToast('Checklist item added.', 'success');
        } catch (error) {
            addToast('Failed to add checklist item.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleToggleChecklistItem = async (item: ChecklistItem) => {
        try {
            const updated = await api.updateChecklistItem(employee.id, item.id, !item.completed);
            setEmployee(updated);
            setEditableEmployee(updated);
        } catch (error) {
            addToast('Failed to update item.', 'error');
        }
    };

    const handleStatusChange = (status: 'Active' | 'Inactive') => {
        setConfirmAction({
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    const updatedEmployee = await api.updateEmployeeStatus(employee.id, status);
                    setEmployee(updatedEmployee);
                    setEditableEmployee(updatedEmployee);
                    onUpdate(); // Notify parent
                    addToast('Employee status updated.', 'success');
                } catch (error) {
                    addToast(`Failed to update status.`, 'error');
                } finally {
                    setIsSaving(false);
                    setIsConfirmModalOpen(false);
                }
            },
            title: `${status === 'Active' ? 'Activate' : 'Pause'} Employee`,
            message: `Are you sure you want to set ${employee.name}'s status to ${status}?`,
            confirmText: `Yes, ${status === 'Active' ? 'Activate' : 'Pause'}`,
        });
        setIsConfirmModalOpen(true);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'checklist':
                return (
                    <div className="space-y-4">
                        {canEdit && (
                            <form onSubmit={handleAddChecklistItem} className="bg-brand-bg/60 p-4 rounded-lg flex items-end gap-4">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-brand-light mb-1">New Checklist Item</label>
                                    <input type="text" value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)} className="w-full bg-brand-dark border border-brand-dark/50 text-white p-2 rounded-md" placeholder="e.g., Return company laptop"/>
                                </div>
                                <button type="submit" disabled={isSaving || !newChecklistItem.trim()} className="bg-brand-primary h-[42px] hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
                                    {isSaving ? 'Adding...' : 'Add Item'}
                                </button>
                            </form>
                        )}
                        <div className="space-y-3">
                            {employee.checklist.length > 0 ? employee.checklist.map(item => (
                                <div key={item.id} className="bg-brand-bg/60 p-3 rounded-md flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={() => handleToggleChecklistItem(item)}
                                        disabled={!canEdit}
                                        className="h-5 w-5 rounded bg-brand-dark border-brand-dark text-brand-primary focus:ring-brand-primary mr-4"
                                    />
                                    <span className={`${item.completed ? 'line-through text-gray-500' : 'text-brand-text'}`}>{item.text}</span>
                                </div>
                            )) : <p className="text-gray-400 text-center p-4">No checklist items for this employee.</p>}
                        </div>
                    </div>
                );
            case 'documents':
                return (
                    <div className="space-y-4">
                        {canEdit && (
                            <form onSubmit={handleAddDocument} className="bg-brand-bg/60 p-4 rounded-lg flex items-end gap-4">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-brand-light mb-1">Document Name</label>
                                    <input type="text" value={newDoc.name} onChange={e => setNewDoc(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-brand-dark border border-brand-dark/50 text-white p-2 rounded-md" placeholder="e.g., Passport.pdf"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-light mb-1">Type</label>
                                    <select value={newDoc.type} onChange={e => setNewDoc(prev => ({ ...prev, type: e.target.value as any }))} className="w-full bg-brand-dark border border-brand-dark/50 text-white p-2 rounded-md h-[42px]">
                                        <option value="pdf">PDF</option>
                                        <option value="jpg">JPG</option>
                                        <option value="png">PNG</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={isSaving || !newDoc.name.trim()} className="bg-brand-primary h-[42px] hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
                                    {isSaving ? 'Adding...' : 'Add Document'}
                                </button>
                            </form>
                        )}
                        <div className="space-y-3">
                            {employee.documents.length > 0 ? employee.documents.map(doc => (
                                <div key={doc.id} className="bg-brand-bg/60 p-3 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-brand-text">{doc.name}</p>
                                        <p className="text-xs text-gray-400">Uploaded on {doc.uploadDate}</p>
                                    </div>
                                    <span className="text-xs font-mono uppercase bg-gray-600 px-2 py-1 rounded">{doc.type}</span>
                                </div>
                            )) : <p className="text-gray-400 text-center p-4">No documents uploaded.</p>}
                        </div>
                    </div>
                );
            case 'training':
                 return (
                     <div className="overflow-x-auto">
                        {employee.courses.length > 0 ? (
                            <table className="min-w-full">
                                <thead className="text-left text-sm text-gray-400">
                                    <tr>
                                        <th className="p-3">Course Name</th>
                                        <th className="p-3">Expiry Date</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Document</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employee.courses.map(course => {
                                        const { status } = getCourseStatus(course.expiryDate);
                                        return (
                                            <tr key={course.id} className="border-b border-brand-dark/50">
                                                <td className="p-3 font-medium">{course.name}</td>
                                                <td className="p-3">{course.expiryDate}</td>
                                                <td className="p-3"><StatusBadge status={status} /></td>
                                                <td className="p-3">
                                                    {course.documentName ? (
                                                        <div className="flex items-center text-brand-light">
                                                            <DocumentIcon className="w-5 h-5 mr-2 text-gray-400" />
                                                            <span>{course.documentName}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : <p className="text-gray-400 text-center p-4">No training records found.</p>}
                    </div>
                );
            default:
                const InfoField = ({ label, value, name, onChange, isEditing = false, type = 'text', options }: any) => (
                    <div>
                        <strong className="text-gray-400 block">{label}:</strong>
                        {isEditing ? (
                            type === 'select' ? (
                                <select name={name} value={value} onChange={onChange} className="w-full bg-brand-dark border border-brand-dark/50 text-white p-2 rounded-md">
                                    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <input type={type} name={name} value={value} onChange={onChange} className="w-full bg-brand-dark border border-brand-dark/50 text-white p-2 rounded-md" />
                            )
                        ) : (
                            <span>{value}</span>
                        )}
                    </div>
                );

                return (
                    <div className="space-y-6">
                        {/* Admin Actions */}
                        {canEdit && (
                             <div className="bg-brand-bg/60 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-brand-primary mb-3">Admin Actions</h4>
                                {employee.status === 'Active' ? (
                                    <button onClick={() => handleStatusChange('Inactive')} disabled={isSaving} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg">Pause Employee</button>
                                ) : (
                                    <button onClick={() => handleStatusChange('Active')} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Activate Employee</button>
                                )}
                            </div>
                        )}

                        {/* Personal Details */}
                        <div className="bg-brand-bg/60 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-brand-primary mb-3">Personal Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-brand-light">
                                <InfoField label="Name (English)" value={editableEmployee.name} name="name" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'name')} />
                                <InfoField label="الاسم (عربي)" value={editableEmployee.nameAr} name="nameAr" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'nameAr')} />
                                <InfoField label="Marital Status" value={editableEmployee.maritalStatus} name="maritalStatus" isEditing={isEditMode} type="select" options={Object.values(MaritalStatus)} onChange={(e: any) => handleInputChange(e, 'maritalStatus')} />
                                <InfoField label="Family Members" value={editableEmployee.numberOfFamilyMembers} name="numberOfFamilyMembers" type="number" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'numberOfFamilyMembers')} />
                                <InfoField label="Blood Type" value={editableEmployee.bloodType} name="bloodType" isEditing={isEditMode} type="select" options={Object.values(BloodType)} onChange={(e: any) => handleInputChange(e, 'bloodType')} />
                                <div><strong className="text-gray-400 block">Hire Date:</strong> {employee.hireDate}</div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-brand-bg/60 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-brand-primary mb-3">Contact Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-brand-light">
                                <InfoField label="Phone Number" value={editableEmployee.phone} name="phone" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'phone')} />
                                <InfoField label="WhatsApp Number" value={editableEmployee.whatsappNumber} name="whatsappNumber" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'whatsappNumber')} />
                                <div className="md:col-span-2"><InfoField label="Email" value={editableEmployee.email} name="email" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'email')} /></div>
                                <InfoField label="City" value={editableEmployee.address.city} name="city" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'address', 'city')} />
                                <InfoField label="Area" value={editableEmployee.address.area} name="area" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'address', 'area')} />
                                <InfoField label="Nearest Knowing Place" value={editableEmployee.address.nearestKnowingPlace} name="nearestKnowingPlace" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'address', 'nearestKnowingPlace')} />
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="bg-brand-bg/60 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-brand-primary mb-3">Employment Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-brand-light">
                                <InfoField label="Designation" value={editableEmployee.jobTitle} name="jobTitle" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'jobTitle')} />
                                <div><strong className="text-gray-400 block">Employee ID:</strong> {employee.employeeId}</div>
                                <InfoField label="Contract Type" value={editableEmployee.contractType} name="contractType" isEditing={isEditMode} type="select" options={Object.values(ContractType)} onChange={(e: any) => handleInputChange(e, 'contractType')} />
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-brand-bg/60 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-brand-primary mb-3">Emergency Contact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-brand-light">
                                <InfoField label="Name" value={editableEmployee.emergencyContact.name} name="name" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'emergencyContact', 'name')} />
                                <InfoField label="Phone Number" value={editableEmployee.emergencyContact.phoneNumber} name="phoneNumber" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'emergencyContact', 'phoneNumber')} />
                                <InfoField label="Relationship" value={editableEmployee.emergencyContact.relationship} name="relationship" isEditing={isEditMode} onChange={(e: any) => handleInputChange(e, 'emergencyContact', 'relationship')} />
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="bg-brand-nav p-8 rounded-xl shadow-lg">
             <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={() => confirmAction?.onConfirm()}
                title={confirmAction?.title || "Confirm"}
                message={confirmAction?.message || ""}
                confirmText={confirmAction?.confirmText || "Confirm"}
            />
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
                <img src={employee.avatarUrl} alt={employee.name} className="w-32 h-32 rounded-full border-4 border-brand-primary"/>
                <div className="flex-grow text-center md:text-left pt-4">
                    <h2 className="text-3xl font-bold text-white">{employee.name}</h2>
                    <p className="text-brand-light">{employee.jobTitle}</p>
                     <span className={`mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${employee.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{employee.status}</span>
                </div>
                {canEdit && (
                    <div className="flex gap-x-2">
                        {isEditMode ? (
                            <>
                                <button onClick={handleSave} disabled={isSaving} className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">{isSaving ? "Saving..." : "Save Changes"}</button>
                                <button onClick={handleCancel} className="bg-brand-dark hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditMode(true)} className="bg-brand-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg">Edit Profile</button>
                        )}
                    </div>
                )}
            </div>

            <div className="border-b border-brand-dark mb-6">
                <nav className="flex space-x-6">
                    <button onClick={() => setActiveTab('personal')} className={`py-3 px-1 font-medium ${activeTab === 'personal' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Personal Info</button>
                    <button onClick={() => setActiveTab('checklist')} className={`py-3 px-1 font-medium ${activeTab === 'checklist' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Checklists</button>
                    <button onClick={() => setActiveTab('documents')} className={`py-3 px-1 font-medium ${activeTab === 'documents' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Documents</button>
                    <button onClick={() => setActiveTab('training')} className={`py-3 px-1 font-medium ${activeTab === 'training' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Training</button>
                </nav>
            </div>
            
            <div>{renderTabContent()}</div>
        </div>
    );
}

const EmployeeList: React.FC<{ allEmployees: Employee[], onEmployeeAdded: () => void }> = ({ allEmployees, onEmployeeAdded }) => {
    const [filters, setFilters] = useState({ jobTitle: 'all', contractType: 'all', status: 'all' });
    const [filteredEmployees, setFilteredEmployees] = useState(allEmployees);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const jobTitles = useMemo(() => [...new Set(allEmployees.map(e => e.jobTitle))], [allEmployees]);
    const contractTypes = Object.values(ContractType);

    useEffect(() => {
        let employees = [...allEmployees];
        if (filters.jobTitle !== 'all') {
            employees = employees.filter(e => e.jobTitle === filters.jobTitle);
        }
        if (filters.contractType !== 'all') {
            employees = employees.filter(e => e.contractType === filters.contractType);
        }
        if (filters.status !== 'all') {
            employees = employees.filter(e => e.status === filters.status);
        }
        setFilteredEmployees(employees);
    }, [filters, allEmployees]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value }));
    };

    const handleExportAllData = (employeesToExport: Employee[]) => {
        const dataForCsv = employeesToExport.map(e => ({
            'Employee ID': e.employeeId,
            'Name (English)': e.name,
            'Name (Arabic)': e.nameAr,
            'Job Title': e.jobTitle,
            'Status': e.status,
            'Contract Type': e.contractType,
            'Hire Date': e.hireDate,
            'Email': e.email,
            'Phone': e.phone,
            'WhatsApp': e.whatsappNumber,
            'Marital Status': e.maritalStatus,
            'Family Members': e.numberOfFamilyMembers,
            'Blood Type': e.bloodType,
            'Address - City': e.address.city,
            'Address - Area': e.address.area,
            'Address - Nearest Place': e.address.nearestKnowingPlace,
            'Emergency Contact Name': e.emergencyContact.name,
            'Emergency Contact Phone': e.emergencyContact.phoneNumber,
            'Emergency Contact Relationship': e.emergencyContact.relationship,
            'Courses': e.courses.map(c => `${c.name} (Expires: ${c.expiryDate})`).join(' | ') || 'N/A',
            'Documents': e.documents.map(d => `${d.name} (Uploaded: ${d.uploadDate})`).join(' | ') || 'N/A',
            'Checklist Items': e.checklist.map(i => `${i.text} (${i.completed ? 'Done' : 'Pending'})`).join(' | ') || 'N/A',
        }));
        exportToCsv('all_employee_data.csv', dataForCsv);
    };

    return (
        <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
            {isAddModalOpen && <AddEmployeeModal onClose={() => setIsAddModalOpen(false)} onSave={onEmployeeAdded} />}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-white">All Employees ({filteredEmployees.length})</h2>
                <div className="flex gap-x-4">
                    <button
                        onClick={() => handleExportAllData(filteredEmployees)}
                        className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Export All Data
                    </button>
                     <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        New Employee
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select name="jobTitle" onChange={handleFilterChange} value={filters.jobTitle} className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md">
                    <option value="all">All Job Titles</option>
                    {jobTitles.map(title => <option key={title} value={title}>{title}</option>)}
                </select>
                 <select name="contractType" onChange={handleFilterChange} value={filters.contractType} className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md">
                    <option value="all">All Contract Types</option>
                    {contractTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <select name="status" onChange={handleFilterChange} value={filters.status} className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md">
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="text-left text-sm text-gray-400">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Job Title</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map(employee => (
                            <tr key={employee.id} className="border-b border-brand-dark/50 hover:bg-brand-dark/30">
                                <td className="p-3">
                                    <Link to={`/employees/${employee.id}`} className="flex items-center group">
                                        <img src={employee.avatarUrl} alt={employee.name} className="w-10 h-10 rounded-full mr-4" />
                                        <span className="font-medium group-hover:text-brand-primary">{employee.name}</span>
                                    </Link>
                                </td>
                                <td className="p-3 text-brand-light">{employee.jobTitle}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${employee.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{employee.status}</span>
                                </td>
                                <td className="p-3 text-brand-light">{employee.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const CourseManagement: React.FC<{ allEmployees: Employee[], onCourseAdded: () => void }> = ({ allEmployees, onCourseAdded }) => {
    const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
    
    const allCourses = useMemo(() => allEmployees.flatMap(emp =>
        emp.courses.map(course => ({
            ...course,
            employeeName: emp.name,
            employeeId: emp.id,
            status: getCourseStatus(course.expiryDate)
        }))
    ).sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()), [allEmployees]);

    return (
        <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
            {isAddCourseModalOpen && <AddCourseModal allEmployees={allEmployees.filter(e => e.status === 'Active')} onClose={() => setIsAddCourseModalOpen(false)} onSave={onCourseAdded} />}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Course & Certificate Management</h2>
                <button onClick={() => setIsAddCourseModalOpen(true)} className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Add Course Record</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="text-left text-sm text-gray-400">
                        <tr>
                            <th className="p-3">Employee</th>
                            <th className="p-3">Course Name</th>
                            <th className="p-3">Expiry Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Document</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allCourses.map(course => (
                            <tr key={`${course.employeeId}-${course.id}`} className="border-b border-brand-dark/50 hover:bg-brand-dark/30">
                                <td className="p-3 font-medium">{course.employeeName}</td>
                                <td className="p-3 text-brand-light">{course.name}</td>
                                <td className="p-3 text-brand-light">{course.expiryDate}</td>
                                <td className="p-3"><StatusBadge status={course.status.status} /></td>
                                <td className="p-3">
                                    {course.documentName ? (
                                        <div className="flex items-center text-brand-light">
                                            <DocumentIcon className="w-5 h-5 mr-2 text-gray-400" />
                                            <span>{course.documentName}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">N/A</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AddCourseModal: React.FC<{
    allEmployees: Employee[],
    onClose: () => void,
    onSave: () => void
}> = ({ allEmployees, onClose, onSave }) => {
    const [formData, setFormData] = useState<{
        employeeId: string;
        name: string;
        dateTaken: string;
        expiryDate: string;
        documentName?: string;
        documentType?: 'pdf' | 'jpg' | 'png';
    }>({ employeeId: '', name: '', dateTaken: '', expiryDate: ''});
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (allEmployees.length > 0) {
            setFormData(prev => ({ ...prev, employeeId: allEmployees[0].id }));
        }
    }, [allEmployees]);
    
    const isFormValid = formData.employeeId && formData.name && formData.dateTaken && formData.expiryDate;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileType = file.name.split('.').pop()?.toLowerCase();
            if (['pdf', 'jpg', 'png'].includes(fileType || '')) {
                setFormData(p => ({
                    ...p,
                    documentName: file.name,
                    documentType: fileType as any
                }));
            } else {
                addToast("Invalid file type. Please use PDF, JPG, or PNG.", "warning");
                e.target.value = ''; // Reset file input
                setFormData(p => ({ ...p, documentName: undefined, documentType: undefined }));
            }
        } else {
            setFormData(p => ({ ...p, documentName: undefined, documentType: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsSaving(true);
        try {
            await api.addCourseToEmployee(formData.employeeId, formData);
            addToast("Course added successfully!", "success");
            onSave();
            onClose();
        } catch (error) {
            addToast("Failed to add course.", "error");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-brand-nav p-8 rounded-lg shadow-2xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <XCircleIcon className="w-8 h-8"/>
                </button>
                <h2 className="text-2xl font-bold text-white mb-6">Add New Course Record</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-light mb-1">Employee</label>
                        <select value={formData.employeeId} onChange={e => setFormData(p => ({...p, employeeId: e.target.value}))} className="w-full bg-brand-bg border border-brand-dark text-white p-2.5 rounded-md">
                            {allEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-light mb-1">Course Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-brand-light mb-1">Date Taken</label>
                            <input type="date" value={formData.dateTaken} onChange={e => setFormData(p => ({...p, dateTaken: e.target.value}))} className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-light mb-1">Expiry Date</label>
                            <input type="date" value={formData.expiryDate} onChange={e => setFormData(p => ({...p, expiryDate: e.target.value}))} className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-light mb-1">Supporting Document (Optional)</label>
                        <input type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/20 file:text-brand-primary hover:file:bg-brand-primary/30" />
                     </div>
                     <div className="flex justify-end pt-4">
                        <button type="submit" disabled={!isFormValid || isSaving} className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500">
                            {isSaving ? 'Saving...' : 'Save Record'}
                        </button>
                     </div>
                </form>
            </div>
        </div>
    );
};

const AddEmployeeModal: React.FC<{ onClose: () => void, onSave: () => void }> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', nameAr: '', jobTitle: '', employeeId: '', phone: '', whatsappNumber: '', email: '',
        address: { city: '', area: '', nearestKnowingPlace: '' },
        maritalStatus: MaritalStatus.SINGLE, numberOfFamilyMembers: 0,
        emergencyContact: { name: '', phoneNumber: '', relationship: '' },
        contractType: ContractType.PERMANENT, bloodType: BloodType.A_POSITIVE,
        role: UserRole.EMPLOYEE,
    });
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string, subField: string | null = null) => {
        const { name, value } = e.target;
        if (subField) {
            setFormData(prev => ({
                ...prev,
                [field]: { ...(prev as any)[field], [subField]: value }
            }));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.addEmployee(formData, formData.role);
            addToast("Employee added successfully!", "success");
            onSave();
            onClose();
        } catch(err) {
            addToast("Failed to add employee.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-brand-nav p-8 rounded-lg shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XCircleIcon className="w-8 h-8"/></button>
                <h2 className="text-2xl font-bold text-white mb-6">Add New Employee</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Details */}
                    <fieldset className="bg-brand-bg/60 p-4 rounded-lg">
                        <legend className="text-lg font-semibold text-brand-primary px-2">Personal Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                             <input name="name" onChange={(e) => handleChange(e, 'name')} placeholder="Name (English)" className="w-full bg-brand-dark p-2 rounded-md" />
                             <input name="nameAr" onChange={(e) => handleChange(e, 'nameAr')} placeholder="الاسم (عربي)" className="w-full bg-brand-dark p-2 rounded-md" />
                             <select name="maritalStatus" onChange={(e) => handleChange(e, 'maritalStatus')} className="w-full bg-brand-dark p-2 rounded-md"><option value={MaritalStatus.SINGLE}>Single</option><option value={MaritalStatus.MARRIED}>Married</option></select>
                             <input type="number" name="numberOfFamilyMembers" onChange={(e) => handleChange(e, 'numberOfFamilyMembers')} placeholder="Family Members" className="w-full bg-brand-dark p-2 rounded-md" />
                             <select name="bloodType" onChange={(e) => handleChange(e, 'bloodType')} className="w-full bg-brand-dark p-2 rounded-md">{Object.values(BloodType).map(v => <option key={v} value={v}>{v}</option>)}</select>
                        </div>
                    </fieldset>
                    {/* Employment Details */}
                    <fieldset className="bg-brand-bg/60 p-4 rounded-lg">
                        <legend className="text-lg font-semibold text-brand-primary px-2">Employment Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                            <input name="jobTitle" onChange={(e) => handleChange(e, 'jobTitle')} placeholder="Designation / Job Title" className="w-full bg-brand-dark p-2 rounded-md" />
                            <input name="employeeId" onChange={(e) => handleChange(e, 'employeeId')} placeholder="Employee ID" className="w-full bg-brand-dark p-2 rounded-md" />
                            <select name="contractType" onChange={(e) => handleChange(e, 'contractType')} className="w-full bg-brand-dark p-2 rounded-md">{Object.values(ContractType).map(v => <option key={v} value={v}>{v}</option>)}</select>
                        </div>
                        <div className="p-2">
                             <label className="block text-sm font-medium text-brand-light mb-1">User Role</label>
                             <select name="role" value={formData.role} onChange={(e) => handleChange(e, 'role')} className="w-full bg-brand-dark p-2 rounded-md">
                                {Object.values(UserRole).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </fieldset>
                    {/* Contact Info */}
                    <fieldset className="bg-brand-bg/60 p-4 rounded-lg">
                        <legend className="text-lg font-semibold text-brand-primary px-2">Contact Info</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                            <input name="phone" onChange={(e) => handleChange(e, 'phone')} placeholder="Phone Number" className="w-full bg-brand-dark p-2 rounded-md" />
                            <input name="whatsappNumber" onChange={(e) => handleChange(e, 'whatsappNumber')} placeholder="WhatsApp Number" className="w-full bg-brand-dark p-2 rounded-md" />
                            <input name="email" type="email" onChange={(e) => handleChange(e, 'email')} placeholder="Email Address" className="w-full bg-brand-dark p-2 rounded-md" />
                            <input name="city" onChange={(e) => handleChange(e, 'address', 'city')} placeholder="City" className="w-full bg-brand-dark p-2 rounded-md" />
                            <input name="area" onChange={(e) => handleChange(e, 'address', 'area')} placeholder="Area" className="w-full bg-brand-dark p-2 rounded-md" />
                            <input name="nearestKnowingPlace" onChange={(e) => handleChange(e, 'address', 'nearestKnowingPlace')} placeholder="Nearest Place" className="w-full bg-brand-dark p-2 rounded-md" />
                        </div>
                    </fieldset>
                     {/* Emergency Contact */}
                    <fieldset className="bg-brand-bg/60 p-4 rounded-lg">
                        <legend className="text-lg font-semibold text-brand-primary px-2">Emergency Contact</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                            <input name="name" onChange={(e) => handleChange(e, 'emergencyContact', 'name')} placeholder="Contact Name" className="w-full bg-brand-dark p-2 rounded-md" />
                            <input name="phoneNumber" onChange={(e) => handleChange(e, 'emergencyContact', 'phoneNumber')} placeholder="Contact Phone" className="w-full bg-brand-dark p-2 rounded-md" />
                            <input name="relationship" onChange={(e) => handleChange(e, 'emergencyContact', 'relationship')} placeholder="Relationship" className="w-full bg-brand-dark p-2 rounded-md" />
                        </div>
                    </fieldset>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSaving} className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500">
                            {isSaving ? 'Saving...' : 'Save Employee'}
                        </button>
                     </div>
                </form>
            </div>
        </div>
    );
};


const Employees: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' or 'courses'
  
  const canViewProfile = user?.role !== 'Employee' || user?.employeeProfileId === employeeId;
  const canManageCourses = user?.role === UserRole.ADMIN || user?.role === UserRole.COORDINATOR;

  const fetchAllData = useCallback(() => {
     setIsLoading(true);
     api.getEmployees().then(data => {
        setAllEmployees(data);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    // Employee role should be redirected to their own profile if no ID is specified
    if (user?.role === 'Employee' && !employeeId) {
        navigate(`/employees/${user.employeeProfileId}`);
        return;
    }

    setIsLoading(true);
    if (employeeId) {
        setActiveTab('profile'); // When viewing one profile, there are no main tabs.
        if (canViewProfile) {
            api.getEmployeeById(employeeId).then(data => {
                setSelectedEmployee(data || null);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false); // Access denied, stop loading
        }
    } else {
      fetchAllData();
    }
  }, [employeeId, user, navigate, canViewProfile, fetchAllData]);
  
  if (isLoading) return <Spinner text="Loading employees..." />;

  if (employeeId) {
      if (!canViewProfile) return <div className="text-center p-8 text-red-400">Access Denied. You can only view your own profile.</div>;
      return selectedEmployee ? <EmployeeProfile initialEmployee={selectedEmployee} onUpdate={fetchAllData}/> : <div className="text-center p-8">Employee not found.</div>;
  }
  
  return (
    <div className="space-y-6">
        <div className="border-b border-brand-dark">
            <nav className="flex space-x-6">
                <button onClick={() => setActiveTab('employees')} className={`py-3 px-1 font-medium ${activeTab === 'employees' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>All Employees</button>
                {canManageCourses && <button onClick={() => setActiveTab('courses')} className={`py-3 px-1 font-medium ${activeTab === 'courses' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Course Management</button>}
            </nav>
        </div>
        
        {activeTab === 'employees' && <EmployeeList allEmployees={allEmployees} onEmployeeAdded={fetchAllData} />}
        {activeTab === 'courses' && canManageCourses && <CourseManagement allEmployees={allEmployees} onCourseAdded={fetchAllData} />}
    </div>
  );
};

export default Employees;
