
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import SubAgreements from './components/SubAgreements';
import ServiceTickets, { getStatusColor } from './components/ServiceTickets';
import UserManagement from './components/UserManagement';
import TicketIssues from './components/TicketIssues';
import DocumentArchive from './components/DocumentArchive';
import DailyServiceLogs from './components/DailyServiceLogs';
import CallOutJobs from './components/CallOutJobs';
import Modal from './components/Modal';
import { AddClientForm, AddSubAgreementForm, AddServiceTicketForm, AddUserForm, AddCallOutJobForm, AddFullDailyServiceLogForm, AddSimpleDailyServiceLogForm, AddTicketIssueForm, GenerateServiceTicketForm } from './components/AddForms';

import { View, Client, SubAgreement, User, ServiceTicket, TicketIssue, CallOutJob, DailyServiceLog, ContactPerson, PersonnelLogItem, EquipmentLogItem, CombinedDocument } from './types';
import { 
    DUMMY_CLIENTS, DUMMY_SUB_AGREEMENTS, DUMMY_USERS, DUMMY_SERVICE_TICKETS, 
    DUMMY_CALL_OUT_JOBS, DUMMY_SERVICE_LOGS, DUMMY_TICKET_ISSUES
} from './constants';

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
        header: `font-size: 16pt; font-weight: bold; text-align: center; border: none;`,
        subheader: `font-size: 12pt; font-weight: bold; text-align: center; border: none;`,
        sectionTitle: `font-weight: bold; background-color: #DDEBF7;`,
        yellowBg: `background-color: #FFFF00; border: 1px solid black; padding: 5px;`,
        lightBlueBg: `background-color: #DDEBF7;`,
        noBorder: `border: none; padding: 5px;`,
        approvalLabel: `border: none; text-align: left; padding: 2px 5px;`,
        approvalValue: `border: none; border-bottom: 1px solid black; text-align: left; padding: 2px 5px;`,
    };

    const renderLogGrid = (items: (PersonnelLogItem | EquipmentLogItem)[]) => {
        return items.map((item, index) => {
            const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
                const status = item.dailyStatus[i] || '';
                return `<td style="${styles.tdCenter}">${status}</td>`;
            }).join('');
            const daysCount = item.dailyStatus.filter(s => s === 'X' || s === 'T').length;
            
            let firstCells = '';
            if ('position' in item) { // Personnel
                firstCells = `<td style="${styles.tdCenter}">${index + 1}</td><td style="${styles.td}">${item.name}</td><td style="${styles.td}">${item.position}</td>`;
            } else { // Equipment
                firstCells = `<td style="${styles.tdCenter}">${index + 1}</td><td style="${styles.td}">${item.name}</td><td style="${styles.tdCenter}">${item.quantity}</td>`;
            }

            return `<tr>${firstCells}${dayCells}<td style="${styles.tdCenter}">${daysCount}</td></tr>`;
        }).join('');
    };

    const dayHeaders = Array.from({length: daysInMonth}, (_, i) => `<th style="${styles.th}${styles.lightBlueBg}">${i+1}</th>`).join('');
    const colspan = 4 + daysInMonth;
    const logDateFormatted = new Date(log.date + 'T00:00:00'); // Ensure date is parsed as local
    const dateDisplay = logDateFormatted.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });


    return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
    <body style="${styles.body}">
    <table style="${styles.table}">
        <tr>
            <td colspan="5" style="${styles.noBorder}"><img src="https://i.imgur.com/gX1t1q4.png" alt="logo" width="200"></td>
            <td colspan="${colspan - 10}" style="${styles.header}">DAILY SERVICES LOG</td>
            <td colspan="5" style="${styles.noBorder}"><img src="https://i.imgur.com/8aR8qk7.png" alt="vision" width="80"></td>
        </tr>
        <tr><td colspan="${colspan}" style="${styles.subheader}">N: ${log.logNumber}</td></tr>
        <tr><td colspan="${colspan}" style="${styles.noBorder}">&nbsp;</td></tr>
        <tr style="${styles.yellowBg}">
            <td style="${styles.td}"><b>Client :</b></td><td colspan="${Math.floor((colspan-4)/2)}" style="${styles.td}">${clientName}</td>
            <td colspan="1"></td>
            <td style="${styles.td}"><b>Contract :</b></td><td colspan="${Math.ceil((colspan-4)/2)}" style="${styles.td}">${log.contract}</td>
        </tr>
        <tr style="${styles.yellowBg}">
            <td style="${styles.td}"><b>Field :</b></td><td colspan="${Math.floor((colspan-4)/2)}" style="${styles.td}">${log.field}</td>
            <td colspan="1"></td>
            <td style="${styles.td}"><b>Job No :</b></td><td colspan="${Math.ceil((colspan-4)/2)}" style="${styles.td}">${log.jobNo}</td>
        </tr>
        <tr style="${styles.yellowBg}">
            <td style="${styles.td}"><b>Well :</b></td><td colspan="${Math.floor((colspan-4)/2)}" style="${styles.td}">${log.well}</td>
            <td colspan="1"></td>
            <td style="${styles.td}"><b>Date :</b></td><td colspan="${Math.ceil((colspan-4)/2)}" style="${styles.td}">${dateDisplay}</td>
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-brand-blue-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        <span>{name || doc.name}</span>
    </a>
);


const ServiceTicketDetailsView: React.FC<{ ticket: ServiceTicket; clients: Client[]; agreements: SubAgreement[]; jobs: CallOutJob[] }> = ({ ticket, clients, agreements, jobs }) => {
    const client = clients.find(c => c.id === ticket.clientId);
    const agreement = agreements.find(a => a.id === ticket.subAgreementId);
    const job = jobs.find(j => j.id === ticket.callOutJobId);

    return (
        <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
                <DetailItem label="Ticket #"><span className="font-medium">{ticket.ticketNumber}</span></DetailItem>
                <DetailItem label="Status">
                    <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                    </span>
                </DetailItem>
                <DetailItem label="Client">{client?.name || 'N/A'}</DetailItem>
                <DetailItem label="Date">{new Date(ticket.date).toLocaleDateString()}</DetailItem>
                <DetailItem label="Amount">${ticket.amount.toLocaleString()}</DetailItem>
                <DetailItem label="Linked To">{agreement?.name || job?.jobName || 'N/A'}</DetailItem>
                <DetailItem label="Related Logs">{ticket.relatedLogIds.join(', ') || 'None'}</DetailItem>

                <dt className="col-span-3 font-semibold text-slate-500 pt-2 border-t mt-2">Documents</dt>
                <dd className="col-span-3 text-slate-900">
                     {ticket.documents.length > 0 ? (
                        <ul className="list-inside space-y-1">
                            {ticket.documents.map((doc, index) => <li key={index}><DocumentLink doc={doc}/></li>)}
                        </ul>
                    ) : (
                        <span className="text-sm text-slate-500">None</span>
                    )}
                </dd>
            </dl>
        </div>
    );
};

const DailyServiceLogDetailsView: React.FC<{ log: DailyServiceLog; clients: Client[]; jobs: (SubAgreement | CallOutJob)[] }> = ({ log, clients, jobs }) => {
    const client = clients.find(c => c.id === log.clientId);
    const linkedJob = log.linkedJobId ? jobs.find(j => j.id === log.linkedJobId) : null;
    const linkedJobName = linkedJob ? ('jobName' in linkedJob ? linkedJob.jobName : linkedJob.name) : null;

    const renderItems = (items: (PersonnelLogItem | EquipmentLogItem)[]) => (
         <ul className="list-disc list-inside space-y-1">
            {items.map(item => {
                const totalDays = item.dailyStatus.filter(s => s).length;
                return (
                    <li key={item.id}>
                        {item.name}{' '}
                        {'position' in item && <span className="text-slate-500">({item.position})</span>}
                        {'quantity' in item && <span className="text-slate-500">(Qty: {item.quantity})</span>}
                        <span className="text-slate-500"> - {totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
                    </li>
                );
            })}
        </ul>
    );

    return (
        <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
                <DetailItem label="Log #"><span className="font-medium">{log.logNumber}</span></DetailItem>
                <DetailItem label="Client">{client?.name || 'N/A'}</DetailItem>
                <DetailItem label="Date">{new Date(log.date + 'T00:00:00').toLocaleDateString()}</DetailItem>
                <DetailItem label="Field">{log.field}</DetailItem>
                <DetailItem label="Well">{log.well}</DetailItem>
                <DetailItem label="Job / Agreement">{linkedJobName || log.jobNo || 'N/A'}</DetailItem>

                {log.personnel && log.personnel.length > 0 && (
                    <>
                        <dt className="col-span-3 font-semibold text-slate-500 pt-2 border-t mt-2">Personnel</dt>
                        <dd className="col-span-3 text-slate-900">{renderItems(log.personnel)}</dd>
                    </>
                )}

                {log.equipmentUsed && log.equipmentUsed.length > 0 && (
                    <>
                        <dt className="col-span-3 font-semibold text-slate-500 pt-2 border-t mt-2">Equipment Used</dt>
                        <dd className="col-span-3 text-slate-900">{renderItems(log.equipmentUsed)}</dd>
                    </>
                )}
                
                {(log.almansooriRep?.name || log.mogApproval1?.name || log.mogApproval2?.name) && (
                     <>
                        <dt className="col-span-3 font-semibold text-slate-500 pt-2 border-t mt-2">Approvers</dt>
                        <dd className="col-span-3 text-slate-900 space-y-1">
                            {log.almansooriRep?.name && <p><b>Almansoori:</b> {`${log.almansooriRep.name} (${log.almansooriRep.position})`}</p>}
                            {log.mogApproval1?.name && <p><b>{client?.name || 'Client'} Appr. 1:</b> {`${log.mogApproval1.name} (${log.mogApproval1.position})`}</p>}
                            {log.mogApproval2?.name && <p><b>{client?.name || 'Client'} Appr. 2:</b> {`${log.mogApproval2.name} (${log.mogApproval2.position})`}</p>}
                        </dd>
                    </>
                )}

                {(log.excelFile || log.pdfFile) && (
                    <>
                        <dt className="col-span-3 font-semibold text-slate-500 pt-2 border-t mt-2">Attached Files</dt>
                        <dd className="col-span-3 text-slate-900 space-y-1">
                            {log.excelFile && <DocumentLink doc={log.excelFile} name={log.excelFileName} />}
                            {log.pdfFile && <DocumentLink doc={log.pdfFile} name={log.pdfFileName} />}
                        </dd>
                    </>
                )}
            </dl>
        </div>
    );
};


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Dashboard');
  
  // State for all data types
  const [clients, setClients] = useState<Client[]>(DUMMY_CLIENTS);
  const [agreements, setAgreements] = useState<SubAgreement[]>(DUMMY_SUB_AGREEMENTS);
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [tickets, setTickets] = useState<ServiceTicket[]>(DUMMY_SERVICE_TICKETS);
  const [jobs, setJobs] = useState<CallOutJob[]>(DUMMY_CALL_OUT_JOBS);
  const [logs, setLogs] = useState<DailyServiceLog[]>(DUMMY_SERVICE_LOGS);
  const [issues, setIssues] = useState<TicketIssue[]>(DUMMY_TICKET_ISSUES);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingAgreement, setEditingAgreement] = useState<SubAgreement | null>(null);
  const [editingTicket, setEditingTicket] = useState<ServiceTicket | null>(null);
  const [viewingTicket, setViewingTicket] = useState<ServiceTicket | null>(null);
  const [editingJob, setEditingJob] = useState<CallOutJob | null>(null);
  const [editingLog, setEditingLog] = useState<DailyServiceLog | null>(null);
  const [viewingLog, setViewingLog] = useState<DailyServiceLog | null>(null);


  // --- MODAL HANDLERS ---
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


  // --- SAVE HANDLERS ---
  const handleSaveClient = (data: { id?: string, name: string; contacts: Omit<ContactPerson, 'id'>[]; logoFile: File | null }) => {
    if (data.id) {
        setClients(prevClients => prevClients.map(client => {
            if (client.id === data.id) {
                const existingLogoUrl = client.logoUrl;
                return {
                    ...client,
                    name: data.name,
                    logoFile: data.logoFile,
                    logoUrl: data.logoFile ? URL.createObjectURL(data.logoFile) : existingLogoUrl,
                    contacts: data.contacts.map((contact, index) => ({...contact, id: `con-${data.id}-${index}`}))
                };
            }
            return client;
        }));
    } 
    else {
        const newClient: Client = { 
          id: `cli-${Date.now()}`, 
          name: data.name,
          logoFile: data.logoFile,
          logoUrl: data.logoFile ? URL.createObjectURL(data.logoFile) : `https://picsum.photos/seed/cli${Date.now()}/40/40`,
          contacts: data.contacts.map((contact, index) => ({...contact, id: `con-${Date.now()}-${index}`}))
        };
        setClients(prev => [newClient, ...prev]);
    }
    handleCloseModal();
  };

  const handleSaveAgreement = (data: any) => {
    if (data.id) {
      setAgreements(prevAgreements => prevAgreements.map(agreement => {
        if (agreement.id === data.id) {
          return { ...agreement, ...data };
        }
        return agreement;
      }));
    } 
    else {
      const newAgreement: SubAgreement = { 
        ...data, 
        id: `sub-${Date.now()}`, 
        balance: data.amount
      };
      setAgreements(prev => [newAgreement, ...prev]);
    }
    handleCloseModal();
  };

  const handleSaveTicket = (data: Partial<ServiceTicket> & { ticketNumber: string }) => {
    // EDIT
    if (data.id) {
        const originalTicket = tickets.find(t => t.id === data.id);
        if (!originalTicket) {
            handleCloseModal();
            return;
        }

        const updatedTicket = { ...originalTicket, ...data } as ServiceTicket;
        setTickets(prevTickets => prevTickets.map(t => t.id === data.id ? updatedTicket : t));

        // Update agreement balances intelligently
        setAgreements(prev => {
            let newAgreements = [...prev];
            // 1. Revert old balance deduction if there was an old agreement
            if (originalTicket.subAgreementId) {
                 newAgreements = newAgreements.map(agg => 
                    agg.id === originalTicket.subAgreementId 
                        ? { ...agg, balance: agg.balance + originalTicket.amount } 
                        : agg
                );
            }
            // 2. Apply new balance deduction if there is a new agreement
            if (updatedTicket.subAgreementId) {
                newAgreements = newAgreements.map(agg =>
                    agg.id === updatedTicket.subAgreementId
                        ? { ...agg, balance: agg.balance - updatedTicket.amount }
                        : agg
                );
            }
            return newAgreements;
        });
    } 
    // CREATE
    else {
        const newTicket: ServiceTicket = { 
            ...(data as Omit<ServiceTicket, 'id'>), 
            id: `st-${Date.now()}` 
        };
        setTickets(prev => [newTicket, ...prev]);
        
        if(newTicket.subAgreementId) {
            setAgreements(prev => prev.map(agg => agg.id === newTicket.subAgreementId ? {...agg, balance: agg.balance - newTicket.amount} : agg));
        }
    }
    handleCloseModal();
  };

  const handleSaveGeneratedTicket = (data: any) => {
    const newTicket: ServiceTicket = { 
        id: `st-${Date.now()}`,
        ticketNumber: data.ticketNumber,
        clientId: data.clientId,
        subAgreementId: data.subAgreementId,
        callOutJobId: data.callOutJobId,
        date: data.date,
        status: 'Delivered', // Default status for generated tickets
        amount: data.amount,
        relatedLogIds: data.relatedLogIds,
        documents: data.documents,
    };
    setTickets(prev => [newTicket, ...prev]);
    
    if(newTicket.subAgreementId) {
        setAgreements(prev => prev.map(agg => agg.id === newTicket.subAgreementId ? {...agg, balance: agg.balance - newTicket.amount} : agg));
    }
    handleCloseModal();
  };
  
  const handleSaveUser = (data: Omit<User, 'id' | 'avatarUrl'>) => {
    const newUser: User = { ...data, id: `user-${Date.now()}`, avatarUrl: `https://picsum.photos/seed/user${Date.now()}/40/40`};
    setUsers(prev => [newUser, ...prev]);
    handleCloseModal();
  };

  const handleSaveJob = (data: Partial<CallOutJob>) => {
    if (data.id) {
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === data.id ? { ...job, ...data } as CallOutJob : job
      ));
    } else {
      const newJob: CallOutJob = { ...(data as Omit<CallOutJob, 'id'>), id: `coj-${Date.now()}`};
      setJobs(prev => [newJob, ...prev]);
    }
    handleCloseModal();
  };

  const handleSaveLog = (data: Partial<DailyServiceLog>) => {
     let savedLog: DailyServiceLog;
     let shouldGenerateExcel = false;

     if (data.id) { // Editing
      savedLog = { ...logs.find(l => l.id === data.id)!, ...data } as DailyServiceLog;
      setLogs(prevLogs => prevLogs.map(log => 
        log.id === data.id ? savedLog : log
      ));
    } else { // Creating
      savedLog = {
        id: `dsl-${Date.now()}`,
        ...(data as Omit<DailyServiceLog, 'id'>), 
      };
      setLogs(prev => [savedLog, ...prev]);
    }
    
    // Check if it's a "detailed" log that should have an Excel file generated
    shouldGenerateExcel = !!(savedLog.personnel?.length || savedLog.equipmentUsed?.length);
    
    if (shouldGenerateExcel) {
        const clientName = clients.find(c => c.id === savedLog.clientId)?.name || 'Unknown Client';
        const excelHtml = getDslExcelHtml(savedLog, clientName);
        downloadExcel(excelHtml, `DSL-${savedLog.logNumber.replace(/[\/\\]/g, '-')}`);
    }

    handleCloseModal();
  };

  const handleSaveIssue = (data: Omit<TicketIssue, 'id'>) => {
    const newIssue: TicketIssue = { ...data, id: `iss-${Date.now()}`};
    setIssues(prev => [newIssue, ...prev]);
    handleCloseModal();
  };

  // --- DERIVED DATA FOR CHILD COMPONENTS ---
  const combinedDocuments = useMemo((): CombinedDocument[] => {
    const allDocs: CombinedDocument[] = [];
    
    agreements.forEach(agg => {
        if (agg.file) {
            allDocs.push({
                id: `doc-agg-${agg.id}`, name: agg.fileName || agg.file.name, type: 'Sub-Agreement',
                size: agg.file.size, uploadDate: new Date(agg.file.lastModified).toISOString(),
                clientId: agg.clientId, file: agg.file, sourceName: agg.name
            });
        }
    });

    jobs.forEach(job => {
        job.documents.forEach((doc, index) => {
             allDocs.push({
                id: `doc-job-${job.id}-${index}`, name: doc.name, type: 'Call-Out Job',
                size: doc.size, uploadDate: new Date(doc.lastModified).toISOString(),
                clientId: job.clientId, file: doc, sourceName: job.jobName
            });
        });
    });

    tickets.forEach(ticket => {
        ticket.documents.forEach((doc, index) => {
             allDocs.push({
                id: `doc-tkt-${ticket.id}-${index}`, name: doc.name, type: 'Service Ticket',
                size: doc.size, uploadDate: new Date(doc.lastModified).toISOString(),
                clientId: ticket.clientId, file: doc, sourceName: ticket.ticketNumber
            });
        });
    });

    logs.forEach(log => {
        if (log.excelFile) {
             allDocs.push({
                id: `doc-log-xls-${log.id}`, name: log.excelFileName || log.excelFile.name, type: 'Daily Service Log (Excel)',
                size: log.excelFile.size, uploadDate: new Date(log.excelFile.lastModified).toISOString(),
                clientId: log.clientId, file: log.excelFile, sourceName: log.logNumber
            });
        }
        if (log.pdfFile) {
             allDocs.push({
                id: `doc-log-pdf-${log.id}`, name: log.pdfFileName || log.pdfFile.name, type: 'Daily Service Log (PDF)',
                size: log.pdfFile.size, uploadDate: new Date(log.pdfFile.lastModified).toISOString(),
                clientId: log.clientId, file: log.pdfFile, sourceName: log.logNumber
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
        return <AddServiceTicketForm clients={clients} agreements={agreements} jobs={jobs} onSave={handleSaveTicket} onCancel={handleCloseModal} initialData={editingTicket}/>;
      case 'viewTicket':
        return viewingTicket && <ServiceTicketDetailsView ticket={viewingTicket} clients={clients} agreements={agreements} jobs={jobs} />;
      case 'generateTicket':
        const allUsedLogIds = new Set(tickets.flatMap(t => t.relatedLogIds));
        const availableLogs = logs.filter(log => 
            !allUsedLogIds.has(log.id) && 
            ((log.personnel && log.personnel.length > 0) || (log.equipmentUsed && log.equipmentUsed.length > 0))
        );
        return <GenerateServiceTicketForm 
                  clients={clients} 
                  agreements={agreements}
                  jobs={jobs}
                  availableLogs={availableLogs}
                  onSave={handleSaveGeneratedTicket}
                  onCancel={handleCloseModal}
                />;
      case 'addUser':
        return <AddUserForm onSave={handleSaveUser} onCancel={handleCloseModal} />;
      case 'addJob':
        return <AddCallOutJobForm clients={clients} onSave={handleSaveJob} onCancel={handleCloseModal} />;
      case 'editJob':
        return <AddCallOutJobForm clients={clients} onSave={handleSaveJob} onCancel={handleCloseModal} initialData={editingJob} />;
      case 'addSimpleLog':
        return <AddSimpleDailyServiceLogForm clients={clients} jobs={allJobsAndAgreements} onSave={handleSaveLog} onCancel={handleCloseModal} />;
      case 'addFullLog':
        return <AddFullDailyServiceLogForm clients={clients} jobs={allJobsAndAgreements} onSave={handleSaveLog} onCancel={handleCloseModal} isGenerating={true} initialData={null} />;
      case 'editLog':
        return <AddFullDailyServiceLogForm clients={clients} jobs={allJobsAndAgreements} onSave={handleSaveLog} onCancel={handleCloseModal} initialData={editingLog} isGenerating={true} />;
       case 'viewLog':
        return viewingLog && <DailyServiceLogDetailsView log={viewingLog} clients={clients} jobs={allJobsAndAgreements} />;
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
        return <Clients clients={clients} onAdd={() => setModalType('addClient')} onEdit={handleOpenEditClientModal} />;
      case 'Sub-Agreements':
        return <SubAgreements agreements={agreements} clients={clients} tickets={tickets} onAdd={() => setModalType('addAgreement')} onEdit={handleOpenEditAgreementModal} />;
      case 'Service Tickets':
        return <ServiceTickets tickets={tickets} clients={clients} onAdd={() => setModalType('addTicket')} onGenerate={() => setModalType('generateTicket')} onView={handleOpenViewTicketModal} onEdit={handleOpenEditTicketModal} />;
      case 'User Management':
        return <UserManagement users={users} onAdd={() => setModalType('addUser')}/>;
      case 'Call-Out Jobs':
        return <CallOutJobs jobs={jobs} clients={clients} onAdd={() => setModalType('addJob')} onEdit={handleOpenEditJobModal} />;
      case 'Daily Service Logs':
        return <DailyServiceLogs logs={logs} clients={clients} jobs={[...agreements, ...jobs]} onAdd={handleOpenSimpleLogModal} onGenerate={handleOpenFullLogModal} onEdit={handleOpenEditLogModal} onView={handleOpenViewLogModal} />;
      case 'Ticket Issues':
        return <TicketIssues issues={issues} tickets={tickets} onAdd={() => setModalType('addIssue')} />;
      case 'Document Archive':
        return <DocumentArchive documents={combinedDocuments} clients={clients} />;
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

export default App;