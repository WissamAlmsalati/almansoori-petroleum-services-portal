
import React, { useState, useEffect, useMemo } from 'react';
import { Client, SubAgreement, User, ServiceTicket, TicketIssue, CallOutJob, DailyServiceLog, TicketStatus, UserRole, ContactPerson, PersonnelLogItem, EquipmentLogItem } from '../types';

// --- Reusable Form Components ---
const FormRow = ({ children }: { children: React.ReactNode }) => <div className="mb-4">{children}</div>;
const FormRowGrid = ({ children }: { children: React.ReactNode }) => <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mb-4">{children}</div>;
const Label = ({ children, ...props }: { children: React.ReactNode } & React.LabelHTMLAttributes<HTMLLabelElement>) => <label className="block text-sm font-medium text-slate-700 mb-1" {...props}>{children}</label>;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm" {...props} />;
const Select = ({ children, ...props }: { children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) => <select className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm" {...props}>{children}</select>;
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={3} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm" {...props} />;
const FormActions = ({ onCancel, onSaveLabel = "Save" }: { onCancel: () => void, onSaveLabel?: string }) => (
    <div className="mt-8 flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-brand-blue-600 text-white rounded-md hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500">{onSaveLabel}</button>
    </div>
);
const FileInput = ({ onFileChange, fileName, label = "Upload a file", accept, placeholderText = "PDF, JPG, PNG up to 10MB" }: { onFileChange: (file: File | null) => void; fileName?: string; label?: string; accept?: string; placeholderText?: string; }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    } else {
      onFileChange(null);
    }
  };
  const fileId = `file-upload-${Math.random()}`;
  return (
    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
      <div className="space-y-1 text-center">
        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div className="flex text-sm text-slate-600">
          <label htmlFor={fileId} className="relative cursor-pointer bg-white rounded-md font-medium text-brand-blue-600 hover:text-brand-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-blue-500">
            <span>{label}</span>
            <input id={fileId} name={fileId} type="file" className="sr-only" onChange={handleFileChange} accept={accept} />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        {fileName ? <p className="text-xs text-slate-500 truncate max-w-xs mx-auto">{fileName}</p> : <p className="text-xs text-slate-500">{placeholderText}</p>}
      </div>
    </div>
  );
};
const FormSection = ({ title, children }: { title: string, children: React.ReactNode}) => (
  <div className="mb-6">
    <h4 className="text-md font-semibold text-slate-800 border-b pb-2 mb-4">{title}</h4>
    {children}
  </div>
);

const RemoveItemButton = ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
    </button>
);


// --- Form Components ---
interface AddClientFormProps {
    onSave: (data: any) => void;
    onCancel: () => void;
    initialData?: Client | null;
}

export const AddClientForm: React.FC<AddClientFormProps> = ({ onSave, onCancel, initialData = null }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    
    const [contacts, setContacts] = useState<(Partial<ContactPerson> & { reactKey: string })[]>(() => {
        if (initialData?.contacts && initialData.contacts.length > 0) {
            return initialData.contacts.map(c => ({ ...c, reactKey: c.id }));
        }
        return [{ reactKey: `contact-${Date.now()}`, name: '', email: '', phone: '', position: '' }];
    });

    const handleContactChange = (index: number, field: keyof Omit<ContactPerson, 'id'>, value: string) => {
        const newContacts = contacts.map((contact, i) => {
            if (i === index) {
                return { ...contact, [field]: value };
            }
            return contact;
        });
        setContacts(newContacts);
    };

    const addContact = () => {
        setContacts([...contacts, { reactKey: `contact-${Date.now()}`, name: '', email: '', phone: '', position: '' }]);
    };
    
    const removeContact = (index: number) => {
        if (contacts.length > 1) {
            setContacts(contacts.filter((_, i) => i !== index));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        const contactsToSave = contacts.map(({ reactKey, ...rest }) => rest);
        onSave({ id: initialData?.id, name, contacts: contactsToSave, logoFile }); 
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormSection title="Part 1: Company Details">
                <FormRow><Label htmlFor="name">Company Name</Label><Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required /></FormRow>
                <FormRow>
                    <Label>Company Logo</Label>
                    {initialData?.logoUrl && !logoFile && (
                         <div className="mb-2 flex items-center gap-4">
                            <img src={initialData.logoUrl} alt="Current logo" className="h-12 w-12 rounded-md object-cover" />
                            <span className="text-sm text-slate-500">Current logo. Upload a new file to replace it.</span>
                        </div>
                    )}
                    <FileInput onFileChange={setLogoFile} fileName={logoFile?.name} />
                </FormRow>
            </FormSection>

            <FormSection title="Part 2: Contact Persons">
                {contacts.map((contact, index) => (
                    <div key={contact.reactKey} className="p-4 border rounded-md mb-4 bg-slate-50 relative">
                        {contacts.length > 1 && (
                            <button type="button" onClick={() => removeContact(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                            </button>
                        )}
                        <p className="font-semibold text-sm mb-2 text-slate-600">Contact #{index + 1}</p>
                         <FormRowGrid>
                            <div><Label htmlFor={`contact_name_${index}`}>Full Name</Label><Input id={`contact_name_${index}`} value={contact.name || ''} onChange={e => handleContactChange(index, 'name', e.target.value)} required /></div>
                            <div><Label htmlFor={`contact_email_${index}`}>Email</Label><Input id={`contact_email_${index}`} type="email" value={contact.email || ''} onChange={e => handleContactChange(index, 'email', e.target.value)} required /></div>
                        </FormRowGrid>
                        <FormRowGrid>
                            <div><Label htmlFor={`contact_phone_${index}`}>Phone</Label><Input id={`contact_phone_${index}`} type="tel" value={contact.phone || ''} onChange={e => handleContactChange(index, 'phone', e.target.value)} /></div>
                            <div><Label htmlFor={`contact_position_${index}`}>Position</Label><Input id={`contact_position_${index}`} value={contact.position || ''} onChange={e => handleContactChange(index, 'position', e.target.value)} /></div>
                        </FormRowGrid>
                    </div>
                ))}
                <button type="button" onClick={addContact} className="w-full text-center px-4 py-2 border border-dashed border-slate-300 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500">
                    + Add Another Contact
                </button>
            </FormSection>

            <FormActions onCancel={onCancel} onSaveLabel={initialData ? "Save Changes" : "Save Client"} />
        </form>
    );
};

interface AddSubAgreementFormProps {
    clients: Client[];
    onSave: (data: any) => void;
    onCancel: () => void;
    initialData?: SubAgreement | null;
}

export const AddSubAgreementForm: React.FC<AddSubAgreementFormProps> = ({ clients, onSave, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        clientId: initialData?.clientId || '',
        name: initialData?.name || '',
        amount: initialData?.amount || 0,
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
    });
    const [file, setFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (selectedFile: File | null) => setFile(selectedFile);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const saveData = {
            ...formData,
            amount: Number(formData.amount),
            file,
            fileName: file?.name || initialData?.fileName,
            id: initialData?.id,
        };
        onSave(saveData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormRow><Label>Client</Label><Select name="clientId" value={formData.clientId} onChange={handleChange} required><option value="">Select a client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormRow>
            <FormRow><Label>Agreement Name</Label><Input name="name" value={formData.name} onChange={handleChange} required /></FormRow>
            <FormRow><Label>Total Amount ($)</Label><Input type="number" name="amount" value={formData.amount} onChange={handleChange} required /></FormRow>
            <FormRow><Label>Start Date</Label><Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required /></FormRow>
            <FormRow><Label>End Date</Label><Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required /></FormRow>
            <FormRow><Label>Agreement Copy</Label><FileInput onFileChange={handleFileChange} fileName={file?.name || initialData?.fileName} /></FormRow>
            <FormActions onCancel={onCancel} onSaveLabel={initialData ? "Save Changes" : "Save Agreement"} />
        </form>
    );
};

interface AddServiceTicketFormProps {
    clients: Client[];
    agreements: SubAgreement[];
    jobs: CallOutJob[];
    onSave: (data: any) => void;
    onCancel: () => void;
    initialData?: ServiceTicket | null;
}

export const AddServiceTicketForm: React.FC<AddServiceTicketFormProps> = ({ clients, agreements, jobs, onSave, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        ticketNumber: initialData?.ticketNumber || '',
        clientId: initialData?.clientId || '',
        date: initialData?.date || '',
        amount: initialData?.amount || 0,
        status: initialData?.status || 'In Field to Sign' as TicketStatus,
        subAgreementId: initialData?.subAgreementId || '',
        callOutJobId: initialData?.callOutJobId || '',
    });
    const [documents, setDocuments] = useState<File[]>(initialData?.documents || []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleFilesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const uniqueNewFiles = newFiles.filter(newFile => !documents.some(existingFile => existingFile.name === newFile.name));
            setDocuments(prev => [...prev, ...uniqueNewFiles]);
        }
    };
    
    const handleFileRemove = (fileName: string) => {
        setDocuments(prev => prev.filter(f => f.name !== fileName));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: initialData?.id,
            amount: Number(formData.amount),
            relatedLogIds: initialData?.relatedLogIds || [],
            documents,
        });
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <FormRow><Label>Ticket Number</Label><Input name="ticketNumber" value={formData.ticketNumber} onChange={handleChange} required /></FormRow>
            <FormRow><Label>Client</Label><Select name="clientId" value={formData.clientId} onChange={handleChange} required><option value="">Select a client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormRow>
            <FormRow><Label>Date</Label><Input type="date" name="date" value={formData.date} onChange={handleChange} required /></FormRow>
            <FormRow><Label>Amount ($)</Label><Input type="number" name="amount" value={formData.amount} onChange={handleChange} required /></FormRow>
            <FormRow><Label>Status</Label><Select name="status" value={formData.status} onChange={handleChange} required>{(['In Field to Sign', 'Issue', 'Delivered', 'Invoiced'] as TicketStatus[]).map(s => <option key={s} value={s}>{s}</option>)}</Select></FormRow>
            <FormRow><Label>Link to Agreement (Optional)</Label><Select name="subAgreementId" value={formData.subAgreementId} onChange={handleChange}><option value="">None</option>{agreements.filter(a => a.clientId === formData.clientId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></FormRow>
            
            <FormRow>
                <Label>Documents</Label>
                {documents.length > 0 && (
                    <div className="mb-2 space-y-2">
                        {documents.map((doc) => (
                            <div key={doc.name} className="flex items-center justify-between bg-slate-100 p-2 rounded-md text-sm">
                                <span className="text-slate-700 truncate">{doc.name}</span>
                                <button type="button" onClick={() => handleFileRemove(doc.name)} className="ml-2 text-red-500 hover:text-red-700">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div>
                    <label htmlFor="ticket-file-upload" className="cursor-pointer text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700 bg-brand-blue-50 hover:bg-brand-blue-100 px-4 py-2 rounded-md inline-block w-full text-center border border-dashed border-brand-blue-200">
                        + Add PDF Document(s)
                    </label>
                    <input id="ticket-file-upload" type="file" multiple accept=".pdf" className="sr-only" onChange={handleFilesAdd} />
                </div>
            </FormRow>

            <FormActions onCancel={onCancel} onSaveLabel={initialData ? "Save Changes" : "Save Ticket"}/>
        </form>
    );
};

interface AddUserFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: User | null;
  availableRoles?: string[];
}

export const AddUserForm: React.FC<AddUserFormProps> = ({ onSave, onCancel, initialData = null, availableRoles = ['User', 'Manager', 'Admin'] }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        password: '',
        password_confirmation: '',
        role: initialData?.role || 'User',
        status: initialData?.status || 'pending'
    });
    const [avatar, setAvatar] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleAvatarChange = (file: File | null) => setAvatar(file);
    
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        onSave({
            ...formData,
            avatar: avatar
        }); 
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormSection title="User Information">
                <FormRow><Label>Name</Label><Input name="name" value={formData.name} onChange={handleChange} required /></FormRow>
                <FormRow><Label>Email</Label><Input type="email" name="email" value={formData.email} onChange={handleChange} required /></FormRow>
                {!initialData && (
                    <>
                        <FormRow><Label>Password</Label><Input type="password" name="password" value={formData.password} onChange={handleChange} required /></FormRow>
                        <FormRow><Label>Confirm Password</Label><Input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required /></FormRow>
                    </>
                )}
                <FormRow>
                    <Label>Role</Label>
                    <Select name="role" value={formData.role} onChange={handleChange} required>
                        {availableRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </Select>
                </FormRow>
                {initialData && (
                    <FormRow>
                        <Label>Status</Label>
                        <Select name="status" value={formData.status} onChange={handleChange} required>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </Select>
                    </FormRow>
                )}
                <FormRow>
                    <Label>Avatar (Optional)</Label>
                    <FileInput 
                        onFileChange={handleAvatarChange} 
                        fileName={avatar?.name}
                        label="Upload Avatar"
                        accept="image/*"
                        placeholderText="JPG, PNG up to 5MB"
                    />
                </FormRow>
            </FormSection>
            <FormActions onCancel={onCancel} onSaveLabel={initialData ? "Update User" : "Create User"} />
        </form>
    );
};

interface AddCallOutJobFormProps {
    clients: Client[];
    onSave: (data: any) => void;
    onCancel: () => void;
    initialData?: CallOutJob | null;
}

export const AddCallOutJobForm: React.FC<AddCallOutJobFormProps> = ({ clients, onSave, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        clientId: initialData?.clientId || '',
        jobName: initialData?.jobName || '',
        workOrderNumber: initialData?.workOrderNumber || '',
        description: initialData?.description || '',
        priority: initialData?.priority || 'medium',
        status: initialData?.status || 'scheduled',
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
    });
    const [documents, setDocuments] = useState<File[]>(initialData?.documents || []);

    useEffect(() => {
        if(initialData) {
            setFormData({
                clientId: initialData.clientId,
                jobName: initialData.jobName,
                workOrderNumber: initialData.workOrderNumber,
                description: initialData.description || '',
                priority: initialData.priority || 'medium',
                status: initialData.status || 'scheduled',
                startDate: initialData.startDate,
                endDate: initialData.endDate,
            });
            setDocuments(initialData.documents);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleFilesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const uniqueNewFiles = newFiles.filter(newFile => !documents.some(existingFile => existingFile.name === newFile.name));
            setDocuments(prev => [...prev, ...uniqueNewFiles]);
        }
    };
    
    const handleFileRemove = (fileName: string) => {
        setDocuments(prev => prev.filter(f => f.name !== fileName));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.clientId) {
            alert('Please select a client');
            return;
        }
        if (!formData.jobName.trim()) {
            alert('Please enter a job name');
            return;
        }
        if (!formData.workOrderNumber.trim()) {
            alert('Please enter a work order number');
            return;
        }
        if (!formData.startDate) {
            alert('Please select a start date');
            return;
        }
        if (!formData.endDate) {
            alert('Please select an end date');
            return;
        }
        
        console.log('Form data being submitted:', { ...formData, id: initialData?.id, documents });
        onSave({ ...formData, id: initialData?.id, documents });
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormRow>
                <Label>Client</Label>
                <Select name="clientId" value={formData.clientId} onChange={handleChange} required>
                    <option value="">Select a client</option>
                    {clients.length === 0 ? (
                        <option value="" disabled>No clients available</option>
                    ) : (
                        clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    )}
                </Select>
                {clients.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">No clients available. Please add clients first.</p>
                )}
            </FormRow>
            <FormRow><Label>Job Name</Label><Input name="jobName" value={formData.jobName} onChange={handleChange} required /></FormRow>
            <FormRow><Label>Work Order #</Label><Input name="workOrderNumber" value={formData.workOrderNumber} onChange={handleChange} required /></FormRow>
            <FormRow><Label>Description</Label><Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter job description..." /></FormRow>
            <FormRow><Label>Priority</Label><Select name="priority" value={formData.priority} onChange={handleChange} required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
            </Select></FormRow>
            <FormRow><Label>Status</Label><Select name="status" value={formData.status} onChange={handleChange} required>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </Select></FormRow>
            <FormRow><Label>Start Date</Label><Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required /></FormRow>
            <FormRow><Label>End Date</Label><Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required /></FormRow>
            
            <FormRow>
                <Label>Documents</Label>
                {documents.length > 0 && (
                    <div className="mb-2 space-y-2">
                        {documents.map((doc) => (
                            <div key={doc.name} className="flex items-center justify-between bg-slate-100 p-2 rounded-md text-sm">
                                <span className="text-slate-700 truncate">{doc.name}</span>
                                <button type="button" onClick={() => handleFileRemove(doc.name)} className="ml-2 text-red-500 hover:text-red-700">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div>
                    <label htmlFor="job-file-upload" className="cursor-pointer text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700 bg-brand-blue-50 hover:bg-brand-blue-100 px-4 py-2 rounded-md inline-block w-full text-center border border-dashed border-brand-blue-200">
                        + Add Document(s)
                    </label>
                    <input id="job-file-upload" type="file" multiple className="sr-only" onChange={handleFilesAdd} />
                </div>
            </FormRow>

            <FormActions onCancel={onCancel} onSaveLabel={initialData ? "Save Changes" : "Save Job"} />
        </form>
    );
};

// --- Service Ticket Generation Form ---
const PERSONNEL_DAY_RATE = 500; // Standard rate for one person for one day
const EQUIPMENT_DAY_RATE = 1000; // Standard rate for one piece of equipment for one day

interface GenerateServiceTicketFormProps {
    clients: Client[];
    agreements: SubAgreement[];
    jobs: CallOutJob[];
    availableLogs: DailyServiceLog[];
    onSave: (data: any) => void;
    onCancel: () => void;
}

export const GenerateServiceTicketForm: React.FC<GenerateServiceTicketFormProps> = ({ clients, agreements, jobs, availableLogs, onSave, onCancel }) => {
    const [clientId, setClientId] = useState('');
    const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
    const [ticketNumber, setTicketNumber] = useState('');
    const [documents, setDocuments] = useState<File[]>([]);
    
    const clientLogs = useMemo(() => {
        if (!clientId) return [];
        return availableLogs.filter(log => log.clientId === clientId);
    }, [clientId, availableLogs]);

    const handleLogSelection = (logId: string) => {
        setSelectedLogIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(logId)) {
                newSet.delete(logId);
            } else {
                newSet.add(logId);
            }
            return newSet;
        });
    };

    const derivedData = useMemo(() => {
        if (selectedLogIds.size === 0) {
            return { amount: 0, date: '', linkedJobId: null };
        }

        const selectedLogs = clientLogs.filter(log => selectedLogIds.has(log.id));
        if (selectedLogs.length === 0) {
             return { amount: 0, date: '', linkedJobId: null };
        }

        // Calculate amount
        let totalAmount = 0;
        selectedLogs.forEach(log => {
            const personnelDays = log.personnel?.reduce((sum, p) => sum + p.dailyStatus.filter(s => s === 'X' || s === 'T').length, 0) || 0;
            const equipmentDays = log.equipmentUsed?.reduce((sum, e) => sum + e.dailyStatus.filter(s => s === 'X').length * e.quantity, 0) || 0;
            totalAmount += (personnelDays * PERSONNEL_DAY_RATE) + (equipmentDays * EQUIPMENT_DAY_RATE);
        });

        // Determine latest date
        const latestDate = selectedLogs.reduce((latest, log) => {
            const logDate = new Date(log.date);
            return logDate > latest ? logDate : latest;
        }, new Date(0));
        
        // Determine common linked job
        let commonJobId: string | undefined | null = selectedLogs.length > 0 ? selectedLogs[0].linkedJobId : null;
        for (let i = 1; i < selectedLogs.length; i++) {
            if (selectedLogs[i].linkedJobId !== commonJobId) {
                commonJobId = null;
                break;
            }
        }

        return {
            amount: totalAmount,
            date: latestDate.toISOString().split('T')[0],
            linkedJobId: commonJobId || null,
        };
    }, [selectedLogIds, clientLogs]);
    
    const allJobsAndAgreements = useMemo(() => [...agreements, ...jobs], [agreements, jobs]);

    const linkedJobDetails = useMemo(() => {
        if (!derivedData.linkedJobId) return { name: 'Multiple/None', isAgreement: false };
        const job = allJobsAndAgreements.find(j => j.id === derivedData.linkedJobId);
        if (!job) return { name: 'N/A', isAgreement: false };
        return {
            name: 'jobName' in job ? job.jobName : job.name,
            isAgreement: 'balance' in job
        };
    }, [derivedData.linkedJobId, allJobsAndAgreements]);

    const handleFilesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setDocuments(prev => [...prev, ...newFiles]);
        }
    };

    const handleFileRemove = (fileName: string) => {
        setDocuments(prev => prev.filter(f => f.name !== fileName));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLogIds.size === 0 || !ticketNumber) {
            alert("Please select at least one log and provide a ticket number.");
            return;
        }

        onSave({
            ticketNumber,
            clientId,
            date: derivedData.date,
            amount: derivedData.amount,
            status: 'Delivered',
            subAgreementId: linkedJobDetails.isAgreement ? derivedData.linkedJobId : undefined,
            callOutJobId: !linkedJobDetails.isAgreement && derivedData.linkedJobId ? derivedData.linkedJobId : undefined,
            relatedLogIds: Array.from(selectedLogIds),
            documents,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormSection title="Step 1: Select Client">
                <Select value={clientId} onChange={e => { setClientId(e.target.value); setSelectedLogIds(new Set()); }} required>
                    <option value="">-- Select a Client --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
            </FormSection>
            
            {clientId && (
                <FormSection title="Step 2: Select Available Daily Service Logs">
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2 bg-slate-50">
                        {clientLogs.length > 0 ? clientLogs.map(log => (
                            <div key={log.id} className="flex items-center p-2 rounded-md transition-colors bg-white hover:bg-brand-blue-50 border">
                                <input
                                    type="checkbox"
                                    id={`log-${log.id}`}
                                    checked={selectedLogIds.has(log.id)}
                                    onChange={() => handleLogSelection(log.id)}
                                    className="h-4 w-4 text-brand-blue-600 border-slate-300 rounded focus:ring-brand-blue-500"
                                />
                                <label htmlFor={`log-${log.id}`} className="ml-3 flex-grow cursor-pointer">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-800">{log.logNumber}</span>
                                        <span className="text-sm text-slate-500">{new Date(log.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {log.personnel?.map(p => p.name).join(', ') || 'No personnel'}
                                    </p>
                                </label>
                            </div>
                        )) : (
                            <p className="text-center text-slate-500 p-4">No available detailed service logs for this client.</p>
                        )}
                    </div>
                     {clientLogs.length === 0 && <p className="text-sm text-slate-500 mt-2">Note: Only detailed logs (created via "Generate DSL") that are not already linked to a service ticket will appear here.</p>}
                </FormSection>
            )}

            <FormSection title="Step 3: Review and Finalize Ticket">
                <fieldset disabled={selectedLogIds.size === 0} className="disabled:opacity-50">
                    <FormRow><Label>Ticket Number</Label><Input value={ticketNumber} onChange={e => setTicketNumber(e.target.value)} required /></FormRow>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-md">
                        <div><Label>Calculated Amount</Label><p className="text-lg font-bold text-slate-800 mt-2">${derivedData.amount.toLocaleString()}</p></div>
                        <div><Label>Ticket Date</Label><p className="text-slate-800 mt-2">{derivedData.date ? new Date(derivedData.date + 'T00:00:00').toLocaleDateString() : 'N/A'}</p></div>
                        <div><Label>Linked To</Label><p className="text-slate-800 mt-2 truncate" title={linkedJobDetails.name}>{linkedJobDetails.name}</p></div>
                    </div>
                    <FormRow>
                        <Label>Attach Additional Documents</Label>
                        {documents.length > 0 && (
                            <div className="mb-2 space-y-2">
                                {documents.map((doc, index) => (
                                    <div key={`${doc.name}-${index}`} className="flex items-center justify-between bg-slate-100 p-2 rounded-md text-sm">
                                        <span className="text-slate-700 truncate">{doc.name}</span>
                                        <button type="button" onClick={() => handleFileRemove(doc.name)} className="ml-2 text-red-500 hover:text-red-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div>
                            <label htmlFor="gen-ticket-file-upload" className={`cursor-pointer text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700 bg-brand-blue-50 hover:bg-brand-blue-100 px-4 py-2 rounded-md inline-block w-full text-center border border-dashed border-brand-blue-200`}>
                                + Add PDF Document(s)
                            </label>
                            <input id="gen-ticket-file-upload" type="file" multiple accept=".pdf" className="sr-only" onChange={handleFilesAdd} />
                        </div>
                    </FormRow>
                </fieldset>
            </FormSection>

            <FormActions onCancel={onCancel} onSaveLabel="Generate Ticket" />
        </form>
    );
}

// --- Utility Functions ---
const getDaysInMonth = (dateString: string): number => {
    const date = new Date(dateString + 'T00:00:00'); // Use local time
    const year = date.getFullYear();
    const month = date.getMonth();
    // Day 0 of next month gives the last day of the current month
    return new Date(year, month + 1, 0).getDate();
};


interface AddFullDailyServiceLogFormProps {
    clients: Client[];
    jobs: (SubAgreement | CallOutJob)[];
    onSave: (data: Partial<DailyServiceLog>) => void;
    onCancel: () => void;
    initialData?: DailyServiceLog | null;
    isGenerating: boolean;
}

type FormPersonnel = { id: string; name: string; position: string; daysPresentStr: string; daysTravelStr: string; }
type FormEquipment = { id: string; name: string; quantity: number; daysPresentStr: string; }

// --- Day String Parsers ---
const parseDayString = (str: string, maxDay: number): number[] => {
  const days: number[] = [];
  if (!str) return days;

  str.split(',').forEach(part => {
    part = part.trim();
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= maxDay) days.push(i);
        }
      }
    } else {
      const day = Number(part);
      if (!isNaN(day) && day >= 1 && day <= maxDay) {
        days.push(day);
      }
    }
  });
  return [...new Set(days)].sort((a,b) => a - b);
};

const dailyStatusToDayString = (dailyStatus: string[], statusChar: 'X' | 'T'): string => {
    const days = dailyStatus.map((status, index) => status === statusChar ? index + 1 : 0).filter(day => day > 0);
    if (days.length === 0) return '';

    const ranges: (string|number)[] = [];
    let start = days[0];
    let end = days[0];

    for (let i = 1; i < days.length; i++) {
        if (days[i] === end + 1) {
            end = days[i];
        } else {
            ranges.push(start === end ? start : `${start}-${end}`);
            start = end = days[i];
        }
    }
    ranges.push(start === end ? start : `${start}-${end}`);
    return ranges.join(', ');
};

export const AddFullDailyServiceLogForm: React.FC<AddFullDailyServiceLogFormProps> = ({ clients, jobs, onSave, onCancel, initialData = null, isGenerating }) => {
    
    const [headerData, setHeaderData] = useState({
        logNumber: initialData?.logNumber || '',
        clientId: initialData?.clientId || '',
        linkedJobId: initialData?.linkedJobId || '',
        field: initialData?.field || '',
        well: initialData?.well || '',
        contract: initialData?.contract || '',
        jobNo: initialData?.jobNo || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
    });

    const daysInSelectedMonth = useMemo(() => getDaysInMonth(headerData.date), [headerData.date]);
    
    const [personnel, setPersonnel] = useState<FormPersonnel[]>(
        initialData?.personnel?.map(p => ({
            id: p.id,
            name: p.name,
            position: p.position,
            daysPresentStr: dailyStatusToDayString(p.dailyStatus, 'X'),
            daysTravelStr: dailyStatusToDayString(p.dailyStatus, 'T'),
        })) || [{ id: `p-${Date.now()}`, name: '', position: '', daysPresentStr: '', daysTravelStr: '' }]
    );

    const [equipment, setEquipment] = useState<FormEquipment[]>(
        initialData?.equipmentUsed?.map(e => ({
            id: e.id,
            name: e.name,
            quantity: e.quantity,
            daysPresentStr: dailyStatusToDayString(e.dailyStatus, 'X'),
        })) || [{ id: `eq-${Date.now()}`, name: '', quantity: 1, daysPresentStr: '' }]
    );

    const [approvers, setApprovers] = useState({
        almansooriRepName: initialData?.almansooriRep?.[0]?.name || '',
        almansooriRepPos: initialData?.almansooriRep?.[0]?.position || '',
        mog1Name: initialData?.mogApproval1?.name || '',
        mog1Date: initialData?.mogApproval1?.date || '',
        mog2Name: initialData?.mogApproval2?.name || '',
        mog2Date: initialData?.mogApproval2?.date || '',
    });

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setHeaderData({ ...headerData, [e.target.name]: e.target.value });
    const handleApproverChange = (e: React.ChangeEvent<HTMLInputElement>) => setApprovers({ ...approvers, [e.target.name]: e.target.value });

    const clientName = useMemo(() => {
        if (!headerData.clientId) return 'Client';
        const client = clients.find(c => c.id === headerData.clientId);
        return client ? client.name : 'Client';
    }, [headerData.clientId, clients]);

    const availableJobs = useMemo(() => {
        if (!headerData.clientId) return [];
        return jobs.filter(j => j.clientId === headerData.clientId);
    }, [headerData.clientId, jobs]);

    useEffect(() => {
        // When client changes, check if the current linkedJobId is still valid.
        if (headerData.linkedJobId && !availableJobs.some(j => j.id === headerData.linkedJobId)) {
            // Reset linked job and auto-filled fields if client changes and job is no longer valid
            setHeaderData(prev => ({ ...prev, linkedJobId: '', contract: initialData?.contract || '', jobNo: initialData?.jobNo || '' }));
        }
    }, [headerData.clientId, availableJobs, initialData]);

    useEffect(() => {
        // Auto-populate manual fields when a job is linked
        if (headerData.linkedJobId) {
            const selectedJob = availableJobs.find(j => j.id === headerData.linkedJobId);
            if (selectedJob) {
                const contract = 'workOrderNumber' in selectedJob ? selectedJob.workOrderNumber : '';
                const jobNo = 'jobName' in selectedJob ? selectedJob.jobName : selectedJob.name;
                setHeaderData(prev => ({ ...prev, contract, jobNo }));
            }
        }
    }, [headerData.linkedJobId, availableJobs]);


    const handleListChange = <T extends FormPersonnel | FormEquipment>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, index: number, field: keyof T, value: string | number) => {
        const newList = [...list];
        // @ts-ignore
        newList[index][field] = value;
        setList(newList);
    };

    const addListItem = <T extends FormPersonnel | FormEquipment>(setList: React.Dispatch<React.SetStateAction<T[]>>, newItem: T) => {
        setList(prev => [...prev, newItem]);
    };

    const removeListItem = (list: any[], setList: React.Dispatch<React.SetStateAction<any[]>>, index: number) => {
        if(list.length > 1) setList(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalPersonnel: PersonnelLogItem[] = personnel.filter(p => p.name).map(p => {
            const dailyStatus = Array(daysInSelectedMonth).fill('');
            parseDayString(p.daysPresentStr, daysInSelectedMonth).forEach(d => { dailyStatus[d-1] = 'X'; });
            parseDayString(p.daysTravelStr, daysInSelectedMonth).forEach(d => { dailyStatus[d-1] = 'T'; });
            return { id: p.id, name: p.name, position: p.position, dailyStatus };
        });

        const finalEquipment: EquipmentLogItem[] = equipment.filter(e => e.name).map(e => {
            const dailyStatus = Array(daysInSelectedMonth).fill('');
            parseDayString(e.daysPresentStr, daysInSelectedMonth).forEach(d => { dailyStatus[d-1] = 'X'; });
            return { id: e.id, name: e.name, quantity: e.quantity, dailyStatus };
        });
        
        const saveData: Partial<DailyServiceLog> = {
            ...headerData,
            id: initialData?.id,
            personnel: finalPersonnel,
            equipmentUsed: finalEquipment,
            almansooriRep: approvers.almansooriRepName ? [{ name: approvers.almansooriRepName, position: approvers.almansooriRepPos }] : [],
            mogApproval1: approvers.mog1Name ? { name: approvers.mog1Name, date: approvers.mog1Date } : undefined,
            mogApproval2: approvers.mog2Name ? { name: approvers.mog2Name, date: approvers.mog2Date } : undefined,
        };
        onSave(saveData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormSection title="Header Information">
                <FormRowGrid><FormRow><Label>Log Number (N:)</Label><Input name="logNumber" value={headerData.logNumber} onChange={handleHeaderChange} required placeholder="e.g. 2025/090" /></FormRow><FormRow><Label>Date (determines month length)</Label><Input type="date" name="date" value={headerData.date} onChange={handleHeaderChange} required /></FormRow></FormRowGrid>
                <FormRowGrid>
                    <FormRow><Label>Client</Label><Select name="clientId" value={headerData.clientId} onChange={handleHeaderChange} required><option value="">Select a client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormRow>
                    <FormRow><Label>Linked Job / Agreement</Label><Select name="linkedJobId" value={headerData.linkedJobId} onChange={handleHeaderChange} disabled={!headerData.clientId}><option value="">Select a job or agreement</option>{availableJobs.map(j => <option key={j.id} value={j.id}>{'jobName' in j ? j.jobName : j.name}</option>)}</Select></FormRow>
                </FormRowGrid>
                <FormRowGrid><FormRow><Label>Field</Label><Input name="field" value={headerData.field} onChange={handleHeaderChange} required /></FormRow><FormRow><Label>Well</Label><Input name="well" value={headerData.well} onChange={handleHeaderChange} /></FormRow></FormRowGrid>
                <FormRowGrid><FormRow><Label>Contract (manual)</Label><Input name="contract" value={headerData.contract} onChange={handleHeaderChange} /></FormRow><FormRow><Label>Job No. (manual)</Label><Input name="jobNo" value={headerData.jobNo} onChange={handleHeaderChange} /></FormRow></FormRowGrid>
            </FormSection>

            <FormSection title="Personnel">
                {personnel.map((p, index) => (
                    <div key={p.id} className="p-3 border rounded-md mb-3 bg-slate-50 space-y-2 relative">
                        {personnel.length > 1 && <RemoveItemButton onClick={() => removeListItem(personnel, setPersonnel, index)} />}
                         <FormRowGrid>
                            <div><Label>Name</Label><Input value={p.name} onChange={e => handleListChange(personnel, setPersonnel, index, 'name', e.target.value)} placeholder="Personnel Name" /></div>
                            <div><Label>Position</Label><Input value={p.position} onChange={e => handleListChange(personnel, setPersonnel, index, 'position', e.target.value)} placeholder="e.g. Supervisor" /></div>
                        </FormRowGrid>
                        <FormRowGrid>
                            <div><Label>Present Days (X)</Label><Input value={p.daysPresentStr} onChange={e => handleListChange(personnel, setPersonnel, index, 'daysPresentStr', e.target.value)} placeholder={`e.g. 1-${daysInSelectedMonth}, 5`} /></div>
                            <div><Label>Travel Days (T)</Label><Input value={p.daysTravelStr} onChange={e => handleListChange(personnel, setPersonnel, index, 'daysTravelStr', e.target.value)} placeholder="e.g. 4, 9" /></div>
                        </FormRowGrid>
                    </div>
                ))}
                <button type="button" onClick={() => addListItem(setPersonnel, { id: `p-${Date.now()}`, name: '', position: '', daysPresentStr: '', daysTravelStr: '' })} className="mt-2 text-sm font-medium text-brand-blue-600 hover:text-brand-blue-800">+ Add Personnel</button>
            </FormSection>

            <FormSection title="Equipment">
                {equipment.map((e, index) => (
                    <div key={e.id} className="p-3 border rounded-md mb-3 bg-slate-50 space-y-2 relative">
                         {equipment.length > 1 && <RemoveItemButton onClick={() => removeListItem(equipment, setEquipment, index)} />}
                        <FormRowGrid>
                            <div className="md:col-span-2"><Label>Equipment</Label><Input value={e.name} onChange={ev => handleListChange(equipment, setEquipment, index, 'name', ev.target.value)} placeholder="Equipment Name" /></div>
                        </FormRowGrid>
                        <FormRowGrid>
                             <div><Label>Quantity</Label><Input type="number" value={e.quantity} onChange={ev => handleListChange(equipment, setEquipment, index, 'quantity', Number(ev.target.value))} /></div>
                            <div><Label>Present Days (X)</Label><Input value={e.daysPresentStr} onChange={ev => handleListChange(equipment, setEquipment, index, 'daysPresentStr', ev.target.value)} placeholder={`e.g. 1-${daysInSelectedMonth}`} /></div>
                        </FormRowGrid>
                    </div>
                ))}
                 <button type="button" onClick={() => addListItem(setEquipment, { id: `eq-${Date.now()}`, name: '', quantity: 1, daysPresentStr: '' })} className="mt-2 text-sm font-medium text-brand-blue-600 hover:text-brand-blue-800">+ Add Equipment</button>
            </FormSection>

            <FormSection title="Approvals">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h5 className="font-semibold text-slate-600 mb-2">Almansoori Rep.</h5>
                        <FormRow><Label>Name</Label><Input name="almansooriRepName" value={approvers.almansooriRepName} onChange={handleApproverChange} /></FormRow>
                        <FormRow><Label>Position</Label><Input name="almansooriRepPos" value={approvers.almansooriRepPos} onChange={handleApproverChange} /></FormRow>
                    </div>
                     <div>
                        <h5 className="font-semibold text-slate-600 mb-2">{clientName} Approval 1</h5>
                        <FormRow><Label>Name</Label><Input name="mog1Name" value={approvers.mog1Name} onChange={handleApproverChange} /></FormRow>
                        <FormRow><Label>Date</Label><Input type="date" name="mog1Date" value={approvers.mog1Date} onChange={handleApproverChange} /></FormRow>
                    </div>
                     <div>
                        <h5 className="font-semibold text-slate-600 mb-2">{clientName} Approval 2</h5>
                        <FormRow><Label>Name</Label><Input name="mog2Name" value={approvers.mog2Name} onChange={handleApproverChange} /></FormRow>
                        <FormRow><Label>Date</Label><Input type="date" name="mog2Date" value={approvers.mog2Date} onChange={handleApproverChange} /></FormRow>
                    </div>
                </div>
            </FormSection>

            <FormActions onCancel={onCancel} onSaveLabel={isGenerating ? (initialData ? "Save Changes & Generate" : "Save & Generate Excel") : "Save Log"} />
        </form>
    );
};


interface AddSimpleDailyServiceLogFormProps {
    clients: Client[];
    jobs: (SubAgreement | CallOutJob)[];
    onSave: (data: Partial<DailyServiceLog>) => void;
    onCancel: () => void;
    initialData?: DailyServiceLog | null;
}

export const AddSimpleDailyServiceLogForm: React.FC<AddSimpleDailyServiceLogFormProps> = ({ clients, jobs, onSave, onCancel, initialData = null }) => {
    const [headerData, setHeaderData] = useState({
        logNumber: initialData?.logNumber || '',
        clientId: initialData?.clientId || '',
        linkedJobId: initialData?.linkedJobId || '',
        field: initialData?.field || '',
        well: initialData?.well || '',
        contract: initialData?.contract || '',
        jobNo: initialData?.jobNo || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
    });
    const [excelFile, setExcelFile] = useState<File | null>(initialData?.excelFile || null);
    const [pdfFile, setPdfFile] = useState<File | null>(initialData?.pdfFile || null);

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setHeaderData({ ...headerData, [e.target.name]: e.target.value });
    
    const availableJobs = useMemo(() => {
        if (!headerData.clientId) return [];
        return jobs.filter(j => j.clientId === headerData.clientId);
    }, [headerData.clientId, jobs]);

    useEffect(() => {
        // When client changes, check if the current linkedJobId is still valid.
        if (headerData.linkedJobId && !availableJobs.some(j => j.id === headerData.linkedJobId)) {
            setHeaderData(prev => ({ ...prev, linkedJobId: '', contract: initialData?.contract || '', jobNo: initialData?.jobNo || '' }));
        }
    }, [headerData.clientId, availableJobs, initialData]);

    useEffect(() => {
        // Auto-populate manual fields when a job is linked
        if (headerData.linkedJobId) {
            const selectedJob = availableJobs.find(j => j.id === headerData.linkedJobId);
            if (selectedJob) {
                const contract = 'workOrderNumber' in selectedJob ? selectedJob.workOrderNumber : '';
                const jobNo = 'jobName' in selectedJob ? selectedJob.jobName : selectedJob.name;
                setHeaderData(prev => ({ ...prev, contract, jobNo }));
            }
        }
    }, [headerData.linkedJobId, availableJobs]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...headerData,
            id: initialData?.id,
            excelFile,
            excelFileName: excelFile?.name || initialData?.excelFileName,
            pdfFile,
            pdfFileName: pdfFile?.name || initialData?.pdfFileName,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormSection title="Header Information">
                <FormRowGrid><FormRow><Label>Log Number (N:)</Label><Input name="logNumber" value={headerData.logNumber} onChange={handleHeaderChange} required placeholder="e.g. 2025/090" /></FormRow><FormRow><Label>Date</Label><Input type="date" name="date" value={headerData.date} onChange={handleHeaderChange} required /></FormRow></FormRowGrid>
                <FormRowGrid>
                    <FormRow><Label>Client</Label><Select name="clientId" value={headerData.clientId} onChange={handleHeaderChange} required><option value="">Select a client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormRow>
                    <FormRow><Label>Linked Job / Agreement</Label><Select name="linkedJobId" value={headerData.linkedJobId} onChange={handleHeaderChange} disabled={!headerData.clientId}><option value="">Select a job or agreement</option>{availableJobs.map(j => <option key={j.id} value={j.id}>{'jobName' in j ? j.jobName : j.name}</option>)}</Select></FormRow>
                </FormRowGrid>
                <FormRowGrid><FormRow><Label>Field</Label><Input name="field" value={headerData.field} onChange={handleHeaderChange} required /></FormRow><FormRow><Label>Well</Label><Input name="well" value={headerData.well} onChange={handleHeaderChange} /></FormRow></FormRowGrid>
                <FormRowGrid><FormRow><Label>Contract (manual)</Label><Input name="contract" value={headerData.contract} onChange={handleHeaderChange} /></FormRow><FormRow><Label>Job No. (manual)</Label><Input name="jobNo" value={headerData.jobNo} onChange={handleHeaderChange} /></FormRow></FormRowGrid>
            </FormSection>

            <FormSection title="File Uploads">
                 <FormRow>
                    <Label>Upload Excel File</Label>
                    <FileInput onFileChange={setExcelFile} fileName={excelFile?.name || initialData?.excelFileName} accept=".xls,.xlsx" placeholderText="XLS, XLSX up to 10MB" />
                </FormRow>
                 <FormRow>
                    <Label>Upload PDF File</Label>
                    <FileInput onFileChange={setPdfFile} fileName={pdfFile?.name || initialData?.pdfFileName} accept=".pdf" placeholderText="PDF up to 10MB" />
                </FormRow>
            </FormSection>

            <FormActions onCancel={onCancel} onSaveLabel={initialData ? "Save Changes" : "Save Log"} />
        </form>
    );
};


export const AddTicketIssueForm = ({ tickets, onSave, onCancel }: { tickets: ServiceTicket[], onSave: (data: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({ ticketId: '', description: '', remarks: '', dateReported: new Date().toISOString().split('T')[0] });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({...formData, status: 'Open'}); };

    return (
        <form onSubmit={handleSubmit}>
            <FormRow><Label>Related Ticket</Label><Select name="ticketId" value={formData.ticketId} onChange={handleChange} required><option value="">Select a ticket</option>{tickets.map(t => <option key={t.id} value={t.id}>{t.ticketNumber}</option>)}</Select></FormRow>
            <FormRow><Label>Issue Description</Label><Textarea name="description" value={formData.description} onChange={handleChange} required /></FormRow>
            <FormRow><Label>Initial Remarks</Label><Textarea name="remarks" value={formData.remarks} onChange={handleChange} required /></FormRow>
            <FormRow><Label>Date Reported</Label><Input type="date" name="dateReported" value={formData.dateReported} onChange={handleChange} required /></FormRow>
            <FormActions onCancel={onCancel} />
        </form>
    );
};