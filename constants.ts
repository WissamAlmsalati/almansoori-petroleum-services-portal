import { Client, SubAgreement, User, ServiceTicket, TicketIssue, CallOutJob, DailyServiceLog } from './types';

export const DUMMY_CLIENTS: Client[] = [
  { 
    id: 'cli-1', 
    name: 'Mellitah Oil & Gas B.V.', 
    contacts: [
      { id: 'con-1', name: 'John Doe', email: 'j.doe@globaloil.com', phone: '123-456-7890', position: 'Procurement Head' },
      { id: 'con-2', name: 'Samantha Ray', email: 's.ray@globaloil.com', phone: '123-456-7891', position: 'Operations Manager' }
    ], 
    logoUrl: 'https://picsum.photos/seed/client1/40/40' 
  },
  { 
    id: 'cli-2', 
    name: 'Desert Drilling Co.', 
    contacts: [
      { id: 'con-3', name: 'Jane Smith', email: 'j.smith@desertdrilling.com', phone: '234-567-8901', position: 'Director' }
    ], 
    logoUrl: 'https://picsum.photos/seed/client2/40/40' 
  },
  { 
    id: 'cli-3', 
    name: 'Maritime Exploration', 
    contacts: [
      { id: 'con-4', name: 'Peter Jones', email: 'p.jones@maritime.com', phone: '345-678-9012', position: 'Field Supervisor' }
    ], 
    logoUrl: 'https://picsum.photos/seed/client3/40/40' 
  },
];

export const DUMMY_SUB_AGREEMENTS: SubAgreement[] = [
    { id: 'sub-1', clientId: 'cli-1', name: 'Annual Maintenance Contract 2024', amount: 500000, balance: 250000, startDate: '2024-01-01', endDate: '2024-12-31' },
    { id: 'sub-2', clientId: 'cli-2', name: 'Drilling Support Q2', amount: 75000, balance: 12000, startDate: '2024-04-01', endDate: '2024-07-30' },
    { id: 'sub-3', clientId: 'cli-1', name: 'Offshore Platform Services', amount: 1200000, balance: 1150000, startDate: '2023-08-01', endDate: '2024-08-01' },
    { id: 'sub-4', clientId: 'cli-3', name: 'Seismic Survey Support', amount: 300000, balance: 300000, startDate: '2024-06-01', endDate: '2024-09-30' },
];

export const DUMMY_USERS: User[] = [
    { id: 'user-1', name: 'Admin User', email: 'admin@almansoori.biz', role: 'Admin', avatarUrl: 'https://picsum.photos/seed/user1/40/40' },
    { id: 'user-2', name: 'Manager Mike', email: 'mike.m@almansoori.biz', role: 'Manager', avatarUrl: 'https://picsum.photos/seed/user2/40/40' },
    { id: 'user-3', name: 'User Ursula', email: 'ursula.u@almansoori.biz', role: 'User', avatarUrl: 'https://picsum.photos/seed/user3/40/40' },
];

export const DUMMY_SERVICE_TICKETS: ServiceTicket[] = [
    { id: 'st-1', ticketNumber: 'T2024-001', clientId: 'cli-1', subAgreementId: 'sub-1', date: '2024-06-10', status: 'Delivered', amount: 15000, relatedLogIds: ['dsl-1'], documents: [] },
    { id: 'st-2', ticketNumber: 'T2024-002', clientId: 'cli-2', callOutJobId: 'coj-1', date: '2024-06-12', status: 'In Field to Sign', amount: 5200, relatedLogIds: [], documents: [] },
    { id: 'st-3', ticketNumber: 'T2024-003', clientId: 'cli-1', subAgreementId: 'sub-1', date: '2024-06-15', status: 'Issue', amount: 8900, relatedLogIds: ['dsl-2'], documents: [] },
    { id: 'st-4', ticketNumber: 'T2024-004', clientId: 'cli-3', date: '2024-05-20', status: 'Invoiced', amount: 25000, relatedLogIds: [], documents: [] },
];

export const DUMMY_CALL_OUT_JOBS: CallOutJob[] = [
    { id: 'coj-1', clientId: 'cli-2', jobName: 'Emergency Pump Repair', workOrderNumber: 'WO-556-23', startDate: '2024-06-12', endDate: '2024-06-14', documents: [] },
    { id: 'coj-2', clientId: 'cli-3', jobName: 'Vessel Inspection', workOrderNumber: 'WO-559-01', startDate: '2024-07-01', endDate: '2024-07-03', documents: [] },
];

const dsl1_personnel_status = Array(31).fill('');
dsl1_personnel_status[9] = 'X'; // for day 10

export const DUMMY_SERVICE_LOGS: DailyServiceLog[] = [
    { 
        id: 'dsl-1', 
        logNumber: '2024/162', 
        clientId: 'cli-1', 
        field: 'Bouri Field', 
        well: 'DP4-P12', 
        contract: 'C-123', 
        jobNo: 'J-456', 
        date: '2024-06-10', 
        linkedJobId: 'sub-1', 
        personnel: [{ 
            id: 'p1', 
            name: 'F. Azizi', 
            position: 'Supervisor', 
            dailyStatus: dsl1_personnel_status
        }],
        equipmentUsed: []
    },
    { 
        id: 'dsl-2', 
        logNumber: '2024/166', 
        clientId: 'cli-1', 
        field: 'Bouri Field', 
        well: 'DP3-A9', 
        contract: 'C-123', 
        jobNo: 'J-456', 
        date: '2024-06-15', 
        linkedJobId: 'sub-1',
        personnel: [],
        equipmentUsed: []
    },
];

export const DUMMY_TICKET_ISSUES: TicketIssue[] = [
    { id: 'iss-1', ticketId: 'st-3', description: 'Client disputes hours logged for personnel.', status: 'Open', remarks: 'Client states one team member left early.', dateReported: '2024-06-16' },
];
