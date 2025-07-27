import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import SubAgreements from './components/SubAgreements';
import ServiceTickets from './components/ServiceTickets';
import UserManagement from './components/UserManagement';
import TicketIssues from './components/TicketIssues';
import DocumentArchive from './components/DocumentArchive';
import DailyServiceLogs from './components/DailyServiceLogs';
import CallOutJobs from './components/CallOutJobs';
import Modal from './components/Modal';
import { AddClientForm, AddSubAgreementForm, AddServiceTicketForm, AddUserForm, AddCallOutJobForm, AddFullDailyServiceLogForm, AddSimpleDailyServiceLogForm, AddTicketIssueForm, GenerateServiceTicketForm } from './components/AddForms';

import { View, Client, SubAgreement, User, ServiceTicket, TicketIssue, CallOutJob, DailyServiceLog, ContactPerson, PersonnelLogItem, EquipmentLogItem, CombinedDocument } from './types';
import { 
    DUMMY_USERS, DUMMY_SERVICE_TICKETS, 
    DUMMY_CALL_OUT_JOBS, DUMMY_SERVICE_LOGS, DUMMY_TICKET_ISSUES
} from './constants';
import clientService from './services/clientService';
import subAgreementService from './services/subAgreementService';
import { useMessages } from './contexts/MessageContext';

type ModalType = 'addClient' | 'editClient' | 'addAgreement' | 'editAgreement' | 'addTicket' | 'editTicket' | 'viewTicket' | 'addUser' | 'addJob' | 'editJob' | 'addSimpleLog' | 'addFullLog' | 'editLog' | 'viewLog' | 'addIssue' | 'generateTicket' | null;

// --- Utility Functions ---
const getDaysInMonth = (dateString: string): number => {
    const date = new Date(dateString + 'T00:00:00'); // Use local time
    const year = date.getFullYear();
    const month = date.getMonth();
    // Day 0 of next month gives the last day of the current month
    return new Date(year, month + 1, 0).getDate();
};

// --- Excel Generation Logic ---
const getDslExcelHtml = (log: DailyServiceLog, clientName: string): string => {
    const personnel = log.personnel || [];
    const equipmentUsed = log.equipmentUsed || [];
    const almansooriRep = log.almansooriRep || { name: '', position: '' };
    const mogApproval1 = log.mogApproval1 || { name: '', position: '' };
    const mogApproval2 = log.mogApproval2 || { name: '', position: '' };

    const daysInMonth = getDaysInMonth(log.date);

    const styles = {
        body: `font-family: Arial, sans-serif; font-size: 10pt;`,
        table: `border-collapse: collapse; width: 100%; border: 1px solid black;`,
        th: `border: 1px solid black; padding: 5px; text-align: center; font-weight: bold;`,
        td: `border: 1px solid black; padding: 5px; text-align: left;`,
        tdCenter: `border: 1px solid black; padding: 5px; text-align: center;`,
        noBorder: `border: none; padding: 5px;`,
        yellowBg: `background-color: #ffffcc;`,
        lightBlueBg: `background-color: #cce5ff;`,
        sectionTitle: `; background-color: #4472C4; color: white;`,
        approvalLabel: `border: 1px solid black; padding: 5px; font-weight: bold; width: 80px;`,
        approvalValue: `border: 1px solid black; padding: 5px; border-bottom: none;`
    };

    const colspan = 3 + daysInMonth + 1; // Serial + Name + Position + Days + Total

    let dayHeaders = '';
    for (let i = 1; i <= daysInMonth; i++) {
        dayHeaders += `<th style="${styles.th}" width="25">${i}</th>`;
    }

    const renderLogGrid = (items: PersonnelLogItem[] | EquipmentLogItem[]): string => {
        return items.map((item, index) => {
            let daysCells = '';
            const days = item.days || [];
            for (let i = 1; i <= daysInMonth; i++) {
                const isWorked = days.includes(i);
                daysCells += `<td style="${styles.tdCenter}">${isWorked ? '✓' : ''}</td>`;
            }
            const totalDays = days.length;
            
            return `
                <tr>
                    <td style="${styles.tdCenter}">${index + 1}</td>
                    <td style="${styles.td}">${item.name}</td>
                    <td style="${styles.td}">${'position' in item ? item.position : (item as EquipmentLogItem).quantity}</td>
                    ${daysCells}
                    <td style="${styles.tdCenter}">${totalDays}</td>
                </tr>
            `;
        }).join('');
    };

    const dateDisplay = new Date(log.date).toLocaleDateString('en-GB');

    return `
    <html>
    <head><meta charset="utf-8"><title>Daily Service Log</title></head>
    <body style="${styles.body}">
    <table style="${styles.table}">
        <tr style="${styles.yellowBg}">
            <td colspan="${Math.floor(colspan/2)}" style="${styles.td}"><b>Client :</b> ${clientName}</td>
            <td colspan="${Math.ceil(colspan/2)}" style="${styles.td}"><b>Contractor :</b> Almansoori Petroleum Services LLC</td>
        </tr>
        <tr style="${styles.yellowBg}">
            <td style="${styles.td}"><b>Contract :</b></td><td colspan="${Math.floor((colspan-4)/2)}" style="${styles.td}">${log.contract}</td>
            <td colspan="1"></td>
            <td style="${styles.td}"><b>Job No :</b></td><td colspan="${Math.ceil((colspan-4)/2)}" style="${styles.td}">${log.jobNo}</td>
        </tr>
        <tr style="${styles.yellowBg}">
            <td style="${styles.td}"><b>Field :</b></td><td colspan="${Math.floor((colspan-4)/2)}" style="${styles.td}">${log.field}</td>
            <td colspan="1"></td>
            <td style="${styles.td}"><b>Date :</b></td><td colspan="${Math.ceil((colspan-4)/2)}" style="${styles.td}">${dateDisplay}</td>
        </tr>
        <tr style="${styles.yellowBg}">
            <td style="${styles.td}"><b>Well :</b></td><td colspan="${Math.floor((colspan-4)/2)}" style="${styles.td}">${log.well}</td>
            <td colspan="1"></td>
            <td style="${styles.td}"><b>Report No :</b></td><td colspan="${Math.ceil((colspan-4)/2)}" style="${styles.td}">${log.logNumber}</td>
        </tr>
        <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
        
        <!-- Personnel Section -->
        <tr><th style="${styles.th}${styles.sectionTitle}" colspan="${colspan}">Personnel</th></tr>
        <tr style="${styles.lightBlueBg}">
            <th style="${styles.th}" width="30"></th>
            <th style="${styles.th}" width="200">Name</th>
            <th style="${styles.th}" width="150">Position</th>
            ${dayHeaders}
            <th style="${styles.th}" width="50">Days</th>
        </tr>
        ${renderLogGrid(personnel)}

        <!-- Equipment Section -->
        <tr><th style="${styles.th}${styles.sectionTitle}" colspan="${colspan}">EQUIPMENT</th></tr>
        <tr style="${styles.lightBlueBg}">
            <th style="${styles.th}"></th>
            <th style="${styles.th}">EQUIPMENT</th>
            <th style="${styles.th}">Qty</th>
            ${dayHeaders}
            <th style="${styles.th}">Days</th>
        </tr>
        ${renderLogGrid(equipmentUsed)}

        <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
        <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
        
        <!-- Approvals -->
        <tr>
            <td colspan="${Math.floor(colspan/3)}" style="font-weight: bold; text-align:center; ${styles.noBorder}">Almansoori Representative</td>
            <td colspan="${Math.ceil(colspan/3)}" style="font-weight: bold; text-align:center; ${styles.noBorder}">${clientName} Approval</td>
            <td colspan="${Math.floor(colspan/3)}" style="font-weight: bold; text-align:center; ${styles.noBorder}">${clientName} Approval</td>
        </tr>
        <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
        <tr>
            <td style="${styles.approvalLabel}">Name :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}">${almansooriRep.name}</td><td style="${styles.noBorder}" colspan="1"></td>
            <td style="${styles.approvalLabel}">Name :</td><td colspan="${Math.ceil(colspan/3) - 2}" style="${styles.approvalValue}">${mogApproval1.name}</td><td style="${styles.noBorder}" colspan="1"></td>
            <td style="${styles.approvalLabel}">Name :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}">${mogApproval2.name}</td>
        </tr>
         <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
        <tr>
            <td style="${styles.approvalLabel}">Position :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}">${almansooriRep.position}</td><td style="${styles.noBorder}" colspan="1"></td>
            <td style="${styles.approvalLabel}">Position :</td><td colspan="${Math.ceil(colspan/3) - 2}" style="${styles.approvalValue}">${mogApproval1.position}</td><td style="${styles.noBorder}" colspan="1"></td>
            <td style="${styles.approvalLabel}">Position :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}">${mogApproval2.position}</td>
        </tr>
         <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
        <tr>
            <td style="${styles.approvalLabel}">Date :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}"></td><td style="${styles.noBorder}" colspan="1"></td>
            <td style="${styles.approvalLabel}">Date :</td><td colspan="${Math.ceil(colspan/3) - 2}" style="${styles.approvalValue}"></td><td style="${styles.noBorder}" colspan="1"></td>
            <td style="${styles.approvalLabel}">Date :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}"></td>
        </tr>
         <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
        <tr>
            <td style="${styles.approvalLabel}">Signature :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}"></td><td style="${styles.noBorder}" colspan="1"></td>
            <td style="${styles.approvalLabel}">Signature :</td><td colspan="${Math.ceil(colspan/3) - 2}" style="${styles.approvalValue}"></td><td style="${styles.noBorder}" colspan="1"></td>
            <td style="${styles.approvalLabel}">Signature :</td><td colspan="${Math.floor(colspan/3) - 2}" style="${styles.approvalValue}"></td>
        </tr>
    </table>
    </body></html>
    `;
};

const downloadExcel = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// --- React Components ---
const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <>
        <dt className="col-span-1 font-semibold text-slate-500">{label}</dt>
        <dd className="col-span-2 text-slate-900">{children}</dd>
    </>
);

const DocumentLink: React.FC<{ doc: File, name?: string }> = ({ doc, name }) => (
    <a
        href={URL.createObjectURL(doc)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-brand-blue-600 hover:text-brand-blue-800 hover:underline group"
    >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="group-hover:underline">{name || doc.name}</span>
    </a>
);

// Main App Component
const MainApp: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('Dashboard');
    const { showMessage } = useMessages();
  
    // State for all data types
    const [clients, setClients] = useState<Client[]>([]);
    const [agreements, setAgreements] = useState<SubAgreement[]>([]);
    const [users, setUsers] = useState<User[]>(DUMMY_USERS);
    const [tickets, setTickets] = useState<ServiceTicket[]>(DUMMY_SERVICE_TICKETS);
    const [jobs, setJobs] = useState<CallOutJob[]>(DUMMY_CALL_OUT_JOBS);
    const [logs, setLogs] = useState<DailyServiceLog[]>(DUMMY_SERVICE_LOGS);
    const [issues, setIssues] = useState<TicketIssue[]>(DUMMY_TICKET_ISSUES);

    // Loading and API states
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [clientsLoaded, setClientsLoaded] = useState<boolean>(false);
    const [agreementsLoaded, setAgreementsLoaded] = useState<boolean>(false);
    const [clientsMap, setClientsMap] = useState<{ [key: string]: Client }>({});

    const [modalType, setModalType] = useState<ModalType>(null);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [editingAgreement, setEditingAgreement] = useState<SubAgreement | null>(null);
    const [editingTicket, setEditingTicket] = useState<ServiceTicket | null>(null);
    const [viewingTicket, setViewingTicket] = useState<ServiceTicket | null>(null);
    const [editingJob, setEditingJob] = useState<CallOutJob | null>(null);
    const [editingLog, setEditingLog] = useState<DailyServiceLog | null>(null);
    const [viewingLog, setViewingLog] = useState<DailyServiceLog | null>(null);

    // Modal Handlers
    const handleOpenEditClientModal = (client: Client) => {
        setEditingClient(client);
        setModalType('editClient');
    };

    const handleOpenEditAgreementModal = (agreement: SubAgreement) => {
        setEditingAgreement(agreement);
        setModalType('editAgreement');
    };
    
    const handleOpenEditTicketModal = (ticket: ServiceTicket) => {
        setEditingTicket(ticket);
        setModalType('editTicket');
    };
    
    const handleOpenViewTicketModal = (ticket: ServiceTicket) => {
        setViewingTicket(ticket);
        setModalType('viewTicket');
    };

    const handleOpenEditJobModal = (job: CallOutJob) => {
        setEditingJob(job);
        setModalType('editJob');
    };

    const handleOpenSimpleLogModal = () => {
        setModalType('addSimpleLog');
    };

    const handleOpenFullLogModal = () => {
        setModalType('addFullLog');
    };

    const handleOpenEditLogModal = (log: DailyServiceLog) => {
        setEditingLog(log);
        setModalType('editLog');
    };

    const handleOpenViewLogModal = (log: DailyServiceLog) => {
        setViewingLog(log);
        setModalType('viewLog');
    };

    const handleCloseModal = () => {
        setModalType(null);
        setEditingClient(null);
        setEditingAgreement(null);
        setEditingTicket(null);
        setViewingTicket(null);
        setEditingJob(null);
        setEditingLog(null);
        setViewingLog(null);
    };

    // Load clients from API
    useEffect(() => {
        const loadClients = async () => {
            if (clientsLoaded) return;
            
            try {
                setIsLoading(true);
                const response = await clientService.getClients();
                setClients(response.clients);
                setClientsLoaded(true);
            } catch (error) {
                console.error('Failed to load clients:', error);
                showMessage('error', 'Failed to load clients');
            } finally {
                setIsLoading(false);
            }
        };

        loadClients();
    }, [clientsLoaded, showMessage]);

    // Client CRUD Operations
    const handleCreateClient = async (clientData: Omit<Client, 'id'>) => {
        try {
            setIsLoading(true);
            const savedClient = await clientService.createClient(clientData);
            setClients(prev => [...prev, savedClient]);
            showMessage('success', 'Client created successfully');
            handleCloseModal();
        } catch (error) {
            console.error('Failed to create client:', error);
            showMessage('error', 'Failed to create client');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateClient = async (clientData: Client) => {
        try {
            setIsLoading(true);
            const updatedClient = await clientService.updateClient(clientData.id, clientData);
            setClients(prev => prev.map(c => c.id === clientData.id ? updatedClient : c));
            showMessage('success', 'Client updated successfully');
            handleCloseModal();
        } catch (error) {
            console.error('Failed to update client:', error);
            showMessage('error', 'Failed to update client');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClient = async (clientId: string) => {
        try {
            setIsLoading(true);
            await clientService.deleteClient(clientId);
            setClients(prev => prev.filter(c => c.id !== clientId));
            showMessage('success', 'Client deleted successfully');
        } catch (error) {
            console.error('Failed to delete client:', error);
            showMessage('error', 'Failed to delete client');
        } finally {
            setIsLoading(false);
        }
    };

    // Load sub-agreements from API
    useEffect(() => {
        const loadSubAgreements = async () => {
            if (agreementsLoaded) return;
            
            try {
                setIsLoading(true);
                const response = await subAgreementService.getSubAgreements();
                setAgreements(response.subAgreements);
                setClientsMap(response.clients);
                setAgreementsLoaded(true);
            } catch (error) {
                console.error('Failed to load sub-agreements:', error);
                showMessage('error', 'Failed to load sub-agreements');
            } finally {
                setIsLoading(false);
            }
        };

        loadSubAgreements();
    }, [agreementsLoaded, showMessage]);

    // Sub-Agreement CRUD Operations
    const handleCreateSubAgreement = async (agreementData: Omit<SubAgreement, 'id'>) => {
        try {
            setIsLoading(true);
            const savedAgreement = await subAgreementService.createSubAgreement(agreementData);
            setAgreements(prev => [...prev, savedAgreement]);
            showMessage('success', 'Sub-agreement created successfully');
            handleCloseModal();
        } catch (error) {
            console.error('Failed to create sub-agreement:', error);
            showMessage('error', 'Failed to create sub-agreement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSubAgreement = async (agreementData: SubAgreement) => {
        try {
            setIsLoading(true);
            const updatedAgreement = await subAgreementService.updateSubAgreement(agreementData.id, agreementData);
            setAgreements(prev => prev.map(a => a.id === agreementData.id ? updatedAgreement : a));
            showMessage('success', 'Sub-agreement updated successfully');
            handleCloseModal();
        } catch (error) {
            console.error('Failed to update sub-agreement:', error);
            showMessage('error', 'Failed to update sub-agreement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSubAgreement = async (agreementId: string) => {
        try {
            setIsLoading(true);
            await subAgreementService.deleteSubAgreement(agreementId);
            setAgreements(prev => prev.filter(a => a.id !== agreementId));
            showMessage('success', 'Sub-agreement deleted successfully');
        } catch (error) {
            console.error('Failed to delete sub-agreement:', error);
            showMessage('error', 'Failed to delete sub-agreement');
        } finally {
            setIsLoading(false);
        }
    };

    // Save Handlers
    const handleSaveClient = async (data: { id?: string, name: string; contacts: Omit<ContactPerson, 'id'>[]; logoFile: File | null }) => {
        const clientData = {
            name: data.name,
            contacts: data.contacts.map((contact, index) => ({
                ...contact, 
                id: data.id ? `con-${data.id}-${index}` : `con-${Date.now()}-${index}`
            })),
            logoFile: data.logoFile,
            logoUrl: data.logoFile ? URL.createObjectURL(data.logoFile) : `https://picsum.photos/seed/cli${Date.now()}/40/40`
        };

        if (data.id) {
            // Update existing client
            await handleUpdateClient({ id: data.id, ...clientData } as Client);
        } else {
            // Create new client
            await handleCreateClient(clientData);
        }
    };

    const handleSaveAgreement = async (data: any) => {
        const agreementData = {
            clientId: data.clientId,
            name: data.name,
            amount: data.amount,
            balance: data.balance || data.amount,
            startDate: data.startDate,
            endDate: data.endDate
        };

        if (data.id) {
            // Update existing agreement
            await handleUpdateSubAgreement({ id: data.id, ...agreementData } as SubAgreement);
        } else {
            // Create new agreement
            await handleCreateSubAgreement(agreementData);
        }
    };

    const handleSaveTicket = (data: any) => {
        if (data.id) {
            setTickets(prevTickets => prevTickets.map(ticket => {
                if (ticket.id === data.id) {
                    return { ...ticket, ...data };
                }
                return ticket;
            }));
        } else {
            const newTicket: ServiceTicket = { 
                ...data, 
                id: `tkt-${Date.now()}`,
                ticketNumber: `TKT-${String(tickets.length + 1).padStart(4, '0')}`
            };
            setTickets(prev => [newTicket, ...prev]);
        }
        handleCloseModal();
    };

    const handleSaveUser = (data: any) => {
        if (data.id) {
            setUsers(prevUsers => prevUsers.map(user => {
                if (user.id === data.id) {
                    return { ...user, ...data };
                }
                return user;
            }));
        } else {
            const newUser: User = { 
                ...data, 
                id: `usr-${Date.now()}`,
                avatarUrl: `https://picsum.photos/seed/usr${Date.now()}/40/40`
            };
            setUsers(prev => [newUser, ...prev]);
        }
        handleCloseModal();
    };

    const handleSaveJob = (data: any) => {
        if (data.id) {
            setJobs(prevJobs => prevJobs.map(job => {
                if (job.id === data.id) {
                    return { ...job, ...data };
                }
                return job;
            }));
        } else {
            const newJob: CallOutJob = { 
                ...data, 
                id: `job-${Date.now()}`
            };
            setJobs(prev => [newJob, ...prev]);
        }
        handleCloseModal();
    };

    const handleSaveLog = (data: any) => {
        if (data.id) {
            setLogs(prevLogs => prevLogs.map(log => {
                if (log.id === data.id) {
                    return { ...log, ...data };
                }
                return log;
            }));
        } else {
            const newLog: DailyServiceLog = { 
                ...data, 
                id: `log-${Date.now()}`,
                logNumber: `DSL-${String(logs.length + 1).padStart(4, '0')}`
            };
            setLogs(prev => [newLog, ...prev]);
        }
        handleCloseModal();
    };

    const handleSaveIssue = (data: any) => {
        const newIssue: TicketIssue = { 
            ...data, 
            id: `iss-${Date.now()}`,
            reportedDate: new Date().toISOString(),
            status: 'Open' as const
        };
        setIssues(prev => [newIssue, ...prev]);
        handleCloseModal();
    };

    const handleDownloadExcel = (log: DailyServiceLog) => {
        const client = clients.find(c => c.id === log.clientId);
        const clientName = client?.name || 'Unknown Client';
        const html = getDslExcelHtml(log, clientName);
        downloadExcel(html, `DSL-${log.logNumber}-${log.date}`);
    };

    // Derived data
    const combinedDocuments = useMemo((): CombinedDocument[] => {
        const allDocs: CombinedDocument[] = [];
        
        agreements.forEach(agg => {
            if (agg.file) {
                allDocs.push({
                    id: `doc-agg-${agg.id}`, 
                    name: agg.fileName || agg.file.name, 
                    type: 'Sub-Agreement',
                    size: agg.file.size, 
                    uploadDate: new Date(agg.file.lastModified).toISOString(),
                    clientId: agg.clientId, 
                    file: agg.file, 
                    sourceName: agg.name
                });
            }
        });

        return allDocs;
    }, [agreements, jobs, tickets, logs]);
    
    const openIssueCount = useMemo(() => issues.filter(i => i.status === 'Open').length, [issues]);
    const activeTicketCount = useMemo(() => tickets.filter(t => t.status !== 'Invoiced').length, [tickets]);

    const getModalTitle = () => {
        switch (modalType) {
            case 'addClient': return 'Add New Client';
            case 'editClient': return 'Edit Client';
            case 'addAgreement': return 'Add New Sub-Agreement';
            case 'editAgreement': return 'Edit Sub-Agreement';
            case 'addTicket': return 'Add New Service Ticket';
            case 'editTicket': return 'Edit Service Ticket';
            case 'viewTicket': return `Details for Ticket #${viewingTicket?.ticketNumber}`;
            case 'generateTicket': return 'Generate Service Ticket from Logs';
            case 'addUser': return 'Add New User';
            case 'addJob': return 'Add New Call-Out Job';
            case 'editJob': return 'Edit Call-Out Job';
            case 'addSimpleLog': return 'Add New Daily Service Log';
            case 'addFullLog': return 'Generate Daily Service Log';
            case 'editLog': return `Edit Daily Service Log #${editingLog?.logNumber}`;
            case 'viewLog': return `Details for Log #${viewingLog?.logNumber}`;
            case 'addIssue': return 'Report New Ticket Issue';
            default: return '';
        }
    };

    const renderModalContent = () => {
        const allJobsAndAgreements = [...agreements, ...jobs];
        switch (modalType) {
            case 'addClient':
                return <AddClientForm onSave={handleSaveClient} onCancel={handleCloseModal} />;
            case 'editClient':
                return <AddClientForm onSave={handleSaveClient} onCancel={handleCloseModal} initialData={editingClient} />;
            case 'addAgreement':
                return <AddSubAgreementForm clients={clients} onSave={handleSaveAgreement} onCancel={handleCloseModal} />;
            case 'editAgreement':
                return <AddSubAgreementForm clients={clients} onSave={handleSaveAgreement} onCancel={handleCloseModal} initialData={editingAgreement} />;
            case 'addTicket':
                return <AddServiceTicketForm clients={clients} agreements={agreements} jobs={jobs} onSave={handleSaveTicket} onCancel={handleCloseModal} />;
            case 'editTicket':
                return <AddServiceTicketForm clients={clients} agreements={agreements} jobs={jobs} onSave={handleSaveTicket} onCancel={handleCloseModal} initialData={editingTicket} />;
            case 'generateTicket':
                return <GenerateServiceTicketForm clients={clients} agreements={agreements} jobs={jobs} availableLogs={logs} onSave={handleSaveTicket} onCancel={handleCloseModal} />;
            case 'viewTicket':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <DetailItem label="Ticket Number">{viewingTicket?.ticketNumber}</DetailItem>
                            <DetailItem label="Client">{clients.find(c => c.id === viewingTicket?.clientId)?.name}</DetailItem>
                            <DetailItem label="Sub-Agreement">{agreements.find(a => a.id === viewingTicket?.subAgreementId)?.name}</DetailItem>
                            <DetailItem label="Status">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    viewingTicket?.status === 'In Field to Sign' && 'bg-yellow-100 text-yellow-800' ||
                                    viewingTicket?.status === 'Issue' && 'bg-red-100 text-red-800' ||
                                    viewingTicket?.status === 'Delivered' && 'bg-blue-100 text-blue-800' ||
                                    viewingTicket?.status === 'Invoiced' && 'bg-green-100 text-green-800'
                                }`}>
                                    {viewingTicket?.status}
                                </span>
                            </DetailItem>
                            <DetailItem label="Date">{viewingTicket?.date ? new Date(viewingTicket.date).toLocaleDateString() : ''}</DetailItem>
                            <DetailItem label="Amount">${viewingTicket?.amount?.toLocaleString()}</DetailItem>
                        </div>
                    </div>
                );
                );
            case 'addUser':
                return <AddUserForm onSave={handleSaveUser} onCancel={handleCloseModal} />;
            case 'addJob':
                return <AddCallOutJobForm clients={clients} onSave={handleSaveJob} onCancel={handleCloseModal} />;
            case 'editJob':
                return <AddCallOutJobForm clients={clients} onSave={handleSaveJob} onCancel={handleCloseModal} initialData={editingJob} />;
            case 'addSimpleLog':
                return <AddSimpleDailyServiceLogForm clients={clients} jobs={allJobsAndAgreements} onSave={handleSaveLog} onCancel={handleCloseModal} />;
            case 'addFullLog':
                return <AddFullDailyServiceLogForm clients={clients} jobs={allJobsAndAgreements} isGenerating={false} onSave={handleSaveLog} onCancel={handleCloseModal} />;
            case 'editLog':
                return <AddFullDailyServiceLogForm clients={clients} jobs={allJobsAndAgreements} isGenerating={false} onSave={handleSaveLog} onCancel={handleCloseModal} initialData={editingLog} />;
            case 'viewLog':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <DetailItem label="Log Number">{viewingLog?.logNumber}</DetailItem>
                            <DetailItem label="Client">{clients.find(c => c.id === viewingLog?.clientId)?.name}</DetailItem>
                            <DetailItem label="Date">{viewingLog?.date ? new Date(viewingLog.date).toLocaleDateString() : ''}</DetailItem>
                            <DetailItem label="Field">{viewingLog?.field}</DetailItem>
                            <DetailItem label="Well">{viewingLog?.well}</DetailItem>
                            <DetailItem label="Contract">{viewingLog?.contract}</DetailItem>
                            <DetailItem label="Job No">{viewingLog?.jobNo}</DetailItem>
                        </div>

                        {/* Personnel Section */}
                        {viewingLog?.personnel && viewingLog.personnel.length > 0 && (
                            <div>
                                <h4 className="font-medium text-slate-900 mb-2">Personnel</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-slate-500">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Name</th>
                                                <th className="px-3 py-2 text-left">Position</th>
                                                <th className="px-3 py-2 text-center">Days Worked</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {viewingLog.personnel.map((person, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="px-3 py-2">{person.name}</td>
                                                    <td className="px-3 py-2">{person.position}</td>
                                                    <td className="px-3 py-2 text-center">{person.days?.length || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Equipment Section */}
                        {viewingLog?.equipmentUsed && viewingLog.equipmentUsed.length > 0 && (
                            <div>
                                <h4 className="font-medium text-slate-900 mb-2">Equipment Used</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-slate-500">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Equipment</th>
                                                <th className="px-3 py-2 text-left">Quantity</th>
                                                <th className="px-3 py-2 text-center">Days Used</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {viewingLog.equipmentUsed.map((equipment, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="px-3 py-2">{equipment.name}</td>
                                                    <td className="px-3 py-2">{equipment.quantity}</td>
                                                    <td className="px-3 py-2 text-center">{equipment.days?.length || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => handleDownloadExcel(viewingLog!)}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Download Excel
                            </button>
                        </div>
                    </div>
                );
            case 'addIssue':
                return <AddTicketIssueForm tickets={tickets} onSave={handleSaveIssue} onCancel={handleCloseModal} />;
            default:
                return null;
        }
    };
    
    const renderContent = () => {
        switch (activeView) {
            case 'Dashboard':
                return <Dashboard 
                         clients={clients}
                         tickets={tickets} 
                         agreements={agreements} 
                         openIssueCount={openIssueCount} 
                         activeTicketCount={activeTicketCount}
                         documentCount={combinedDocuments.length}
                       />;
            case 'Clients':
                return <Clients 
                    clients={clients} 
                    onAdd={() => setModalType('addClient')} 
                    onEdit={handleOpenEditClientModal}
                    onDelete={handleDeleteClient}
                    isLoading={isLoading}
                />;
            case 'Sub-Agreements':
                return <SubAgreements 
                    agreements={agreements} 
                    clients={clients} 
                    tickets={tickets} 
                    onAdd={() => setModalType('addAgreement')} 
                    onEdit={handleOpenEditAgreementModal}
                    onDelete={handleDeleteSubAgreement}
                    isLoading={isLoading}
                />;
            case 'Daily Service Logs':
                return <DailyServiceLogs 
                    logs={logs}
                    clients={clients}
                    jobs={[...agreements, ...jobs]}
                    onAdd={handleOpenSimpleLogModal}
                    onGenerate={handleOpenFullLogModal}
                    onEdit={handleOpenEditLogModal}
                    onView={handleOpenViewLogModal}
                />;
            case 'Service Tickets':
                return <ServiceTickets 
                    tickets={tickets}
                    clients={clients}
                    onAdd={() => setModalType('addTicket')}
                    onGenerate={() => setModalType('generateTicket')}
                    onEdit={handleOpenEditTicketModal}
                    onView={handleOpenViewTicketModal}
                />;
            case 'Call-Out Jobs':
                return <CallOutJobs 
                    jobs={jobs}
                    clients={clients}
                    onAdd={() => setModalType('addJob')}
                    onEdit={handleOpenEditJobModal}
                />;
            case 'Ticket Issues':
                return <TicketIssues 
                    issues={issues}
                    tickets={tickets}
                    onAdd={() => setModalType('addIssue')}
                />;
            case 'Document Archive':
                return <DocumentArchive documents={combinedDocuments} clients={clients} />;
            case 'User Management':
                return <UserManagement users={users} onAdd={() => setModalType('addUser')}/>;
            default:
                return <Dashboard 
                         clients={clients}
                         tickets={tickets} 
                         agreements={agreements}
                         openIssueCount={openIssueCount} 
                         activeTicketCount={activeTicketCount}
                         documentCount={combinedDocuments.length}
                        />;
        }
    };
    
    const largeModals: (ModalType|null)[] = ['addClient', 'editClient', 'addFullLog', 'editLog', 'generateTicket'];

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 flex flex-col ml-64">
                <Header activeView={activeView} />
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
            <Modal isOpen={modalType !== null} onClose={handleCloseModal} title={getModalTitle()} size={largeModals.includes(modalType) ? 'xl' : 'md'}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default MainApp;
