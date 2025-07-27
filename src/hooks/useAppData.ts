import { useState, useEffect, useMemo } from 'react';
import { 
  Client, 
  SubAgreement, 
  User, 
  ServiceTicket, 
  CallOutJob, 
  DailyServiceLog, 
  TicketIssue,
  CombinedDocument 
} from '../types';
import { 
  DUMMY_USERS, 
  DUMMY_SERVICE_TICKETS, 
  DUMMY_CALL_OUT_JOBS, 
  DUMMY_SERVICE_LOGS, 
  DUMMY_TICKET_ISSUES 
} from '../constants';
import clientService from '../services/clientService';
import subAgreementService from '../services/subAgreementService';
import { useMessages } from '../contexts/MessageContext';

/**
 * Custom hook for managing all application data
 */
export const useAppData = () => {
  // State for all data types
  const [clients, setClients] = useState<Client[]>([]);
  const [agreements, setAgreements] = useState<SubAgreement[]>([]);
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [tickets, setTickets] = useState<ServiceTicket[]>(DUMMY_SERVICE_TICKETS);
  const [jobs, setJobs] = useState<CallOutJob[]>(DUMMY_CALL_OUT_JOBS);
  const [logs, setLogs] = useState<DailyServiceLog[]>(DUMMY_SERVICE_LOGS);
  const [issues, setIssues] = useState<TicketIssue[]>(DUMMY_TICKET_ISSUES);
  const [loading, setLoading] = useState(false);

  const { showMessage } = useMessages();

  // Load data on mount
  useEffect(() => {
    loadClients();
    loadAgreements();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getClients();
      setClients(data.clients);
    } catch (error) {
      showMessage('error', 'Failed to load clients');
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgreements = async () => {
    try {
      setLoading(true);
      const data = await subAgreementService.getSubAgreements();
      setAgreements(data.subAgreements);
    } catch (error) {
      showMessage('error', 'Failed to load sub-agreements');
      console.error('Failed to load sub-agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  // API handlers for clients
  const handleSaveClient = async (data: { id?: string, name: string; contacts: any[]; logoFile: File | null }) => {
    try {
      setLoading(true);
      if (data.id) {
        const updatedClient = await clientService.updateClient(data.id, {
          name: data.name,
          contacts: data.contacts
        });
        setClients(prevClients => prevClients.map(client => 
          client.id === data.id ? updatedClient : client
        ));
        showMessage('success', 'Client updated successfully');
      } else {
        const newClient = await clientService.createClient({
          name: data.name,
          contacts: data.contacts
        });
        setClients(prev => [newClient, ...prev]);
        showMessage('success', 'Client created successfully');
      }
    } catch (error) {
      showMessage('error', data.id ? 'Failed to update client' : 'Failed to create client');
      console.error('Client save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      setLoading(true);
      await clientService.deleteClient(clientId);
      setClients(prev => prev.filter(client => client.id !== clientId));
      showMessage('success', 'Client deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete client');
      console.error('Client delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  // API handlers for sub-agreements
  const handleSaveAgreement = async (data: any) => {
    try {
      setLoading(true);
      if (data.id) {
        const updatedAgreement = await subAgreementService.updateSubAgreement(data.id, data);
        setAgreements(prevAgreements => prevAgreements.map(agreement => 
          agreement.id === data.id ? updatedAgreement : agreement
        ));
        showMessage('success', 'Sub-agreement updated successfully');
      } else {
        const newAgreement = await subAgreementService.createSubAgreement({
          ...data,
          balance: data.amount
        });
        setAgreements(prev => [newAgreement, ...prev]);
        showMessage('success', 'Sub-agreement created successfully');
      }
    } catch (error) {
      showMessage('error', data.id ? 'Failed to update sub-agreement' : 'Failed to create sub-agreement');
      console.error('Sub-agreement save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgreement = async (agreementId: string) => {
    if (!confirm('Are you sure you want to delete this sub-agreement?')) return;
    
    try {
      setLoading(true);
      await subAgreementService.deleteSubAgreement(agreementId);
      setAgreements(prev => prev.filter(agreement => agreement.id !== agreementId));
      showMessage('success', 'Sub-agreement deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete sub-agreement');
      console.error('Sub-agreement delete error:', error);
    } finally {
      setLoading(false);
    }
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

    jobs.forEach(job => {
      job.documents.forEach((doc, index) => {
        allDocs.push({
          id: `doc-job-${job.id}-${index}`, 
          name: doc.name, 
          type: 'Call-Out Job',
          size: doc.size, 
          uploadDate: new Date(doc.lastModified).toISOString(),
          clientId: job.clientId, 
          file: doc, 
          sourceName: job.jobName
        });
      });
    });

    tickets.forEach(ticket => {
      ticket.documents.forEach((doc, index) => {
        allDocs.push({
          id: `doc-tkt-${ticket.id}-${index}`, 
          name: doc.name, 
          type: 'Service Ticket',
          size: doc.size, 
          uploadDate: new Date(doc.lastModified).toISOString(),
          clientId: ticket.clientId, 
          file: doc, 
          sourceName: ticket.ticketNumber
        });
      });
    });

    logs.forEach(log => {
      if (log.excelFile) {
        allDocs.push({
          id: `doc-log-xls-${log.id}`, 
          name: log.excelFileName || log.excelFile.name, 
          type: 'Daily Service Log (Excel)',
          size: log.excelFile.size, 
          uploadDate: new Date(log.excelFile.lastModified).toISOString(),
          clientId: log.clientId, 
          file: log.excelFile, 
          sourceName: log.logNumber
        });
      }
      if (log.pdfFile) {
        allDocs.push({
          id: `doc-log-pdf-${log.id}`, 
          name: log.pdfFileName || log.pdfFile.name, 
          type: 'Daily Service Log (PDF)',
          size: log.pdfFile.size, 
          uploadDate: new Date(log.pdfFile.lastModified).toISOString(),
          clientId: log.clientId, 
          file: log.pdfFile, 
          sourceName: log.logNumber
        });
      }
    });

    return allDocs;
  }, [agreements, jobs, tickets, logs]);

  const openIssueCount = useMemo(() => issues.filter(i => i.status === 'Open').length, [issues]);
  const activeTicketCount = useMemo(() => tickets.filter(t => t.status !== 'Invoiced').length, [tickets]);

  return {
    // Data
    clients,
    agreements,
    users,
    tickets,
    jobs,
    logs,
    issues,
    combinedDocuments,
    loading,

    // Setters for local operations
    setUsers,
    setTickets,
    setJobs,
    setLogs,
    setIssues,
    setAgreements,

    // API handlers
    handleSaveClient,
    handleDeleteClient,
    handleSaveAgreement,
    handleDeleteAgreement,

    // Computed values
    openIssueCount,
    activeTicketCount,

    // Reload functions
    loadClients,
    loadAgreements,
  };
};
