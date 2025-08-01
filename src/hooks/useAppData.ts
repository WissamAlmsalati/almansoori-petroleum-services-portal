import { useState, useEffect, useMemo } from 'react';
import { 
  Client, 
  SubAgreement, 
  User, 
  ServiceTicket, 
  CallOutJob, 
  DailyServiceLog, 
  TicketIssue,
  CombinedDocument,
  TicketStatus,
  IssueStatus
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
import callOutJobService from '../services/callOutJobService';
import dailyServiceLogService from '../services/dailyServiceLogService';
import serviceTicketService from '../services/serviceTicketService';
import ticketIssueService from '../services/ticketIssueService';
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
    loadCallOutJobs();
    loadDailyServiceLogs();
    loadServiceTickets();
    loadTicketIssues();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getClients();
      
      // If no data from API, use mock data for testing
      if (!data || !data.clients || !Array.isArray(data.clients) || data.clients.length === 0) {
        const mockClients = [
          {
            id: '1',
            name: 'Almansoori Petroleum',
            logoUrl: '',
            contacts: []
          },
          {
            id: '2',
            name: 'ADNOC',
            logoUrl: '',
            contacts: []
          },
          {
            id: '3',
            name: 'ExxonMobil',
            logoUrl: '',
            contacts: []
          }
        ];
        
        console.log('Using mock clients for testing');
        setClients(mockClients);
        return;
      }
      
      setClients(data.clients);
    } catch (error) {
      showMessage('error', 'Failed to load clients');
      console.error('Failed to load clients:', error);
      
      // Use mock data on error
      const mockClients = [
        {
          id: '1',
          name: 'Almansoori Petroleum',
          logoUrl: '',
          contacts: []
        },
        {
          id: '2',
          name: 'ADNOC',
          logoUrl: '',
          contacts: []
        },
        {
          id: '3',
          name: 'ExxonMobil',
          logoUrl: '',
          contacts: []
        }
      ];
      
      setClients(mockClients);
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

  const loadCallOutJobs = async () => {
    try {
      setLoading(true);
      const data = await callOutJobService.getCallOutJobs();
      
      // Debug: Log the actual response structure
      console.log('API Response:', data);
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', typeof data, data);
        
        // If no data from API, use mock data for testing
        const mockJobs = [
          {
            id: '1',
            clientId: '1',
            jobName: 'Emergency Pipeline Maintenance',
            workOrderNumber: 'WO-2025-001',
            startDate: '2025-01-20',
            endDate: '2025-01-25',
            documents: []
          },
          {
            id: '2',
            clientId: '2',
            jobName: 'Well Intervention RW-123',
            workOrderNumber: 'WO-2025-002',
            startDate: '2025-01-22',
            endDate: '2025-01-28',
            documents: []
          }
        ];
        
        console.log('Using mock data for testing');
        setJobs(mockJobs);
        return;
      }
      
      // Transform backend data to frontend format with null checks
      const transformedJobs = data.map(job => {
        // Debug: Log each job object
        console.log('Processing job:', job);
        
        return {
          id: job.id ? job.id.toString() : `job-${Date.now()}-${Math.random()}`,
          clientId: job.client_id ? job.client_id.toString() : '',
          jobName: job.job_name || '',
          workOrderNumber: job.work_order_number || '',
          description: job.description || '',
          priority: job.priority || 'medium',
          status: job.status || 'scheduled',
          startDate: job.start_date || '',
          endDate: job.end_date || '',
          documents: job.documents || []
        };
      });
      
      console.log('Transformed jobs:', transformedJobs);
      setJobs(transformedJobs);
    } catch (error) {
      showMessage('error', 'Failed to load call-out jobs');
      console.error('Failed to load call-out jobs:', error);
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadDailyServiceLogs = async () => {
    try {
      setLoading(true);
      const data = await dailyServiceLogService.getDailyServiceLogs();
      
      // Debug: Log the actual response structure
      console.log('API Response for daily logs:', data);
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', typeof data, data);
        setLogs([]);
        return;
      }
      
      // Transform backend data to frontend format
      const transformedLogs = data.map((log, index) => {
        console.log(`Processing log ${index}:`, log);
        console.log('Log ID type:', typeof log.id, 'value:', log.id);
        console.log('Client ID type:', typeof log.client_id, 'value:', log.client_id);
        
        // Transform personnel data
        const transformedPersonnel = (log.personnel || []).map((person, index) => ({
          id: `person-${log.id}-${index}`,
          name: person.name,
          position: person.position,
          dailyStatus: [],
          hours: person.hours
        }));
        
        // Transform equipment data
        const transformedEquipment = (log.equipment_used || []).map((equipment, index) => ({
          id: `equipment-${log.id}-${index}`,
          name: equipment.name,
          quantity: 1,
          dailyStatus: [],
          hours: equipment.hours
        }));
        
        return {
          id: (log.id ? log.id.toString() : `log-${Date.now()}-${Math.random()}`),
          logNumber: log.log_number || '',
          clientId: (log.client_id ? log.client_id.toString() : ''),
          field: log.field || '',
          well: log.well || '',
          contract: log.contract || '',
          jobNo: log.job_no || '',
          date: log.date || '',
          linkedJobId: log.linked_job_id || '',
          personnel: transformedPersonnel,
          equipmentUsed: transformedEquipment,
          almansooriRep: log.almansoori_rep || [],
          mogApproval1: log.mog_approval_1,
          mogApproval2: log.mog_approval_2,
          excelFile: null,
          excelFileName: log.excel_file_name || '',
          pdfFile: null,
          pdfFileName: log.pdf_file_name || ''
        };
      });
      
      console.log('Transformed logs:', transformedLogs);
      setLogs(transformedLogs);
    } catch (error: any) {
      showMessage('error', 'Failed to load daily service logs');
      console.error('Failed to load daily service logs:', error);
      setLogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadServiceTickets = async () => {
    try {
      setLoading(true);
      const data = await serviceTicketService.getServiceTickets();
      
      console.log('Raw service tickets data from API:', data);
      
      // Transform backend data to frontend format
      const transformedTickets = data.map(ticket => ({
        id: ticket.id ? ticket.id.toString() : `ticket-${Date.now()}-${Math.random()}`,
        ticketNumber: ticket.ticket_number || '',
        clientId: ticket.client_id ? ticket.client_id.toString() : '',
        subAgreementId: ticket.sub_agreement_id ? ticket.sub_agreement_id.toString() : undefined,
        callOutJobId: ticket.call_out_job_id ? ticket.call_out_job_id.toString() : undefined,
        date: ticket.date || '',
        status: ticket.status as TicketStatus || 'In Field to Sign',
        amount: ticket.amount || 0,
        relatedLogIds: ticket.related_log_ids ? ticket.related_log_ids.map(id => id ? id.toString() : '').filter(id => id !== '') : [],
        documents: [], // Transform documents if needed
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        client: ticket.client,
        subAgreement: ticket.sub_agreement,
        callOutJob: ticket.call_out_job
      }));
      
      console.log('Transformed tickets:', transformedTickets);
      setTickets(transformedTickets);
    } catch (error: any) {
      showMessage('error', 'Failed to load service tickets');
      console.error('Failed to load service tickets:', error);
      setTickets([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadTicketIssues = async () => {
    try {
      setLoading(true);
      const data = await ticketIssueService.getTicketIssues();
      
      console.log('Raw ticket issues data from API:', data);
      
      // Transform backend data to frontend format
      const transformedIssues = data.map(issue => ({
        id: issue.id ? issue.id.toString() : `issue-${Date.now()}-${Math.random()}`,
        ticketId: issue.ticket_id ? issue.ticket_id.toString() : '',
        description: issue.description || '',
        status: issue.status as IssueStatus || 'Open',
        remarks: issue.remarks || '',
        dateReported: issue.date_reported || '',
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        ticket: issue.ticket
      }));
      
      console.log('Transformed ticket issues:', transformedIssues);
      setIssues(transformedIssues);
    } catch (error: any) {
      showMessage('error', 'Failed to load ticket issues');
      console.error('Failed to load ticket issues:', error);
      setIssues([]); // Set empty array on error
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

  // API handlers for call-out jobs
  const handleSaveCallOutJob = async (data: Partial<CallOutJob>) => {
    try {
      setLoading(true);
      
      // Debug: Log the incoming data
      console.log('Incoming data for call-out job:', data);
      
      // Validate required fields
      if (!data.clientId) {
        throw new Error('Client is required');
      }
      if (!data.jobName) {
        throw new Error('Job name is required');
      }
      if (!data.workOrderNumber) {
        throw new Error('Work order number is required');
      }
      if (!data.startDate) {
        throw new Error('Start date is required');
      }
      if (!data.endDate) {
        throw new Error('End date is required');
      }
      
      // Transform frontend data to backend format
      const backendData = {
        client_id: parseInt(data.clientId),
        job_name: data.jobName,
        work_order_number: data.workOrderNumber,
        description: data.description,
        priority: data.priority,
        status: data.status,
        start_date: data.startDate,
        end_date: data.endDate
      };
      
      console.log('Backend data being sent:', backendData);

      if (data.id) {
        const updatedJob = await callOutJobService.updateCallOutJob(data.id, backendData);
        // Transform backend response to frontend format
        const transformedJob = {
          id: updatedJob.id,
          clientId: updatedJob.client_id.toString(),
          jobName: updatedJob.job_name,
          workOrderNumber: updatedJob.work_order_number,
          startDate: updatedJob.start_date,
          endDate: updatedJob.end_date,
          documents: updatedJob.documents || []
        };
        // Refresh the jobs from the server to get the latest data
        await loadCallOutJobs();
        showMessage('success', 'Call-out job updated successfully');
      } else {
        const newJob = await callOutJobService.createCallOutJob(backendData);
        // Transform backend response to frontend format
        const transformedJob = {
          id: newJob.id,
          clientId: newJob.client_id.toString(),
          jobName: newJob.job_name,
          workOrderNumber: newJob.work_order_number,
          startDate: newJob.start_date,
          endDate: newJob.end_date,
          documents: newJob.documents || []
        };
        // Refresh the jobs from the server to get the latest data
        await loadCallOutJobs();
        showMessage('success', 'Call-out job created successfully');
      }
    } catch (error) {
      console.error('Call-out job save error:', error);
      
      // Check if it's a 422 validation error
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as any).response &&
        (error as any).response.status === 422
      ) {
        const validationErrors = (error as any).response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          showMessage('error', `Validation error: ${errorMessages}`);
        } else {
          showMessage('error', 'Validation error: Please check your input data');
        }
      } else {
        // If API is not available, use mock data for testing
        console.log('API not available, using mock data for testing');
        
        const mockJob = {
          id: data.id || `job-${Date.now()}`,
          clientId: data.clientId || '1',
          jobName: data.jobName || '',
          workOrderNumber: data.workOrderNumber || '',
          description: data.description || '',
          priority: data.priority || 'medium',
          status: data.status || 'scheduled',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          documents: []
        };
        
        if (data.id) {
          setJobs(prevJobs => prevJobs.map(job => 
            job.id === data.id ? mockJob : job
          ));
          showMessage('success', 'Call-out job updated successfully (mock)');
        } else {
          setJobs(prev => [mockJob, ...prev]);
          showMessage('success', 'Call-out job created successfully (mock)');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCallOutJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this call-out job?')) return;
    
    try {
      setLoading(true);
      await callOutJobService.deleteCallOutJob(jobId);
      // Refresh the jobs from the server to get the latest data
      await loadCallOutJobs();
      showMessage('success', 'Call-out job deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete call-out job');
      console.error('Call-out job delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  // API handlers for daily service logs
  const handleSaveDailyServiceLog = async (data: Partial<DailyServiceLog>) => {
    try {
      setLoading(true);
      
      // Debug: Log the incoming data
      console.log('Incoming data for daily service log:', data);
      
      // Validate required fields
      if (!data.clientId) {
        throw new Error('Client is required');
      }
      if (!data.field) {
        throw new Error('Field is required');
      }
      if (!data.well) {
        throw new Error('Well is required');
      }
      if (!data.contract) {
        throw new Error('Contract is required');
      }
      if (!data.jobNo) {
        throw new Error('Job number is required');
      }
      if (!data.date) {
        throw new Error('Date is required');
      }
      
      // Transform frontend data to backend format
      const backendData = {
        client_id: parseInt(data.clientId),
        field: data.field,
        well: data.well,
        contract: data.contract,
        job_no: data.jobNo,
        date: data.date,
        linked_job_id: data.linkedJobId,
        personnel: data.personnel?.map(person => ({
          name: person.name,
          position: person.position,
          hours: person.hours
        })),
        equipment_used: data.equipmentUsed?.map(equipment => ({
          name: equipment.name,
          hours: equipment.hours
        })),
        almansoori_rep: data.almansooriRep,
        mog_approval_1: data.mogApproval1,
        mog_approval_2: data.mogApproval2
      };
      
      console.log('Backend data being sent:', backendData);

      if (data.id) {
        const updatedLog = await dailyServiceLogService.updateDailyServiceLog(data.id, backendData);
        // Transform backend response to frontend format
        const transformedPersonnel = (updatedLog.personnel || []).map((person, index) => ({
          id: `person-${updatedLog.id}-${index}`,
          name: person.name,
          position: person.position,
          dailyStatus: [],
          hours: person.hours
        }));
        
        const transformedEquipment = (updatedLog.equipment_used || []).map((equipment, index) => ({
          id: `equipment-${updatedLog.id}-${index}`,
          name: equipment.name,
          quantity: 1,
          dailyStatus: [],
          hours: equipment.hours
        }));
        
        const transformedLog = {
          id: updatedLog.id ? updatedLog.id.toString() : '',
          logNumber: updatedLog.log_number || '',
          clientId: updatedLog.client_id ? updatedLog.client_id.toString() : '',
          field: updatedLog.field || '',
          well: updatedLog.well || '',
          contract: updatedLog.contract || '',
          jobNo: updatedLog.job_no || '',
          date: updatedLog.date || '',
          linkedJobId: updatedLog.linked_job_id || '',
          personnel: transformedPersonnel,
          equipmentUsed: transformedEquipment,
          almansooriRep: updatedLog.almansoori_rep || [],
          mogApproval1: updatedLog.mog_approval_1,
          mogApproval2: updatedLog.mog_approval_2,
          excelFile: null,
          excelFileName: updatedLog.excel_file_name || '',
          pdfFile: null,
          pdfFileName: updatedLog.pdf_file_name || ''
        };
        // Refresh the logs from the server to get the latest data
        await loadDailyServiceLogs();
        showMessage('success', 'Daily service log updated successfully');
      } else {
        const newLog = await dailyServiceLogService.createDailyServiceLog(backendData);
        // Transform backend response to frontend format
        const transformedPersonnel = (newLog.personnel || []).map((person, index) => ({
          id: `person-${newLog.id}-${index}`,
          name: person.name,
          position: person.position,
          dailyStatus: [],
          hours: person.hours
        }));
        
        const transformedEquipment = (newLog.equipment_used || []).map((equipment, index) => ({
          id: `equipment-${newLog.id}-${index}`,
          name: equipment.name,
          quantity: 1,
          dailyStatus: [],
          hours: equipment.hours
        }));
        
        const transformedLog = {
          id: newLog.id ? newLog.id.toString() : '',
          logNumber: newLog.log_number || '',
          clientId: newLog.client_id ? newLog.client_id.toString() : '',
          field: newLog.field || '',
          well: newLog.well || '',
          contract: newLog.contract || '',
          jobNo: newLog.job_no || '',
          date: newLog.date || '',
          linkedJobId: newLog.linked_job_id || '',
          personnel: transformedPersonnel,
          equipmentUsed: transformedEquipment,
          almansooriRep: newLog.almansoori_rep || [],
          mogApproval1: newLog.mog_approval_1,
          mogApproval2: newLog.mog_approval_2,
          excelFile: null,
          excelFileName: newLog.excel_file_name || '',
          pdfFile: null,
          pdfFileName: newLog.pdf_file_name || ''
        };
        // Refresh the logs from the server to get the latest data
        await loadDailyServiceLogs();
        showMessage('success', 'Daily service log created successfully');
      }
    } catch (error: any) {
      console.error('Daily service log save error:', error);
      
      // Check if it's a 422 validation error
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          showMessage('error', `Validation error: ${errorMessages}`);
        } else {
          showMessage('error', 'Validation error: Please check your input data');
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : (data.id ? 'Failed to update daily service log' : 'Failed to create daily service log');
        showMessage('error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDailyServiceLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this daily service log?')) return;
    
    try {
      setLoading(true);
      await dailyServiceLogService.deleteDailyServiceLog(logId);
      // Refresh the logs from the server to get the latest data
      await loadDailyServiceLogs();
      showMessage('success', 'Daily service log deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete daily service log');
      console.error('Daily service log delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExcel = async (logId: string) => {
    try {
      setLoading(true);
      const response = await dailyServiceLogService.generateExcel(logId);
      
      console.log('Excel generation response:', response);
      
      if (response.success && response.data) {
        // Try to use public_download_url first, then force_download_url, then fallback
        let downloadUrl = response.data.public_download_url || response.data.force_download_url;
        
        if (downloadUrl) {
          console.log('Using download URL:', downloadUrl);
          
          // Try to download the file
          try {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = response.data.file_name || 'daily_service_log.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.warn('Download failed:', error);
            // If download fails, just show success message and let user try download button
          }
        } else {
          console.warn('No download URL found in response:', response.data);
        }
        
        showMessage('success', 'Excel file generated successfully!');
        
        // Refresh the logs to get updated file information
        await loadDailyServiceLogs();
      } else {
        showMessage('error', 'Failed to generate Excel file');
      }
    } catch (error: any) {
      console.error('Excel generation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate Excel file';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // API handlers for service tickets
  const handleSaveServiceTicket = async (data: Partial<ServiceTicket>) => {
    try {
      setLoading(true);
      
      // Debug: Log the incoming data
      console.log('Incoming data for service ticket:', data);
      
      // Validate required fields
      if (!data.clientId) {
        throw new Error('Client is required');
      }
      if (!data.date) {
        throw new Error('Date is required');
      }
      if (!data.status) {
        throw new Error('Status is required');
      }
      if (!data.amount) {
        throw new Error('Amount is required');
      }
      
      // Transform frontend data to backend format
      const backendData = {
        client_id: parseInt(data.clientId),
        sub_agreement_id: data.subAgreementId ? parseInt(data.subAgreementId) : null,
        call_out_job_id: data.callOutJobId ? parseInt(data.callOutJobId) : null,
        date: data.date,
        status: data.status,
        amount: data.amount,
        related_log_ids: data.relatedLogIds?.map(id => parseInt(id)) || []
      };
      
      console.log('Backend data being sent:', backendData);

      if (data.id) {
        const updatedTicket = await serviceTicketService.updateServiceTicket(data.id, backendData);
        // Transform backend response to frontend format
        const transformedTicket = {
          id: updatedTicket.id ? updatedTicket.id.toString() : '',
          ticketNumber: updatedTicket.ticket_number || '',
          clientId: updatedTicket.client_id ? updatedTicket.client_id.toString() : '',
          subAgreementId: updatedTicket.sub_agreement_id ? updatedTicket.sub_agreement_id.toString() : undefined,
          callOutJobId: updatedTicket.call_out_job_id ? updatedTicket.call_out_job_id.toString() : undefined,
          date: updatedTicket.date || '',
          status: updatedTicket.status as TicketStatus || 'In Field to Sign',
          amount: updatedTicket.amount || 0,
          relatedLogIds: updatedTicket.related_log_ids ? updatedTicket.related_log_ids.map(id => id ? id.toString() : '').filter(id => id !== '') : [],
          documents: [],
          createdAt: updatedTicket.created_at,
          updatedAt: updatedTicket.updated_at,
          client: updatedTicket.client,
          subAgreement: updatedTicket.sub_agreement,
          callOutJob: updatedTicket.call_out_job
        };
        
        // Refresh the tickets from the server to get the latest data
        await loadServiceTickets();
        showMessage('success', 'Service ticket updated successfully');
      } else {
        const newTicket = await serviceTicketService.createServiceTicket(backendData);
        // Transform backend response to frontend format
        const transformedTicket = {
          id: newTicket.id ? newTicket.id.toString() : '',
          ticketNumber: newTicket.ticket_number || '',
          clientId: newTicket.client_id ? newTicket.client_id.toString() : '',
          subAgreementId: newTicket.sub_agreement_id ? newTicket.sub_agreement_id.toString() : undefined,
          callOutJobId: newTicket.call_out_job_id ? newTicket.call_out_job_id.toString() : undefined,
          date: newTicket.date || '',
          status: newTicket.status as TicketStatus || 'In Field to Sign',
          amount: newTicket.amount || 0,
          relatedLogIds: newTicket.related_log_ids ? newTicket.related_log_ids.map(id => id ? id.toString() : '').filter(id => id !== '') : [],
          documents: [],
          createdAt: newTicket.created_at,
          updatedAt: newTicket.updated_at,
          client: newTicket.client,
          subAgreement: newTicket.sub_agreement,
          callOutJob: newTicket.call_out_job
        };
        
        // Refresh the tickets from the server to get the latest data
        await loadServiceTickets();
        showMessage('success', 'Service ticket created successfully');
      }
    } catch (error: any) {
      console.error('Service ticket save error:', error);
      
      // Check if it's a 422 validation error
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          showMessage('error', `Validation error: ${errorMessages}`);
        } else {
          showMessage('error', 'Validation error: Please check your input data');
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : (data.id ? 'Failed to update service ticket' : 'Failed to create service ticket');
        showMessage('error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServiceTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this service ticket?')) return;
    
    try {
      setLoading(true);
      await serviceTicketService.deleteServiceTicket(ticketId);
      // Refresh the tickets from the server to get the latest data
      await loadServiceTickets();
      showMessage('success', 'Service ticket deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete service ticket');
      console.error('Service ticket delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      setLoading(true);
      
      // Find the current ticket to get its data
      const currentTicket = tickets.find(t => t.id === ticketId);
      if (!currentTicket) {
        showMessage('error', 'Ticket not found');
        return;
      }

      // Update only the status
      const updateData = {
        status: newStatus
      };

      console.log('Updating ticket status:', { ticketId, newStatus });
      
      await serviceTicketService.updateServiceTicket(ticketId, updateData);
      showMessage('success', 'Status updated successfully');
      
      // Refresh the tickets list
      await loadServiceTickets();
    } catch (error: any) {
      console.error('Status update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update status';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateServiceTicket = async (data: {
    clientId: string;
    logIds: string[];
    subAgreementId?: string;
    callOutJobId?: string;
    date: string;
    status: string;
    amount: number;
  }) => {
    try {
      setLoading(true);
      
      // Transform frontend data to backend format
      const backendData = {
        client_id: parseInt(data.clientId),
        log_ids: data.logIds.map(id => parseInt(id)),
        sub_agreement_id: data.subAgreementId ? parseInt(data.subAgreementId) : null,
        call_out_job_id: data.callOutJobId ? parseInt(data.callOutJobId) : null,
        date: data.date,
        status: data.status,
        amount: data.amount
      };
      
      console.log('Generate service ticket data:', backendData);
      
      const newTicket = await serviceTicketService.generateServiceTicket(backendData);
      
      // Refresh the tickets from the server to get the latest data
      await loadServiceTickets();
      showMessage('success', 'Service ticket generated successfully');
      
      return newTicket;
    } catch (error: any) {
      console.error('Service ticket generation error:', error);
      
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          showMessage('error', `Validation error: ${errorMessages}`);
        } else {
          showMessage('error', 'Validation error: Please check your input data');
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate service ticket';
        showMessage('error', errorMessage);
      }
      throw error;
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

  const handleSaveTicketIssue = async (data: Partial<TicketIssue>) => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!data.ticketId || !data.description || !data.dateReported) {
        showMessage('error', 'Please fill in all required fields');
        return;
      }

      // Transform frontend data to backend format
      const backendData = {
        ticket_id: parseInt(data.ticketId),
        description: data.description,
        status: data.status || 'Open',
        remarks: data.remarks || '',
        date_reported: data.dateReported
      };

      console.log('Saving ticket issue with data:', backendData);

      if (data.id) {
        // Update existing ticket issue
        const updatedIssue = await ticketIssueService.updateTicketIssue(data.id, backendData);
        
        // Transform backend response to frontend format
        const transformedIssue = {
          id: updatedIssue.id ? updatedIssue.id.toString() : '',
          ticketId: updatedIssue.ticket_id ? updatedIssue.ticket_id.toString() : '',
          description: updatedIssue.description || '',
          status: updatedIssue.status as IssueStatus || 'Open',
          remarks: updatedIssue.remarks || '',
          dateReported: updatedIssue.date_reported || '',
          createdAt: updatedIssue.created_at,
          updatedAt: updatedIssue.updated_at,
          ticket: updatedIssue.ticket
        };

        console.log('Ticket issue updated successfully:', transformedIssue);
        showMessage('success', 'Ticket issue updated successfully');
        
        // Refresh the issues list
        await loadTicketIssues();
      } else {
        // Create new ticket issue
        const newIssue = await ticketIssueService.createTicketIssue(backendData);
        
        // Transform backend response to frontend format
        const transformedIssue = {
          id: newIssue.id ? newIssue.id.toString() : '',
          ticketId: newIssue.ticket_id ? newIssue.ticket_id.toString() : '',
          description: newIssue.description || '',
          status: newIssue.status as IssueStatus || 'Open',
          remarks: newIssue.remarks || '',
          dateReported: newIssue.date_reported || '',
          createdAt: newIssue.created_at,
          updatedAt: newIssue.updated_at,
          ticket: newIssue.ticket
        };

        console.log('Ticket issue created successfully:', transformedIssue);
        showMessage('success', 'Ticket issue created successfully');
        
        // Refresh the issues list
        await loadTicketIssues();
      }
    } catch (error: any) {
      console.error('Ticket issue save error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save ticket issue';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicketIssue = async (issueId: string) => {
    if (!confirm('Are you sure you want to delete this ticket issue?')) return;
    
    try {
      setLoading(true);
      await ticketIssueService.deleteTicketIssue(issueId);
      showMessage('success', 'Ticket issue deleted successfully');
      
      // Refresh the issues list
      await loadTicketIssues();
    } catch (error: any) {
      console.error('Ticket issue delete error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete ticket issue';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };



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
    handleSaveCallOutJob,
    handleDeleteCallOutJob,
    handleSaveDailyServiceLog,
    handleDeleteDailyServiceLog,
    handleGenerateExcel,
    handleSaveServiceTicket,
    handleDeleteServiceTicket,
    handleStatusChange,
    handleGenerateServiceTicket,
    handleSaveTicketIssue,
    handleDeleteTicketIssue,

    // Computed values
    openIssueCount,
    activeTicketCount,

    // Reload functions
    loadClients,
    loadAgreements,
    loadCallOutJobs,
    loadDailyServiceLogs,
    loadServiceTickets,
    loadTicketIssues,
  };
};
